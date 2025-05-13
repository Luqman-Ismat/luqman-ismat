"use client"

import { useEffect } from "react"
// import { usePathname, useSearchParams } from 'next/navigation'  These are not needed

export function ScrollToTopLayout({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname()
  // const searchParams = useSearchParams()  These are not needed

  useEffect(() => {
    const handleRouteChange = () => {
      const isNewPage = document.cookie.includes("x-new-page=true")
      if (isNewPage) {
        window.scrollTo(0, 0)
        // Clear the cookie
        document.cookie = "x-new-page=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      }
    }

    handleRouteChange()
  }, []) // Removed unnecessary dependencies

  return <>{children}</>
}
