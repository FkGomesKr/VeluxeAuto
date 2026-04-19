<script lang="ts" setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const {t, locale} = useI18n();
const localCode = useCookie("i18n_redirected");
const failedImages = reactive(new Set<string>())
const resolvedImages = reactive(new Set<string>())
function onImageError(src: string) {
  failedImages.add(src)
  resolvedImages.add(src)
}
function onImageLoad(src: string) {
  resolvedImages.add(src)
}

const props = defineProps({
  id: Number,
});

// Fetch car from API
const { getCarById } = useApi()
const carro = ref<any>(null)

const isImageAreaReady = computed(() => {
  if (!carro.value?.imagens || carro.value.imagens.length === 0) return true
  return carro.value.imagens.some((img: string) => resolvedImages.has(img))
})
const isLoading = ref(true)
const error = ref<string | null>(null)

// Function to load car data
const loadCar = async (carId: number | undefined) => {
  if (!carId) {
    showError({ statusCode: 404, statusMessage: 'Page Not Found' })
    return
  }

  try {
    isLoading.value = true
    error.value = null
    const car = await getCarById(carId)
    if (!car) {
      showError({ statusCode: 404, statusMessage: 'Page Not Found' })
      return
    }
    carro.value = car
  } catch {
    showError({ statusCode: 404, statusMessage: 'Page Not Found' })
  } finally {
    isLoading.value = false
  }
}

// Load car on component mount
onMounted(() => {
  loadCar(props.id)
})

// Watch for prop changes (in case id changes)
watch(() => props.id, (newId) => {
  if (newId) {
    loadCar(newId)
  }
})

const showContactForm = ref(false);
const contentSwapped = ref(false);
let swapTimeout: ReturnType<typeof setTimeout> | null = null;

function flipToContact() {
  showContactForm.value = true;
  swapTimeout = setTimeout(() => {
    contentSwapped.value = true;
  }, 700);
}

function flipBack() {
  if (swapTimeout) {
    clearTimeout(swapTimeout);
    swapTimeout = null;
  }
  contentSwapped.value = false;
  showContactForm.value = false;
}

const isFullscreen = ref(false);
const fullscreenSwiper = ref<any>(null);
const mobileSwiper = ref<any>(null);
const desktopSwiper = ref<any>(null);
const activeSlideIndex = ref(0);
const isZoomed = ref(false);
const zoomOrigin = ref('center center');

const toggleZoom = (e: MouseEvent) => {
  if (window.innerWidth < 1024) return;
  if (!isZoomed.value) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    zoomOrigin.value = `${x}% ${y}%`;
  }
  isZoomed.value = !isZoomed.value;
};

const onSlideChange = (swiper: any) => {
  activeSlideIndex.value = swiper.realIndex;
};

const onFullscreenSlideChange = (swiper: any) => {
  activeSlideIndex.value = swiper.realIndex;
  isZoomed.value = false;
};

const onFullscreenSwiperInit = (swiper: any) => {
  fullscreenSwiper.value = swiper;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeFullscreen();
  } else if (e.key === 'ArrowLeft') {
    fullscreenSwiper.value?.slidePrev();
  } else if (e.key === 'ArrowRight') {
    fullscreenSwiper.value?.slideNext();
  }
};

const openFullscreen = () => {
  isFullscreen.value = true;
  window.addEventListener('keydown', handleKeydown);
};

const closeFullscreen = () => {
  const idx = fullscreenSwiper.value?.realIndex ?? activeSlideIndex.value;
  activeSlideIndex.value = idx;
  isZoomed.value = false;
  window.removeEventListener('keydown', handleKeydown);
  mobileSwiper.value?.slideToLoop(idx, 0);
  desktopSwiper.value?.slideToLoop(idx, 0);
  isFullscreen.value = false;
};

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

</script>
<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="bg-[#121212] flex justify-center items-center h-screen">
    <div class="loading-spinner"></div>
  </div>
  <!-- Error State -->
  <div v-else-if="error || !carro" class="bg-[#121212] flex justify-center items-center h-screen">
  </div>
  <!-- Car Details -->
  <div v-else class="bg-[#121212] p-4 sm:p-10">
    <div class="h-8 xl:h-16"> </div>
    <NuxtLink
      :to="localCode === 'pt' ? '/stock' : '/' + localCode + '/stock'"
      class="inline-flex items-center gap-1.5 text-[#a0a0a0] hover:text-white transition-colors duration-200 mb-4 group pl-2"
    >
      <i class="fa-solid fa-arrow-left text-sm group-hover:-translate-x-1 transition-transform duration-200"></i>
      <span class="text-medium font-bold">{{ t('stock') }}</span>
    </NuxtLink>
    <div class="flex flex-col lg:flex-row lg:items-stretch justify-center rounded-xl">
      <div class="w-full lg:w-1/2 flip-perspective bg-[#201818] rounded-xl lg:rounded-l-xl lg:rounded-[0px] flex" :class="{ 'is-flipped items-start justify-center': showContactForm, 'items-center justify-center': !showContactForm }">
        <div class="flip-card" :class="{ 'is-flipped': showContactForm, 'content-swapped': contentSwapped }">
          <!-- FRONT FACE: Car details -->
          <div class="flip-face flip-front bg-[#201818] rounded-xl lg:rounded-tr-none lg:rounded-br-none pl-6 text-whit flex flex-col justify-between lg:py-8" :class="{ 'py-0': contentSwapped, 'py-4': !contentSwapped }">
            <h1 class="ml-0 xs:ml-8 text-white text-xl xs:text-2xl md:text-3xl lg:text-2xl xl:text-3xl text-left pb-3 font-black pr-3 sm:pr-0">
              {{ carro.marca + " - " + carro.modelo }}
            </h1>
            <div class="w-full pb-2 lg:w-2/5 xl:w-1/2 bg-[#201818] rounded-r-xl flex lg:hidden flex-col sm:flex-row justify-center items-center relative">
              <div
                v-if="!isImageAreaReady"
                class="absolute inset-0 z-10 flex items-center justify-center bg-[#201818] rounded-xl"
              >
                <div class="loading-spinner"></div>
              </div>
              <Swiper
                  class="rounded-xl rounded-r-xl w-[95%] lg:w-full object-fit overflow-hidden"
                  :modules="[Navigation]"
                  :slides-per-view="1"
                  space-between="4"
                  :loop="true"
                  :navigation="{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }"
                  :speed="500"
                  :effect="'fade'"
                  @swiper="(s: any) => mobileSwiper = s"
                  @slideChange="onSlideChange"
              >
                <SwiperSlide v-for="(carIMG, index) in carro.imagens" :key="index" class="w-full relative pb-4 bg-[#201818]">
                    <img 
                      v-if="!failedImages.has(carIMG)"
                      class="max-h-[240px] xs:max-h-[300px] sm:max-h-[450px] rounded-xl w-full h-auto object-cover" 
                      :src="carIMG" 
                      alt="Car Image"
                      :loading="index === 0 ? 'eager' : 'lazy'"
                      decoding="async"
                      @error="onImageError(carIMG)"
                      @load="onImageLoad(carIMG)"
                    >
                    <div
                      v-else
                      class="flex flex-col items-center justify-center gap-3 h-[240px] xs:h-[300px] sm:h-[450px] w-full bg-[#1a1212] rounded-xl"
                    >
                      <svg fill="#a0a0a0" width="100" height="36" viewBox="0 0 122.88 43.49" xmlns="http://www.w3.org/2000/svg"><path d="M103.94,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76c-5.39,0-9.76-4.37-9.76-9.76 C94.18,28.34,98.55,23.97,103.94,23.97L103.94,23.97z M23,29.07v3.51h3.51C26.09,30.86,24.73,29.49,23,29.07L23,29.07z M26.52,34.87H23v3.51C24.73,37.97,26.09,36.6,26.52,34.87L26.52,34.87z M20.71,38.39v-3.51H17.2 C17.62,36.6,18.99,37.96,20.71,38.39L20.71,38.39z M17.2,32.59h3.51v-3.51C18.99,29.49,17.62,30.86,17.2,32.59L17.2,32.59z M105.09,29.07v3.51h3.51C108.18,30.86,106.82,29.49,105.09,29.07L105.09,29.07z M108.6,34.87h-3.51v3.51 C106.82,37.97,108.18,36.6,108.6,34.87L108.6,34.87z M102.8,38.39v-3.51h-3.51C99.71,36.6,101.07,37.96,102.8,38.39L102.8,38.39z M99.28,32.59h3.51v-3.51C101.07,29.49,99.71,30.86,99.28,32.59L99.28,32.59z M49.29,12.79c-1.54-0.35-3.07-0.35-4.61-0.28 C56.73,6.18,61.46,2.07,75.57,2.9l-1.94,12.87L50.4,16.65c0.21-0.61,0.33-0.94,0.37-1.55C50.88,13.36,50.86,13.15,49.29,12.79 L49.29,12.79z M79.12,3.13L76.6,15.6l24.13-0.98c2.48-0.1,2.91-1.19,1.41-3.28c-0.68-0.95-1.44-1.89-2.31-2.82 C93.59,1.86,87.38,3.24,79.12,3.13L79.12,3.13z M0.46,27.28H1.2c0.46-2.04,1.37-3.88,2.71-5.53c2.94-3.66,4.28-3.2,8.65-3.99 l24.46-4.61c5.43-3.86,11.98-7.3,19.97-10.2C64.4,0.25,69.63-0.01,77.56,0c4.54,0.01,9.14,0.28,13.81,0.84 c2.37,0.15,4.69,0.47,6.97,0.93c2.73,0.55,5.41,1.31,8.04,2.21l9.8,5.66c2.89,1.67,3.51,3.62,3.88,6.81l1.38,11.78h1.43v6.51 c-0.2,2.19-1.06,2.52-2.88,2.52h-2.37c0.92-20.59-28.05-24.11-27.42,1.63H34.76c3.73-17.75-14.17-23.91-22.96-13.76 c-2.67,3.09-3.6,7.31-3.36,12.3H2.03c-0.51-0.24-0.91-0.57-1.21-0.98c-1.05-1.43-0.82-5.74-0.74-8.23 C0.09,27.55-0.12,27.28,0.46,27.28L0.46,27.28z M21.86,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76 c-5.39,0-9.76-4.37-9.76-9.76C12.1,28.34,16.47,23.97,21.86,23.97L21.86,23.97z"/></svg>
                      <span class="text-[#a0a0a0] text-md font-light">{{ t('imageUnavailable') }}</span>
                    </div>
                    <!-- Fullscreen Button -->
                    <button v-if="!failedImages.has(carIMG)" @click="openFullscreen()" class="fullscreen-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z"/>
                      </svg>
                    </button>
                </SwiperSlide>
                <div class="swiper-button-prev-custom transition duration-300 ease-in-out">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="currentColor" d="M9.428 11.84c.663.458 1.571-.013 1.571-.816V4.975c0-.803-.908-1.274-1.571-.816L5.644 6.776a1.486 1.486 0 0 0 0 2.447z"/></svg>
                </div>
                <div class="swiper-button-next-custom transition duration-300 ease-in-out">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="currentColor" d="M7.571 11.84C6.908 12.298 6 11.827 6 11.024V4.975c0-.803.908-1.274 1.571-.816l3.784 2.617a1.486 1.486 0 0 1 0 2.447z"/></svg>
                </div>
              </Swiper>
            </div>
            <div class="mt-0 xl:mt-6 2xl:mt-10 flex flex-wrap justify-between items-center ml-0 xs:ml-8">
              <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
                <svg class="mr-3 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
                  <g fill="currentColor">
                    <path d="M3 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z"/>
                    <path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c-.011-.476-.053-.894-.201-1.222a.97.97 0 0 0-.394-.458c-.184-.11-.464-.195-.9-.195a.5.5 0 0 1 0-1q.846-.002 1.412.336c.383.228.634.551.794.907c.295.655.294 1.465.294 2.081v3.175a.5.5 0 0 1-.5.501H15v4.5a1.5 1.5 0 0 1-3 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1zm9 0a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v13h8z"/>
                  </g>
                </svg>
                <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                  <p class="leading-[13px] text-[#a0a0a0]">
                    {{ t('fuel') }}
                  </p>
                  <p class="font-medium text-white">
                    {{ t(carro.combustivel) }}
                  </p>
                  
                </div>
              </div>
              <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
                <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 2048 2048">
                  <path fill="currentColor" d="M1792 993q60 41 107 93t81 114t50 131t18 141q0 119-45 224t-124 183t-183 123t-224 46q-91 0-176-27t-156-78t-126-122t-85-157H128V128h256V0h128v128h896V0h128v128h256zM256 256v256h1408V256h-128v128h-128V256H512v128H384V256zm643 1280q-3-31-3-64q0-86 24-167t73-153h-97v-128h128v86q41-51 91-90t108-67t121-42t128-15q100 0 192 33V640H256v896zm573 384q93 0 174-35t142-96t96-142t36-175q0-93-35-174t-96-142t-142-96t-175-36q-93 0-174 35t-142 96t-96 142t-36 175q0 93 35 174t96 142t142 96t175 36m64-512h192v128h-320v-384h128zM384 1024h128v128H384zm256 0h128v128H640zm0-256h128v128H640zm-256 512h128v128H384zm256 0h128v128H640zm384-384H896V768h128zm256 0h-128V768h128zm256 0h-128V768h128z"/>
                </svg>
                <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                  <p class="leading-[13px] text-[#a0a0a0]">
                    {{ t('year') }}
                  </p>
                  <p class="font-medium text-white">
                    {{ carro.anoReg }}
                  </p>
                  
                </div>
              </div>
              <div class="hidden sm:flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
                <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 20 20">
                  <path fill="currentColor" d="M10 2a2 2 0 0 0-.5 3.937V9.5a.5.5 0 0 0 1 0V5.937A2 2 0 0 0 10 2M3 5a1 1 0 0 1 2 0v4a.5.5 0 0 0 .5.5H8a.5.5 0 0 0 0-1H6V5a2 2 0 1 0-4 0v11a2 2 0 1 0 4 0v-3.5h2V16a2 2 0 1 0 4 0v-3h4.5a1.5 1.5 0 0 0 1.5-1.5V5a2 2 0 1 0-4 0v3.5h-2a.5.5 0 0 0 0 1h2.5A.5.5 0 0 0 15 9V5a1 1 0 1 1 2 0v6.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 0-.5.5V16a1 1 0 1 1-2 0v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4a1 1 0 1 1-2 0z"/>
                </svg>
                <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                  <p class="leading-[22px] text-[#a0a0a0]">
                    {{ t('transmission') }}
                  </p>
                  <p class="font-medium leading-[14px] text-white">
                    {{ t(carro.transmissao) }}
                  </p>
                  
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center mt-4 sm:mt-8 ml-0 xs:ml-8">
              <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
                <svg class="mr-3 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2 21.998V11.996m20 10.002V11.996M12 21.998v-1m0-3.001v-1M5.725 5.655l.83.758m0 0c.16-.268.435-.738.527-1.032c.799-2.57.87-3.278 2.103-3.38h5.627c1.234.102 1.304.81 2.103 3.38c.091.294.318.764.477 1.032m-10.837 0C5.951 7.433 5.15 8.1 5.03 8.98c-.02.145 0 1.752 0 2.918c0 .876.844.85 1.666.918c.523.043 1.046.138 1.57.143c2.906.03 4.828.033 7.702.002c.556-.006 1.116-.11 1.67-.158c.625-.053 1.28-.123 1.33-.905c.077-1.165.02-2.773 0-2.918c-.12-.88-.97-1.547-1.575-2.567m-10.837 0h10.837m0 0l.972-.759M5.204 8.43l1.208.92m4.146 1.162h2.939m4.123-1.185l1.335-.425M7.082 12.855L7.004 14.5m9.978-1.623V14.5" color="currentColor"/>
                </svg>
                <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                  <p class="leading-[13px] text-[#a0a0a0]">
                    {{ t('kilometers') }}
                  </p>
                  <p class="font-medium text-white">
                    {{ carro.kms + " km" }}
                  </p>
                  
                </div>
              </div>
              <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
                <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M17 4.5C17 5.9 15.9 7 14.5 7S12 5.9 12 4.5S13.1 2 14.5 2S17 3.1 17 4.5M15 8h-.8c-2.1 0-4.1-1.2-5.1-3.1c-.1-.1-.2-.2-.2-.3l-1.8.8c.5 1.4 2.1 3.2 4.4 4.1l-1.8 5l-3.9-1.1L3 18.9l2 .5l1.8-3.6l4.5 1.2c1 .2 2-.3 2.4-1.2L16 9.4c.2-.7-.3-1.4-1-1.4m3.9-1l-3.4 9.4c-.6 1.6-2.1 2.6-3.7 2.6c-.3 0-.7 0-1-.1l-2.9-.8l-.9 1.8l2 .5l1.4.4c.5.1 1 .2 1.5.2c2.5 0 4.7-1.5 5.6-3.9L21 7z"/>
                </svg>
                <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                  <p class="leading-[13px] text-[#a0a0a0]">
                    {{ t('capacity') }}
                  </p>
                  <p class="font-medium text-white">
                    {{ carro.lugares }}
                  </p>
                  
                </div>
              </div>
              <div class="hidden sm:flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
                <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 14h-3v2h3zm3 7H3V11l8-8h10a1 1 0 0 1 1 1zM11.83 5l-6 6H20V5z"/>
                </svg>
                <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                  <p class="leading-[13px] text-[#a0a0a0]">
                    {{ t('doors') }}
                  </p>
                  <p class="font-medium text-white">
                    {{ carro.portas }}
                  </p>
                  
                </div>
              </div>
          </div>

          <div class="flex justify-between items-center mt-4 sm:mt-8 ml-0 xs:ml-8">
            <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
                <path d="M5 6v-.5c0-.943 0-1.414.293-1.707S6.057 3.5 7 3.5s1.414 0 1.707.293S9 4.557 9 5.5V6m6-1h3"/>
                <path d="M16 2h-1.333C12.793 2 12 2.934 12 4.667C12 5.533 11.603 6 10.667 6H7c-1.886 0-2.828 0-3.414.586S3 8.114 3 10v5c0 3.3 0 4.95 1.025 5.975S6.7 22 10 22h4c3.3 0 4.95 0 5.975-1.025S21 18.3 21 15V7c0-2.357 0-3.536-.732-4.268C19.535 2 18.357 2 16 2"/>
                <path d="M9 14.587c0-1.464 1.264-2.911 2.15-3.747a1.23 1.23 0 0 1 1.7 0c.886.836 2.15 2.283 2.15 3.747a2.933 2.933 0 0 1-3 2.913c-1.864 0-3-1.477-3-2.913"/></g>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('consumption') }}
                </p>
                <p v-if="carro.combustivel=='Elétrico'" class="font-medium text-white">
                  {{ carro.consumo + " kWh/100km" }}
                </p>
                <p v-else class="font-medium text-white">
                  {{ carro.consumo + " L/100km" }}
                </p>
                
                
              </div>
            </div>
            <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 16 16">
                <g fill="currentColor">
                  <path d="M8 2a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V2.5A.5.5 0 0 1 8 2M3.732 3.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 8a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 7.31A.91.91 0 1 0 8.85 8.569l3.434-4.297a.39.39 0 0 0-.029-.518z"/>
                  <path fill-rule="evenodd" d="M6.664 15.889A8 8 0 1 1 9.336.11a8 8 0 0 1-2.672 15.78zm-4.665-4.283A11.95 11.95 0 0 1 8 10c2.186 0 4.236.585 6.001 1.606a7 7 0 1 0-12.002 0"/>
                </g>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('power') }}
                </p>
                <p class="font-medium text-white">
                  {{ carro.potencia + " Cv" }}
                </p>
                
              </div>
            </div>
            <div class="hidden sm:flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                  <path d="M11 9h6v10h-6.5l-2 -2h-2.5v-6.5l1.5 -1.5Z"/>
                  <path fill="currentColor" d="M17 13h4v-3h1v8h-1v-3h-4z"/>
                  <path d="M6 14h-4M2 11v6"/>
                  <path d="M11 9v-4M8 5h6"/>
                </g>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('cylinderCapacity') }}
                </p>
                <p class="font-medium text-white">
                  {{ carro.cilindrada + " Cc" }}
                </p>
                
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center mt-4 sm:mt-8 ml-0 xs:ml-8">
            <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.5 12a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 17.5 9a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m-3-4A1.5 1.5 0 0 1 13 6.5A1.5 1.5 0 0 1 14.5 5A1.5 1.5 0 0 1 16 6.5A1.5 1.5 0 0 1 14.5 8m-5 0A1.5 1.5 0 0 1 8 6.5A1.5 1.5 0 0 1 9.5 5A1.5 1.5 0 0 1 11 6.5A1.5 1.5 0 0 1 9.5 8m-3 4A1.5 1.5 0 0 1 5 10.5A1.5 1.5 0 0 1 6.5 9A1.5 1.5 0 0 1 8 10.5A1.5 1.5 0 0 1 6.5 12M12 3a9 9 0 0 0-9 9a9 9 0 0 0 9 9a1.5 1.5 0 0 0 1.5-1.5c0-.39-.15-.74-.39-1c-.23-.27-.38-.62-.38-1a1.5 1.5 0 0 1 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8"/>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('color') }}
                </p>
                <p class="font-medium text-white">
                  {{ t(carro.cor) }}
                </p>
                
              </div>
            </div>
            <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-width="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10ZM7 12l4 3l5-7"/>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('state') }}
                </p>
                <p class="font-medium text-white">
                  {{ t(carro.estado) }}
                </p>
                
              </div>
            </div>
            <div class="hidden sm:flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
                <path fill="currentColor" d="M49.369 11.228c-11.647-.171-27.826.079-31.157 9.027l-8.184 19.204a2.84 2.84 0 0 0-1.37-.865l-3.295-.927a2.86 2.86 0 0 0-3.535 1.983L.109 45.754a2.86 2.86 0 0 0 1.983 3.534l3.296.928c.11.03.22.04.33.058c-.63 1.57-1.022 3.296-1.022 4.323v22.32c0 1.144.48 1.674 1.242 1.922v5.946a4.01 4.01 0 0 0 4.017 4.017h10.777a4.01 4.01 0 0 0 4.017-4.017v-5.728h50.503v5.728a4.01 4.01 0 0 0 4.018 4.017h10.775a4.01 4.01 0 0 0 4.019-4.017V78.84c.763-.248 1.24-.778 1.24-1.922v-22.32c0-1.027-.393-2.753-1.022-4.323c.11-.017.22-.027.33-.058l3.297-.928a2.86 2.86 0 0 0 1.982-3.534l-1.717-6.104a2.86 2.86 0 0 0-3.536-1.983l-3.295.927a2.86 2.86 0 0 0-1.371.865l-8.184-19.204c-3.57-9.084-20.773-8.856-32.42-9.027m33.357 29.444c.194.576-.386.96-.993.995c0 0-1.984.168-4.72.389c-2.082-4.864-6.92-8.292-12.525-8.292c-6.151 0-11.373 4.13-13.048 9.754c-.464.006-1.003.026-1.434.026c-10.597 0-31.739-1.877-31.739-1.877c-.606-.036-1.187-.42-.993-.995c8.142-24.821 8.385-22.955 32.276-22.694c23.89.26 24.029-1.513 33.176 22.694m-18.238-2.217a8.89 8.89 0 0 1 7.447 3.991c-4.785.355-10.292.718-15.424.929a8.88 8.88 0 0 1 7.977-4.92M9.407 46.51c.072.107.142.214.222.317h-.31zm5.294 6.234c2.096-.034 13.348 3.753 13.348 3.753c1.405.396 2.642 3.052 2.635 4.512c-.021 4.917-12.709 3.21-17.86 3.23a2.63 2.63 0 0 1-2.635-2.634V55.38c0-1.46 2.416-2.6 4.512-2.636m70.598 0c2.096.035 4.512 1.176 4.512 2.636v6.225a2.63 2.63 0 0 1-2.635 2.635c-5.15-.02-17.839 1.686-17.86-3.231c-.007-1.46 1.23-4.116 2.635-4.512c0 0 11.252-3.787 13.348-3.753" color="currentColor"/>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('typology') }}
                </p>
                <p class="font-medium text-white">
                  {{ carro.tipologia }}
                </p>
                
              </div>
            </div>
          </div>

          <div class="flex sm:hidden justify-between items-center mt-4 ml-0 xs:ml-8">
            <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 20 20">
                <path fill="currentColor" d="M10 2a2 2 0 0 0-.5 3.937V9.5a.5.5 0 0 0 1 0V5.937A2 2 0 0 0 10 2M3 5a1 1 0 0 1 2 0v4a.5.5 0 0 0 .5.5H8a.5.5 0 0 0 0-1H6V5a2 2 0 1 0-4 0v11a2 2 0 1 0 4 0v-3.5h2V16a2 2 0 1 0 4 0v-3h4.5a1.5 1.5 0 0 0 1.5-1.5V5a2 2 0 1 0-4 0v3.5h-2a.5.5 0 0 0 0 1h2.5A.5.5 0 0 0 15 9V5a1 1 0 1 1 2 0v6.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 0-.5.5V16a1 1 0 1 1-2 0v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4a1 1 0 1 1-2 0z"/>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[22px] text-[#a0a0a0]">
                  {{ t('transmission') }}
                </p>
                <p class="font-medium leading-[14px] text-white">
                  {{ carro.transmissao }}
                </p>
                
              </div>
            </div>
            <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 14h-3v2h3zm3 7H3V11l8-8h10a1 1 0 0 1 1 1zM11.83 5l-6 6H20V5z"/>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('doors') }}
                </p>
                <p class="font-medium text-white">
                  {{ carro.portas }}
                </p>
                
              </div>
            </div>
          </div>

          <div class="flex sm:hidden justify-between items-center mt-4 ml-0 xs:ml-8">
            <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                  <path d="M11 9h6v10h-6.5l-2 -2h-2.5v-6.5l1.5 -1.5Z"/>
                  <path fill="currentColor" d="M17 13h4v-3h1v8h-1v-3h-4z"/>
                  <path d="M6 14h-4M2 11v6"/>
                  <path d="M11 9v-4M8 5h6"/>
                </g>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('cylinderCapacity') }}
                </p>
                <p class="font-medium text-white">
                  {{ carro.cilindrada + " Cc" }}
                </p>
                
              </div>
            </div>
            <div class="flex justify-start items-center font-light text-[15px] w-1/2 sm:w-1/3">
              <svg class="mr-3 mt-1 text-[#b53d3d]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
                <path fill="currentColor" d="M49.369 11.228c-11.647-.171-27.826.079-31.157 9.027l-8.184 19.204a2.84 2.84 0 0 0-1.37-.865l-3.295-.927a2.86 2.86 0 0 0-3.535 1.983L.109 45.754a2.86 2.86 0 0 0 1.983 3.534l3.296.928c.11.03.22.04.33.058c-.63 1.57-1.022 3.296-1.022 4.323v22.32c0 1.144.48 1.674 1.242 1.922v5.946a4.01 4.01 0 0 0 4.017 4.017h10.777a4.01 4.01 0 0 0 4.017-4.017v-5.728h50.503v5.728a4.01 4.01 0 0 0 4.018 4.017h10.775a4.01 4.01 0 0 0 4.019-4.017V78.84c.763-.248 1.24-.778 1.24-1.922v-22.32c0-1.027-.393-2.753-1.022-4.323c.11-.017.22-.027.33-.058l3.297-.928a2.86 2.86 0 0 0 1.982-3.534l-1.717-6.104a2.86 2.86 0 0 0-3.536-1.983l-3.295.927a2.86 2.86 0 0 0-1.371.865l-8.184-19.204c-3.57-9.084-20.773-8.856-32.42-9.027m33.357 29.444c.194.576-.386.96-.993.995c0 0-1.984.168-4.72.389c-2.082-4.864-6.92-8.292-12.525-8.292c-6.151 0-11.373 4.13-13.048 9.754c-.464.006-1.003.026-1.434.026c-10.597 0-31.739-1.877-31.739-1.877c-.606-.036-1.187-.42-.993-.995c8.142-24.821 8.385-22.955 32.276-22.694c23.89.26 24.029-1.513 33.176 22.694m-18.238-2.217a8.89 8.89 0 0 1 7.447 3.991c-4.785.355-10.292.718-15.424.929a8.88 8.88 0 0 1 7.977-4.92M9.407 46.51c.072.107.142.214.222.317h-.31zm5.294 6.234c2.096-.034 13.348 3.753 13.348 3.753c1.405.396 2.642 3.052 2.635 4.512c-.021 4.917-12.709 3.21-17.86 3.23a2.63 2.63 0 0 1-2.635-2.634V55.38c0-1.46 2.416-2.6 4.512-2.636m70.598 0c2.096.035 4.512 1.176 4.512 2.636v6.225a2.63 2.63 0 0 1-2.635 2.635c-5.15-.02-17.839 1.686-17.86-3.231c-.007-1.46 1.23-4.116 2.635-4.512c0 0 11.252-3.787 13.348-3.753" color="currentColor"/>
              </svg>
              <div class="flex flex-col justify-center items-start mt-2 text-[14px] sm:text-[15px]">
                <p class="leading-[13px] text-[#a0a0a0]">
                  {{ t('typology') }}
                </p>
                <p class="font-medium text-white">
                  {{ carro.tipologia }}
                </p>
                
              </div>
            </div>
          </div>
          
          <div class="hidden lg:flex w-full">
            <div class="w-full lg:w-1/2 flex justify-center items-center flex-col mt-4 xl:mt-12">
              <div class="flex justify-center items-center">
                <h1 class="text-[#a0a0a0] text-lg">
                  {{ t('price') }}
                </h1>
              </div>
              <h1 class="text-white text-3xl font-bold italic">
                {{ carro.preco + " €" }}
              </h1>
            </div>

            <div class="w-1/2 flex justify-center items-center flex-col mt-8 xl:mt-14">
              <button @click="flipToContact()" class="border-2 btc italic border-[#b53d3d] hover:bg-[#b53d3d] text-[14px] xl:text-[16px] text-[#b53d3d] p-3 xl:p-4 ps-6 xl:ps-8 pe-6 xl:pe-8 rounded-xl hover:scale-[1.02] transition duration-300 ease-in-out">
                {{ t('interested') }}
                <i class="fa-regular fa-paper-plane text-[16p] xl:text-[19px] text-[#b53d3d] py-[5px] icn transition duration-300 ease-in-out"></i>
              </button>
            </div>
          </div>
          <div class="flex lg:hidden w-[95%] justify-center items-center flex-col pt-6 pb-3">
            <button @click="flipToContact()" class="border-2 btc italic border-[#b53d3d] hover:bg-[#b53d3d] text-[14px] xl:text-[16px] text-[#b53d3d] p-3 ps-4 pe-4 rounded-xl hover:scale-[1.02] transition duration-300 ease-in-out">
              {{ t('interested') }}
              <i class="fa-regular fa-paper-plane text-[16p] xl:text-[19px] text-[#b53d3d] py-[5px] icn transition duration-300 ease-in-out"></i>
            </button>
          </div>
          </div>

          <!-- BACK FACE: Contact form -->
          <div class="flip-face flip-back rounded-xl">
            <StockContactSpecificPage
              :car-name="carro.marca + ' ' + carro.modelo"
              @close="flipBack()"
            />
          </div>
        </div>
      </div>
      <div class="desktop-swiper-panel w-full lg:w-1/2 bg-[#201818] rounded-r-xl hidden lg:flex flex-col sm:flex-row justify-center items-center relative">
        <div
          v-if="!isImageAreaReady"
          class="absolute inset-0 z-10 flex items-center justify-center bg-[#201818] rounded-r-xl"
        >
          <div class="loading-spinner"></div>
        </div>
        <Swiper
            class="rounded-xl rounded-r-xl w-[95%] lg:w-full object-fit overflow-hidden"
            :modules="[Navigation]"
            :slides-per-view="1"
            space-between="4"
            :loop="true"
            :navigation="{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }"
            :speed="500"
            :effect="'fade'"
            @swiper="(s: any) => desktopSwiper = s"
            @slideChange="onSlideChange"
        >
          <SwiperSlide v-for="(carIMG, index) in carro.imagens" :key="index" class="w-full p-3 bg-[#201818]">
            <div class="relative w-full">
              <img 
                v-if="!failedImages.has(carIMG)"
                class="max-h-[240px] xs:max-h-[300px] sm:max-h-[450px] lg:max-h-[500px] xl:max-h-[550px] rounded-xl w-full h-auto object-cover" 
                :src="carIMG" 
                alt="Car Image"
                :loading="index === 0 ? 'eager' : 'lazy'"
                decoding="async"
                @error="onImageError(carIMG)"
                @load="onImageLoad(carIMG)"
              >
              <div
                v-else
                class="flex flex-col items-center justify-center gap-3 h-[240px] xs:h-[300px] sm:h-[450px] lg:h-[500px] xl:h-[550px] w-full bg-[#1a1212] rounded-xl"
              >
                <svg fill="#a0a0a0" width="100" height="36" viewBox="0 0 122.88 43.49" xmlns="http://www.w3.org/2000/svg"><path d="M103.94,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76c-5.39,0-9.76-4.37-9.76-9.76 C94.18,28.34,98.55,23.97,103.94,23.97L103.94,23.97z M23,29.07v3.51h3.51C26.09,30.86,24.73,29.49,23,29.07L23,29.07z M26.52,34.87H23v3.51C24.73,37.97,26.09,36.6,26.52,34.87L26.52,34.87z M20.71,38.39v-3.51H17.2 C17.62,36.6,18.99,37.96,20.71,38.39L20.71,38.39z M17.2,32.59h3.51v-3.51C18.99,29.49,17.62,30.86,17.2,32.59L17.2,32.59z M105.09,29.07v3.51h3.51C108.18,30.86,106.82,29.49,105.09,29.07L105.09,29.07z M108.6,34.87h-3.51v3.51 C106.82,37.97,108.18,36.6,108.6,34.87L108.6,34.87z M102.8,38.39v-3.51h-3.51C99.71,36.6,101.07,37.96,102.8,38.39L102.8,38.39z M99.28,32.59h3.51v-3.51C101.07,29.49,99.71,30.86,99.28,32.59L99.28,32.59z M49.29,12.79c-1.54-0.35-3.07-0.35-4.61-0.28 C56.73,6.18,61.46,2.07,75.57,2.9l-1.94,12.87L50.4,16.65c0.21-0.61,0.33-0.94,0.37-1.55C50.88,13.36,50.86,13.15,49.29,12.79 L49.29,12.79z M79.12,3.13L76.6,15.6l24.13-0.98c2.48-0.1,2.91-1.19,1.41-3.28c-0.68-0.95-1.44-1.89-2.31-2.82 C93.59,1.86,87.38,3.24,79.12,3.13L79.12,3.13z M0.46,27.28H1.2c0.46-2.04,1.37-3.88,2.71-5.53c2.94-3.66,4.28-3.2,8.65-3.99 l24.46-4.61c5.43-3.86,11.98-7.3,19.97-10.2C64.4,0.25,69.63-0.01,77.56,0c4.54,0.01,9.14,0.28,13.81,0.84 c2.37,0.15,4.69,0.47,6.97,0.93c2.73,0.55,5.41,1.31,8.04,2.21l9.8,5.66c2.89,1.67,3.51,3.62,3.88,6.81l1.38,11.78h1.43v6.51 c-0.2,2.19-1.06,2.52-2.88,2.52h-2.37c0.92-20.59-28.05-24.11-27.42,1.63H34.76c3.73-17.75-14.17-23.91-22.96-13.76 c-2.67,3.09-3.6,7.31-3.36,12.3H2.03c-0.51-0.24-0.91-0.57-1.21-0.98c-1.05-1.43-0.82-5.74-0.74-8.23 C0.09,27.55-0.12,27.28,0.46,27.28L0.46,27.28z M21.86,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76 c-5.39,0-9.76-4.37-9.76-9.76C12.1,28.34,16.47,23.97,21.86,23.97L21.86,23.97z"/></svg>
                <span class="text-[#a0a0a0] text-md font-light">{{ t('imageUnavailable') }}</span>
              </div>
              <button v-if="!failedImages.has(carIMG)" @click="openFullscreen()" class="fullscreen-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z"/>
                </svg>
              </button>
            </div>
          </SwiperSlide>
          <div class="swiper-button-prev-custom transition duration-300 ease-in-out">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="currentColor" d="M9.428 11.84c.663.458 1.571-.013 1.571-.816V4.975c0-.803-.908-1.274-1.571-.816L5.644 6.776a1.486 1.486 0 0 0 0 2.447z"/></svg>
          </div>
          <div class="swiper-button-next-custom transition duration-300 ease-in-out">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="currentColor" d="M7.571 11.84C6.908 12.298 6 11.827 6 11.024V4.975c0-.803.908-1.274 1.571-.816l3.784 2.617a1.486 1.486 0 0 1 0 2.447z"/></svg>
          </div>
        </Swiper>
      </div>
    </div>

    <div v-if="isFullscreen" class="fullscreen-overlay">
      <div class="fullscreen-content">
        <Swiper
          class="w-full h-full"
          :modules="[Navigation]"
          :slides-per-view="1"
          space-between="4"
          :loop="true"
          :navigation="{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }"
          :speed="500"
          :effect="'fade'"
          :initial-slide="activeSlideIndex"
          @swiper="onFullscreenSwiperInit"
          @slideChange="onFullscreenSlideChange"
        >
          <SwiperSlide v-for="(carIMG, index) in carro.imagens" :key="index" class="w-full relative overflow-hidden">
            <div class="fullscreen-slide-inner">
              <img 
                v-if="!failedImages.has(carIMG)"
                class="max-h-full max-w-full object-contain lg:transition-transform lg:duration-300 lg:ease-in-out"
                :class="[isZoomed ? 'lg:scale-[2.2] lg:cursor-zoom-out' : 'lg:cursor-zoom-in']"
                :style="{ transformOrigin: zoomOrigin }"
                :src="carIMG" 
                alt="Car Image"
                :loading="Math.abs(Number(index) - activeSlideIndex) <= 1 ? 'eager' : 'lazy'"
                decoding="async"
                @error="onImageError(carIMG)"
                @load="onImageLoad(carIMG)"
                @click.prevent="toggleZoom"
              >
              <div
                v-else
                class="flex flex-col items-center justify-center gap-3"
              >
              <svg fill="#a0a0a0" width="120" height="44" viewBox="0 0 122.88 43.49" xmlns="http://www.w3.org/2000/svg"><path d="M103.94,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76c-5.39,0-9.76-4.37-9.76-9.76 C94.18,28.34,98.55,23.97,103.94,23.97L103.94,23.97z M23,29.07v3.51h3.51C26.09,30.86,24.73,29.49,23,29.07L23,29.07z M26.52,34.87H23v3.51C24.73,37.97,26.09,36.6,26.52,34.87L26.52,34.87z M20.71,38.39v-3.51H17.2 C17.62,36.6,18.99,37.96,20.71,38.39L20.71,38.39z M17.2,32.59h3.51v-3.51C18.99,29.49,17.62,30.86,17.2,32.59L17.2,32.59z M105.09,29.07v3.51h3.51C108.18,30.86,106.82,29.49,105.09,29.07L105.09,29.07z M108.6,34.87h-3.51v3.51 C106.82,37.97,108.18,36.6,108.6,34.87L108.6,34.87z M102.8,38.39v-3.51h-3.51C99.71,36.6,101.07,37.96,102.8,38.39L102.8,38.39z M99.28,32.59h3.51v-3.51C101.07,29.49,99.71,30.86,99.28,32.59L99.28,32.59z M49.29,12.79c-1.54-0.35-3.07-0.35-4.61-0.28 C56.73,6.18,61.46,2.07,75.57,2.9l-1.94,12.87L50.4,16.65c0.21-0.61,0.33-0.94,0.37-1.55C50.88,13.36,50.86,13.15,49.29,12.79 L49.29,12.79z M79.12,3.13L76.6,15.6l24.13-0.98c2.48-0.1,2.91-1.19,1.41-3.28c-0.68-0.95-1.44-1.89-2.31-2.82 C93.59,1.86,87.38,3.24,79.12,3.13L79.12,3.13z M0.46,27.28H1.2c0.46-2.04,1.37-3.88,2.71-5.53c2.94-3.66,4.28-3.2,8.65-3.99 l24.46-4.61c5.43-3.86,11.98-7.3,19.97-10.2C64.4,0.25,69.63-0.01,77.56,0c4.54,0.01,9.14,0.28,13.81,0.84 c2.37,0.15,4.69,0.47,6.97,0.93c2.73,0.55,5.41,1.31,8.04,2.21l9.8,5.66c2.89,1.67,3.51,3.62,3.88,6.81l1.38,11.78h1.43v6.51 c-0.2,2.19-1.06,2.52-2.88,2.52h-2.37c0.92-20.59-28.05-24.11-27.42,1.63H34.76c3.73-17.75-14.17-23.91-22.96-13.76 c-2.67,3.09-3.6,7.31-3.36,12.3H2.03c-0.51-0.24-0.91-0.57-1.21-0.98c-1.05-1.43-0.82-5.74-0.74-8.23 C0.09,27.55-0.12,27.28,0.46,27.28L0.46,27.28z M21.86,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76 c-5.39,0-9.76-4.37-9.76-9.76C12.1,28.34,16.47,23.97,21.86,23.97L21.86,23.97z"/></svg>
              <span class="text-[#a0a0a0] text-lg font-light">{{ t('imageUnavailable') }}</span>
              </div>
            </div>
          </SwiperSlide>
          <div class="swiper-button-prev-custom transition duration-300 ease-in-out">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 lg:w-8 lg:h-8" viewBox="0 0 16 16"><path fill="currentColor" d="M9.428 11.84c.663.458 1.571-.013 1.571-.816V4.975c0-.803-.908-1.274-1.571-.816L5.644 6.776a1.486 1.486 0 0 0 0 2.447z"/></svg>
          </div>
          <div class="swiper-button-next-custom transition duration-300 ease-in-out">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 lg:w-8 lg:h-8" viewBox="0 0 16 16"><path fill="currentColor" d="M7.571 11.84C6.908 12.298 6 11.827 6 11.024V4.975c0-.803.908-1.274 1.571-.816l3.784 2.617a1.486 1.486 0 0 1 0 2.447z"/></svg>
          </div>
        </Swiper>

        <button @click="closeFullscreen()" class="close-fullscreen">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <path fill="currentColor" d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"/>
          </svg>
        </button>
      </div>
    </div>

  </div>
  <div class="h-8 xl:h-16"> </div>
</template>

<style scoped>
.swiper-button-prev-custom,
.swiper-button-next-custom {
  position: absolute;
  color: white;
  border-radius: 100%;
  background-color: #b53d3d;
  font-weight: 700;
  cursor: pointer;
  top: 50%;
  z-index: 1;
  opacity: 0.6;
}

.swiper-button-prev-custom {
  left: 16px;
}

.swiper-button-next-custom {
  right: 16px;
}

.swiper-button-prev-custom:hover,
.swiper-button-next-custom:hover {
  opacity: 1;
  background-color: #b53d3d;
  color: white;
}


.fullscreen-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  border: none;
  border-bottom-left-radius: 50%;
  padding: 8px;
  cursor: pointer;
  transition: scale 0.3s ease-in-out;
}

.fullscreen-btn:hover {
  scale: 1.10;
}

.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.fullscreen-content {
  position: relative;
  width: 95%;
  height: 85%;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (min-width: 1024px) {
  .fullscreen-content {
    width: 80%;
    height: 90%;
  }
}

.close-fullscreen {
  position: absolute;
  top: 180px;
  right: 10px;
  color: white;
  cursor: pointer;
  transition: scale 0.3s ease-in-out;
  z-index: 5;
}

@media (min-width: 600px) {
  .close-fullscreen {
    top: 20px;
    right: 20px;
  }
}

.close-fullscreen:hover {
  scale: 1.10;
}

.btc:hover,
.btc:hover .icn {
  color: white;
}

.desktop-swiper-panel :deep(.swiper) {
  height: 100%;
}

.desktop-swiper-panel :deep(.swiper-wrapper) {
  height: 100%;
}

.desktop-swiper-panel :deep(.swiper-slide) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.fullscreen-content :deep(.swiper),
.fullscreen-content :deep(.swiper-wrapper),
.fullscreen-content :deep(.swiper-slide) {
  height: 100%;
}

.fullscreen-slide-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

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

.flip-back {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transform: rotateY(180deg);
}

@media (max-width: 1023px) {
  .flip-card.content-swapped .flip-front {
    height: 0;
    overflow: hidden;
  }

  .flip-back {
    z-index: 10;
  }

  .flip-card.content-swapped .flip-back {
    position: relative;
    height: auto;
  }
}

@media (min-width: 1024px) {
  .flip-card {
    display: grid;
  }

  .flip-face {
    grid-area: 1 / 1;
    min-height: 0;
  }

  .flip-back {
    position: static;
    height: auto;
  }
}

</style>