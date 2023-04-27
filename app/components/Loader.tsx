export default function Loader({
  height = 20,
  width = '100%'
}: {
  height?: string | number
  width?: string | number
}) {
  return (
    <div
      className={`rounded bg-slate-200 animate-pulse`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof height === 'number' ? `${width}px` : width
      }}
    />
  )
}
