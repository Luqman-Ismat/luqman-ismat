"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { StationId } from "@/lib/chapters";

const ExplodeStage = dynamic(() => import("./explode-stage"), { ssr: false });

export function StageClient(props: { station: StationId; parts: { id: string; n: string; title: string }[] }) {
  const [gl, setGl] = useState(false);
  const [visible, setVisible] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      // Feature detection has to run in the browser, after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch { /* no WebGL: the part index below the title still works */ }
  }, []);
  // stop rendering the scene once the reader has scrolled into the components
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={host} className="ch-stage-host">{gl && <ExplodeStage {...props} active={visible} />}</div>;
}
