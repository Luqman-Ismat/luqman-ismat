FIELD 01 / REV A
Original CAD development study for Indus Blue, by Luqman Ismat.

FILES
- field-01-technical-flats.dxf: finished garment views, mm, 1:1; NOT sewing patterns.
- field-01-pocket-pattern.dxf: pocket cut/fold/stitch template, mm, 1:1.
- field-01-drawing-set.pdf: four sheets; only page 3 is full-scale on A3 portrait at 100%.
- field-01-pull.step: solid hardware geometry.
- field-01-pull.stl: triangulated export (millimetres; STL carries no unit metadata).
- build_field01.py: editable parametric source. Rebuild with Python and cadquery==2.8.0, ezdxf==1.4.4, reportlab>=4.
- measurements.csv / bill-of-materials.csv: proposed sample targets.
- geometry-checks.json: CAD integrity checks.

Manufacturing status: untested development sample. Garment fit, grading, fabric shrinkage, sewing finish, hardware attachment, load and fabrication method require physical validation. Digital colors are not supplier standards. The optional pull is a separate accessory concept, not attached to the button-front overshirt.

Tools: https://cadquery.readthedocs.io/en/stable/ ; https://ezdxf.readthedocs.io/en/stable/
