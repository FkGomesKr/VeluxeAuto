<script lang="ts" setup>
import { ref } from 'vue'

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
            <h3 class="text-white text-md font-semibold tracking-wide uppercase">Sobre nós</h3>
          </div>
          <p class="text-gray-400 text-[14px] leading-relaxed pt-2">
            A VeluxeAuto é especializada na venda de viaturas de qualidade, com garantia e
            transparência em todo o processo. O nosso compromisso é oferecer a melhor experiência
            na compra do seu próximo automóvel.
          </p>
        </div>

        <!-- Contactos -->
        <div class="flex flex-col gap-3">
          <h3 class="text-white text-md font-semibold tracking-wide uppercase">Contactos</h3>
          <div class="flex flex-col gap-3 pt-2">
            <a
              href="https://www.instagram.com/veluxeauto"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 text-gray-400 text-[14px] hover:text-[#ff026a] transition-colors duration-200"
            >
              <i class="fa-brands fa-instagram text-lg"></i>
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/veluxeauto"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 text-gray-400 text-[14px] hover:text-[#0866ff] transition-colors duration-200"
            >
              <i class="fa-brands fa-facebook-f text-lg"></i>
              <span>Facebook</span>
            </a>
            <a
              href="https://wa.me/351912247691?text=Olá, estou interessado em comprar um carro. Podemos conversar?"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 text-gray-400 text-[14px] hover:text-[#25d366] transition-colors duration-200"
            >
              <i class="fa-brands fa-whatsapp text-lg"></i>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <!-- Localização -->
        <div class="flex flex-col gap-3">
          <h3 class="text-white text-md font-semibold tracking-wide uppercase">Localização</h3>
          <div class="flex items-start gap-2 text-gray-400 text-[14px] leading-relaxed pt-2">
            <i class="fa-solid fa-location-dot mt-0.5"></i>
            <div>
              <p>Portugal, Braga</p>
              <p>4700-000 Braga</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Separator -->
      <div class="border-t border-gray-700 mt-10 pt-8 mb-1">
        <div class="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-0">
          <p class="text-gray-500 text-sm">
            © 2026 VeluxeAuto. Todos os direitos reservados.
          </p>
          <span class="hidden sm:inline text-gray-600 text-xs mx-2">|</span>
          <button
            @click="openPrivacyModal()"
            class="text-gray-500 text-sm hover:text-[#b53d3d] transition-colors duration-200 underline underline-offset-2"
          >
            Política de Privacidade
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
              <h2 class="text-white text-lg font-semibold">Política de Privacidade</h2>
              <button
                @click="closePrivacyModal()"
                class="text-gray-400 hover:text-white transition-colors duration-200 p-1"
              >
                <i class="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div class="px-6 py-5 text-gray-300 text-sm leading-relaxed space-y-4">
              <p>
                <strong class="text-white">1. Responsável</strong><br>
                A VeluxeAuto é um projeto independente de compra e venda de automóveis,
                localizado na região de Braga, Portugal. Este website serve como plataforma
                de divulgação dos veículos disponíveis e dos nossos serviços.
              </p>
              <p>
                <strong class="text-white">2. Dados Pessoais Recolhidos</strong><br>
                Este website não exige qualquer registo nem criação de conta. A navegação é livre
                e anónima. O site disponibiliza um formulário de contacto opcional, no qual o
                utilizador pode, de forma voluntária, fornecer informações como nome, número de
                telefone ou e-mail para ser posteriormente contactado pela VeluxeAuto. O
                preenchimento deste formulário é inteiramente facultativo — o utilizador pode
                sempre optar por nos contactar diretamente por telefone, WhatsApp, Instagram ou
                Facebook.
              </p>
              <p>
                <strong class="text-white">3. Finalidade do Tratamento</strong><br>
                Os dados fornecidos através do formulário de contacto são utilizados exclusivamente
                para responder ao pedido do utilizador e facilitar a comunicação sobre veículos
                disponíveis. Não são utilizados para fins de marketing, nem são partilhados com
                terceiros.
              </p>
              <p>
                <strong class="text-white">4. Base Legal</strong><br>
                O tratamento dos dados pessoais fornecidos voluntariamente pelo utilizador é
                realizado com base no seu consentimento (artigo 6.º, n.º 1, alínea a) do
                Regulamento Geral sobre a Proteção de Dados — RGPD, Regulamento (UE) 2016/679),
                aplicável em Portugal através da Lei n.º 58/2019 de 8 de agosto.
              </p>
              <p>
                <strong class="text-white">5. Cookies</strong><br>
                Este website utiliza apenas um cookie funcional estritamente necessário:
                <span class="text-white font-medium">i18n_redirected</span>, que regista a
                preferência de idioma do utilizador durante a navegação. Este cookie não recolhe
                dados pessoais, não rastreia o utilizador e é essencial para o funcionamento
                correto do site. Não são utilizados cookies de terceiros, cookies de análise
                de tráfego nem cookies publicitários.
              </p>
              <p>
                <strong class="text-white">6. Registos Técnicos do Servidor</strong><br>
                A plataforma de alojamento (Vercel) regista automaticamente dados técnicos
                de acesso, como endereços IP e páginas visitadas. Estes dados são processados
                exclusivamente pela Vercel para fins de segurança e disponibilidade do serviço,
                de acordo com a
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" class="text-[#b53d3d] hover:underline">política de privacidade da Vercel</a>.
              </p>
              <p>
                <strong class="text-white">7. Partilha de Dados</strong><br>
                A VeluxeAuto não partilha, vende nem cede os dados dos utilizadores a terceiros.
                Quando o utilizador nos contacta através de plataformas externas (WhatsApp,
                Instagram, Facebook), aplicam-se as respetivas políticas de privacidade dessas
                plataformas.
              </p>
              <p>
                <strong class="text-white">8. Conservação dos Dados</strong><br>
                Os dados fornecidos através do formulário de contacto são conservados apenas
                pelo período necessário para responder ao pedido do utilizador, sendo
                posteriormente eliminados.
              </p>
              <p>
                <strong class="text-white">9. Direitos do Titular</strong><br>
                Nos termos do RGPD e da legislação portuguesa aplicável, o utilizador tem o
                direito de acesso, retificação, apagamento, limitação do tratamento,
                portabilidade e oposição relativamente aos seus dados pessoais. Pode também
                apresentar reclamação junto da
                <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" class="text-[#b53d3d] hover:underline">Comissão Nacional de Proteção de Dados (CNPD)</a>.
              </p>
              <p>
                <strong class="text-white">10. Contacto</strong><br>
                Para exercer os seus direitos ou para qualquer questão relacionada com
                privacidade, pode contactar-nos através do WhatsApp, Instagram ou Facebook,
                acessíveis a partir deste website.
              </p>
              <p class="text-gray-500 text-xs pt-2">
                Última atualização: março de 2026
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