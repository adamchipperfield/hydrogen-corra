import { useParams, Link as RemixLink } from '@remix-run/react'
import type { RemixLinkProps } from '@remix-run/react/dist/components'

export default function Link({ to, className, ...rest }: RemixLinkProps) {
  const params = useParams()
  const path = params.lang ? `/${params.lang}${to}` : to

  return (
    <RemixLink
      to={path}
      className={className}
      {...rest}
    />
  )
}
