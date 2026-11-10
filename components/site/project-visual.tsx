import { LiveGantt } from "./live-gantt";
import { CostCurves } from "./cost-curves";
import { PlantSchematic } from "@/components/engivault/plant-schematic";
import { hotspots } from "@/lib/engivault/catalog";

/* The visual that stands for each project everywhere on the site. Drawn by
   code in the site's own style; never a screenshot. */
export function ProjectVisual({ kind, variant = 0 }: { kind: string; variant?: number }) {
  if (kind === "project") return <LiveGantt variant={variant} />;
  if (kind === "inspection") return <CostCurves variant={variant % 2} />;
  return <PlantSchematic hotspots={hotspots} initial={variant ? hotspots[variant % hotspots.length]?.id : null} />;
}
