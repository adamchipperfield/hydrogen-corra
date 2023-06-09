import type { ReactNode } from 'react'
import IconDirection from '~/components/IconDirection'

/**
 * A disclosure element with a custom icon.
 */
export default function DetailsTab({
  children,
  title = 'Details'
}: {
  children: ReactNode
  title: string
}) {
  return (
    <details className="group border-t border-slate-500/20">
      <summary className="py-4 flex items-center font-medium cursor-pointer select-none">
        {title}

        <IconDirection
          icon="chevron"
          direction="down"
          className="ml-auto group-open:rotate-180"
        />
      </summary>

      <div className="mb-6 text-sm">
        {children}
      </div>
    </details>
  )
}
