const NAME_RE = /^[\p{L}][\p{L}\s'-]{1,98}[\p{L}]$/u
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizePhone(input) {
  let digits = String(input ?? '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('55')) digits = `55${digits}`
  if (digits.length < 12 || digits.length > 13) return null
  return digits
}

export function validateBuyer(input) {
  const name = String(input?.name ?? '').trim().replace(/\s+/g, ' ')
  const email = String(input?.email ?? '').trim().toLowerCase()
  const phone = normalizePhone(input?.phone)
  const documentDigits = String(input?.document ?? '').replace(/\D/g, '')
  const discord = String(input?.discord ?? '').trim()

  if (name.length < 3 || name.length > 100 || !NAME_RE.test(name) || !name.includes(' ')) {
    return { error: 'invalid_name' }
  }
  if (!EMAIL_RE.test(email) || email.length > 100) return { error: 'invalid_email' }
  if (!phone) return { error: 'invalid_phone' }
  if (documentDigits && !/^\d{11}$|^\d{14}$/.test(documentDigits)) return { error: 'invalid_document' }
  if (discord.length > 40) return { error: 'invalid_discord' }

  return {
    buyer: {
      name,
      email,
      phone,
      ...(documentDigits ? { document: documentDigits } : {}),
      ...(discord ? { discord } : {}),
    },
  }
}
