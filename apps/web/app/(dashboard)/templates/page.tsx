import { cookies } from 'next/headers'
import { TemplatesView } from '@/components/templates/templates-view'

interface TemplateItem {
  id: string
  label: string
  required: boolean
  sortOrder: number
}

interface Template {
  id: string
  name: string
  items: TemplateItem[]
}

async function getTemplates(): Promise<Template[]> {
  const token = cookies().get('token')?.value
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/templates`,
    { headers: { Cookie: `token=${token}` }, cache: 'no-store' },
  )
  if (!res.ok) return []
  return res.json()
}

export default async function TemplatesPage() {
  const templates = await getTemplates()
  return <TemplatesView initialTemplates={templates} />
}
