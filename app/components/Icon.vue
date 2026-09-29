<script setup lang="ts">
import { icons } from '~/utils/icons'

// An icon from utils/icons.ts: a name ("arrow-right"), or [prefix, name] as Font Awesome writes it.
// Sized and aligned to the text like Font Awesome's own icons (1em high, sitting on the baseline).
const props = defineProps<{ icon: string | [string, string] | string[] }>()
const def = computed(() => icons[Array.isArray(props.icon) ? props.icon[props.icon.length - 1]! : props.icon])
const path = computed(() => {
  const d = def.value?.icon[4]
  return Array.isArray(d) ? d.join(' ') : d
})
</script>

<template>
  <svg
    v-if="def"
    class="icon"
    :viewBox="`0 0 ${def.icon[0]} ${def.icon[1]}`"
    aria-hidden="true"
    focusable="false"
  >
    <path fill="currentColor" :d="path" />
  </svg>
</template>

<style scoped>
.icon {
  display: inline-block;
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  box-sizing: content-box;
}
</style>
