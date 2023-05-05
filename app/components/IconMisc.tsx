import Icon, { IconNotFound } from '~/components/Icon'
import type { IconProps } from '~/components/Icon'

/**
 * Renders a miscellaneous icon.
 */
export default function IconMisc({ icon, ...props }: IconProps & {
  icon: 'loading'
}) {
  if (icon === 'loading') {
    return (
      <Icon {...props}>
        <path d="M13.837 21.83A10 10 0 0 1 2 11.909l1.564.014a8.436 8.436 0 0 0 9.986 8.37l.287 1.537Z" />
      </Icon>
    )
  }
  
  return <IconNotFound />
}
