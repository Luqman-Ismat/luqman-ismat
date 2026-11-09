"use client";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { recordFirstTouch } from "@/lib/leads/attribution";

/* Cookieless page analytics (Vercel Web Analytics) and first-touch
   attribution for inquiries. */
export function SiteAnalytics() {
  useEffect(() => { recordFirstTouch(); }, []);
  return process.env.NEXT_PUBLIC_VERCEL_ENV ? <Analytics /> : null;
}
