<script setup lang="ts">
// The avatar at its native 184 px, drawn block by block on a canvas each time the intro is built.
const SIZE = 184
const BLOCK = 8

const wrap = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const drawing = ref(false)
let img: HTMLImageElement | undefined
let raf = 0

function load() {
  return new Promise<HTMLImageElement>((resolve) => {
    if (img?.complete) return resolve(img)
    img = new Image()
    img.onload = () => resolve(img!)
    img.src = '/img/avatar.webp'
  })
}

function context() {
  const c = canvas.value!
  const dpr = window.devicePixelRatio || 1
  c.width = SIZE * dpr
  c.height = SIZE * dpr
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.scale(dpr, dpr)
  return ctx
}

async function run(e: Event) {
  const { resolve, signal, speed = 1 } = (e as CustomEvent<{ resolve: () => void, signal: AbortSignal, speed?: number }>).detail
  cancelAnimationFrame(raf)
  const image = await load()
  if (signal.aborted) return
  const ctx = context()
  ctx.clearRect(0, 0, SIZE, SIZE)
  drawing.value = true
  // rows sweep top to bottom, each block lands with a little jitter
  const n = SIZE / BLOCK
  const blocks = Array.from({ length: n * n }, (_, i) => {
    const x = i % n
    const y = Math.floor(i / n)
    return { x, y, at: ((y / n) * 900 + Math.random() * 260) / speed }
  }).sort((a, b) => a.at - b.at)
  const scale = image.naturalWidth / SIZE
  const start = performance.now()
  let i = 0
  const step = (now: number) => {
    if (signal.aborted) return
    const t = now - start
    while (i < blocks.length && blocks[i]!.at <= t) {
      const b = blocks[i++]!
      ctx.drawImage(image, b.x * BLOCK * scale, b.y * BLOCK * scale, BLOCK * scale, BLOCK * scale, b.x * BLOCK, b.y * BLOCK, BLOCK, BLOCK)
    }
    if (i < blocks.length) raf = requestAnimationFrame(step)
    else {
      drawing.value = false
      resolve()
    }
  }
  raf = requestAnimationFrame(step)
}

function reset() {
  cancelAnimationFrame(raf)
  drawing.value = false
  const c = canvas.value
  c?.getContext('2d')?.clearRect(0, 0, c.width, c.height)
}

onMounted(() => {
  wrap.value?.addEventListener('build-run', run)
  wrap.value?.addEventListener('build-reset', reset)
  wrap.value?.addEventListener('build-finish', reset)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <!-- the builder owns this element's classes, so Vue-bound state lives on the inner frame -->
  <div ref="wrap" class="avatar" data-build="custom">
    <div class="frame" :class="{ 'is-drawing': drawing }">
      <img src="/img/avatar.webp" alt="Pixel art of a cat sitting in front of a wooden wall with plants and a yellow butterfly" width="184" height="184">
      <canvas ref="canvas" aria-hidden="true" />
    </div>
    <span class="corner tl" aria-hidden="true" />
    <span class="corner tr" aria-hidden="true" />
    <span class="corner bl" aria-hidden="true" />
    <span class="corner br" aria-hidden="true" />
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
  width: 184px;
  height: 184px;
}

img,
canvas {
  position: absolute;
  inset: 0;
  width: 184px;
  height: 184px;
  image-rendering: pixelated;
  border-radius: 22%;
}

/* while the canvas draws, the finished image waits underneath */
.frame.is-drawing img,
.avatar.b-run img {
  visibility: hidden;
}

.avatar.b-done .frame:not(.is-drawing) canvas {
  visibility: hidden;
}

.corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: var(--line);
  border-style: solid;
  border-width: 0;
}

.tl { left: -8px; top: -8px; border-left-width: 1px; border-top-width: 1px; }
.tr { right: -8px; top: -8px; border-right-width: 1px; border-top-width: 1px; }
.bl { left: -8px; bottom: -8px; border-left-width: 1px; border-bottom-width: 1px; }
.br { right: -8px; bottom: -8px; border-right-width: 1px; border-bottom-width: 1px; }
</style>
