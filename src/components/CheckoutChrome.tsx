import type { ReactNode } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import { IconCheck } from './Icons'

const STEPS = ['book.step.data', 'book.step.pay', 'book.step.done'] as const satisfies readonly MessageKey[]

export function BookingSteps({ step, done = false }: { step: 1 | 2 | 3; done?: boolean }) {
  const { t } = useI18n()
  return (
    <ol className="booking-steps" aria-label={t('book.steps')}>
      {STEPS.map((key, index) => {
        const n = index + 1
        const complete = done || n < step
        const current = !done && n === step
        return (
          <li
            key={key}
            className={complete ? 'is-done' : current ? 'is-current' : undefined}
            aria-current={current ? 'step' : undefined}
          >
            <span>{complete ? <IconCheck /> : n}</span>
            {t(key)}
          </li>
        )
      })}
    </ol>
  )
}

export function BookingPlan({
  badge,
  title,
  points,
  price,
  notes,
}: {
  badge: string
  title: string
  points: string[]
  price: string
  notes?: ReactNode
}) {
  return (
    <div className="booking-plan">
      <div className="booking-plan-copy">
        <span>{badge}</span>
        <h3>{title}</h3>
        <ul>
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="booking-meta">
        <strong>{price}</strong>
        {notes}
      </div>
    </div>
  )
}
