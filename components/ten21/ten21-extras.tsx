import { MotifSwatch, type MotifName } from "./garment-flat";
import { colourways } from "@/lib/ten21/collection";

const anatomy: { term: string; gloss: string; text: string; motif: MotifName }[] = [
  { term: "Jig", gloss: "Chest yoke", text: "The large embroidered panel that covers the chest, carrying the densest work.", motif: "setareh" },
  { term: "Toi", gloss: "Central strip", text: "A patterned strip running through the jig, here following the offset placket.", motif: "toi" },
  { term: "Banzar", gloss: "Cuffs", text: "Embroidered sleeve bands, worked on a separate cuff piece and joined.", motif: "gol" },
  { term: "Pado", gloss: "Pocket panel", text: "A long, narrow pocket from just above the waist to the hem.", motif: "kap" },
];

/* The grammar of Baloch dress and the story of the name, after the pieces. */
export function Ten21Extras() {
  return (
    <>
      <section className="ten21-anatomy" aria-labelledby="anatomy-title">
        <h2 id="anatomy-title" className="x-title">Where the embroidery goes</h2>
        <div className="anatomy-grid">
          {anatomy.map((a, i) => (
            <article key={a.term}>
              <MotifSwatch className="anatomy-swatch" name={a.motif} colourway={colourways[i % colourways.length]} />
              <h3>{a.term} <span>{a.gloss}</span></h3>
              <p>{a.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ten21-name" aria-labelledby="name-title">
        <h2 id="name-title" className="x-title">Why it’s called TEN21</h2>
        <div className="ten21-zips">
          <div><b>77010</b><span>Downtown Houston</span></div>
          <div><b>77021</b><span>Southeast of downtown</span></div>
        </div>
        <p>The name comes from two Houston ZIP codes, 77010 and 77021. Collection 01 is in development: the tech packs are Rev A specifications, not yet sampled or approved for production, and nothing is for sale yet.</p>
      </section>
    </>
  );
}
