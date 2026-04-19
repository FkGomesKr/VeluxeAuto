<script lang="ts" setup>
const { t, locale } = useI18n();

const activeBar = ref(0);
const flipped = ref(false);
const userMessage = ref('');
const userName = ref('');
const userEmail = ref('');
const userPhone = ref('');
const formError = ref('');
const formSubmitted = ref(false);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

function toggle(index: number) {
  activeBar.value = index;
}

function flipToForm() {
  flipped.value = true;
}

function flipBack() {
  flipped.value = false;
  formError.value = '';
}

function sendViaWhatsApp() {
  const msg = userMessage.value.trim();
  if (!msg) return;
  const url = `https://wa.me/351912247691?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function sendViaEmail() {
  const msg = userMessage.value.trim();
  if (!msg) return;
  const url = `mailto:veluxeauto@gmail.com?subject=${encodeURIComponent(t('emailSubject'))}&body=${encodeURIComponent(msg)}`;
  window.location.href = url;
}

const isEmailValid = computed(() => !userEmail.value.trim() || EMAIL_RE.test(userEmail.value.trim()));
const isPhoneValid = computed(() => !userPhone.value.trim() || PHONE_RE.test(userPhone.value.trim()));
const hasValidContact = computed(() =>
  (userEmail.value.trim() && isEmailValid.value) || (userPhone.value.trim() && isPhoneValid.value)
);

const canSubmitForm = computed(() =>
  userName.value.trim() && userMessage.value.trim() && hasValidContact.value
);

const submitting = ref(false);

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

function resetForm() {
  userName.value = '';
  userEmail.value = '';
  userPhone.value = '';
  userMessage.value = '';
  formError.value = '';
  formSubmitted.value = false;
  flipBack();
}

const bars = computed(() => [
  { title: t('contactBarScheduleTitle'), text: t('contactBarScheduleText'), icon: 'clock' },
  { title: t('contactBarLocationTitle'), text: t('contactBarLocationText'), icon: 'pin' },
  { title: t('contactBarContactTitle'), text: t('contactBarContactText'), icon: 'phone' },
]);
</script>

<template>
  <section id="contactos" class="w-full bg-[#121212] py-12 px-8 md:px-4 sm:px-8 lg:px-16 mb-0 sm:mb-8">
    <div class="max-w-7xl mx-auto flex flex-col items-center">
      <div class="flex flex-col items-center mb-14">
        <h1 class="text-[35px] lg:text-[42px] text-center text-white font-extrabold w-fit leading-[40px] lg:leading-[55px]">
          {{ t('contactSectionTitle') }}
        </h1>
        <h1 class="text-[35px] lg:text-[42px] text-center text-[#D32F2F] font-extrabold w-fit leading-[40px] lg:leading-[55px]">
          {{ t('contacts') }}
        </h1>
      </div>

      <div class="w-full flex flex-col lg:flex-row lg:items-stretch gap-10 lg:gap-0">

      <!-- Left: Flip card container -->
      <div class="w-full lg:w-[55%] pr-0 lg:pr-10 flip-perspective">
        <div class="flip-card h-full" :class="{ 'is-flipped': flipped }">

          <!-- FRONT FACE -->
          <div class="flip-face flip-front flex flex-col gap-4 h-full">
            <!-- 3 accordion bars -->
            <div
              v-for="(bar, i) in bars"
              :key="i"
              class="rounded-xl overflow-hidden transition-all duration-300"
              :class="activeBar === i ? 'bg-[#201818] shadow-[0_4px_20px_rgba(255,255,255,0.05)]' : 'bg-[#161111] hover:bg-[#201818]'"
            >
              <button
                class="w-full flex items-center justify-between px-6 py-5 cursor-pointer"
                @click="toggle(i)"
              >
                <span class="flex items-center gap-3">
                  <svg v-if="bar.icon === 'clock'" class="w-5 h-5 shrink-0 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  <svg v-else-if="bar.icon === 'pin'" class="w-5 h-5 shrink-0 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <svg v-else-if="bar.icon === 'phone'" class="w-5 h-5 shrink-0 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span class="text-md xl:text-lg font-semibold text-white">{{ bar.title }}</span>
                </span>
              </button>

              <Transition name="accordion">
                <div v-if="activeBar === i" class="px-6 pb-5">
                  <p class="text-[#a0a0a0] text-sm leading-relaxed">{{ bar.text }}</p>
                </div>
              </Transition>
            </div>

            <div class="h-10 md:h-0"></div>

            <!-- 4th bar: Send message (pushed to bottom) -->
            <button
              @click="flipToForm()"
              class="cta-pulse mt-auto rounded-xl bg-[#b53d3d] hover:bg-[#c94a4a] hover:-translate-y-0.5 transition-all duration-300 px-6 py-5 cursor-pointer flex items-center justify-between group shadow-[0_4px_20px_rgba(181,61,61,0.25)] hover:shadow-[0_6px_35px_rgba(181,61,61,0.5)]"
            >
              <span class="flex items-center gap-3">
                <svg class="w-5 h-5 shrink-0 text-white transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span class="text-md xl:text-lg font-semibold text-white">{{ t('contactFormBarTitle') }}</span>
              </span>
              <svg class="w-5 h-5 text-white/60 transition-all duration-300 group-hover:text-white group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M5 12h14m-7-7 7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <!-- BACK FACE -->
          <div class="flip-face flip-back flip-back-scroll flex flex-col rounded-xl bg-[#201818] shadow-[0_4px_20px_rgba(255,255,255,0.05)] p-6 overflow-y-auto">

            <!-- Success state -->
            <div v-if="formSubmitted" class="flex-1 flex flex-col items-center justify-center gap-5 text-center">
              <div class="w-16 h-16 rounded-full bg-[#25d366]/15 flex items-center justify-center">
                <svg class="w-8 h-8 text-[#25d366]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <p class="text-white text-lg font-semibold">{{ t('contactFormBarTitle') }}</p>
              <p class="text-[#a0a0a0] text-sm">{{ t('contactBarScheduleText').split('.')[0] }}.</p>
              <button
                @click="resetForm()"
                class="mt-2 text-[#b53d3d] hover:text-[#c94a4a] text-md font-medium transition-colors duration-200 cursor-pointer"
              >
                ← {{ t('backToContact') }}
              </button>
            </div>

            <!-- Form state -->
            <template v-else>
              <!-- Header with back arrow -->
              <div class="flex items-center gap-3 mb-5">
                <button
                  @click="flipBack()"
                  class="group/back text-[#a0a0a0] hover:text-white transition-colors duration-200 p-1"
                >
                  <svg class="w-6 h-6 transition-transform duration-200 group-hover/back:-translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M19 12H5m7-7-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <h3 class="text-md xl:text-xl font-semibold text-white">{{ t('contactFormBarTitle') }}</h3>
              </div>

              <!-- Name -->
              <input
                v-model="userName"
                type="text"
                :placeholder="t('contactFormName') + ' *'"
                class="w-full bg-[#161111] text-white text-sm rounded-xl px-5 py-3.5 border transition-colors duration-200 focus:outline-none placeholder-[#5a5a5a] mb-3"
                :class="userName.trim() ? 'border-[#2a2020] focus:border-[#b53d3d]' : 'border-[#2a2020] focus:border-[#b53d3d]'"
              >

              <!-- Email + Phone row -->
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

              <!-- Contact hint -->
              <p class="text-xs px-1 mt-1.5 mb-3 transition-colors duration-300" :class="formError ? 'text-red-400' : hasValidContact ? 'text-[#25d366]/70' : 'text-[#5a5a5a]'">
                <span v-if="formError">{{ formError }}</span>
                <span v-else-if="hasValidContact">
                  <svg class="w-3 h-3 inline-block mr-0.5 -mt-0.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  {{ userEmail.trim() && isEmailValid && userPhone.trim() && isPhoneValid ? t('contactFormEmail') + ' & ' + t('contactFormPhone') : userEmail.trim() && isEmailValid ? t('contactFormEmail') : t('contactFormPhone') }}
                </span>
                <span v-else>{{ t('contactFormContactRequired') }}</span>
              </p>

              <!-- Message textarea -->
              <div class="flex-1 flex flex-col mb-4">
                <textarea
                  v-model="userMessage"
                  :placeholder="t('contactFormPlaceholder') + ' *'"
                  maxlength="500"
                  class="flex-1 w-full bg-[#161111] text-white text-sm rounded-xl px-5 py-4 border border-[#2a2020] focus:border-[#b53d3d] focus:outline-none transition-colors duration-200 resize-none placeholder-[#5a5a5a] min-h-[120px]"
                />
                <span class="text-[#5a5a5a] text-xs text-right mt-1.5 tabular-nums">{{ userMessage.length }} / 500</span>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-col gap-3">
                <!-- Submit form button -->
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

                <!-- Divider -->
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-px bg-[#2a2020]"></div>
                  <span class="text-[#5a5a5a] text-sm font-bold uppercase tracking-wider">ou</span>
                  <div class="flex-1 h-px bg-[#2a2020]"></div>
                </div>

                <!-- WhatsApp + Email row -->
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

        </div>
      </div>

      <!-- Right: Google Maps -->
      <div class="w-full lg:w-[45%] min-h-[350px] sm:min-h-[420px] rounded-xl">
        <iframe
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Braga,Portugal&maptype=roadmap&zoom=12"
          class="w-full h-full aspect-square md:aspect-square border-0 rounded-xl"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Braga, Portugal"
        />
      </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Flip card */
.flip-perspective {
  perspective: 1200px;
}

.flip-card {
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-card.is-flipped {
  transform: rotateY(180deg);
}

.flip-face {
  width: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-front {
  position: relative;
}

.flip-back {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transform: rotateY(180deg);
}

.flip-back-scroll::-webkit-scrollbar {
  width: 8px;
}

.flip-back-scroll::-webkit-scrollbar-track {
  background: #201818;
  border-radius: 0 12px 12px 0;
}

.flip-back-scroll::-webkit-scrollbar-thumb {
  background: #3a2a2a;
  border-radius: 4px;
}

.flip-back-scroll::-webkit-scrollbar-thumb:hover {
  background: #4a3535;
}

.flip-back-scroll {
  scrollbar-color: #3a2a2a #201818;
  scrollbar-width: thin;
}

/* CTA pulse glow */
.cta-pulse {
  animation: ctaGlow 3s ease-in-out infinite;
}

@keyframes ctaGlow {
  0%, 100% { box-shadow: 0 4px 20px rgba(181, 61, 61, 0.25); }
  50% { box-shadow: 0 4px 30px rgba(181, 61, 61, 0.45), 0 0 15px rgba(181, 61, 61, 0.15); }
}

.cta-pulse:hover {
  animation: none;
}

/* Accordion */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  max-height: 200px;
  opacity: 1;
  color: #1b1515;
}
</style>
