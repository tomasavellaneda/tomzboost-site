import { createHmac, timingSafeEqual } from 'node:crypto'

function adminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || ''
}

export function adminConfigured() {
  return adminPassword().length >= 8
}

export function adminSessionToken() {
  const password = adminPassword()
  if (password.length < 8) return ''
  return createHmac('sha256', password).update('tomz-admin-v1').digest('base64url')
}

function same(a, b) {
  const left = Buffer.from(String(a ?? ''))
  const right = Buffer.from(String(b ?? ''))
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right)
}

export function checkAdminPassword(input) {
  const password = adminPassword()
  if (password.length < 8) return false
  return same(input, password)
}

export function checkAdminToken(header) {
  const expected = adminSessionToken()
  if (!expected) return false
  const raw = String(header ?? '')
  const got = raw.startsWith('Bearer ') ? raw.slice(7) : raw
  return same(got, expected)
}
