<script setup lang="ts">
import '~/themes/active'

useHead({
  script: [
    // Marks JS as available before first paint, so draw-in styles only hide things when they can be revealed.
    { innerHTML: 'document.documentElement.classList.add(\'js\')', tagPosition: 'head' },
  ],
})
</script>

<template>
  <NuxtPage />
</template>
