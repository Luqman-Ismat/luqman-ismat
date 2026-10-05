/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  async redirects() {
    return [
      { source: "/demos", destination: "/projects", permanent: true },
      { source: "/apparel", destination: "/indus-blue", permanent: true },
      { source: "/projects/field-01", destination: "/indus-blue", permanent: true },
      {
        source: "/portfolio/pinnacle-reliability/:path*",
        destination: "/consulting#connected-systems",
        permanent: true,
      },
      {
        source: "/projects/innovari",
        destination: "/consulting#project-delivery",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      { source: "/examples/:path*", headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'" },
        { key: "X-Robots-Tag", value: "noindex" },
      ] },
    ];
  },
  images: {
    formats: ["image/webp", "image/avif"],
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.luqmanismat.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
    ],
  },
  poweredByHeader: false,
  compress: true,
};
export default nextConfig;
