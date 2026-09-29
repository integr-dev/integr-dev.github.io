<!-- A pixel spinner: four pixels in a square, the lit one stepping round. In the text colour's
     accent; used on the postcard's send button and in the search box. -->
<template>
  <span class="pixel-spinner" aria-hidden="true" />
</template>

<style scoped>
.pixel-spinner {
  --p: 4px;

  position: relative;
  display: inline-block;
  flex: none;
  width: calc(var(--p) * 2);
  height: calc(var(--p) * 2);
  color: var(--accent);
}

.pixel-spinner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: var(--p);
  height: var(--p);
  background: currentColor;
  box-shadow:
    var(--p) 0 0 color-mix(in srgb, currentColor 30%, transparent),
    var(--p) var(--p) 0 color-mix(in srgb, currentColor 30%, transparent),
    0 var(--p) 0 color-mix(in srgb, currentColor 30%, transparent);
  transform-origin: var(--p) var(--p);
  animation: pixel-spin 640ms steps(4, end) infinite;
}

@keyframes pixel-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .pixel-spinner::before {
    animation-duration: 2400ms;
  }
}
</style>
