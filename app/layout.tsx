import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import { ScrollProgress } from "@/components/scroll-progress"
import { RouteProgress } from "@/components/route-progress"
import { CursorGlow } from "@/components/cursor-glow"
import { Konami } from "@/components/konami"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/react"
import dynamic from "next/dynamic"
import type React from "react"

const PerformanceMonitor =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/performance-monitor").then((m) => m.PerformanceMonitor), {
        ssr: false,
      })
    : () => null

export const metadata = {
  title: {
    default: "Luqman Ismat | Engineering Consultant",
    template: "%s | Luqman Ismat"
  },
  description:
    "Luqman Ismat is an innovative engineering consultant specializing in process engineering, chemical engineering, and AI-driven solutions for the EPC industry. Serving Houston, Katy, and The Woodlands, TX.",
  keywords: [
    "Luqman Ismat",
    "Engineering Consultant",
    "Process Engineering",
    "Chemical Engineering",
    "EPC Industry",
    "Oil & Gas Consultant",
    "Industrial Engineering Solutions",
    "HAZOP Studies",
    "Process Safety Management",
    "Process Simulation",
    "Piping Systems Design",
    "Heat Exchanger Design",
    "Engineering Innovation",
    "AI-driven Solutions",
    "Digital Twins",
    "Houston Engineering Consultant",
    "Katy TX Process Engineer",
    "The Woodlands EPC Specialist",
    "Houston Area Engineering Services",
    "Texas Engineering Professional"
  ],
  authors: [{ name: "Luqman Ismat" }],
  creator: "Luqman Ismat",
  publisher: "Luqman Ismat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png",
    shortcut:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png",
  },
  metadataBase: new URL("https://www.luqmanismat.com"),
  alternates: {
    canonical: "https://www.luqmanismat.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.luqmanismat.com",
    title: "Luqman Ismat | Engineering Consultant",
    description: "Innovative engineering consultant specializing in process engineering, chemical engineering, and AI-driven solutions for the EPC industry.",
    siteName: "Luqman Ismat",
    images: [
      {
        url: "https://www.luqmanismat.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Luqman Ismat - Engineering Consultant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luqman Ismat | Engineering Consultant",
    description: "Innovative engineering consultant specializing in process engineering, chemical engineering, and AI-driven solutions for the EPC industry.",
    images: ["https://www.luqmanismat.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="w-full h-full" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://www.luqmanismat.com/#person",
                  "name": "Luqman Ismat",
                  "jobTitle": "Engineering Consultant",
                  "description": "Innovative engineering consultant specializing in process engineering, chemical engineering, and AI-driven solutions for the EPC industry.",
                  "url": "https://www.luqmanismat.com",
                  "image": "https://www.luqmanismat.com/og-image.jpg",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Katy",
                    "addressRegion": "TX",
                    "addressCountry": "US",
                    "areaServed": ["Houston", "Katy", "The Woodlands", "Texas"]
                  },
                  "sameAs": [
                    "https://www.linkedin.com/in/luqman-ismat/",
                    "https://x.com/LuqmanMIsmat",
                    "https://github.com/Luqman-Ismat",
                    "https://www.pinterest.com/luqmanismat/"
                  ],
                  "knowsAbout": [
                    "Process Engineering",
                    "Chemical Engineering",
                    "EPC Industry",
                    "Oil & Gas",
                    "AI-driven Solutions",
                    "Process Safety Management",
                    "HAZOP Studies",
                    "Piping Systems Design",
                    "Heat Exchanger Design",
                    "Process Simulation",
                    "Engineering Innovation",
                    "Digital Twins"
                  ],
                  "worksFor": {
                    "@type": "Organization",
                    "name": "Independent Consultant"
                  }
                },
                {
                  "@type": "ProfessionalService",
                  "@id": "https://www.luqmanismat.com/#service",
                  "name": "Luqman Ismat Engineering Consulting",
                  "image": "https://www.luqmanismat.com/og-image.jpg",
                  "description": "Professional engineering consulting services specializing in process engineering, chemical engineering, and AI-driven solutions for the EPC industry.",
                  "url": "https://www.luqmanismat.com",
                  "priceRange": "$$",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Katy",
                    "addressRegion": "TX",
                    "addressCountry": "US"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": "29.7858",
                    "longitude": "-95.8244"
                  },
                  "areaServed": [
                    {
                      "@type": "City",
                      "name": "Houston"
                    },
                    {
                      "@type": "City",
                      "name": "Katy"
                    },
                    {
                      "@type": "City",
                      "name": "The Woodlands"
                    },
                    {
                      "@type": "State",
                      "name": "Texas"
                    }
                  ],
                  "serviceType": [
                    "Process Engineering",
                    "Chemical Engineering",
                    "EPC Consulting",
                    "Process Safety Management",
                    "Engineering Design",
                    "AI Solutions"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.luqmanismat.com/#website",
                  "url": "https://www.luqmanismat.com",
                  "name": "Luqman Ismat",
                  "description": "Engineering consultant specializing in process engineering and innovative solutions",
                  "publisher": {
                    "@id": "https://www.luqmanismat.com/#person"
                  }
                }
              ]
            })
          }}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="36x36"
          href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Luqman Ismat — Engineering Blog"
          href="https://www.luqmanismat.com/feed.xml"
        />
        <link
          rel="apple-touch-icon"
          sizes="36x36"
          href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png"
        />
      </head>
      <body className="w-full h-full bg-background">
        <a href="#main" className="skip-link">Skip to content</a>
        <ThemeProvider>
          <ScrollToTopWrapper>
            <div className="relative w-full h-full">
              <CursorGlow />
              <ScrollProgress />
              <RouteProgress />
              <Konami />
              {children}
              <ThemeToggle />
              <PerformanceMonitor />
              <Toaster />
            </div>
          </ScrollToTopWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
