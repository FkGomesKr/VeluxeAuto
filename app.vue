<script setup lang="ts">
useHead({
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico"
    }
  ]
});
</script>

<template>
  <NuxtLayout />
</template>

<style>
::selection {
  background-color: #d47474;
  color: white; 
}

html, body {
  background-color: #121212;
  font-family: 'Nunito Sans Variable', 'Nunito Sans', sans-serif;
  color: #121212;
}
</style>