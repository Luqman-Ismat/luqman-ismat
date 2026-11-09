import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TEN21 Consulting",
    short_name: "TEN21",
    description: "Websites, payments, automation, knowledge bases, dashboards and integrations. Houston.",
    start_url: "/",
    display: "browser",
    background_color: "#0b0b0a",
    theme_color: "#0b0b0a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
