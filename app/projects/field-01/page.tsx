import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { GarmentViewer } from "@/components/garment-viewer";
import { HardwareViewer } from "@/components/hardware-viewer";
import { CadDownloads } from "@/components/cad-downloads";
export const metadata = {
  title: "Field 01 | Indus Blue CAD Study",
  description:
    "Explore original utility overshirt CAD, a full-scale pocket draft, and a parametric hardware solid. Download DXF, STEP, STL and PDF source files.",
  alternates: { canonical: "/projects/field-01" },
};
export default function FieldStudy() {
  return (
    <PageShell>
      <section className="studio-wrap field-heading">
        <p className="eyebrow">Indus Blue / Field 01 / Development study</p>
        <h1>FIELD / 01</h1>
        <div className="field-intro">
          <h2>
            A garment idea.
            <br />
            Made tangible.
          </h2>
          <p>
            An Indus Blue utility overshirt explored through editable technical
            drawings, a pocket construction draft, and a complementary hardware
            concept. Open the geometry. Change the colorway. Take the files
            apart.
          </p>
        </div>
        <div className="field-meta">
          <span>DISCIPLINE / APPAREL + CAD</span>
          <span>REVISION / A</span>
          <span>UNITS / MILLIMETRES</span>
        </div>
      </section>
      <section className="field-viewer">
        <GarmentViewer />
      </section>
      <section className="studio-wrap field-details">
        <div>
          <p className="eyebrow">01 / The garment</p>
          <h2>
            Practical by design.
            <br />
            Precise in the details.
          </h2>
        </div>
        <div>
          <p>
            The study starts with a relaxed, dropped-shoulder overshirt: two
            chest pockets, a button front, a structured collar, and a back yoke.
            Front and back views share a millimetre-based coordinate system and
            separate layers for outlines, seams, stitching, and hardware.
          </p>
          <p>
            The colorways are visual explorations. The measurement sheet records
            the proposed base size; a physical sample is the next step for
            checking fit, balance, and construction.
          </p>
          <dl className="spec-rows">
            <div>
              <dt>Half chest</dt>
              <dd>660 mm</dd>
            </div>
            <div>
              <dt>High-point shoulder to hem</dt>
              <dd>680 mm</dd>
            </div>
            <div>
              <dt>Finished chest pocket</dt>
              <dd>180 × 210 mm</dd>
            </div>
            <div>
              <dt>Views</dt>
              <dd>Front / back / details</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="pocket-section studio-wrap">
        <div className="pocket-drawing">
          <svg
            viewBox="0 0 320 370"
            role="img"
            aria-label="Pocket pattern: 200 by 250 millimetre cut blank, 180 by 210 finished, side and bottom allowances 10 millimetres and double 15 millimetre top turn"
          >
            <rect
              x="60"
              y="50"
              width="200"
              height="250"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M70 50V300M250 50V300M60 65H260M60 80H260M60 290H260"
              stroke="currentColor"
              strokeDasharray="5 5"
              fill="none"
            />
            <path
              d="M72 90V288H248V90M160 240V130l-7 10m7-10l7 10"
              stroke="currentColor"
              fill="none"
            />
            <text x="160" y="30" textAnchor="middle">
              200 mm / CUT WIDTH
            </text>
            <text x="160" y="329" textAnchor="middle">
              180 × 210 mm FINISHED
            </text>
            <text x="160" y="355" textAnchor="middle">
              10 mm SIDES + BASE / 30 mm TOP
            </text>
          </svg>
        </div>
        <div>
          <p className="eyebrow">02 / From drawing to construction</p>
          <h2>
            A pocket you
            <br />
            can print at 1:1.
          </h2>
          <p>
            A separate pocket draft documents cut, fold, stitch, and grain
            lines. The top edge uses two 15 mm turns; the sides and base use 10
            mm allowances.
          </p>
          <p>
            Sheet 03 of the A3 drawing set is full scale. Print at 100% and
            check the 100 mm calibration line before using the draft for a test
            sample.
          </p>
          <Action href="/cad/field-01/field-01-drawing-set.pdf" secondary>
            Open the drawing set
          </Action>
        </div>
      </section>
      <section className="hardware-section">
        <div className="studio-wrap field-details">
          <div>
            <p className="eyebrow">03 / A complementary hardware study</p>
            <h2>
              Small part.
              <br />
              Real solid model.
            </h2>
          </div>
          <div>
            <p>
              A matching pull concept explores rounded corners, a finger
              opening, an attachment slot, and chamfered edges. It is a separate
              accessory study for a future zipped piece, rather than a closure
              on this button-front overshirt.
            </p>
            <p>
              The viewer uses the triangulated solid exported from the CAD
              model. STEP preserves the solid geometry for editing; STL provides
              a mesh for prototype preparation. Material, attachment
              compatibility, and strength remain to be validated.
            </p>
          </div>
        </div>
        <div className="studio-wrap">
          <HardwareViewer />
        </div>
      </section>
      <section id="downloads" className="studio-wrap downloads-section">
        <div className="studio-section-label">
          <p>(The actual files)</p>
          <span>(04)</span>
        </div>
        <h2 className="statement-heading">
          OPEN IT.
          <br />
          <span>BUILD ON IT.</span>
        </h2>
        <p className="download-intro">
          Layered drawings, a solid model, a four-sheet drawing set,
          measurements, BOM, and the editable generator. An original development
          study—not a completed client commission or approved production
          pattern.
        </p>
        <CadDownloads />
        <p className="small-note">
          Checked: DXF audit and millimetre units; STEP re-import as one valid
          solid; 14 × 38 × 3 mm model envelope. Full garment patternmaking, fit,
          manufacturing, and load testing are outside this study.
        </p>
      </section>
      <ProjectCTA service="apparel" title="LET’S DEFINE YOUR NEXT PRODUCT." />
    </PageShell>
  );
}
