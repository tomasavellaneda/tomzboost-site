#!/usr/bin/env node
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'screenshots')
const base = process.env.SHOT_BASE || 'http://127.0.0.1:43123'

const screens = ['inicio', 'tweaks', 'juegos', 'debloat', 'affinity', 'bios']
const locales = ['es', 'pt', 'en']

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  headless: true,
})

const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
})

for (const locale of locales) {
  const localeDir = path.join(outDir, locale)
  await mkdir(localeDir, { recursive: true })

  for (const screen of screens) {
    const url = `${base}/?shot=${screen}&lang=${locale}`
    console.log('Capturando', url)
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    const target = page.locator('.app-window')
    await target.waitFor({ state: 'visible' })
    const file = path.join(localeDir, `${screen}.png`)
    await target.screenshot({ path: file, type: 'png' })
    // compat: también en la raíz para ES
    if (locale === 'es') {
      await target.screenshot({ path: path.join(outDir, `${screen}.png`), type: 'png' })
    }
    console.log('OK', file)
  }
}

await browser.close()
console.log('Listo.')
