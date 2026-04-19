<script setup lang="ts">
import { computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import 'swiper/css';
import 'swiper/css/navigation'; 

const {t, locale} = useI18n();
const failedImages = reactive(new Set<string>())
const resolvedImages = reactive(new Set<string>())
function onImageError(src: string) {
  failedImages.add(src)
  resolvedImages.add(src)
}
function onImageLoad(src: string) {
  resolvedImages.add(src)
}
function isCarImageReady(carro: any): boolean {
  if (!carro.imagens || carro.imagens.length === 0) return true
  return carro.imagens.some((img: string) => resolvedImages.has(img))
}
const selectedRange = ref([1990, 2024]);
const selectedRange2 = ref([10000, 400000]);
const selectedRange3 = ref([3000, 50000]); 
const localCode = useCookie("i18n_redirected");

const props = defineProps({
  marca: String,
  combustivel: String,
  minAno: Number,
  maxAno: Number,
  minPreco: Number,
  maxPreco: Number,
  minKM: Number,
  maxKM: Number,
  modelo: String,
  transmissao: String,
  tipologia: String,
  lugares: String,
});

const marca = ref(props.marca ? props.marca : "");
const combustivel = ref(props.combustivel ? props.combustivel : "");
const modelo = ref(props.modelo ? props.modelo : "");
const transmissao = ref(props.transmissao ? props.transmissao : "");
const tipologia = ref(props.tipologia ? props.tipologia : "");
const lugares = ref(props.lugares ? props.lugares : "");
selectedRange.value[0] = props.minAno ? props.minAno : 1990;
selectedRange.value[1] = props.maxAno ? props.maxAno : 2024;
selectedRange3.value[0] = props.minPreco ? props.minPreco : 3000;
selectedRange3.value[1] = props.maxPreco ? props.maxPreco : 50000;
selectedRange2.value[0] = props.minKM ? props.minKM : 10000;
selectedRange2.value[1] = props.maxKM ? props.maxKM : 400000;

// Fetch cars from API
const { getCars } = useApi()
const carros = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

async function loadCars() {
  try {
    isLoading.value = true
    error.value = null
    const cars = await getCars()
    carros.value = cars
  } catch (err: any) {
    error.value = err.message || 'Failed to load cars'
    console.error('Error loading cars:', err)
  } finally {
    isLoading.value = false
  }
}

function retryLoad() {
  loadCars()
}

onMounted(() => {
  loadCars()
})


const orderByOptions = [
  {
    title: t('higherPrice')
  },
  {
    title: t('lowerPrice')
  },
  {
    title: t('latest')
  },
  {
    title: t('oldest')
  },
  {
    title: t('brandAZ')
  },
  {
    title: t('brandZA')
  },
  {
    title: t('higherKMs')
  },
  {
    title: t('lowerKMs')
  },
]

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
];

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

function extractNumber(input: string): number {
    const match = input.match(/\d+/);
    return match ? parseInt(match[0], 10) : NaN;
}

function parseFormattedNumber(input: string): number {
    return parseInt(input.replace(/\D/g, ""), 10);
}

const orderFilter = ref("");

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

const filteredCarros = computed(() => {
  let filtered = carros.value.filter(carro => {
    const isMarcaValid = marca.value ? carro.marca.toLowerCase().includes(marca.value.toLowerCase()) : true;
    const isCombustivelValid = combustivel.value ? t(carro.combustivel).toLowerCase().includes(combustivel.value.toLowerCase()) : true;
    const isTransmissionValid = transmissao.value ? t(carro.transmissao).toLowerCase().includes(transmissao.value.toLowerCase()) : true;
    const isTipologiaValid = tipologia.value ? t(carro.tipologia).toLowerCase().includes(tipologia.value.toLowerCase()) : true;
    const isLugaresValid = lugares.value ? carro.lugares==extractNumber(lugares.value) : true;
    const isAnoValid = (selectedRange.value[0]!== undefined ? carro.anoReg >= selectedRange.value[0] : true) &&
                       (selectedRange.value[1] !== undefined ? carro.anoReg <= selectedRange.value[1] : true);
    const isPrecoValid = (selectedRange3.value[0]!== undefined ? parseFormattedNumber(carro.preco) >= selectedRange3.value[0] : true) &&
                       (selectedRange3.value[1] !== undefined ? parseFormattedNumber(carro.preco) <= selectedRange3.value[1] : true);
    const isKMValid = (selectedRange2.value[0]!== undefined ? carro.kms >= selectedRange2.value[0] : true) &&
                       (selectedRange2.value[1] !== undefined ? carro.kms <= selectedRange2.value[1] : true);

    return isMarcaValid && isCombustivelValid && isAnoValid && isTransmissionValid && isTipologiaValid && isPrecoValid && isKMValid && isLugaresValid;
  });

  return filtered.sort((a, b) => {
    switch (orderFilter.value) {
      case t('lowerPrice'):
        return parseFloat(a.preco.replace(",", ".")) - parseFloat(b.preco.replace(",", "."));
      case t('higherPrice'):
        return parseFloat(b.preco.replace(",", ".")) - parseFloat(a.preco.replace(",", "."));
      case t('latest'):
        return b.anoReg - a.anoReg;
      case t('oldest'):
        return a.anoReg - b.anoReg;
      case t('brandAZ'):
        return a.marca.localeCompare(b.marca);
      case t('brandZA'):
        return b.marca.localeCompare(a.marca);
      case t('lowerKMs'):
        return a.kms - b.kms;
        case t('higherKMs'):
        return b.kms - a.kms;
      default:
        return 0;
    }
  });
});

function initializeSliders() {
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
      from: (value: string) => parseInt(value)
    }
  });

  const connectBars = slider.getElementsByClassName("noUi-connect");
  for (let i = 0; i < connectBars.length; i++) {
    const bar = connectBars[i] as HTMLElement;
    bar.style.background = "#b53d3d"; 
    bar.style.border = "none"; 
    bar.style.outline = "none"; 
    bar.style.boxShadow = "none";
    bar.style.height = "7px";
  }

  const handles = slider.querySelectorAll<HTMLElement>(".noUi-handle");
  handles.forEach(handle => {
    handle.style.background = "#b53d3d";
    handle.style.border = "none";
    handle.style.borderRadius = "4px";
    handle.style.boxShadow = "none";
    handle.style.outline = "none";
    handle.style.width = "10px";
    handle.style.height = "20px";
    handle.style.marginRight = "8px";
  });

  // Apply the custom tooltip styling after the slider is initialized
  slider.noUiSlider?.on('update', (values: any) => {
    selectedRange.value = values.map((value: string) => parseInt(value));
    //console.log("Intervalo selecionado: " + selectedRange.value[0] + " - " + selectedRange.value[1]);
  });

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
  
  const handles2 = slider2.querySelectorAll<HTMLElement>(".noUi-handle");
  handles2.forEach(handle => {
    handle.style.background = "#b53d3d";
    handle.style.border = "none";
    handle.style.borderRadius = "4px";
    handle.style.boxShadow = "none";
    handle.style.outline = "none";
    handle.style.width = "10px";
    handle.style.height = "20px";
    handle.style.marginRight = "8px";
  });
  const handles3 = slider3.querySelectorAll<HTMLElement>(".noUi-handle");
  handles3.forEach(handle => {
    handle.style.background = "#b53d3d";
    handle.style.border = "none";
    handle.style.borderRadius = "4px";
    handle.style.boxShadow = "none";
    handle.style.outline = "none";
    handle.style.width = "10px";
    handle.style.height = "20px";
    handle.style.marginRight = "8px";
  });

  slider2.noUiSlider?.on('update', (values: any) => {
    selectedRange3.value = values.map((value: string) => parseInt(value));
    //console.log("Intervalo selecionado: " + selectedRange.value[0] + " - " + selectedRange.value[1]);
  });
  slider3.noUiSlider?.on('update', (values: any) => {
    selectedRange2.value = values.map((value: string) => parseInt(value));
    //console.log("Intervalo selecionado: " + selectedRange.value[0] + " - " + selectedRange.value[1]);
  });
}

const isHiding = ref(false);

const openFilters = ref(false);
function toggleOpenFilters() {
  if (openFilters.value) {
    isHiding.value = true;
    setTimeout(() => {
      openFilters.value = false;
      isHiding.value = false;
    }, 1000); 
  } else {
    openFilters.value = true;
    nextTick(() => {
      initializeSliders();
    });
  }
}

const filledCount = computed(() => {
  let count = 0;
  
  if (marca.value !== "") count++;
  if (combustivel.value !== "") count++;
  if (modelo.value !== "") count++;
  if (transmissao.value !== "") count++;
  if (tipologia.value !== "") count++;
  if (lugares.value !== "") count++;
  if (selectedRange.value[0] !== 1990) count++;
  if (selectedRange.value[1] !== 2024) count++;
  if (selectedRange3.value[0] !== 3000) count++;
  if (selectedRange3.value[1] !== 50000) count++;
  if (selectedRange2.value[0] !== 10000) count++;
  if (selectedRange2.value[1] !== 400000) count++;

  return count;
});

const resetFilters = () => {
  marca.value = "";
  combustivel.value = "";
  modelo.value = "";
  transmissao.value = "";
  tipologia.value = "";
  lugares.value = "";
  selectedRange.value = [1990, 2024];
  selectedRange3.value = [3000, 50000];
  selectedRange2.value = [10000, 400000];
};
</script>

<template>
  <div class="bg-[#121212] pt-8 pb-1 px-10 lg:px-20 flex justify-between items-end" :class="{'pb-6': !openFilters || isHiding}">
    <div class="w-[140px] text-white flex justify-start items-center pl-1 md:pl-0">
      <button
        @click="toggleOpenFilters()"
        >
        <svg :class="{'rotate-[90deg]': openFilters && !isHiding}" class="transition mr-2 duration-[1s] ease-in-out" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="none" stroke="white" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.5" d="M21.25 12H8.895m-4.361 0H2.75m18.5 6.607h-5.748m-4.361 0H2.75m18.5-13.214h-3.105m-4.361 0H2.75m13.214 2.18a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm-9.25 6.607a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm6.607 6.608a2.18 2.18 0 1 0 0-4.361a2.18 2.18 0 0 0 0 4.36Z"/></svg>
      </button>
      <div v-if="filledCount!=0" class="pl-3 pr-2 flex justify-center items-center gap-1 py-1 border rounded-full">
        {{ filledCount }}
        <button @click="resetFilters()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m2.59 6L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41z"/></svg>
        </button>
      </div>
    </div>

    <div class="relative w-[140px] mt-2">
      <select v-model="orderFilter" class="bg-transparent w-[140px] hover:bg-transparent px-3 py-2 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
        <option class="bg-[#121212]" value="">{{ t('orderBy') }}</option>
        <option class="bg-[#121212]" v-for="marca in orderByOptions" :key="marca.title" :value="marca.title">{{ marca.title }}</option>
      </select>
      <svg class="absolute top-[10px] right-1 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
    </div>
  </div>


  <div v-if="openFilters"
    class="w-full bg-[#121212] pt-1 flex justify-center items-center px-10 xs:px-10 lg:px-20"
  >
    <div 
    :class="{
      'appearSmooth': openFilters && !isHiding,
      'disappearSmooth': isHiding
    }"
    class="w-full bg-[#121212] transition-all duration-[1.5s] ease-in-out"
    > 
    <div class="flex w-full gap-3 md:gap-8 md:flex-row md:justify-center items-center md:items-end flex-col md:flex-row pt-2 md:pl-0">
        <div class="w-[99%] md:w-[27%] md:min-w-0 rounded-xl relative pl-2 md:pl-0">
          <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('brand') }}</label>
          <select v-model="marca" class="bg-transparent hover:bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
            <option class="bg-[#121212]" value="">{{ t('select') }}</option>
            <option class="bg-[#121212]" v-for="marca in marcas" :key="marca.title" :value="marca.title">{{ marca.title }}</option>
          </select>
          <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
        </div>

        <div class="stock-year-slider stock-slider-col relative w-[98%] md:w-[42%] flex flex-col gap-3 px-4 md:px-3 pb-0 translate-y-3 mt-5 md:mt-0">
          <label class="text-xs text-[#b53d3d] font-semibold absolute top-[-30px]">{{ t('year') }}</label>
          <div class="slider-with-labels w-full">
            <div id="year-slider" class="slider relative"></div>
            <div class="slider-value-row stock-year-value-row relative min-h-[1.375rem] pointer-events-none">
              <span
                v-for="(pct, i) in yearHandlePct"
                :key="'year-val-' + i"
                class="slider-value-chip"
                :style="{ left: pct + '%', transform: `translateX(-${pct * 0.70}%)` }"
              >{{ Math.round(selectedRange[i]) }}</span>
            </div>
          </div>
        </div>

        <div class="w-[99%] md:w-[27%] md:min-w-0 relative pl-2 md:pl-0">
          <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('fuel') }}</label>
          <select v-model="combustivel" class="bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
            <option class="bg-[#121212]" value="">{{ t('select') }}</option>
            <option class="bg-[#121212]" v-for="opt in combustiveis" :key="opt.title">{{ opt.title }}</option>
          </select>
          <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
        </div>
      </div>
      <div class="w-full flex justify-center items-center bg-[#121212]">
        <div class="mt-6 bg-[#b53d3d] opacity-[0.3] h-[1px] w-full py-[1px]"></div>
      </div>
      <div class="flex w-full gap-3 md:gap-8 md:flex-row md:justify-center items-center md:items-end flex-col md:flex-row pt-2 md:pl-0">
        <div class="w-[99%] md:w-[27%] md:min-w-0 rounded-xl relative pl-2 md:pl-0">
          <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('model') }}</label>
          <select v-model="modelo" class="bg-transparent hover:bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
            <option class="bg-[#121212]" value="">{{ t('select') }}</option>
            <option class="bg-[#121212]" v-for="marca in marcas" :key="marca.title" :value="marca.title">{{ marca.title }}</option>
          </select>
          <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
        </div>

        <div class="stock-price-slider stock-slider-col relative w-[98%] md:w-[42%] flex flex-col gap-3 px-4 md:px-3 pb-0 translate-y-3 mt-5 md:mt-0">
          <label class="text-xs text-[#b53d3d] font-semibold absolute top-[-30px]">{{ t('budget') }}</label>
          <div class="slider-with-labels w-full">
            <div id="price-slider" class="slider relative"></div>
            <div class="slider-value-row stock-price-value-row relative min-h-[1.375rem] pointer-events-none">
              <span
                v-for="(pct, i) in priceHandlePct"
                :key="'price-val-' + i"
                class="slider-value-chip"
                :style="{ left: pct + '%', transform: `translateX(-${pct * 0.80}%)` }"
              >{{ Math.round(selectedRange3[i]) }}€</span>
            </div>
          </div>
        </div>

        <div class="w-[99%] md:w-[27%] md:min-w-0 relative pl-2 md:pl-0">
          <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('typology') }}</label>
          <select v-model="tipologia" class="bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
            <option class="bg-[#121212]" value="">{{ t('select') }}</option>
            <option class="bg-[#121212]" v-for="opt in typologies" :key="opt.title">{{ opt.title }}</option>
          </select>
          <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
        </div>
      </div>
      <div class="flex w-full gap-3 md:gap-8 md:flex-row md:justify-center items-center md:items-end flex-col md:flex-row mt-3 md:pl-0 ">
        <div class="w-[99%] md:w-[27%] md:min-w-0 rounded-xl relative pl-2 md:pl-0">
          <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('transmission') }}</label>
          <select v-model="transmissao" class="bg-transparent hover:bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
            <option class="bg-[#121212]" value="">{{ t('select') }}</option>
            <option class="bg-[#121212]" v-for="opt in transmissoes" :key="opt.title" :value="opt.title">{{ opt.title }}</option>
          </select>
          <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
        </div>

        <div class="stock-km-slider stock-slider-col relative w-[98%] md:w-[42%] flex flex-col gap-3 px-4 md:px-3 pb-0 translate-y-3 mt-5 md:mt-0">
          <label class="text-xs text-[#b53d3d] font-semibold absolute top-[-30px]">{{ t('kilometers') }}</label>
          <div class="slider-with-labels w-full">
            <div id="kilometer-slider" class="slider relative"></div>
            <div class="slider-value-row stock-km-value-row relative min-h-[1.375rem] pointer-events-none">
              <span
                v-for="(pct, i) in kmHandlePct"
                :key="'km-val-' + i"
                class="slider-value-chip"
                :style="{ left: pct + '%', transform: `translateX(-${pct * 0.85}%)` }"
              >{{ Math.round(selectedRange2[i]) }}km</span>
            </div>
          </div>
        </div>

        <div class="w-[99%] md:w-[27%] md:min-w-0 relative pl-2 md:pl-0">
          <label class="text-xs text-[#b53d3d] ml-2 font-semibold">{{ t('capacity') }}</label>
          <select v-model="lugares" class="bg-transparent w-full px-3 py-2 bg-gray-800 text-white rounded-2xl border appearance-none focus:outline-none border-[#b53d3d]">
            <option class="bg-[#121212]" value="">{{ t('select') }}</option>
            <option class="bg-[#121212]" v-for="opt in lugaresOpcoes" :key="opt.title">{{ opt.title + ' ' + t('seats') }}</option>
          </select>
          <svg class="absolute top-[50%] right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12"><path fill="white" d="M3.076 4.617A1 1 0 0 1 4 4h4a1 1 0 0 1 .707 1.707l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.217-1.09"/></svg>
        </div>
      </div>
      <div class="w-full flex justify-center items-center bg-[#121212] text-[#121212]">
        <div class="mt-6 bg-[#b53d3d] opacity-[0.3] h-[1px] w-full py-[1px]"></div>
      </div>
    </div>
  </div>

  <!-- Loading State: Skeleton Cards -->
  <div v-if="isLoading" class="bg-[#121212] w-full pb-20 px-5 xs:px-10 lg:px-20 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10" :style="{ minHeight: 'calc(100vh - 198px)' }">
    <div v-for="n in 6" :key="'skeleton-' + n" class="pt-4 pb-1 px-4 rounded-2xl bg-[#201818]">
      <div class="skeleton-pulse rounded-xl h-[240px] xs:h-[280px] w-full"></div>
      <div class="flex flex-col justify-center items-center w-full p-3 pb-2">
        <div class="w-full flex justify-between">
          <div class="skeleton-pulse h-6 w-[40%] rounded-md"></div>
          <div class="skeleton-pulse h-6 w-[30%] rounded-md"></div>
        </div>
        <div class="skeleton-pulse h-5 w-[55%] rounded-md mt-2 self-start"></div>
        <div class="w-full flex items-center justify-center mt-6 gap-4">
          <div class="skeleton-pulse h-4 w-[28%] rounded-md"></div>
          <div class="skeleton-pulse h-4 w-[22%] rounded-md"></div>
          <div class="skeleton-pulse h-4 w-[28%] rounded-md"></div>
        </div>
        <div class="skeleton-pulse h-10 w-3/4 rounded-full mt-3 mb-[1px]"></div>
      </div>
    </div>
  </div>
  <!-- Error State -->
  <div v-else-if="error" class="bg-[#121212] text-center w-full flex flex-col justify-center items-center gap-4 px-6" :style="{ height: 'calc(100vh - 198px)' }">
    <i class="fa-solid fa-screwdriver-wrench text-5xl sm:text-6xl text-[#b53d3d]"></i>
    <p class="text-white text-xl sm:text-2xl font-semibold">{{ t('maintenanceTitle') }}</p>
    <p class="text-[#a0a0a0] text-sm sm:text-base max-w-md">{{ t('maintenanceText') }}</p>
    <button
      @click="retryLoad()"
      class="mt-4 px-8 py-3.5 rounded-xl bg-[#b53d3d] hover:bg-[#c94a4a] text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(181,61,61,0.3)] hover:shadow-[0_6px_30px_rgba(181,61,61,0.5)] cursor-pointer"
    >
      {{ t('maintenanceRetry') }}
    </button>
  </div>
  <!-- No Results -->
  <div v-else-if="filteredCarros.length==0" class="bg-[#121212] text-center w-full pb-20 flex justify-center items-center text-3xl lg:text-5xl font-black text-white" :style="{ height: 'calc(100vh - 198px)' }">
    {{ t('noCarsFound') }}
  </div>
  <!-- Cars Grid -->
  <div v-else class="bg-[#121212] w-full pb-20 px-5 xs:px-10 lg:px-20 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10" :class="{'pt-6': openFilters}" :style="{ minHeight: 'calc(100vh - 198px)' }">
    <div
    v-for="(carro, index) in filteredCarros" :key="carro.id" 
    class="pt-4 pb-1 px-4 test rounded-2xl bg-[#201818] h-fit relative"
    >
      <div
        v-if="!isCarImageReady(carro)"
        class="absolute inset-0 z-10 rounded-2xl bg-[#201818] pt-4 px-4 pb-1 overflow-hidden"
      >
        <div class="skeleton-pulse rounded-xl h-[240px] xs:h-[280px] w-full"></div>
        <div class="flex flex-col justify-center items-center w-full p-3 pb-2">
          <div class="w-full flex justify-between">
            <div class="skeleton-pulse h-6 w-[40%] rounded-md"></div>
            <div class="skeleton-pulse h-6 w-[30%] rounded-md"></div>
          </div>
          <div class="skeleton-pulse h-5 w-[55%] rounded-md mt-2 self-start"></div>
          <div class="w-full flex items-center justify-center mt-6 gap-4">
            <div class="skeleton-pulse h-4 w-[28%] rounded-md"></div>
            <div class="skeleton-pulse h-4 w-[22%] rounded-md"></div>
            <div class="skeleton-pulse h-4 w-[28%] rounded-md"></div>
          </div>
          <div class="skeleton-pulse h-10 w-3/4 rounded-full mt-3 mb-[1px]"></div>
        </div>
      </div>
      <Swiper
          class="rounded-xl object-fit overflow-hidden test3"
          :modules="[Navigation]"
          :slides-per-view="1"
          space-between="4"
          :loop="true"
          :navigation="{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }"
          :speed="500"
          :effect="'fade'"
      >
        <SwiperSlide v-for="(carIMG, imgIndex) in carro.imagens" :key="imgIndex" class="w-full relative">
            <NuxtLink  
            :to="localCode=='pt' ? `/stockSingle/${carro.id}` : '/'+localCode+`/stockSingle/${carro.id}`"
            >
              <img 
                v-if="!failedImages.has(carIMG)"
                class="hover:scale-[1.04] transition duration-300 ease-in-out max-h-[240px] xs:max-h-[280px] w-full object-cover" 
                :src="carIMG" 
                alt="Car Image"
                loading="lazy"
                decoding="async"
                @error="onImageError(carIMG)"
                @load="onImageLoad(carIMG)"
              >
              <div
                v-else
                class="flex flex-col items-center justify-center gap-3 h-[240px] xs:h-[280px] w-full bg-[#1a1212] rounded-xl"
              >
                <svg fill="#a0a0a0" width="80" height="36" viewBox="0 0 122.88 43.49" xmlns="http://www.w3.org/2000/svg"><path d="M103.94,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76c-5.39,0-9.76-4.37-9.76-9.76 C94.18,28.34,98.55,23.97,103.94,23.97L103.94,23.97z M23,29.07v3.51h3.51C26.09,30.86,24.73,29.49,23,29.07L23,29.07z M26.52,34.87H23v3.51C24.73,37.97,26.09,36.6,26.52,34.87L26.52,34.87z M20.71,38.39v-3.51H17.2 C17.62,36.6,18.99,37.96,20.71,38.39L20.71,38.39z M17.2,32.59h3.51v-3.51C18.99,29.49,17.62,30.86,17.2,32.59L17.2,32.59z M105.09,29.07v3.51h3.51C108.18,30.86,106.82,29.49,105.09,29.07L105.09,29.07z M108.6,34.87h-3.51v3.51 C106.82,37.97,108.18,36.6,108.6,34.87L108.6,34.87z M102.8,38.39v-3.51h-3.51C99.71,36.6,101.07,37.96,102.8,38.39L102.8,38.39z M99.28,32.59h3.51v-3.51C101.07,29.49,99.71,30.86,99.28,32.59L99.28,32.59z M49.29,12.79c-1.54-0.35-3.07-0.35-4.61-0.28 C56.73,6.18,61.46,2.07,75.57,2.9l-1.94,12.87L50.4,16.65c0.21-0.61,0.33-0.94,0.37-1.55C50.88,13.36,50.86,13.15,49.29,12.79 L49.29,12.79z M79.12,3.13L76.6,15.6l24.13-0.98c2.48-0.1,2.91-1.19,1.41-3.28c-0.68-0.95-1.44-1.89-2.31-2.82 C93.59,1.86,87.38,3.24,79.12,3.13L79.12,3.13z M0.46,27.28H1.2c0.46-2.04,1.37-3.88,2.71-5.53c2.94-3.66,4.28-3.2,8.65-3.99 l24.46-4.61c5.43-3.86,11.98-7.3,19.97-10.2C64.4,0.25,69.63-0.01,77.56,0c4.54,0.01,9.14,0.28,13.81,0.84 c2.37,0.15,4.69,0.47,6.97,0.93c2.73,0.55,5.41,1.31,8.04,2.21l9.8,5.66c2.89,1.67,3.51,3.62,3.88,6.81l1.38,11.78h1.43v6.51 c-0.2,2.19-1.06,2.52-2.88,2.52h-2.37c0.92-20.59-28.05-24.11-27.42,1.63H34.76c3.73-17.75-14.17-23.91-22.96-13.76 c-2.67,3.09-3.6,7.31-3.36,12.3H2.03c-0.51-0.24-0.91-0.57-1.21-0.98c-1.05-1.43-0.82-5.74-0.74-8.23 C0.09,27.55-0.12,27.28,0.46,27.28L0.46,27.28z M21.86,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76 c-5.39,0-9.76-4.37-9.76-9.76C12.1,28.34,16.47,23.97,21.86,23.97L21.86,23.97z"/></svg>
                <span class="text-[#a0a0a0] text-md font-light">{{ t('imageUnavailable') }}</span>
              </div>
            </NuxtLink>
        </SwiperSlide>
        <div class="swiper-button-prev-custom transition duration-300 ease-in-out">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 16"><path fill="currentColor" d="M9.428 11.84c.663.458 1.571-.013 1.571-.816V4.975c0-.803-.908-1.274-1.571-.816L5.644 6.776a1.486 1.486 0 0 0 0 2.447z"/></svg>
        </div>
        <div class="swiper-button-next-custom transition duration-300 ease-in-out">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 16"><path fill="currentColor" d="M7.571 11.84C6.908 12.298 6 11.827 6 11.024V4.975c0-.803.908-1.274 1.571-.816l3.784 2.617a1.486 1.486 0 0 1 0 2.447z"/></svg>
        </div>
      </Swiper>
      <div class="flex flex-col justify-center items-center w-full p-3 pb-2">
        <div class="w-full flex justify-between">
          <h1 class="w-full text-start text-white font-bold text-lg md:text-xl xl:text-2xl">
            {{ carro.marca }}
          </h1>
          <h1 class="w-full text-end text-white font-bold text-lg xl:text-[20px] font-black">
            {{ carro.preco + " €" }}
          </h1>
        </div>
        <h2 class="w-full text-white text-[15px] md:text-[17px] xl:text-[20px]">{{ carro.modelo }}</h2>
        <div class="w-full flex items-between justify-center text-white mt-6">
          <div class="w-full flex items-center gap-1 justify-start">
            <svg class="mb-1" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2 21.998V11.996m20 10.002V11.996M12 21.998v-1m0-3.001v-1M5.725 5.655l.83.758m0 0c.16-.268.435-.738.527-1.032c.799-2.57.87-3.278 2.103-3.38h5.627c1.234.102 1.304.81 2.103 3.38c.091.294.318.764.477 1.032m-10.837 0C5.951 7.433 5.15 8.1 5.03 8.98c-.02.145 0 1.752 0 2.918c0 .876.844.85 1.666.918c.523.043 1.046.138 1.57.143c2.906.03 4.828.033 7.702.002c.556-.006 1.116-.11 1.67-.158c.625-.053 1.28-.123 1.33-.905c.077-1.165.02-2.773 0-2.918c-.12-.88-.97-1.547-1.575-2.567m-10.837 0h10.837m0 0l.972-.759M5.204 8.43l1.208.92m4.146 1.162h2.939m4.123-1.185l1.335-.425M7.082 12.855L7.004 14.5m9.978-1.623V14.5" color="currentColor"/></svg>
            <p class="text-xs lg:text-sm font-semibold">{{ carro.kms + "km" }}</p>
          </div>
          <div class="w-full flex items-center gap-1 justify-center">
            <svg class="mb-1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 2048 2048"><path fill="currentColor" d="M1792 993q60 41 107 93t81 114t50 131t18 141q0 119-45 224t-124 183t-183 123t-224 46q-91 0-176-27t-156-78t-126-122t-85-157H128V128h256V0h128v128h896V0h128v128h256zM256 256v256h1408V256h-128v128h-128V256H512v128H384V256zm643 1280q-3-31-3-64q0-86 24-167t73-153h-97v-128h128v86q41-51 91-90t108-67t121-42t128-15q100 0 192 33V640H256v896zm573 384q93 0 174-35t142-96t96-142t36-175q0-93-35-174t-96-142t-142-96t-175-36q-93 0-174 35t-142 96t-96 142t-36 175q0 93 35 174t96 142t142 96t175 36m64-512h192v128h-320v-384h128zM384 1024h128v128H384zm256 0h128v128H640zm0-256h128v128H640zm-256 512h128v128H384zm256 0h128v128H640zm384-384H896V768h128zm256 0h-128V768h128zm256 0h-128V768h128z"/></svg>
            <p class="text-xs lg:text-sm font-semibold">{{ carro.anoReg }}</p>
          </div>
          <div class="w-full flex items-center gap-1 justify-end">
            <svg class="mb-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="currentColor"><path d="M3 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z"/><path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c-.011-.476-.053-.894-.201-1.222a.97.97 0 0 0-.394-.458c-.184-.11-.464-.195-.9-.195a.5.5 0 0 1 0-1q.846-.002 1.412.336c.383.228.634.551.794.907c.295.655.294 1.465.294 2.081v3.175a.5.5 0 0 1-.5.501H15v4.5a1.5 1.5 0 0 1-3 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1zm9 0a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v13h8z"/></g></svg>
            <p class="text-xs lg:text-sm font-semibold">{{ t(carro.combustivel) }}</p>
          </div>
        </div>
        <NuxtLink  
        :to="localCode=='pt' ? `/stockSingle/${carro.id}` : '/'+localCode+`/stockSingle/${carro.id}`"
        class="text-center test1 w-3/4 p-2 rounded-full mt-2 mb-[1px] text-white hover:scale-[1.01] transition duration-300 ease-in-out"
        >
          <i class="fa-solid fa-magnifying-glass"></i> {{ t('moreInfo') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test {
  box-shadow: 0 0 0px #381515;
}

.test1 {
  background: linear-gradient(to bottom, #511e1e, #a43939);
}

.test1:hover {
  background: linear-gradient(to bottom, #511e1e, #bc4242);
}

.swiper-button-prev-custom,
.swiper-button-next-custom {
  position: absolute;
  color: white;
  border-radius: 100%;
  background-color: #b53d3d;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  padding: 2px;
  top: 50%;
  z-index: 1;
  opacity: 0.6;
}

.swiper-button-prev-custom {
  left: 5px;
}

.swiper-button-next-custom {
  right: 5px;
}

.swiper-button-prev-custom:hover,
.swiper-button-next-custom:hover {
  opacity: 1;
  background-color: #b53d3d;
  color: white;
}

.test:not(:hover) .swiper-button-prev-custom,
.test:not(:hover) .swiper-button-next-custom {
  display: none;
}

@media (max-width: 640px) {
  .test:not(:hover) .swiper-button-prev-custom,
  .test:not(:hover) .swiper-button-next-custom {
    display: block !important; 
  }
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
}

.stock-slider-col {
  box-sizing: border-box;
  min-width: 0;
}

.stock-year-slider .stock-year-value-row,
.stock-price-slider .stock-price-value-row,
.stock-km-slider .stock-km-value-row {
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
  animation: slide-down 1.4s ease-in-out;
  overflow: hidden;
}

@keyframes slide-up {
  from {
    opacity: 1;
    max-height: 273px;
  }
  to {
    opacity: 0;
    max-height: 0;
  }
}

.disappearSmooth {
  animation: slide-up 1s ease-in-out;
  overflow: hidden;
}

@media (max-width: 768px) {
    @keyframes slide-up {
    from {
      opacity: 1;
      max-height: 750px;
    }
    to {
      opacity: 0;
      max-height: 0;
    }
  };
  @keyframes slide-down {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 750px;
    }
  }
}
.slider {
  width: 100%;
  height: 10px;
}

/* Same as hero: track visible before noUi mounts */
#year-slider.slider:not(.noUi-target) {
  height: 7px;
  border-radius: 3px;
  background-color: #605b5b;
}

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

.skeleton-pulse {
  background: linear-gradient(
    90deg,
    #2a2020 25%,
    #3a2e2e 50%,
    #2a2020 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
