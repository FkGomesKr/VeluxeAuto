<script lang="ts" setup>
import { ref } from 'vue'

const { t } = useI18n()
const showPrivacyModal = ref(false)

function openPrivacyModal() {
  showPrivacyModal.value = true
  document.body.style.overflow = 'hidden'
}

function closePrivacyModal() {
  showPrivacyModal.value = false
  document.body.style.overflow = ''
}
</script>

<template>
  <hr class="bar">
  <hr class="bar2">
  <footer class="w-full bg-[#201818] relative z-[2]">
    <div class="max-w-5xl mx-auto px-8 sm:px-12 pt-10 pb-6">
      <!-- Three columns -->
      <div class="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr_0.8fr] gap-10 md:gap-24">

        <!-- Sobre nós -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2.5">
            <img src="/images/VeluxeAutoLogo.png" alt="VeluxeAuto" class="h-6 w-auto">
            <h3 class="text-white text-md font-semibold tracking-wide uppercase">{{ t('footerAboutUs') }}</h3>
          </div>
          <p class="text-[#a0a0a0] text-[14px] leading-relaxed pt-2">
            {{ t('footerAboutUsText') }}
          </p>
        </div>

        <!-- Contactos -->
        <div class="flex flex-col gap-3">
          <h3 class="text-white text-md font-semibold tracking-wide uppercase">{{ t('contacts') }}</h3>
          <div class="flex flex-col gap-3 pt-2">
            <a
              href="https://www.instagram.com/veluxeauto"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 text-[#a0a0a0] text-[14px] hover:text-[#ff026a] transition-colors duration-200"
            >
              <i class="fa-brands fa-instagram text-lg"></i>
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/veluxeauto"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 text-[#a0a0a0] text-[14px] hover:text-[#0866ff] transition-colors duration-200"
            >
              <i class="fa-brands fa-facebook-f text-lg"></i>
              <span>Facebook</span>
            </a>
            <a
              href="https://wa.me/351912247691?text=Olá, estou interessado em comprar um carro. Podemos conversar?"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 text-[#a0a0a0] text-[14px] hover:text-[#25d366] transition-colors duration-200"
            >
              <i class="fa-brands fa-whatsapp text-lg"></i>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <!-- Localização -->
        <div class="flex flex-col gap-3">
          <h3 class="text-white text-md font-semibold tracking-wide uppercase">{{ t('footerLocation') }}</h3>
          <div class="flex items-start gap-2 text-[#a0a0a0] text-[14px] leading-relaxed pt-2">
            <i class="fa-solid fa-location-dot mt-0.5"></i>
            <div>
              <p>Portugal, Braga</p>
              <p>4700-000 Braga</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Separator -->
      <div class="border-t border-[#a0a0a0] mt-10 pt-8 mb-1">
        <div class="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-0">
          <p class="text-[#a0a0a0] text-sm">
            {{ t('footerAllRights') }}
          </p>
          <span class="hidden sm:inline text-[#a0a0a0] text-xs mx-2">|</span>
          <button
            @click="openPrivacyModal()"
            class="text-[#a0a0a0] text-sm hover:text-[#b53d3d] transition-colors duration-200 underline underline-offset-2"
          >
            {{ t('privacyPolicy') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Privacy Policy Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showPrivacyModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          @click.self="closePrivacyModal()"
        >
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="closePrivacyModal()"></div>
          <div class="relative bg-[#201818] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl z-10">
            <div class="h-full max-h-[80vh] overflow-y-auto modal-scroll">
            <div class="sticky top-0 bg-[#201818] pl-6 pr-1  py-4 flex justify-between items-center">
              <h2 class="text-white text-lg font-semibold">{{ t('privacyPolicy') }}</h2>
              <button
                @click="closePrivacyModal()"
                class="text-[#a0a0a0] hover:text-white transition-colors duration-200 p-1"
              >
                <i class="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div class="px-6 py-5 text-gray-300 text-sm leading-relaxed space-y-4">
              <p v-for="i in 10" :key="i">
                <strong class="text-white">{{ t(`privacyS${i}Title`) }}</strong><br>
                <span v-html="t(`privacyS${i}Text`)"></span>
              </p>
              <p class="text-[#a0a0a0] text-xs pt-2">
                {{ t('privacyLastUpdated') }}
              </p>
            </div>
          </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </footer>
</template>

<style scoped>
.bar {
  border: none;
  height: 1px;
  background: #b53d3d;
  box-shadow: 0 -5px 10px #b53d3d,
              0 5px 10px #b53d3d,
              0 0 15px #b53d3d,
              0 0 30px #b53d3d;
}

.bar2 {
  border: none;
  height: 1px;
  background: #b53d3d;
  box-shadow: 0 -5px 10px #b53d3d,
              0 5px 10px #D32F2F,
              0 0 15px #b53d3d,
              0 0 30px #D32F2F;
  transform: rotate(180deg);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-scroll::-webkit-scrollbar {
  width: 8px;
}

.modal-scroll::-webkit-scrollbar-track {
  background: #201818;
  border-radius: 0 12px 12px 0;
}

.modal-scroll::-webkit-scrollbar-thumb {
  background: #3a2a2a;
  border-radius: 4px;
}

.modal-scroll::-webkit-scrollbar-thumb:hover {
  background: #4a3535;
}

.modal-scroll {
  scrollbar-color: #3a2a2a #201818;
  scrollbar-width: thin;
}
</style>