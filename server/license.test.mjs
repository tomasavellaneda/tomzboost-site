import assert from 'node:assert/strict'
import test from 'node:test'
import { generateLicenseKey, isValidLicenseKey } from './license.mjs'

test('cada clave de la app es válida y distinta', () => {
  const first = generateLicenseKey()
  const second = generateLicenseKey()
  assert.match(first, /^TOMZ(?:-[0-9A-F]{4}){4}$/)
  assert.equal(isValidLicenseKey(first), true)
  assert.equal(isValidLicenseKey(second), true)
  assert.notEqual(first, second)
})

test('una clave alterada o la de la vista previa no activan la app', () => {
  const key = generateLicenseKey()
  const broken = key.slice(0, -1) + (key.endsWith('A') ? 'B' : 'A')
  assert.equal(isValidLicenseKey(broken), false)
  assert.equal(isValidLicenseKey('TOMZ-0000-0000-0000-0000'), false)
  assert.equal(isValidLicenseKey('TB7K-9F2D-4Q8M-3Z6P'), false)
})
