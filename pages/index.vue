<script lang="ts" setup>
definePageMeta({
  layout: 'default' 
});
useHead({
  title: "Veluxe Auto | Showroom"
});
</script>

<template>
  <div class="bg-[#121212]">
    <HomeHeroSection />
    <LazyHomeBrand />
    <LazyHomeContact />
  </div>
</template>
