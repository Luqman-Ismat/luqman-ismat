import Link from "next/link";
import Image from "next/image";
import { Action } from "@/components/consulting";
import { GarmentFlat } from "@/components/indus/garment-flat";
import { colourwayById } from "@/lib/indus/collection";
export function PageIntro({
  label,
  title,
  text,
  children,
}: {
  label: string;
  title: React.ReactNode;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="site-container page-intro">
      <p className="eyebrow">{label}</p>
      <h1>{title}</h1>
      <div className="intro-bottom">
        <p>{text}</p>
        {children}
      </div>
    </section>
  );
}
export function WorkShowcase({ index = false }: { index?: boolean }) {
  return (
    <section className="site-container work-showcase">
      <div className="section-top">
        <div>
          <p className="eyebrow">Selected work</p>
          <h2>{index ? "Products & design studies" : "Built, not just proposed."}</h2>
        </div>
        {!index && <Link href="/projects" className="inline-link">
          View all work ↗
        </Link>}
      </div>
      <div className="work-pair">
        <Link href="/projects/engivault" className="work-item">
          <div className="work-screen">
            <Image
              src="/images/consulting/engivault-calculator.png"
              alt="EngiVault calculator with engineering inputs and results"
              width={1440}
              height={1000}
              sizes="(max-width:760px) 100vw, 50vw"
            />
          </div>
          <div className="work-item-label">
            <div>
              <span>Engineering software</span>
              <h3>ENGiVAULT</h3>
            </div>
            <span aria-hidden="true">↗</span>
          </div>
          <p>
            Calculations, technical references, and project workflows in one
            product.
          </p>
        </Link>
        <Link href="/indus-blue/jig-kameez" className="work-item">
          <div className="work-garment">
            <GarmentFlat slug="jig-kameez" view="front" colourway={colourwayById("shir")} title="Jig Kameez front flat in the Shir colourway" />
          </div>
          <div className="work-item-label">
            <div>
              <span>Indus Blue / Collection 01</span>
              <h3>JIG KAMEEZ</h3>
            </div>
            <span aria-hidden="true">↗</span>
          </div>
          <p>
            Balochi jig yoke and pakka doch on an oversized kameez, with a full
            development tech pack and 3D study.
          </p>
        </Link>
      </div>
    </section>
  );
}
export function DeliveryProcess() {
  return (
    <section className="site-container delivery-process">
      <div>
        <p className="eyebrow">How we work</p>
        <h2>
          A clear scope.
          <br />A working result.
        </h2>
      </div>
      <ol>
        {[
          [
            "Understand",
            "Map the current process, the people involved, and the result you need.",
          ],
          [
            "Build & review",
            "Test a useful first version with your real inputs. Resolve the details together.",
          ],
          [
            "Handoff",
            "Receive the agreed files, documentation, and walkthrough. Define support before launch.",
          ],
        ].map(([title, text], i) => (
          <li key={title}>
            <span>0{i + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
export function IndusCallout() {
  return (
    <section className="indus-callout">
      <div className="site-container">
        <div>
          <p className="eyebrow">The apparel practice</p>
          <h2>
            INDUS BLUE
            <span>
              Our own line.
              <br />
              Your next collection.
            </span>
          </h2>
        </div>
        <div>
          <p>
            An independent apparel label in development, with CAD and technical
            development services for other brands.
          </p>
          <Action href="/indus-blue">Explore Indus Blue</Action>
        </div>
      </div>
    </section>
  );
}
