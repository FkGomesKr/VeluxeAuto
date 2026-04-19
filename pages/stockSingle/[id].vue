<script setup lang="ts">
import { useRoute } from 'vue-router';
useHead({
  title: `Veluxe Auto | Showroom`
});
const route = useRoute();

const routeId = route.params.id as string
const parsedId = parseInt(routeId)

if (isNaN(parsedId)) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

const id = parsedId
</script>

<template>
  <div class="bg-[#121212]">
    <StockSpecificPage
      :id="id"
    />
  </div>
</template>
