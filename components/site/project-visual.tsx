import { LiveGantt } from "./live-gantt";
import { CostCurves } from "./cost-curves";
import { PlantSchematic } from "@/components/engivault/plant-schematic";
import { hotspots } from "@/lib/engivault/catalog";

/* The visual that stands for each project everywhere on the site. Drawn by
   code in the site's own style; never a screenshot. */
export function ProjectVisual({ kind }: { kind: string }) {
  if (kind === "project") return <LiveGantt />;
  if (kind === "inspection") return <CostCurves />;
  return <PlantSchematic hotspots={hotspots} />;
}
