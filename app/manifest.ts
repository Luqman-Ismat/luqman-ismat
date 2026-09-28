import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Luqman Ismat | Consulting & Product Development",
    short_name: "Luqman Ismat",
    description:
      "Consulting, connected systems, and Indus Blue apparel development.",
    start_url: "/",
    display: "browser",
    background_color: "#f7f8fa",
    theme_color: "#f7f8fa",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
