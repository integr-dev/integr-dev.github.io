<script setup lang="ts">
import { loadTurnstile, useContactForm } from '~/composables/useContactForm'
import type { Turnstile } from '~/composables/useContactForm'
import ButterflySprite from '~/themes/drafting/ButterflySprite.vue'

// "Write me a message" from the Contact sheet: a pixel-art postcard that blows in on the wind with a
// few petals, message on the left, address and stamp on the right. Sending postmarks the stamp and
// the card blows away again. Sent to /api/contact, which mails it to me; Cloudflare Turnstile keeps
// bots out and stays invisible unless it has doubts.
const form = useContactForm()
const { profile } = await useSiteContent()
const { locale } = useI18n()
const siteKey = useRuntimeConfig().public.turnstileSiteKey

const nameField = ref<HTMLInputElement>()
const challenge = ref<HTMLElement>()
const fields = reactive({ name: '', email: '', message: '', website: '' })
// sending → stamped (postmark) → gone (the card has blown away, "sent" shows) → closed
const state = ref<'idle' | 'sending' | 'stamped' | 'gone' | 'error'>('idle')
let token = ''
let turnstile: Turnstile | undefined
let widget: string | undefined
const timers: ReturnType<typeof setTimeout>[] = []

const today = computed(() => formatDate(new Date().toISOString().slice(0, 10), true, locale.value))

// pixel sprites: w petal, y flower heart (accent), g stem, l leaf
const SPRIG = [
  '...w.....',
  '..wyw....',
  '...w..w..',
  '...g.wyw.',
  '..gg..w..',
  '...g..g..',
  'l..g.gg..',
  'll.g.g...',
  '.llgg....',
  '...g.....',
  '...g..ll.',
  '...g.ll..',
  '...gg....',
]
const pixels = (rows: string[]) => rows.flatMap((row, y) => [...row].map((c, x) => ({ x, y, c })).filter(p => p.c !== '.'))
const sprig = pixels(SPRIG)
// petals drifting past on the wind while the card flies in or out
const petals = Array.from({ length: 9 }, (_, i) => ({ top: 12 + ((i * 37) % 70), delay: (i * 97) % 520, size: i % 3 === 0 ? 6 : 4 }))

watch(form.isOpen, async (open) => {
  if (!open) {
    timers.splice(0).forEach(clearTimeout)
    if (turnstile && widget) turnstile.remove(widget)
    widget = undefined
    return
  }
  state.value = 'idle'
  await nextTick()
  // after the card has landed, so the jump to the field does not fight the flight
  timers.push(setTimeout(() => nameField.value?.focus({ preventScroll: true }), 900))
  try {
    turnstile = await loadTurnstile()
    if (form.isOpen.value && challenge.value && !widget) {
      widget = turnstile.render(challenge.value, {
        'sitekey': siteKey,
        'appearance': 'interaction-only',
        'language': locale.value,
        'callback': (t: string) => (token = t),
        'expired-callback': () => (token = ''),
      })
    }
  }
  catch {
    // no Turnstile (blocked or offline): sending fails and the error names the address instead
  }
})

async function send() {
  if (state.value === 'sending' || state.value === 'stamped' || state.value === 'gone') return
  state.value = 'sending'
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...fields, token } })
    state.value = 'stamped'
    Object.assign(fields, { name: '', email: '', message: '' })
    // the postmark lands, then the card blows away and "sent" stays a moment
    timers.push(setTimeout(() => (state.value = 'gone'), 900))
    timers.push(setTimeout(() => form.close(), 3200))
  }
  catch {
    state.value = 'error'
  }
  finally {
    token = ''
    if (turnstile && widget) turnstile.reset(widget)
  }
}

function onKey(e: KeyboardEvent) {
  if (!form.isOpen.value) return
  if (e.key === 'Escape') form.close()
  else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
  else return
  e.preventDefault()
  e.stopImmediatePropagation()
}

onMounted(() => window.addEventListener('keydown', onKey, { capture: true }))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey, { capture: true })
  timers.forEach(clearTimeout)
})
</script>

<template>
  <Transition name="pc" :duration="{ enter: 1200, leave: 800 }">
    <div v-if="form.isOpen.value" class="pc" role="dialog" aria-modal="true" :aria-label="$t('contact.form.title')" @click.self="form.close()">
      <div class="pc-wind" aria-hidden="true">
        <span v-for="(p, i) in petals" :key="i" class="pc-petal" :style="{ top: `${p.top}%`, animationDelay: `${p.delay}ms`, width: `${p.size}px`, height: `${p.size}px` }" />
      </div>

      <form class="pc-card" :class="{ 'is-stamped': state === 'stamped' || state === 'gone', 'is-gone': state === 'gone' }" @submit.prevent="send">
        <!-- the message side -->
        <div class="pc-message">
          <p class="pc-hello">{{ $t('contact.form.greeting') }}</p>
          <textarea
            v-model="fields.message"
            name="message"
            rows="7"
            maxlength="5000"
            required
            :aria-label="$t('contact.form.message')"
            :placeholder="$t('contact.form.placeholder')"
          />
          <svg class="pc-sprig" viewBox="0 0 9 13" shape-rendering="crispEdges" aria-hidden="true">
            <rect v-for="(p, i) in sprig" :key="i" :class="`px-${p.c}`" :x="p.x" :y="p.y" width="1" height="1" />
          </svg>
        </div>

        <!-- the address side -->
        <div class="pc-address">
          <div class="pc-stamp" aria-hidden="true">
            <ButterflySprite :scale="1.6" />
            <span class="pc-stamp-text mono">integr.cc</span>
          </div>
          <!-- lands when the card is sent -->
          <svg class="pc-postmark" viewBox="0 0 120 64" aria-hidden="true">
            <circle cx="88" cy="32" r="26" />
            <circle cx="88" cy="32" r="20" />
            <text x="88" y="30" text-anchor="middle">integr.cc</text>
            <text x="88" y="40" text-anchor="middle">{{ today }}</text>
            <path d="M0 22 h10 v-3 h10 v3 h10 v-3 h10 v3 h12" />
            <path d="M0 32 h10 v-3 h10 v3 h10 v-3 h10 v3 h12" />
            <path d="M0 42 h10 v-3 h10 v3 h10 v-3 h10 v3 h12" />
          </svg>

          <p class="pc-to mono">
            <span class="pc-label">{{ $t('contact.form.to') }}</span>
            {{ profile?.fullName }}
          </p>
          <label class="pc-field">
            <span class="pc-label mono">{{ $t('contact.form.name') }}</span>
            <input ref="nameField" v-model="fields.name" name="name" autocomplete="name" maxlength="100" required>
          </label>
          <label class="pc-field">
            <span class="pc-label mono">{{ $t('contact.form.email') }}</span>
            <input v-model="fields.email" name="email" type="email" autocomplete="email" maxlength="200" required>
          </label>
          <!-- for bots only: people never see it -->
          <input v-model="fields.website" class="pc-trap" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">

          <div class="pc-foot">
            <button type="submit" class="pc-send mono" :disabled="state !== 'idle' && state !== 'error'">
              {{ state === 'sending' ? $t('contact.form.sending') : $t('contact.form.send') }} <FontAwesomeIcon icon="arrow-right" />
            </button>
          </div>
        </div>
      </form>

      <div ref="challenge" class="pc-challenge" />
      <p class="pc-status mono" aria-live="polite">
        <template v-if="state === 'gone'">{{ $t('contact.form.sent') }}</template>
        <template v-else-if="state === 'error'">{{ $t('contact.form.error', { email: profile?.email }) }}</template>
      </p>

      <button type="button" class="pc-close mono" :aria-label="$t('contact.form.close')" @click="form.close()">
        esc
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.pc {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 56px 24px;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  /* at the screen's own scale, not the page zoom: password managers and the browser's autofill
     place their menus by the fields' screen position, which the zoom would throw off */
  zoom: calc(1 / var(--zoom));
}

/* ---------- the card ---------- */

.pc-card {
  --paper: color-mix(in srgb, var(--bg) 92%, #f4e9c8);
  --ink: var(--fg);

  position: relative;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  width: min(720px, 100%);
  min-height: 380px;
  background: var(--paper);
  border: 2px solid var(--line-strong);
  /* a hard pixel shadow; the card lands straight, so it reads and types like a form */
  box-shadow: 8px 8px 0 color-mix(in srgb, var(--line-strong) 45%, transparent);
  image-rendering: pixelated;
}

.pc-message {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px 28px 24px;
  /* the fold between the halves: a dashed pixel line */
  background-image: linear-gradient(var(--line-strong) 50%, transparent 50%);
  background-size: 2px 12px;
  background-repeat: repeat-y;
  background-position: right top;
}

.pc-hello {
  font-family: var(--font-pixel);
  font-weight: var(--font-pixel-weight);
  font-size: 2.2rem;
  line-height: 1;
  color: var(--ink);
}

/* written on ruled lines, like a card */
.pc-message textarea {
  --rule: 1.9em;

  flex: 1;
  width: 100%;
  font: inherit;
  font-size: 1.05rem;
  line-height: var(--rule);
  color: var(--ink);
  background: repeating-linear-gradient(transparent 0 calc(var(--rule) - 1px), var(--line) calc(var(--rule) - 1px) var(--rule));
  background-attachment: local;
  border: 0;
  padding: 0;
  resize: none;
}

.pc-message textarea::placeholder {
  color: var(--fg-muted);
  opacity: 0.6;
}

.pc-message textarea:focus-visible,
.pc-field input:focus-visible {
  outline: none;
}

/* a flower sprig growing over the bottom left corner */
.pc-sprig {
  position: absolute;
  left: -22px;
  bottom: -14px;
  width: 54px;
  height: 78px;
}

.pc-address {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px 24px 20px 26px;
}

/* the stamp, with a perforated edge */
.pc-stamp {
  align-self: flex-end;
  position: relative;
  display: grid;
  place-items: center;
  gap: 4px;
  width: 78px;
  height: 92px;
  padding: 10px 6px 6px;
  background: color-mix(in srgb, var(--accent) 18%, var(--paper));
  border: 4px dotted var(--paper);
  outline: 2px solid var(--line-strong);
  outline-offset: -6px;
}

.pc-stamp-text {
  font-size: 0.6rem;
  color: var(--line);
}

.px-w { fill: #f4f1e4; }
.px-y { fill: var(--accent); }
.px-g { fill: #366834; }
.px-l { fill: #6ca049; }

.pc-postmark {
  position: absolute;
  top: 16px;
  right: 6px;
  width: 170px;
  height: 90px;
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.6;
  opacity: 0;
  pointer-events: none;
}

.pc-postmark text {
  fill: var(--ink);
  stroke: none;
  font-family: var(--font-mono);
  font-size: 7px;
  letter-spacing: 0.04em;
}

.pc-to {
  margin-top: 8px;
  font-size: 0.95rem;
  color: var(--ink);
}

.pc-label {
  display: block;
  font-size: 0.7rem;
  color: var(--line);
}

.pc-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pc-field input {
  font: inherit;
  font-size: 1rem;
  color: var(--ink);
  background: none;
  border: 0;
  border-bottom: 1px solid var(--line);
  padding: 3px 0;
}

.pc-field:focus-within input {
  border-bottom-color: var(--accent);
}

.pc-trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.pc-foot {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.pc-send {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--accent);
  background: none;
  border: 2px solid var(--line-strong);
  padding: 7px 14px;
  cursor: pointer;
}

.pc-send:disabled {
  opacity: 0.5;
  cursor: default;
}

.pc-challenge:empty {
  display: none;
}

.pc-status {
  min-height: 1.2em;
  font-size: 0.85rem;
  color: var(--line);
  text-align: center;
}

.pc-close {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  font: inherit;
  font-size: 0.8rem;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--line-strong);
  cursor: pointer;
}

/* ---------- the wind ---------- */

.pc-wind {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pc-petal {
  position: absolute;
  left: -20px;
  background: #f4f1e4;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--line-strong) 40%, transparent);
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  /* the card is blown in from the left, tumbles, overshoots a little and settles */
  .pc-enter-active .pc-card {
    animation: pc-fly-in 1100ms cubic-bezier(0.22, 0.8, 0.25, 1) both;
  }

  .pc-leave-active .pc-card,
  .pc-card.is-gone {
    animation: pc-fly-out 800ms cubic-bezier(0.55, 0, 0.8, 0.4) both;
  }

  .pc-enter-active .pc-petal,
  .pc-leave-active .pc-petal,
  .pc:has(.is-gone) .pc-petal {
    animation: pc-drift 1300ms linear both;
  }

  /* the postmark is pressed on: a hard step down, then the card jolts */
  .pc-card.is-stamped .pc-postmark {
    animation: pc-stamp 220ms steps(3, end) both;
  }

  .pc-card.is-stamped:not(.is-gone) {
    animation: pc-jolt 160ms steps(2, end) 200ms both;
  }
}

.pc-card.is-stamped .pc-postmark {
  opacity: 0.75;
}

.pc-enter-active {
  transition: background-color 200ms ease;
}

.pc-leave-active {
  transition: background-color 300ms ease 450ms;
}

.pc-enter-from,
.pc-leave-to {
  background-color: transparent;
}

.pc-enter-from :is(.pc-close, .pc-status),
.pc-leave-to :is(.pc-close, .pc-status) {
  opacity: 0;
}

.pc-enter-active :is(.pc-close, .pc-status),
.pc-leave-active :is(.pc-close, .pc-status) {
  transition: opacity 200ms ease;
}

@keyframes pc-fly-in {
  0% { translate: -95vw -28vh; rotate: -32deg; }
  45% { translate: 6vw 4vh; rotate: 9deg; }
  70% { translate: -2vw -1vh; rotate: -4deg; }
  85% { translate: 0.8vw 0.4vh; rotate: 0.5deg; }
  100% { translate: 0 0; rotate: 0deg; }
}

@keyframes pc-fly-out {
  0% { translate: 0 0; rotate: 0deg; }
  25% { translate: -3vw 1vh; rotate: -6deg; }
  100% { translate: 110vw -35vh; rotate: 28deg; }
}

@keyframes pc-drift {
  0% { opacity: 0; transform: translate(0, 0) rotate(0deg); }
  10% { opacity: 1; }
  35% { transform: translate(38vw, -6vh) rotate(180deg); }
  65% { transform: translate(72vw, 5vh) rotate(360deg); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translate(110vw, -4vh) rotate(540deg); }
}

@keyframes pc-stamp {
  from { opacity: 0; transform: scale(1.6); }
  to { opacity: 0.75; transform: scale(1); }
}

@keyframes pc-jolt {
  50% { translate: 2px 3px; }
}

@media (max-width: 767px) {
  .pc {
    justify-content: flex-start;
    padding: 72px 12px 12px;
    overflow-y: auto;
  }

  .pc-card {
    grid-template-columns: 1fr;
  }

  .pc-message {
    order: 2;
    padding: 20px;
    background-image: linear-gradient(90deg, var(--line-strong) 50%, transparent 50%);
    background-size: 12px 2px;
    background-repeat: repeat-x;
    background-position: left top;
  }

  .pc-address {
    padding: 20px;
  }

  .pc-sprig {
    left: auto;
    right: 8px;
    bottom: 8px;
  }
}
</style>
