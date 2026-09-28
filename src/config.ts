/** Enlaces y metadatos públicos — reemplazá SEUNUMERO. */
export const downloadUrl =
  'https://github.com/tomasavellaneda/tomz-boost/releases/download/v1.0.2/Tomz-Boost-Setup-1.0.2.exe'

export const LINKS = {
  download: downloadUrl,
  discord: 'https://discord.com/users/1554052825875484743',
  whatsapp: 'https://wa.me/SEUNUMERO',
  instagram: 'https://www.instagram.com/tomzboost/',
  installGuide: '#pasos',
} as const

export const PRICES = {
  appCents: 6790,
  appWasCents: 9000,
  fullCents: 15000,
  fullWasCents: 18000,
} as const

export const RELEASE = {
  version: '1.0.2',
  size: '81 MB',
  updatedAt: '23 Sep 2026',
  platforms: ['Windows 10', 'Windows 11'] as const,
}
