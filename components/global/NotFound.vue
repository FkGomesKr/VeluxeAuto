<script lang="ts" setup>
const { t } = useI18n();
const localCode = useCookie('i18n_redirected');

const homePath = computed(() => localCode.value === 'pt' ? '/' : '/' + localCode.value);
const stockPath = computed(() => localCode.value === 'pt' ? '/stock' : '/' + localCode.value + '/stock');

function goTo(path: string) {
  clearError({ redirect: path });
}
</script>

<template>
  <div class="bg-[#121212] flex flex-col items-center justify-center px-6 text-center py-16">
    <h1 class="text-[120px] sm:text-[160px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#b53d3d] to-[#5a1e1e] select-none">
      404
    </h1>

    <p class="text-white text-xl sm:text-2xl font-semibold mt-2 mb-3">
      {{ t('notFoundTitle') }}
    </p>

    <p class="text-[#a0a0a0] text-sm sm:text-base max-w-md mb-10">
      {{ t('notFoundText') }}
    </p>

    <div class="flex flex-col sm:flex-row items-center gap-4">
      <button
        @click="goTo(homePath)"
        class="px-8 py-3.5 rounded-xl bg-[#b53d3d] hover:bg-[#c94a4a] text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(181,61,61,0.3)] hover:shadow-[0_6px_30px_rgba(181,61,61,0.5)] cursor-pointer"
      >
        {{ t('notFoundHome') }}
      </button>

      <button
        @click="goTo(stockPath)"
        class="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
      >
        {{ t('notFoundStock') }}
      </button>
    </div>
  </div>
</template>
