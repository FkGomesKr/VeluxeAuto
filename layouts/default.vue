<script lang="ts" setup>
import { NuxtPage } from '#components';
import { SpeedInsights } from "@vercel/speed-insights/nuxt"
import { Analytics } from '@vercel/analytics/nuxt'
</script>

<template>
  <div class="bg-[#121212]">
    <SpeedInsights/>
    <Analytics />
    <Navbar />
    <main class="relative" style="z-index: 1;">
      <NuxtPage />
      <Footer />
    </main>
  </div>
</template>
