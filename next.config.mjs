/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  async redirects() {
    return [
      { source: "/consulting", destination: "/controls", permanent: true },
      { source: "/consulting/project-controls", destination: "/controls", permanent: true },
      { source: "/consulting/dashboards", destination: "/integrations", permanent: true },
      { source: "/consulting/integrations", destination: "/integrations", permanent: true },
      { source: "/projects", destination: "/controls", permanent: true },
      { source: "/projects/engivault", destination: "/engivault", permanent: true },
      { source: "/projects/field-01", destination: "/ten21", permanent: true },
      { source: "/projects/innovari", destination: "/controls", permanent: true },
      { source: "/demos", destination: "/controls", permanent: true },
      { source: "/demos/project-controls", destination: "/controls", permanent: true },
      { source: "/demos/inspection-planning", destination: "/engineering#inspection", permanent: true },
      { source: "/demos/connected-operations", destination: "/integrations#mapping", permanent: true },
      { source: "/portfolio", destination: "/about#experience", permanent: true },
      { source: "/portfolio/pinnacle-reliability/:path*", destination: "/integrations", permanent: true },
      { source: "/indus-blue", destination: "/ten21", permanent: true },
      { source: "/indus-blue/:slug", destination: "/ten21/:slug", permanent: true },
      { source: "/apparel", destination: "/ten21", permanent: true },
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
