/** Shared state for the contact form (ContactForm.vue), opened from the Contact sheet. */
export function useContactForm() {
  const open = useState('contact-form', () => false)
  return {
    isOpen: computed(() => open.value),
    open: () => (open.value = true),
    close: () => (open.value = false),
  }
}

/** Cloudflare Turnstile, as far as the form uses it. */
export interface Turnstile {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window { turnstile?: Turnstile }
}

let loading: Promise<Turnstile> | undefined

/** Turnstile's script, loaded the first time the form opens. */
export function loadTurnstile() {
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')))
    script.onerror = () => {
      loading = undefined
      reject(new Error('turnstile'))
    }
    document.head.append(script)
  })
  return loading
}
