<script setup lang="ts">
import { SITE_URL } from '~/composables/useSiteSeo'

// Links in readmes and posts: other sites open in a new tab; links on this site and to headings
// (#setup) stay in the page.
const props = defineProps<{ href?: string, target?: string }>()

const external = computed(() => !!props.href && /^https?:\/\//.test(props.href) && !props.href.startsWith(SITE_URL))
</script>

<template>
  <NuxtLink :href="href" :target="external ? '_blank' : target">
    <slot />
  </NuxtLink>
</template>
