import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createClient()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/ailments`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/remedies`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic ailment pages
  const { data: ailments } = await supabase
    .from('ailments')
    .select('id, updated_at')
    .order('id')

  const ailmentPages = (ailments || []).map((ailment) => ({
    url: `${baseUrl}/ailments/${ailment.id}`,
    lastModified: new Date(ailment.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic remedy pages
  const { data: remedies } = await supabase
    .from('remedies')
    .select('id, updated_at')
    .order('id')

  const remedyPages = (remedies || []).map((remedy) => ({
    url: `${baseUrl}/remedies/${remedy.id}`,
    lastModified: new Date(remedy.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...ailmentPages, ...remedyPages]
}