import { MotifSwatch, type MotifName } from "./garment-flat";
import { colourways } from "@/lib/ten21/collection";
import { Accent } from "@/components/redesign/primitives";

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
        <p className="section-label"><span>(Grammar)</span>Four panels, one structure</p>
        <h2 id="anatomy-title" className="x-title">Baloch dress carries embroidery in <Accent>four places.</Accent></h2>
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
        <p className="section-label"><span>(10 · 21)</span>The name</p>
        <h2 id="name-title" className="x-title">Two Houston ZIP codes, <Accent>one label.</Accent></h2>
        <div className="ten21-zips">
          <div><b>77010</b><span>Downtown Houston</span></div>
          <div><b>77021</b><span>Southeast of downtown</span></div>
        </div>
        <p>TEN21 is named for 77010 and 77021: the city the label is designed in, and the codes it reads as. Collection 01 is in development: the tech packs are Rev A specifications, not yet sampled or approved for production, and pieces are not for sale yet.</p>
      </section>
    </>
  );
}
