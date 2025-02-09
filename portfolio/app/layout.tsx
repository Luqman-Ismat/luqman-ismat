import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingScreen } from "@/components/loading-screen"
import type React from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LoadingScreen />
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'