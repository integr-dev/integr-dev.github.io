import { setupPixelFill } from '~/themes/drafting/pixelFill'

// hover fill for buttons marked data-fill (see pixelFill.ts)
export default defineNuxtPlugin(() => {
  setupPixelFill()
})
