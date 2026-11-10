import Link from "next/link";
import { PlantSchematic } from "@/components/engivault/plant-schematic";
import { LiveChart } from "./live-chart";
import { WireScene } from "./wire-scene";
import { Roll } from "./roll";
import { SectionHead } from "./title";
import { hotspots } from "@/lib/engivault/catalog";

/* Three live visuals, built in the browser. Nothing here is a screenshot. */
export function Visuals() {
  return (
    <section className="sec visuals" id="visuals" aria-labelledby="visuals-title">
      <SectionHead label="(Custom visuals)" id="visuals-title" title="Diagrams, charts and 3D that move. Not screenshots." pos="tr" />
      <div className="vis-grid">
        <figure className="vis-panel vis-pid" data-fade>
          <PlantSchematic hotspots={hotspots} />
          <figcaption>
            <span className="label">(01) Live process diagram</span>
            <span className="label dim">SVG drawn by code. Every instrument opens its calculation.</span>
          </figcaption>
        </figure>
        <figure className="vis-panel vis-chart" data-fade data-delay="0.1">
          <LiveChart />
          <figcaption>
            <span className="label">(02) Live chart</span>
            <span className="label dim">Plan against actual, redrawn from data. Move across it.</span>
          </figcaption>
        </figure>
        <figure className="vis-panel vis-wire" data-fade data-delay="0.2">
          <WireScene />
          <figcaption>
            <span className="label">(03) WebGL</span>
            <span className="label dim">A heat exchanger in wireframe. Hover to pull the bundle.</span>
          </figcaption>
        </figure>
        <div className="vis-copy" data-fade data-delay="0.15">
          <p className="body">
            Stock charts make every company look the same. <b>A custom visual shows your process, your schedule or your numbers the way your team already pictures them, and it responds.</b> Built for the browser, so it drops into your site, your app or a report.
          </p>
          <div className="action-row">
            <Link className="btn ghost" href="/services#visuals">
              <Roll text="Custom visuals" /> <span className="arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
