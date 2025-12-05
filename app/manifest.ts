import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Luqman Ismat - Engineering Consultant',
    short_name: 'Luqman Ismat',
    description: 'Innovative engineering consultant specializing in process engineering and AI-driven solutions for the EPC industry.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png',
        sizes: '36x36',
        type: 'image/png',
      },
    ],
  }
}

