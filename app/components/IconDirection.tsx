import Icon, { IconNotFound } from '~/components/Icon'
import type { IconProps } from '~/components/Icon'

/**
 * Renders a directional icon.
 */
export default function IconDirection({ icon, direction, ...props }: IconProps & {
  icon: 'chevron'
  direction: 'down'
}) {
  if (icon === 'chevron') {
    if (direction === 'down') {
      return (
        <Icon {...props}>
          <path d="M4.96 7.94 12 14.477l7.039-6.537 1.02 1.1L12 16.524 3.94 9.04l1.021-1.1Z" />
        </Icon>
      )
    }

    return <IconNotFound />
  }
  
  return <IconNotFound />
}
