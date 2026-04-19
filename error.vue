<script setup lang="ts">
import Navbar from '~/components/global/Navbar.vue';
import Footer from '~/components/global/Footer.vue';
import NotFound from '~/components/global/NotFound.vue';

defineProps<{
  error: {
    statusCode: number;
    message: string;
  };
}>();
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <NotFound class="flex-1" />
    <Footer />
  </div>
</template>
