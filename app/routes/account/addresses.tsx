import { useLoaderData } from '@remix-run/react'

export async function loader() {
  return {
    title: 'Addresses'
  }
}

export default function Orders() {
  const { title } = useLoaderData()

  return (
    <div className="my-8">
      <h2 className="text-h3">{title}</h2>
    </div>
  )
}
