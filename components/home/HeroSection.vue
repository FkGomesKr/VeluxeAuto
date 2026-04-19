<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { ref, onMounted, computed, nextTick } from 'vue';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

const { t, locale } = useI18n();
const selectedRange = ref([1990, 2024]);
const selectedRange2 = ref([10000, 400000]);
const selectedRange3 = ref([3000, 50000]); 
const router = useRouter(); 
const openFilters = ref(false);
const marca = ref('')
const combustivel = ref('')
const modelo = ref('')
const transmissao = ref('')
const tipologia = ref('')
const lugares = ref('')

const YEAR_MIN = 1990;
const YEAR_MAX = 2024;
const PRICE_MIN = 3000;
const PRICE_MAX = 50000;
const KM_MIN = 10000;
const KM_MAX = 400000;

function rangeToPct(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

const yearHandlePct = computed(() => [
  rangeToPct(selectedRange.value[0], YEAR_MIN, YEAR_MAX),
  rangeToPct(selectedRange.value[1], YEAR_MIN, YEAR_MAX),
]);
const priceHandlePct = computed(() => [
  rangeToPct(selectedRange3.value[0], PRICE_MIN, PRICE_MAX),
  rangeToPct(selectedRange3.value[1], PRICE_MIN, PRICE_MAX),
]);
const kmHandlePct = computed(() => [
  rangeToPct(selectedRange2.value[0], KM_MIN, KM_MAX),
  rangeToPct(selectedRange2.value[1], KM_MIN, KM_MAX),
]);

const marcas = [
  {
    title: "Audi"
  },
  {
    title: "BMW"
  },
  {
    title: "Mercedes"
  },
  {
    title: "Fiat"
  },
  {
    title: "Toyota"
  },
  {
    title: "Peugeot"
  }
]

const combustiveis = [
  {
    title: t('gasoline'),
  },
  {
    title: t('diesel'),
  },
  {
    title: t('lpg'),
  },
  {
    title: t('eletric')
  }
]

const transmissoes = [
  {
    title: t('manual')
  },
  {
    title: t('automatic')
  }
];

const lugaresOpcoes = [
  {
    title: 2
  },
  {
    title: 3
  },
  {
    title: 4 
  },
  {
    title: 5
  },
  {
    title: 6
  }
];

const typologies = [
  {
    title: t('utility')
  },
  {
    title: t('cityBased')
  },
  {
    title: t('suv')
  },
  {
    title: t('van')
  },
  {
    title: t('monoVolume')
  }
];

const pesquisar = () => {
  // Use router.push to navigate to /stock with query parameters
  router.push({
    path: '/stock',
    query: {
      marca: marca.value,
      combustivel: combustivel.value,
      minAno: selectedRange.value[0],
      maxAno: selectedRange.value[1],
      minPreco: selectedRange3.value[0],
      maxPreco: selectedRange3.value[1],
      minKM: selectedRange2.value[0],
      maxKM: selectedRange2.value[1],
      modelo: modelo.value,
      transmissao: transmissao.value,
      tipologia: tipologia.value,
      lugares: lugares.value,
    }
  });
};

onMounted(() => {
  const slider = document.getElementById('year-slider') as HTMLElement;

  noUiSlider.create(slider, {
    start: selectedRange.value,
    connect: true,
    range: {
      min: YEAR_MIN,
      max: YEAR_MAX
    },
    step: 1,
    tooltips: false,
    format: {
      to: (value: number) => Math.round(value),
      from: (value: string) => parseInt(value, 10)
    }
  });

  const connectBars = slider.getElementsByClassName('noUi-connect');
  for (let i = 0; i < connectBars.length; i++) {
    const bar = connectBars[i] as HTMLElement;
    bar.style.background = '#b53d3d';
    bar.style.border = 'none';
    bar.style.outline = 'none';
    bar.style.boxShadow = 'none';
    bar.style.height = '7px';
  }

  const handles = slider.querySelectorAll<HTMLElement>('.noUi-handle');
  handles.forEach((handle) => {
    handle.style.background = '#b53d3d';
    handle.style.border = 'none';
    handle.style.borderRadius = '4px';
    handle.style.boxShadow = 'none';
    handle.style.outline = 'none';
    handle.style.width = '10px';
    handle.style.height = '20px';
    handle.style.marginRight = '8px';
  });

  slider.noUiSlider?.on('update', (values: any) => {
    selectedRange.value = values.map((value: string) => parseInt(value, 10));
  });
});

function initializeSliders() {
  const slider2 = document.getElementById('price-slider');
  const slider3 = document.getElementById('kilometer-slider');
  
  if (!slider2 || !slider3) {
    console.warn('One or more sliders are missing from the DOM.');
    return;
  }

  // Initialize sliders only if they are visible
  if (slider2.offsetParent !== null && slider3.offsetParent !== null) {
    noUiSlider.create(slider2, {
      start: selectedRange3.value,
      connect: true,
      range: {
        min: PRICE_MIN,
        max: PRICE_MAX
      },
      step: 1,
      tooltips: false,
      format: {
        to: (value: number) => Math.round(value) + '€',
        from: (value: string) => parseInt(value, 10)
      }
    });

    noUiSlider.create(slider3, {
      start: selectedRange2.value,
      connect: true,
      range: {
        min: KM_MIN,
        max: KM_MAX
      },
      step: 1,
      tooltips: false,
      format: {
        to: (value: number) => Math.round(value) + 'km',
        from: (value: string) => parseInt(value, 10)
      }
    });
  }

  const connectBars2 = slider2.getElementsByClassName("noUi-connect");
  for (let i = 0; i < connectBars2.length; i++) {
    const bar = connectBars2[i] as HTMLElement;
    bar.style.background = "#b53d3d"; 
    bar.style.border = "none"; 
    bar.style.outline = "none"; 
    bar.style.boxShadow = "none"; 
    bar.style.height = "7px";
  }
  const connectBars3 = slider3.getElementsByClassName("noUi-connect");
  for (let i = 0; i < connectBars3.length; i++) {
    const bar = connectBars3[i] as HTMLElement;
    bar.style.background = "#b53d3d"; 
    bar.style.border = "none"; 
    bar.style.outline = "none"; 
    bar.style.boxShadow = "none";
    bar.style.height = "7px";
  }
  
  const handles2 = slider2.querySelectorAll<HTMLElement>('.noUi-handle');
  handles2.forEach((handle) => {
    handle.style.background = '#b53d3d';
    handle.style.border = 'none';
    handle.style.borderRadius = '4px';
    handle.style.boxShadow = 'none';
    handle.style.outline = 'none';
    handle.style.width = '10px';
    handle.style.height = '20px';
    handle.style.marginRight = '8px';
  });

  const handles3 = slider3.querySelectorAll<HTMLElement>('.noUi-handle');
  handles3.forEach((handle) => {
    handle.style.background = '#b53d3d';
    handle.style.border = 'none';
    handle.style.borderRadius = '4px';
    handle.style.boxShadow = 'none';
    handle.style.outline = 'none';
    handle.style.width = '10px';
    handle.style.height = '20px';
    handle.style.marginRight = '8px';
  });

  slider2.noUiSlider?.on('update', (values: any) => {
    selectedRange3.value = values.map((value: string) => parseInt(value, 10));
  });
  slider3.noUiSlider?.on('update', (values: any) => {
    selectedRange2.value = values.map((value: string) => parseInt(value, 10));
  });
}

const isHiding = ref(false);

function toggleOpenFilters() {
  if (openFilters.value) {
    isHiding.value = true;
    setTimeout(() => {
      openFilters.value = false;
      isHiding.value = false;
    }, 700); 
  } else {
    openFilters.value = true;
    nextTick(() => {
      initializeSliders();
    });
  }
}
</script>

<template>
  <div class="w-full relative bg-[#121212] mt-[-90px] md:mt-[-40px] transition-[min-height] duration-[0.7s] ease-in-out" :class="openFilters && !isHiding ? 'min-h-[1040px] md:min-h-[570px]' : 'min-h-[530px] md:min-h-[310px]'">
      <div v-if="openFilters" class="block h-[925px] md:hidden "></div>
      <!-- <img class="hidden md:hidden w-full h-[550px] object-cover pointer-events-none" src="https://dvqnsnzkbesefygzzxrq.supabase.co/storage/v1/object/public/carImages/homePage/bgHero.jpg" alt="Background Image Hero Section"> -->
      <div class="absolute inset-0 top-[140px] md:top-[22%] flex flex-col items-center w-full">
        <div class="bg-[#201818] px-0 lg:px-8 pt-10 pb-6 rounded-xl md:rounded-[100px] items-center justify-center w-full max-w-[300px] md:max-w-[700px] lg:max-w-[900px] test">
          <div class="text-[#D32F2F] flex justify-center md:justify-between items-center mr-0 md:mr-8 px-6 md:px-10 mb-4">
            <svg class="hidden md:block" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 2a8 8 0 0 1 8 8c0 2.4-1 4.5-2.7 6c-1.4-1.3-3.3-2-5.3-2s-3.8.7-5.3 2C5 16.5 4 14.4 4 12a8 8 0 0 1 8-8m2 1.89c-.38.01-.74.26-.9.65l-1.29 3.23l-.1.23c-.71.13-1.3.6-1.57 1.26c-.41 1.03.09 2.19 1.12 2.6s2.19-.09 2.6-1.12c.26-.66.14-1.42-.29-1.98l.1-.26l1.29-3.21l.01-.03c.2-.51-.05-1.09-.56-1.3c-.13-.05-.26-.07-.41-.07M10 6a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1M7 9a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1m10 0a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1"/></svg>
            <h1 class="text-[#D32F2F] text-center text-2xl font-bold mr-0 md:mr-10">
              {{ t('filtersTitle') }}
            </h1>
            <div></div>
          </div>
          <!-- md:pr-12 reserves space for the filter toggle (absolute) so column % match the rows below -->
          <div class="relative flex flex-col gap-6 md:gap-0 px-0 md:px-3 pl-6 md:pl-0 md:pr-12">
            <!-- Full width like expanded rows — do not use flex-1 beside the button or 30/36/30% won’t match -->
            <div class="flex w-full flex-col gap-3 md:gap-8 md:flex-row md:justify-center">
              <div class="w-[70%] md:w-[27%] md:min-w-0 rounded-xl relative pl-0 md:pl-6">
                <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('brand') }}</label>
                <select v-model="marca" class="bg-transparent hover:bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
                  <option class="bg-[#201818]" value="">{{ t('select') }}</option>
                  <option class="bg-[#201818]" v-for="marca in marcas" :key="marca.title" :value="marca.title">{{ marca.title }}</option>
                </select>
                <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
              </div>

              <div class="hero-year-slider hero-slider-col relative w-[90%] md:w-[42%] flex flex-col gap-3 pl-2 pr-3 md:px-3 pb-0 translate-y-9 mb-6 md:mb-0">
                <label class="text-xs text-[#b53d3d] font-semibold absolute top-[-30px]">{{ t('year') }}</label>
                <div class="slider-with-labels w-full">
                  <div id="year-slider" class="slider relative"></div>
                  <div class="slider-value-row hero-year-value-row relative min-h-[1.375rem] pointer-events-none">
                    <span
                      v-for="(pct, i) in yearHandlePct"
                      :key="'hero-year-' + i"
                      class="slider-value-chip slider-value-chip--year"
                      :style="{ left: pct + '%' }"
                    >{{ Math.round(selectedRange[i]) }}</span>
                  </div>
                </div>
              </div>

              <!-- Dropdown Combustível -->
              <div class="w-[90%] md:w-[27%] md:min-w-0 relative pr-0 md:pr-10">
                <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('fuel') }}</label>
                <select v-model="combustivel" class="bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
                  <option class="bg-[#201818]" value="">{{ t('select') }}</option>
                  <option class="bg-[#201818]" v-for="combustivel in combustiveis" :key="combustivel.title">{{ combustivel.title }}</option>
                </select>
                <svg class="absolute top-[50%] right-2 md:right-12 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
              </div>
            </div>
            <button
              type="button"
              class="absolute top-[31px] lg:right-[10px] md:right-[28px] right-[30px] border-0 bg-transparent cursor-pointer z-10"
              @click="toggleOpenFilters()"
              >
              <svg :class="{'rotate-[90deg]': openFilters && !isHiding}" class="transition duration-[0.2s] ease-in-out" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="none" stroke="white" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.5" d="M21.25 12H8.895m-4.361 0H2.75m18.5 6.607h-5.748m-4.361 0H2.75m18.5-13.214h-3.105m-4.361 0H2.75m13.214 2.18a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm-9.25 6.607a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm6.607 6.608a2.18 2.18 0 1 0 0-4.361a2.18 2.18 0 0 0 0 4.36Z"/></svg>
            </button>
          </div>
          
          <div 
            v-if="openFilters"
            :class="{
              'appearSmooth': openFilters && !isHiding,
              'disappearSmooth': isHiding
            }"
            class="w-full transition-all duration-[1.5s] ease-in-out"
          >
            <div class="w-full flex justify-center items-center">
              <div class="mt-6 bg-[#b53d3d] opacity-[0.3] h-[1px] w-full ml-10 mr-12 py-[1px]"></div>
            </div>
            <div class="flex flex-col gap-3 md:gap-8 md:flex-row justify-center px-0 md:px-3 mt-2 pl-6 md:pl-0 md:pr-12">
              <div class="w-[90%] md:w-[27%] rounded-xl relative pl-0 md:pl-6">
                <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('model') }}</label>
                <select v-model="modelo" class="bg-transparent hover:bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
                  <option class="bg-[#201818]" value="">{{ t('select') }}</option>
                  <option class="bg-[#201818]" v-for="marca in marcas" :key="marca.title" :value="marca.title">{{ marca.title }}</option>
                </select>
                <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
              </div>

              <div class="hero-price-slider hero-slider-col relative w-[90%] md:w-[42%] flex flex-col gap-3 pl-2 pr-3 md:px-3 pb-0 translate-y-9 mb-6 md:mb-0">
                <label class="text-xs text-[#b53d3d] font-semibold absolute top-[-30px] mr-6">{{ t('budget') }}</label>
                <div class="slider-with-labels w-full">
                  <div id="price-slider" class="slider relative"></div>
                  <div class="slider-value-row hero-price-value-row relative min-h-[1.375rem] pointer-events-none">
                    <span
                      v-for="(pct, i) in priceHandlePct"
                      :key="'hero-price-' + i"
                      class="slider-value-chip slider-value-chip--price"
                      :style="{ left: pct + '%' }"
                    >{{ Math.round(selectedRange3[i]) }}€</span>
                  </div>
                </div>
              </div>

              <div class="w-[90%] md:w-[27%] relative pr-0 md:pr-10">
                <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('typology') }}</label>
                <select v-model="tipologia" class="bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
                  <option class="bg-[#201818]" value="">{{ t('select') }}</option>
                  <option class="bg-[#201818]" v-for="opt in typologies" :key="opt.title">{{ opt.title }}</option>
                </select>
                <svg class="absolute top-[50%] right-2 md:right-12 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
              </div>
            </div>

            <div class="w-full flex justify-center items-center block md:hidden">
              <div class="mt-6 bg-[#b53d3d] opacity-[0.3] h-[1px] w-full ml-10 mr-12 py-[1px]"></div>
            </div>

            <div class="flex flex-col gap-3 md:gap-8 md:flex-row justify-center px-0 md:px-3 mt-3 pl-6 md:pl-0 md:pr-12">
              <div class="w-[90%] md:w-[27%] rounded-xl pl-0 md:pl-6 relative">
                <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('transmission') }}</label>
                <select v-model="transmissao" class="bg-transparent hover:bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
                  <option class="bg-[#201818]" value="">{{ t('select') }}</option>
                  <option class="bg-[#201818]" v-for="opt in transmissoes" :key="opt.title" :value="opt.title">{{ opt.title }}</option>
                </select>
                <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
              </div>

              <div class="hero-km-slider hero-slider-col relative w-[90%] md:w-[42%] flex flex-col gap-3 pl-2 pr-3 md:px-3 pb-0 translate-y-9 mb-6 md:mb-0">
                <label class="text-xs text-[#b53d3d] font-semibold absolute top-[-30px] ml-1 md:ml-0 mr-6">{{ t('kilometers') }}</label>
                <div class="slider-with-labels w-full">
                  <div id="kilometer-slider" class="slider relative"></div>
                  <div class="slider-value-row hero-km-value-row relative min-h-[1.375rem] pointer-events-none">
                    <span
                      v-for="(pct, i) in kmHandlePct"
                      :key="'hero-km-' + i"
                      class="slider-value-chip slider-value-chip--km"
                      :style="{ left: pct + '%' }"
                    >{{ Math.round(selectedRange2[i]) }}km</span>
                  </div>
                </div>
              </div>

              <div class="w-[90%] md:w-[27%] relative pr-0 md:pr-10">
                <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('capacity') }}</label>
                <select v-model="lugares" class="bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
                  <option class="bg-[#201818]" value="">{{ t('select') }}</option>
                  <option class="bg-[#201818]" v-for="opt in lugaresOpcoes" :key="opt.title">{{ opt.title + ' ' +  t('seats') }}</option>
                </select>
                <svg class="absolute top-[50%] right-2 md:right-12 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
              </div>
            </div>
            <div class="w-full flex justify-center items-center hidden md:block">
              <div class="mt-6 bg-[#b53d3d] opacity-[0.3] h-[1px] w-full ml-10 mr-12 py-[1px]"></div>
            </div>
          </div>
          <div class="flex justify-center text-white font-bold items-center">
            <button @click="pesquisar" class="bg-[#b53d3d] py-3 w-[170px] md:w-[250px] mt-6 rounded-full hover:opacity-[0.9] hover:scale-[1.02] transform transition duration-300 ease-in-out">
              {{ t('search') }} <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
      </div>
  </div>

</template>

<style scoped>
.test {
  box-shadow: 0 0 30px #511e1e;
  background: linear-gradient(to bottom, #281d1d, #281d1d, #431313);
}

.slider {
  width: 100%;
  height: 10px;
}

.slider :deep(.noUi-horizontal .noUi-handle) {
  width: 20px !important;
  height: 12px !important;
  min-width: 16px;
  max-width: 16px;
  cursor: grab;
  overflow: hidden;
  background: #b53d3d !important;
  border: none !important;
}

.slider :deep(.noUi-horizontal .noUi-handle:active) {
  cursor: grabbing;
}

.slider :deep(.noUi-handle::before),
.slider :deep(.noUi-handle::after) {
  display: none;
}

/* Injected slider nodes lack Vue scope attrs; hide library tooltips if any */
.slider :deep(.noUi-tooltip) {
  display: none !important;
}

.slider-value-row {
  width: 100%;
  margin-top: 14px;
}

.slider-value-chip {
  position: absolute;
  top: 2px;
  font-size: 13px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  line-height: 1.25;
  margin-left: 4px;
}

.slider-value-chip--year { 
  transform: translateX(-50%);
}

.slider-value-chip--price { 
  transform: translateX(-50%);
}

.slider-value-chip--km { 
  transform: translateX(-55%);
}

.hero-slider-col {
  box-sizing: border-box;
  min-width: 0;
}

/* Hero sliders: nudge down vs adjacent selects; tighten gap under track (noUi + custom chips) */
.hero-year-slider .hero-year-value-row,
.hero-price-slider .hero-price-value-row,
.hero-km-slider .hero-km-value-row {
  margin-top: 10px;
}

@keyframes slide-down {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.appearSmooth {
  animation: slide-down 0.7s ease-in-out;
  overflow: hidden;
}

@keyframes slide-up {
  from {
    opacity: 1;
    max-height: 200px;
  }
  to {
    opacity: 0;
    max-height: 0;
  }
}

.disappearSmooth {
  animation: slide-up 0.7s ease-in-out;
  overflow: hidden;
}

@media (max-width: 768px) {
  @keyframes slide-up {
    from {
      opacity: 1;
      max-height: 500px;
    }
    to {
      opacity: 0;
      max-height: 0;
    }
  };
}

.shadow1 {
  position: absolute;
  width: 1000px; 
  height: 850px;
  bottom: -500px;
  left: -300px;
  background : radial-gradient(closest-side, rgba(157,170,255,0.21), #151316);
  opacity: 0.6;
  z-index: 0;
}

.shadow2 {
  position: absolute;
  width: 1000px; 
  height: 850px;
  top: -500px;
  left: -300px;
  background : radial-gradient(closest-side, rgba(157,170,255,0.21), #151316);
  opacity: 0.35;
  z-index: 0;
}

/* noUi adds .noUi-target on the same node as .slider — descendant selector never matched */
/* Track = outside the selected interval; selected span = .noUi-connect (red) */
.slider.noUi-target {
  background-color: #605b5b;
  border: none !important;
  border-radius: 3px;
  outline: none;
  box-shadow: none !important;
  height: 7px;
}

.slider :deep(.noUi-connect) {
  background: #b53d3d !important;
  border: none !important;
}
</style>
