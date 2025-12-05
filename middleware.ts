import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Set a custom header to indicate a new page load
  response.headers.set("x-new-page", "true")

  return response
}

export const config = {
  matcher: "/:path*",
}
