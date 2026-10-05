"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/* Reads ?s=<chapter>&c=<component> and reports it. Kept tiny and inside its
   own Suspense boundary so the homepage itself stays statically rendered. */
export function ExploreParam({ onChange }: { onChange: (s: string | null, c: string | null) => void }) {
  const params = useSearchParams();
  const s = params.get("s");
  const c = params.get("c");
  useEffect(() => { onChange(s, c); }, [s, c, onChange]);
  return null;
}
