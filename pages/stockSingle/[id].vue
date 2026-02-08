<script setup lang="ts">
import { useRoute } from 'vue-router';
useHead({
  title: `Veluxe Auto | Showroom`
});
const route = useRoute();

const routeId = route.params.id as string
const id = computed(() => {
  const parsedId = parseInt(routeId)
  return isNaN(parsedId) ? undefined : parsedId
})
</script>

<template>
  <div class="bg-[#121212]">
    <StockSpecificPage
      :id="id"
    />
  </div>
</template>
