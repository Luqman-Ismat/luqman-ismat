/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  async redirects() {
    return [
      { source: "/controls", destination: "/services#engineering", permanent: true },
      { source: "/integrations", destination: "/services#integrations", permanent: true },
      { source: "/engineering", destination: "/services#engineering", permanent: true },
      { source: "/ten21", destination: "/", permanent: true },
      { source: "/ten21/:path*", destination: "/", permanent: true },
      { source: "/consulting", destination: "/services", permanent: true },
      { source: "/consulting/:path*", destination: "/services", permanent: true },
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/projects/engivault", destination: "/engivault", permanent: true },
      { source: "/projects/field-01", destination: "/", permanent: true },
      { source: "/projects/innovari", destination: "/work", permanent: true },
      { source: "/demos", destination: "/work", permanent: true },
      { source: "/demos/project-controls", destination: "/work/project-controls", permanent: true },
      { source: "/demos/inspection-planning", destination: "/work/inspection-planning", permanent: true },
      { source: "/demos/:path*", destination: "/work", permanent: true },
      { source: "/portfolio", destination: "/about#experience", permanent: true },
      { source: "/portfolio/:path*", destination: "/about#experience", permanent: true },
      { source: "/indus-blue", destination: "/", permanent: true },
      { source: "/indus-blue/:path*", destination: "/", permanent: true },
      { source: "/apparel", destination: "/", permanent: true },
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
