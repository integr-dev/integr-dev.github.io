// The contact form (app/components/ContactForm.vue). Checks the Turnstile token, then mails the message
// to me through Cloudflare Email Routing (the EMAIL send_email binding), with the sender as Reply-To.
// Without the binding (npm run dev) the message is only logged.
//
// Worker secrets: TURNSTILE_SECRET_KEY, CONTACT_TO (my inbox, a verified Email Routing destination),
// CONTACT_FROM (an address on integr.cc the mail is sent from).

const MAX = { name: 100, email: 200, message: 5000 }
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/

interface SendEmail { send: (message: unknown) => Promise<void> }

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  // one line each: no line breaks can sneak into the mail headers
  const name = String(body?.name ?? '').replace(/\s+/g, ' ').trim()
  const email = String(body?.email ?? '').trim()
  const message = String(body?.message ?? '').trim()
  // a field people never see; bots fill it in
  if (body?.website) return { ok: true }
  if (!name || name.length > MAX.name || !EMAIL.test(email) || email.length > MAX.email || !message || message.length > MAX.message) {
    throw createError({ statusCode: 400, statusMessage: 'invalid' })
  }

  const env = (event.context.cloudflare?.env ?? {}) as Record<string, unknown>
  const secret = typeof env.TURNSTILE_SECRET_KEY === 'string'
    ? env.TURNSTILE_SECRET_KEY
    // Cloudflare's test secret, which accepts the test site key's tokens (dev)
    : '1x0000000000000000000000000000000AA'
  const check = await $fetch<{ success: boolean }>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret,
      response: String(body?.token ?? ''),
      remoteip: getRequestHeader(event, 'cf-connecting-ip') ?? '',
    }),
  }).catch(() => ({ success: false }))
  if (!check.success) throw createError({ statusCode: 403, statusMessage: 'captcha' })

  const mailer = env.EMAIL as SendEmail | undefined
  const to = env.CONTACT_TO
  const from = env.CONTACT_FROM
  if (!mailer || typeof to !== 'string' || typeof from !== 'string') {
    console.info(`[contact] (not sent, no mail binding) from ${name} <${email}>:\n${message}`)
    return { ok: true }
  }

  const raw = [
    `From: integr.cc <${from}>`,
    `To: ${to}`,
    `Reply-To: ${email}`,
    `Subject: ${encodeWord(`integr.cc: message from ${name}`)}`,
    `Message-ID: <${crypto.randomUUID()}@integr.cc>`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    `${name} <${email}> wrote:`,
    '',
    message,
  ].join('\r\n')
  // only on Cloudflare; the literal stays for the bundler, which leaves cloudflare:* to the Worker
  const { EmailMessage } = await import('cloudflare:email' as string)
  await mailer.send(new EmailMessage(from, to, raw))
  return { ok: true }
})

/** A header value with non-ASCII characters (names like "Müller"), as RFC 2047 needs it. */
function encodeWord(text: string) {
  if (/^[\x20-\x7E]*$/.test(text)) return text
  const bytes = new TextEncoder().encode(text)
  return `=?UTF-8?B?${btoa(String.fromCharCode(...bytes))}?=`
}
