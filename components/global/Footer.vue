<script lang="ts" setup>
</script>

<template>
    <hr class="bar">
    <hr class="bar2">
    <div class="w-full bg-[#201818] overflow-hidden relative z-[2]">
        <div class="pt-6 pb-4">
            <div class="mx-auto w-full rounded-2xl flex flex-col items-center gap-6">
              <div class="w-full flex justify-between items-end pr-14 pl-4 gap-6">
                <div class="flex flex-col justify-start items-center">
                  <div class="flex justify-start items-start gap-1">
                    <p class="text-white text-[11px] font-light">
                      Localização:
                    </p>
                  </div>
                  <p class="text-white text-[13px] font-thin ml-8">
                    Portugal, Braga
                  </p>
                </div>
                <div class="icon-container WPP mr-2">
                  <a class="icon-link" href="https://wa.me/351912247691?text=Olá, estou interessado em comprar um carro. Podemos conversar?">
                    <svg class="pr-1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#fff" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/></svg>
                  </a>
                </div>
                <div class="flex flex-col justify-start items-center">
                  <p class="text-white text-[11px] font-light">
                    Contact us: 
                  </p>
                  <div class="ml-3 h-[20px]">
                      <a href="https://wa.me/351912247691?text=Olá, estou interessado em comprar um carro. Podemos conversar?">
                        <span class="text-white text-[13px] font-thin underline">Whatsapp</span>
                      </a>
                  </div>
                </div>
              </div>
              <p class="text-xs text-white pt-2 pb-2 z-[2]">
                  Veluxe Auto®
              </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bar {
  border: none; 
  height: 1px; 
  background: #b53d3d; /* Bright yellow */
  box-shadow: 0 -5px 10px #b53d3d, /* Glow above */
              0 5px 10px #b53d3d,  /* Glow below */
              0 0 15px #b53d3d,   /* Larger glow around */
              0 0 30px #b53d3d;   /* Intense glowing effect */
}

.bar2 {
  border: none; 
  height: 1px; 
  background: #b53d3d; /* Bright yellow */
  box-shadow: 0 -5px 10px #b53d3d, /* Glow above */
              0 5px 10px #D32F2F,  /* Glow below */
              0 0 15px #b53d3d,   /* Larger glow around */
              0 0 30px #D32F2F;   /* Intense glowing effect */
  transform: rotate(180deg);
}

/* Container styles */
.icon-container {
  position: relative;
  display: inline-block;
  width: 50px; /* Adjust size */
  height: 50px; /* Adjust size */
}

/* Icon link styles */
.icon-link {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 2; /* Ensure it is above the circle */
  text-decoration: none;
}

/* Pseudo-element for the circle */
.icon-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 48%;
  width: 30px; /* Initial size of the circle */
  height: 30px; /* Initial size of the circle */
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0); /* Start small */
  transition: transform 0.3s ease; /* Animation duration and easing */
  z-index: 1; /* Below the icon */
}

/* Pseudo-element for the circle */
.INSTA::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px; /* Initial size of the circle */
  height: 30px; /* Initial size of the circle */
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0); /* Start small */
  transition: transform 0.3s ease; /* Animation duration and easing */
  z-index: 1; /* Below the icon */
}

/* Hover effect: Grow the circle */
.icon-container:hover::before {
  transform: translate(-50%, -50%) scale(1.5); /* Grow to full size */
}

.FB::before {
  background-color: #0866ff; 
  color: #aaacad;
}

.TT::before {
  background-color: black;
}

.LI::before {
  background-color: #007bb6;
}

.INSTA::before {
  background-color: #ff026a; 
}

.WPP::before {
  background-color: #c72121; 
}

.horizontal-line {
    width: 100%; 
    height: 1px;
    background-color: #ccd6db;
    margin: 14px 0;
    border-radius: 1px; 
}
</style>