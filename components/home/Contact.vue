<script lang="ts" setup>
const { t } = useI18n();

const activeBar = ref(0);

function toggle(index: number) {
  activeBar.value = index;
}

const bars = computed(() => [
  { title: t('contactBarScheduleTitle'), text: t('contactBarScheduleText'), icon: 'clock' },
  { title: t('contactBarLocationTitle'), text: t('contactBarLocationText'), icon: 'pin' },
  { title: t('contactBarContactTitle'), text: t('contactBarContactText'), icon: 'phone' },
]);
</script>

<template>
  <section id="contactos" class="w-full bg-[#121212] py-12 px-4 sm:px-8 lg:px-16 mb-8">
    <div class="max-w-7xl mx-auto flex flex-col items-center">
      <div class="flex flex-col items-center mb-14">
        <h1 class="text-[42px] text-center text-white font-extrabold w-fit leading-[55px]">
          {{ t('contactSectionTitle') }}
        </h1>
        <h1 class="text-[42px] text-center text-[#D32F2F] font-extrabold w-fit leading-[55px]">
          {{ t('contacts') }}
        </h1>
      </div>

      <div class="w-full flex flex-col lg:flex-row gap-10 lg:gap-0">

      <!-- Left: Accordion bars -->
      <div class="w-full lg:w-[55%] flex flex-col gap-4 pr-0 lg:pr-10">
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
              <span class="text-lg font-semibold text-white">{{ bar.title }}</span>
            </span>
          </button>

          <Transition name="accordion">
            <div v-if="activeBar === i" class="px-6 pb-5">
              <p class="text-[#a0a0a0] text-sm leading-relaxed">{{ bar.text }}</p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Right: Google Maps -->
      <div class="w-full lg:w-[45%] min-h-[350px] sm:min-h-[420px] rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.5)]">
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
