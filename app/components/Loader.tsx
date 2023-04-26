export default function Loader({
  height = 6,
  width = 'full'
}: {
  height?: string | number
  width?: string | number
}) {
  return (
    <div
      className={`h-${height} w-${width} rounded bg-slate-200 animate-pulse inline-block`}
    />
  )
}
