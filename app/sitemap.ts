import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.luqmanismat.com'
  const currentDate = new Date().toISOString()

  // Blog posts data - All 15 blog posts with their actual dates
  const blogPosts = [
    {
      slug: 'cvp-analysis-mobile-service-operations',
      lastModified: '2025-01-15T03:00:00.000Z',
    },
    {
      slug: 'process-safety-management',
      lastModified: '2025-10-11T12:00:00.000Z',
    },
    {
      slug: 'digital-twins',
      lastModified: '2025-10-11T13:00:00.000Z',
    },
    {
      slug: 'heat-exchanger-design',
      lastModified: '2025-10-11T14:00:00.000Z',
    },
    {
      slug: 'project-management-engineers',
      lastModified: '2025-10-11T15:00:00.000Z',
    },
    {
      slug: 'process-piping-systems',
      lastModified: '2025-10-11T16:00:00.000Z',
    },
    {
      slug: 'ai-machine-learning-engineering',
      lastModified: '2025-10-11T17:00:00.000Z',
    },
    {
      slug: 'energy-efficiency-industrial',
      lastModified: '2025-10-11T18:00:00.000Z',
    },
    {
      slug: 'career-development-engineers',
      lastModified: '2025-10-11T19:00:00.000Z',
    },
    {
      slug: 'detailed-engineering',
      lastModified: '2025-03-11T03:00:00.000Z',
    },
    {
      slug: 'fel-stages',
      lastModified: '2025-03-11T03:00:00.000Z',
    },
    {
      slug: 'epc-estimating',
      lastModified: '2025-03-11T03:00:00.000Z',
    },
    {
      slug: 'epc-lifecycle',
      lastModified: currentDate,
    },
    {
      slug: 'engineering-technology',
      lastModified: currentDate,
    },
    {
      slug: 'epc-communication',
      lastModified: currentDate,
    },
  ]

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects/engivault`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects/innovari`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}

