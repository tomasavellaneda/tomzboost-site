/** Enlaces y metadatos públicos — reemplazá SEUNUMERO / SEULINK / URL del instalador. */
export const downloadUrl = '/downloads/TomzBoost-Setup.zip'

export const LINKS = {
  download: downloadUrl,
  discord: 'https://discord.gg/SEULINK',
  whatsapp: 'https://wa.me/SEUNUMERO',
  installGuide: '#pasos',
} as const

export const PRICES = {
  appCents: 9000,
  fullCents: 18000,
} as const

export const RELEASE = {
  version: '1.0.0',
  size: '48 MB',
  updatedAt: '23 Sep 2026',
  platforms: ['Windows 10', 'Windows 11'] as const,
}
