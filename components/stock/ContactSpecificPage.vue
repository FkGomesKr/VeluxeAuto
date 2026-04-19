<script lang="ts" setup>
const { t, locale } = useI18n();

const props = defineProps<{
  carName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userMessage = ref('');
const userName = ref('');
const userEmail = ref('');
const userPhone = ref('');
const formError = ref('');
const formSubmitted = ref(false);
const submitting = ref(false);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

const isEmailValid = computed(() => !userEmail.value.trim() || EMAIL_RE.test(userEmail.value.trim()));
const isPhoneValid = computed(() => !userPhone.value.trim() || PHONE_RE.test(userPhone.value.trim()));
const hasValidContact = computed(() =>
  (userEmail.value.trim() && isEmailValid.value) || (userPhone.value.trim() && isPhoneValid.value)
);
const canSubmitForm = computed(() =>
  userName.value.trim() && userMessage.value.trim() && hasValidContact.value
);

function sendViaWhatsApp() {
  const msg = userMessage.value.trim();
  if (!msg) return;
  const url = `https://wa.me/351912247691?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function sendViaEmail() {
  const msg = userMessage.value.trim();
  if (!msg) return;
  const url = `mailto:veluxeauto@gmail.com?subject=${encodeURIComponent(t('emailSubject') + ' - ' + props.carName)}&body=${encodeURIComponent(msg)}`;
  window.location.href = url;
}

async function submitForm() {
  formError.value = '';
  if (!userName.value.trim() || !userMessage.value.trim()) return;

  if (!userEmail.value.trim() && !userPhone.value.trim()) {
    formError.value = t('contactFormContactRequired');
    return;
  }

  if (userEmail.value.trim() && !isEmailValid.value) return;
  if (userPhone.value.trim() && !isPhoneValid.value) return;

  submitting.value = true;
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: userName.value.trim(),
        email: userEmail.value.trim() || null,
        phone: userPhone.value.trim() || null,
        message: userMessage.value.trim(),
        car: props.carName,
        locale: locale.value,
      },
    });
    formSubmitted.value = true;
  } catch {
    formError.value = t('contactFormError');
  } finally {
    submitting.value = false;
  }
}

function resetAndClose() {
  userName.value = '';
  userEmail.value = '';
  userPhone.value = '';
  userMessage.value = '';
  formError.value = '';
  formSubmitted.value = false;
  emit('close');
}
</script>

<template>
  <div class="flex flex-col rounded-xl bg-[#201818] p-5">

    <!-- Success state -->
    <div v-if="formSubmitted" class="flex-1 flex flex-col items-center justify-center gap-5 text-center py-10">
      <div class="w-16 h-16 rounded-full bg-[#25d366]/15 flex items-center justify-center">
        <svg class="w-8 h-8 text-[#25d366]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <p class="text-white text-lg font-semibold">{{ t('contactFormBarTitle') }}</p>
      <p class="text-[#a0a0a0] text-sm">{{ t('contactBarScheduleText').split('.')[0] }}.</p>
      <button
        @click="resetAndClose()"
        class="mt-2 text-[#b53d3d] hover:text-[#c94a4a] text-md font-medium transition-colors duration-200 cursor-pointer"
      >
        ← {{ t('backToContact') }}
      </button>
    </div>

    <!-- Form state -->
    <template v-else>
      <div class="flex items-center gap-3 mb-2">
        <button
          @click="emit('close')"
          class="group/back text-[#a0a0a0] hover:text-white transition-colors duration-200 p-1"
        >
          <svg class="w-6 h-6 transition-transform duration-200 group-hover/back:-translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 12H5m7-7-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <h3 class="text-md xl:text-xl font-semibold text-white">{{ t('contactFormBarTitle') }}</h3>
      </div>

      <p class="text-[#a0a0a0] text-sm mb-4">
        <span class="text-[#b53d3d] font-semibold">{{ carName }}</span>
      </p>

      <input
        v-model="userName"
        type="text"
        :placeholder="t('contactFormName') + ' *'"
        class="w-full bg-[#161111] text-white text-sm rounded-xl px-5 py-3.5 border border-[#2a2020] focus:border-[#b53d3d] transition-colors duration-200 focus:outline-none placeholder-[#5a5a5a] mb-3"
      >

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            v-model="userEmail"
            type="email"
            :placeholder="t('contactFormEmail')"
            class="w-full bg-[#161111] text-white text-sm rounded-xl px-5 py-3.5 border transition-colors duration-200 focus:outline-none placeholder-[#5a5a5a]"
            :class="isEmailValid ? 'border-[#2a2020] focus:border-[#b53d3d]' : 'border-red-500/60'"
          >
        </div>
        <div class="flex-1">
          <input
            v-model="userPhone"
            type="tel"
            :placeholder="t('contactFormPhone')"
            class="w-full bg-[#161111] text-white text-sm rounded-xl px-5 py-3.5 border transition-colors duration-200 focus:outline-none placeholder-[#5a5a5a]"
            :class="isPhoneValid ? 'border-[#2a2020] focus:border-[#b53d3d]' : 'border-red-500/60'"
          >
        </div>
      </div>

      <p class="text-xs px-1 mt-1.5 mb-3 transition-colors duration-300" :class="formError ? 'text-red-400' : hasValidContact ? 'text-[#25d366]/70' : 'text-[#5a5a5a]'">
        <span v-if="formError">{{ formError }}</span>
        <span v-else-if="hasValidContact">
          <svg class="w-3 h-3 inline-block mr-0.5 -mt-0.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" /></svg>
          {{ userEmail.trim() && isEmailValid && userPhone.trim() && isPhoneValid ? t('contactFormEmail') + ' & ' + t('contactFormPhone') : userEmail.trim() && isEmailValid ? t('contactFormEmail') : t('contactFormPhone') }}
        </span>
        <span v-else>{{ t('contactFormContactRequired') }}</span>
      </p>

      <div class="flex-1 flex flex-col mb-4">
        <textarea
          v-model="userMessage"
          :placeholder="t('contactFormPlaceholder') + ' *'"
          maxlength="500"
          class="flex-1 w-full bg-[#161111] text-white text-sm rounded-xl px-5 py-4 border border-[#2a2020] focus:border-[#b53d3d] focus:outline-none transition-colors duration-200 resize-none placeholder-[#5a5a5a] min-h-[120px]"
        />
        <span class="text-[#5a5a5a] text-xs text-right mt-1.5 tabular-nums">{{ userMessage.length }} / 500</span>
      </div>

      <div class="flex flex-col gap-3">
        <button
          @click="submitForm()"
          :disabled="!canSubmitForm || submitting"
          class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300"
          :class="canSubmitForm && !submitting ? 'bg-white/10 hover:bg-white/15 hover:-translate-y-0.5 border border-white/20 hover:border-white/30 cursor-pointer' : 'bg-white/5 border border-white/5 cursor-not-allowed text-white/30'"
        >
          <i v-if="submitting" class="fa-solid fa-spinner fa-spin text-lg"></i>
          <i v-else class="fa-solid fa-paper-plane text-lg"></i>
          <span>{{ t('contactFormSubmit') }}</span>
        </button>

        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-[#2a2020]"></div>
          <span class="text-[#5a5a5a] text-sm font-bold uppercase tracking-wider">ou</span>
          <div class="flex-1 h-px bg-[#2a2020]"></div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="sendViaWhatsApp()"
            :disabled="!userMessage.trim()"
            class="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300"
            :class="userMessage.trim() ? 'bg-[#25d366] hover:bg-[#1fb855] hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(37,211,102,0.3)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.5)] cursor-pointer' : 'bg-[#25d366]/30 cursor-not-allowed'"
          >
            <i class="fa-brands fa-whatsapp text-lg"></i>
            <span>WhatsApp</span>
          </button>
          <button
            @click="sendViaEmail()"
            :disabled="!userMessage.trim()"
            class="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300"
            :class="userMessage.trim() ? 'bg-[#b53d3d] hover:bg-[#c94a4a] hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(181,61,61,0.3)] hover:shadow-[0_4px_25px_rgba(181,61,61,0.5)] cursor-pointer' : 'bg-[#b53d3d]/30 cursor-not-allowed'"
          >
            <i class="fa-solid fa-envelope text-lg"></i>
            <span>Email</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.contact-scroll::-webkit-scrollbar {
  width: 8px;
}

.contact-scroll::-webkit-scrollbar-track {
  background: #201818;
  border-radius: 0 12px 12px 0;
}

.contact-scroll::-webkit-scrollbar-thumb {
  background: #3a2a2a;
  border-radius: 4px;
}

.contact-scroll::-webkit-scrollbar-thumb:hover {
  background: #4a3535;
}

.contact-scroll {
  scrollbar-color: #3a2a2a #201818;
  scrollbar-width: thin;
}
</style>
