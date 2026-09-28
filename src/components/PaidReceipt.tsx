import { useState } from 'react'
import { LINKS } from '../config'
import { useI18n } from '../i18n/I18nProvider'
import {
  IconArrowRight,
  IconCheck,
  IconChevron,
  IconCopy,
  IconDownload,
  IconHeadset,
  IconKey,
  IconShield,
  IconZap,
} from './Icons'

/** Solo para /comprar?pago=1. Tiene el formato de la app y no es una clave emitida. */
export const PREVIEW_LICENSE_KEY = 'TOMZ-0000-0000-0000-0000'

const HOW_KEYS = ['appbuy.how1', 'appbuy.how2', 'appbuy.how3', 'appbuy.how4'] as const

export function PaidReceipt({
  licenseKey,
  downloadUrl,
}: {
  licenseKey?: string
  downloadUrl: string
}) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const key = licenseKey?.trim() || ''

  async function copyKey() {
    if (!key) return
    await navigator.clipboard.writeText(key)
    setCopied(true)
  }

  return (
    <div className="receipt">
      <div className="receipt-grid">
        <div className="receipt-main">
          <div className="receipt-check" aria-hidden>
            <IconCheck />
          </div>
          <h2>{t('appbuy.paidTitle')}</h2>
          <p className="receipt-lead">{t('appbuy.paidBody')}</p>

          <div className="receipt-keycard">
            <p className="receipt-keycard-label">
              <IconKey />
              {t('appbuy.keyLabel')}
            </p>
            <div className="receipt-key">
              {key ? <code>{key}</code> : <span className="receipt-key-pending">{t('appbuy.keyPending')}</span>}
              <button className="receipt-copy" type="button" onClick={copyKey} disabled={!key} aria-label={t('appbuy.copy')}>
                <IconCopy />
              </button>
            </div>
            {copied && (
              <p className="receipt-copied">
                <IconCheck />
                {t('appbuy.copied')}
              </p>
            )}
            <a className="button button-primary receipt-download" href={downloadUrl}>
              <IconDownload />
              {t('appbuy.download')}
            </a>
            <details className="receipt-guide">
              <summary>
                {t('appbuy.guide')}
                <IconChevron />
              </summary>
              <p>{t('appbuy.guideBody')}</p>
            </details>
          </div>
        </div>

        <aside className="receipt-side">
          <div className="receipt-panel">
            <h3>{t('appbuy.howTitle')}</h3>
            <ol className="receipt-steps">
              {HOW_KEYS.map((keyName, index) => (
                <li key={keyName}>
                  <span>{index + 1}</span>
                  {t(keyName)}
                </li>
              ))}
            </ol>
          </div>
          <div className="receipt-panel receipt-help">
            <h3>
              <IconHeadset />
              {t('appbuy.helpTitle')}
            </h3>
            <p>{t('appbuy.helpBody')}</p>
            <a className="button button-secondary" href={LINKS.discord} target="_blank" rel="noreferrer">
              <img src="/icons/discord.svg" alt="" width={16} height={16} />
              {t('appbuy.discord')}
              <IconArrowRight />
            </a>
          </div>
        </aside>
      </div>

      <div className="receipt-trust">
        <span>
          <IconShield />
          {t('appbuy.secure')}
        </span>
        <span>
          <IconZap />
          {t('appbuy.instant')}
        </span>
      </div>
    </div>
  )
}
