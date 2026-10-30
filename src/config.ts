/** Enlaces y metadatos públicos. */
export const downloadUrl =
  'https://github.com/tomasavellaneda/tomz-boost/releases/download/v1.0.3/Tomz-Boost-1.0.3-win64.zip'

export const LINKS = {
  download: downloadUrl,
  discord: 'https://discord.com/users/1554052825875484743',
  whatsapp: 'https://wa.me/5491123195888',
  instagram: 'https://www.instagram.com/tomzboost/',
  installGuide: '#pasos',
} as const

export const PRICES = {
  appCents: 6790,
  appWasCents: 13990,
  fullCents: 14990,
  fullWasCents: 34990,
} as const

export const RELEASE = {
  version: '1.0.3',
  size: '107 MB',
  updatedAt: '30 Oct 2026',
  platforms: ['Windows 10', 'Windows 11'] as const,
}
