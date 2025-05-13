import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingScreen } from "@/components/loading-screen"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import type React from "react"

export const metadata = {
  title: "Luqman Ismat | Engineering Consultant from Katy, TX",
  description:
    "Luqman Ismat is an innovative engineering consultant based in Katy and The Woodlands, TX, specializing in process engineering and AI-driven solutions for the EPC industry.",
  keywords:
    "Luqman Ismat, Luqman Ismat Montgomery, Engineering, Luqman Ismat Katy, Luqman, Ismat, Luqman Ismat Woodlands",
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png",
    shortcut:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="w-full h-full" suppressHydrationWarning>
      <head>
        <meta name="author" content="Luqman Ismat" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Luqman Ismat | Engineering Consultant from Katy, TX" />
        <meta
          property="og:description"
          content="Luqman Ismat Montgomery is an innovative engineering consultant based in Katy and The Woodlands, TX, specializing in process engineering and AI-driven solutions for the EPC industry."
        />
        <meta property="og:image" content="https://www.luqmanismat.com/og-image.jpg" />
        <meta property="og:url" content="https://www.luqmanismat.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="icon"
          type="image/png"
          sizes="36x36"
          href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="36x36"
          href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-36x36-LUak25km0YlO83hgg0zzo0ZjBcZQm1.png"
        />
      </head>
      <body className="w-full h-full bg-background">
        <ThemeProvider>
          <ScrollToTopWrapper>
            <div className="w-full h-full">
              <LoadingScreen />
              {children}
              <ThemeToggle />
            </div>
          </ScrollToTopWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
