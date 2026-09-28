const files = [
  [
    "01",
    "Complete CAD package",
    "DXF · STEP · STL · PDF · editable source",
    "field-01-cad-package.zip",
    "ZIP",
  ],
  [
    "02",
    "Technical flats",
    "Front + back · layered · millimetres",
    "field-01-technical-flats.dxf",
    "DXF",
  ],
  [
    "03",
    "Pocket sample pattern",
    "Cut, fold & stitch lines · 1:1",
    "field-01-pocket-pattern.dxf",
    "DXF",
  ],
  [
    "04",
    "Drawing set",
    "4 sheets · specifications, BOM & pattern",
    "field-01-drawing-set.pdf",
    "PDF",
  ],
  [
    "05",
    "Hardware solid",
    "14 × 38 × 3 mm · valid single solid",
    "field-01-pull.step",
    "STEP",
  ],
  [
    "06",
    "Hardware mesh",
    "Millimetres · fabrication study",
    "field-01-pull.stl",
    "STL",
  ],
];
export function CadDownloads() {
  return (
    <div className="cad-downloads">
      {files.map(([n, title, detail, file, ext]) => (
        <a href={`/cad/field-01/${file}`} download key={file}>
          <span className="file-index">{n}</span>
          <div>
            <h3>{title}</h3>
            <p>{detail}</p>
          </div>
          <span className="file-format">
            {ext} <span aria-hidden="true">↗</span>
          </span>
        </a>
      ))}
    </div>
  );
}
