<script setup lang="ts">
import Deck from '~/deck/Deck.vue'

useHomeSeo(await useSiteContent())
</script>

<template>
  <Deck />
</template>
