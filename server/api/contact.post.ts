import { createServerSupabaseClient } from '~/server/utils/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/

const translations: Record<string, { subject: string; body: string }> = {
  pt: {
    subject: 'VeluxeAuto — Recebemos a sua mensagem',
    body: 'Olá {name}, obrigado por nos contactar! Recebemos as suas informações e iremos entrar em contacto o mais brevemente possível. Até já!',
  },
  en: {
    subject: 'VeluxeAuto — We received your message',
    body: 'Hello {name}, thank you for contacting us! We received your information and will get in touch as soon as possible. See you soon!',
  },
  es: {
    subject: 'VeluxeAuto — Hemos recibido su mensaje',
    body: 'Hola {name}, ¡gracias por contactarnos! Hemos recibido su información y nos pondremos en contacto lo antes posible. ¡Hasta pronto!',
  },
  fr: {
    subject: 'VeluxeAuto — Nous avons reçu votre message',
    body: "Bonjour {name}, merci de nous avoir contactés ! Nous avons bien reçu vos informations et nous vous contacterons dans les plus brefs délais. À bientôt !",
  },
  de: {
    subject: 'VeluxeAuto — Wir haben Ihre Nachricht erhalten',
    body: 'Hallo {name}, vielen Dank für Ihre Kontaktaufnahme! Wir haben Ihre Informationen erhalten und werden uns so schnell wie möglich bei Ihnen melden. Bis bald!',
  },
  it: {
    subject: 'VeluxeAuto — Abbiamo ricevuto il tuo messaggio',
    body: 'Ciao {name}, grazie per averci contattato! Abbiamo ricevuto le tue informazioni e ti contatteremo il prima possibile. A presto!',
  },
  'zh-CN': {
    subject: 'VeluxeAuto — 我们已收到您的消息',
    body: '您好 {name}，感谢您联系我们！我们已收到您的信息，将尽快与您联系。再见！',
  },
}

async function sendEmail(apiKey: string, to: string, subject: string, text: string, from: string) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
    })

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'No response body')
      console.error(`Resend email failed (${res.status}):`, errorBody)
    }
  } catch (err) {
    console.error('Resend email network error:', err)
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = body?.name?.trim()
  const email = body?.email?.trim() || null
  const phone = body?.phone?.trim() || null
  const message = body?.message?.trim()
  const locale = body?.locale || 'pt'

  if (!name || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Name and message are required' })
  }

  if (message.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Message must be 500 characters or less' })
  }

  if (!email && !phone) {
    throw createError({ statusCode: 400, statusMessage: 'At least one contact method (email or phone) is required' })
  }

  if (email && !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email format' })
  }

  if (phone && !PHONE_RE.test(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid phone format' })
  }

  try {
    const supabase = createServerSupabaseClient()

    const { error } = await (supabase
      .from('contact_messages') as any)
      .insert({ name, email, phone, message })

    if (error) throw error

    const config = useRuntimeConfig()
    const resendKey = config.RESEND_API_KEY as string | undefined

    if (!resendKey) {
      console.error('Missing RESEND_API_KEY — email notifications skipped!')
    } else {
      const notificationBody = [
        `Nome: ${name}`,
        `Email: ${email || '—'}`,
        `Telemóvel: ${phone || '—'}`,
        `\nMensagem:\n${message}`,
      ].join('\n')

      await sendEmail(
        resendKey,
        'veluxeauto@gmail.com',
        'Novo contacto inserido no sistema! Siga contactar!',
        notificationBody,
        'VeluxeContacts <veluxecontacts@notification.veluxeauto.com>',
      )

      if (email) {
        const t = translations[locale] ?? translations.pt!
        const confirmationBody = t.body.replace('{name}', name)

        await sendEmail(
          resendKey,
          email,
          t.subject,
          confirmationBody,
          'VeluxeAuto <veluxecontacts@notification.veluxeauto.com>',
        )
      }
    }

    return { success: true }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to send message',
    })
  }
})
