export type IconProps = JSX.IntrinsicElements['svg']

/**
 * Renders an SVG icon wrapper for consistent styles.
 * - Custom attributes can be defined.
 */
export default function Icon({ children, className, ...props }: IconProps) {
  return (
    <svg
      className={`fill-current h-6 w-6 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...props}
    >
      {children}
    </svg>
  )
}

/**
 * An "not found" message.
 */
export function IconNotFound() {
  return <p>No icon found</p>
}
