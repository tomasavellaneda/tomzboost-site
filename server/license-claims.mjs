import fs from 'node:fs'
import path from 'node:path'
import { getConfig } from './config.mjs'
import { command, redisConfigured } from './redis.mjs'

const PREFIX = 'tomz:license:'
let memory = null

function claimsFile() {
  const configured = getConfig().storeFile
  const base = configured ? path.dirname(configured) : path.join(process.cwd(), 'data')
  return path.join(base, 'license-claims.json')
}

function readFileClaims() {
  const file = claimsFile()
  if (!fs.existsSync(file)) return {}
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeFileClaims(claims) {
  const file = claimsFile()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(claims, null, 2))
  fs.renameSync(tmp, file)
}

export function resetLicenseClaimsForTests() {
  memory = {}
}

/**
 * Ata una key a un equipo la primera vez que se activa.
 * Devuelve { ok: true } si es la primera vez o si ya era de ese equipo.
 */
export async function claimLicenseKey(key, hwid) {
  if (redisConfigured() && memory === null) {
    const redisKey = PREFIX + key
    const claimed = await command('SET', redisKey, hwid, 'NX')
    if (claimed === 'OK') return { ok: true, hwid }
    const current = await command('GET', redisKey)
    if (current === hwid) return { ok: true, hwid }
    return { ok: false, reason: 'bound_elsewhere', hwid: current || null }
  }

  if (memory === null) memory = readFileClaims()
  const current = memory[key]
  if (!current) {
    memory[key] = hwid
    writeFileClaims(memory)
    return { ok: true, hwid }
  }
  if (current === hwid) return { ok: true, hwid }
  return { ok: false, reason: 'bound_elsewhere', hwid: current }
}

/** Libera una key (soporte: el cliente cambió de equipo). */
export async function releaseLicenseKey(key) {
  if (redisConfigured() && memory === null) {
    await command('DEL', PREFIX + key)
    return true
  }
  if (memory === null) memory = readFileClaims()
  if (!(key in memory)) return false
  delete memory[key]
  writeFileClaims(memory)
  return true
}

export async function listLicenseClaims(limit = 200) {
  if (redisConfigured() && memory === null) {
    // Sin SCAN expuesto: se consultan las keys emitidas desde el panel.
    return []
  }
  if (memory === null) memory = readFileClaims()
  return Object.entries(memory)
    .slice(0, limit)
    .map(([key, hwid]) => ({ key, hwid }))
}
