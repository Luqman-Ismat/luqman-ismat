"""FIELD 01: reproducible apparel CAD development study. Units: millimetres.
Run: python build_field01.py [output-directory]
Requires cadquery==2.8.0, ezdxf==1.4.4, reportlab>=4.
The garment flats are finished-garment drawings, NOT graded garment patterns.
The pocket blank is a full-scale sample draft; the hardware is an untested concept.
"""
from pathlib import Path
import sys, json, math, csv, zipfile, shutil
import cadquery as cq
import ezdxf
from ezdxf import units
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.colors import HexColor

OUT=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[2]/'public/cad/field-01'
OUT.mkdir(parents=True,exist_ok=True)
P={'body_width':660,'hps_length':680,'pocket_width':180,'pocket_height':210,'side_allowance':10,'top_turnback':30,'pull_width':14,'pull_length':38,'pull_thickness':3}
scenes={}
def poly(points,layer='OUTLINE',fill=False,closed=False): return dict(kind='poly',points=points,layer=layer,fill=fill,closed=closed)
def line(points,layer='SEAM'): return poly(points,layer)
def circle(x,y,r,layer='HARDWARE'): return dict(kind='circle',center=[x,y],radius=r,layer=layer)
outline=[[-92,70],[-330,130],[-645,580],[-520,665],[-330,370],[-330,750],[330,750],[330,370],[520,665],[645,580],[330,130],[92,70],[65,105],[0,125],[-65,105]]
for view in ['front','back']:
 s=[poly(outline,fill=True,closed=True)]
 for sign in [-1,1]:
  s.extend([line([[sign*330,130],[sign*330,370]]),line([[sign*619,543],[sign*492,621]]),line([[sign*611,535],[sign*485,613]],'STITCH'),line([[sign*320,385],[sign*320,738]],'STITCH')])
 s.append(line([[-322,738],[322,738]],'STITCH'))
 if view=='front':
  s.extend([poly([[-92,70],[-55,25],[0,60],[0,110],[-40,145]],'COLLAR',True,True),poly([[92,70],[55,25],[0,60],[0,110],[40,145]],'COLLAR',True,True),line([[-17,126],[-17,750]]),line([[17,126],[17,750]]),line([[-23,132],[-23,738]],'STITCH'),line([[23,132],[23,738]],'STITCH')])
  for x in [-280,100]:
   s.extend([poly([[x,235],[x+180,235],[x+180,445],[x,445]],'POCKET',True,True),line([[x+3,240],[x+3,442],[x+177,442],[x+177,240]],'STITCH'),line([[x,255],[x+180,255]]),line([[x+7,260],[x+173,260]],'STITCH')])
  for y in [190,290,390,490,590,690]:s.append(circle(0,y,6))
  for sign in [-1,1]:s.append(circle(sign*545,630,6))
 else:
  s.extend([line([[-325,190],[325,190]]),line([[-325,197],[325,197]],'STITCH'),line([[-17,195],[-17,300],[17,300],[17,195]]),line([[0,205],[0,285]],'STITCH'),poly([[-92,70],[-55,25],[55,25],[92,70],[0,95]],'COLLAR',True,True)])
 scenes[view]=s
(OUT/'garment-geometry.json').write_text(json.dumps({'parameters':P,'views':scenes},separators=(',',':')))
COL={'OUTLINE':'#26312e','SEAM':'#3a4540','STITCH':'#718078','COLLAR':'#26312e','POCKET':'#26312e','HARDWARE':'#26312e'}
def scene_svg(view,color='#abb3a4',dark=False):
 stroke='#d2dccd' if dark else '#27382f'; parts=[]
 for e in scenes[view]:
  if e['kind']=='circle':parts.append(f'<circle cx="{e["center"][0]}" cy="{e["center"][1]}" r="{e["radius"]}" fill="{stroke}"/>');continue
  tag='polygon' if e['closed'] else 'polyline';pts=' '.join(f'{x},{y}' for x,y in e['points']);dash='stroke-dasharray="8 7"' if e['layer']=='STITCH' else ''
  fill=color if e['fill'] else 'none';parts.append(f'<{tag} points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="2.2" stroke-linejoin="round" {dash}/>')
 return ''.join(parts)
for view in scenes:
 (OUT/f'overshirt-{view}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-745 -20 1490 850">{scene_svg(view)}</svg>')

def newdoc():
 d=ezdxf.new('R2013',setup=True);d.units=units.MM;d.header['$MEASUREMENT']=1
 for name,color in [('OUTLINE',7),('SEAM',8),('STITCH',3),('COLLAR',7),('POCKET',7),('HARDWARE',4),('DIMENSIONS',2),('NOTES',7),('CUT',1),('FOLD',4),('GRAIN',3)]:
  d.layers.new(name,dxfattribs={'color':color,'linetype':'DASHED' if name in ['STITCH','FOLD'] else 'CONTINUOUS'})
 return d
D=newdoc();m=D.modelspace()
for i,view in enumerate(scenes):
 ox=i*1700
 for e in scenes[view]:
  if e['kind']=='circle':m.add_circle((e['center'][0]+ox,-e['center'][1]),e['radius'],dxfattribs={'layer':e['layer']})
  else:m.add_lwpolyline([(x+ox,-y) for x,y in e['points']],close=e['closed'],dxfattribs={'layer':e['layer']})
 m.add_text(f'FIELD 01 / {view.upper()} / FINISHED GARMENT FLAT',dxfattribs={'height':22,'layer':'NOTES'}).set_placement((ox-500,80))
 m.add_linear_dim(base=(ox,-835),p1=(ox-330,-750),p2=(ox+330,-750),angle=0,override={'dimtxt':18,'dimasz':12,'dimexo':8,'dimexe':10},dxfattribs={'layer':'DIMENSIONS'}).render()
 m.add_linear_dim(base=(ox+740,0),p1=(ox+92,-70),p2=(ox+330,-750),angle=90,override={'dimtxt':18,'dimasz':12,'dimexo':8},dxfattribs={'layer':'DIMENSIONS'}).render()
 m.add_text('UNITS: mm | DRAWN 1:1 | SAMPLE M | REV A | DEVELOPMENT STUDY',dxfattribs={'height':17,'layer':'NOTES'}).set_placement((ox-600,-910))
D.saveas(OUT/'field-01-technical-flats.dxf')
# Patch pocket: 180 x 210 finished; 10 mm sides/bottom, 30 mm double top turnback.
pocket=newdoc();pm=pocket.modelspace();pm.add_lwpolyline([(0,0),(200,0),(200,250),(0,250)],close=True,dxfattribs={'layer':'CUT'})
for a,b in [((10,0),(10,250)),((190,0),(190,250)),((0,10),(200,10)),((0,220),(200,220)),((0,235),(200,235))]:pm.add_line(a,b,dxfattribs={'layer':'FOLD'})
pm.add_lwpolyline([(12,218),(12,12),(188,12),(188,218)],dxfattribs={'layer':'STITCH'})
pm.add_line((10,222),(190,222),dxfattribs={'layer':'STITCH'})
pm.add_line((100,55),(100,180),dxfattribs={'layer':'GRAIN'});pm.add_lwpolyline([(96,172),(100,180),(104,172)],dxfattribs={'layer':'GRAIN'})
pm.add_text('CUT 2 / SELF FABRIC',dxfattribs={'height':5,'layer':'NOTES'}).set_placement((52,130))
pm.add_text('GRAIN PARALLEL TO CF',dxfattribs={'height':4,'layer':'NOTES'}).set_placement((48,115))
for base,p1,p2,angle in [((0,-20),(0,0),(200,0),0),((225,0),(200,0),(200,250),90)]:pm.add_linear_dim(base=base,p1=p1,p2=p2,angle=angle,override={'dimtxt':5,'dimasz':3,'dimexo':2},dxfattribs={'layer':'DIMENSIONS'}).render()
pm.add_text('FINISHED 180 x 210 | 10 SIDE/BOTTOM | TOP TURN 15 + 15',dxfattribs={'height':4,'layer':'NOTES'}).set_placement((0,-38))
pocket.saveas(OUT/'field-01-pocket-pattern.dxf')
# Machined / printed accessory concept. Parametric B-rep, not a visual mockup.
pull=cq.Workplane('XY').rect(P['pull_width'],P['pull_length']).extrude(P['pull_thickness']).edges('|Z').fillet(4)
main_cut=cq.Workplane('XY').center(0,-3).rect(8,18).extrude(5).edges('|Z').fillet(3)
eye=cq.Workplane('XY').center(0,13).slot2D(8,3).extrude(5)
pull=pull.cut(main_cut).cut(eye).faces('>Z or <Z').edges().chamfer(0.35)
assert pull.val().isValid() and len(pull.solids().vals())==1
cq.exporters.export(pull,str(OUT/'field-01-pull.step'));cq.exporters.export(pull,str(OUT/'field-01-pull.stl'),tolerance=.04,angularTolerance=.1)
vertices,triangles=pull.val().tessellate(.04,.1)
mesh={'vertices':[[round(v.x,5),round(v.y,5),round(v.z-1.5,5)] for v in vertices],'triangles':triangles,'dimensions':[14,38,3]}
(OUT/'pull-mesh.json').write_text(json.dumps(mesh,separators=(',',':')))
cq.exporters.export(pull,str(OUT/'pull-isometric.svg'),opt={'width':900,'height':1000,'marginLeft':90,'marginTop':90,'projectionDir':(1,-1,1.8),'showHidden':False,'strokeWidth':.8,'strokeColor':(46,57,50)})
# Compact SVG artwork from the actual triangle mesh, no substitute model.
def project_mesh():
 ax=-.55;ay=.65;out=[]
 for x,y,z in mesh['vertices']:
  Y=y*math.cos(ax)-z*math.sin(ax);Z=y*math.sin(ax)+z*math.cos(ax)
  X=x*math.cos(ay)+Z*math.sin(ay);Z=-x*math.sin(ay)+Z*math.cos(ay)
  out.append((X,Y,Z))
 return out
mv=project_mesh();polys=[]
for tri in sorted(triangles,key=lambda t:sum(mv[i][2] for i in t)):
 a,b,c=[mv[i] for i in tri];u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)];n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];mag=math.sqrt(sum(q*q for q in n)) or 1;brightness=.45+.45*abs((n[0]*-.4+n[1]*-.5+n[2]*.76)/mag);rgb=[int(k*brightness) for k in [213,218,210]];pts=' '.join(f'{500+a*22:.2f},{510-b*22:.2f}' for a,b,z in [a,b,c]);polys.append(f'<polygon points="{pts}" fill="rgb({rgb[0]},{rgb[1]},{rgb[2]})"/>')
(OUT/'pull-render.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">'+''.join(polys)+'</svg>')
# Proposed measurements and BOM, not fit-approved manufacturing data.
measurements=[['A','Half chest / laid flat','660','10'],['B','HPS to hem (excluding collar)','680','10'],['C','Shoulder seam span / horizontal','660','10'],['D','Sleeve outer edge / straight','549.3','10'],['E','Patch pocket finished width','180','3'],['F','Patch pocket finished height','210','3'],['G','Front placket width','34','2']]
with (OUT/'measurements.csv').open('w') as f:w=csv.writer(f);w.writerow(['POM','Description','Sample target mm','Proposed tolerance +/- mm']);w.writerows(measurements)
bom=[['01','Shell fabric','Cotton twill, proposed 280 gsm','Supplier / shrinkage review required'],['02','Thread','Tone-on-tone polyester','Choose with sample maker'],['03','Front buttons','6 x 12 mm','Material and finish to be selected'],['04','Cuff buttons','2 x 12 mm','Match front buttons'],['05','Interfacing','Collar and front placket','Weight to be sampled'],['06','Brand / care labels','Placement to be agreed','Content to be supplied'],['07','Optional pull','38 x 14 x 3 mm concept','Separate accessory study; not fitted to overshirt']]
with (OUT/'bill-of-materials.csv').open('w') as f:w=csv.writer(f);w.writerow(['Item','Component','Specification','Notes']);w.writerows(bom)
# Drawing set in PDF. Pocket page is explicitly full-scale.
pdf=canvas.Canvas(str(OUT/'field-01-drawing-set.pdf'),pagesize=landscape(A3));W,H=landscape(A3)
def text(x,y,t,size=10,color='#26312e',bold=False):
 pdf.setFillColor(HexColor(color));pdf.setFont('Helvetica-Bold' if bold else 'Helvetica',size);pdf.drawString(x,H-y,t)
def rule(y):pdf.setStrokeColor(HexColor('#ccd1c8'));pdf.setLineWidth(.6);pdf.line(45,H-y,W-45,H-y)
def head(number,title,sub):
 text(45,40,'INDUS BLUE / PRODUCT DEVELOPMENT',10,bold=True);text(W-200,40,f'FIELD 01 / REV A / {number}',9);rule(57);text(45,106,title,30,bold=True);text(45,131,sub,10)
def foot():rule(H-52);text(45,H-30,'Independent development study. Sample, fit and manufacturing approval required before production.',9);text(W-210,H-30,'UNITS: mm / SEPTEMBER 2026',8)
def drawflat(view,cx,top,scale):
 pdf.saveState();pdf.translate(cx,H-top);pdf.scale(scale,-scale)
 for e in scenes[view]:
  pdf.setStrokeColor(HexColor(COL[e['layer']]));pdf.setLineWidth(2.5);pdf.setDash([8,7] if e['layer']=='STITCH' else [])
  if e['kind']=='circle':pdf.setFillColor(HexColor('#26312e'));pdf.circle(*e['center'],e['radius'],stroke=1,fill=1)
  else:
   p=pdf.beginPath();p.moveTo(*e['points'][0])
   for q in e['points'][1:]:p.lineTo(*q)
   if e['closed']:p.close()
   pdf.setFillColor(HexColor('#e6e9e0'));pdf.drawPath(p,stroke=1,fill=int(e['fill']))
 pdf.restoreState()
head('01','UTILITY OVERSHIRT','Technical flats / proposed base size M / finished-garment drawing, not a sewing pattern')
drawflat('front',315,165,.34);drawflat('back',865,165,.34)
text(268,464,'FRONT',10,bold=True);text(820,464,'BACK',10,bold=True)
rule(492);text(45,528,'DESIGN INTENT',11,bold=True);text(45,555,'Relaxed overshirt with dropped shoulders, a button front and two rectangular chest pockets.',12)
text(45,580,'Straight hem, double topstitching, a back yoke and a centre-back box pleat.',12)
text(45,620,'660 mm HALF CHEST',16,bold=True);text(405,620,'680 mm HPS LENGTH',16,bold=True);text(800,620,'180 x 210 mm POCKET',16,bold=True)
text(45,665,'Layered DXF: OUTLINE / SEAM / STITCH / COLLAR / POCKET / HARDWARE / DIMENSIONS / NOTES',10)
text(45,690,'The downloadable DXF is drawn 1:1 in millimetres. This overview is reduced to fit the page.',10)
foot();pdf.showPage()
head('02','SPECIFICATIONS & MATERIALS','Proposed targets for sample development. No grading or physical fit validation has been performed.')
ys=182
for row in [['POM','MEASUREMENT','TARGET mm','+/- mm']]+measurements:
 for x,t in zip([45,95,530,645],row):text(x,ys,t,10,bold=ys==182)
 rule(ys+12);ys+=32
text(45,ys+30,'BILL OF MATERIALS',14,bold=True);ys+=63
for item,part,spec,note in bom:
 text(45,ys,item,9);text(82,ys,part,10,bold=True);text(245,ys,spec,10);text(660,ys,note,9);ys+=32
text(45,ys+30,'Colorways: Indigo / Moss / Graphite / Chalk. Digital colors are visual references, not supplier color standards.',10)
foot();pdf.showPage()
W,H=A3;pdf.setPageSize(A3);head('03','POCKET SAMPLE PATTERN','1:1 at 100% / A3 portrait / do not fit to page. Verify the 100 mm scale before cutting.')
mm=72/25.4;left=115;top=180
pdf.setStrokeColor(HexColor('#26312e'));pdf.setLineWidth(1);pdf.rect(left,H-top-250*mm,200*mm,250*mm,stroke=1)
pdf.setStrokeColor(HexColor('#55806b'));pdf.setDash(6,4)
for x in [10,190]:pdf.line(left+x*mm,H-top,left+x*mm,H-top-250*mm)
for y in [15,30,240]:pdf.line(left,H-top-y*mm,left+200*mm,H-top-y*mm)
pdf.setDash(2,3);pdf.setStrokeColor(HexColor('#7d847d'));p=pdf.beginPath();p.moveTo(left+12*mm,H-top-32*mm);p.lineTo(left+12*mm,H-top-238*mm);p.lineTo(left+188*mm,H-top-238*mm);p.lineTo(left+188*mm,H-top-32*mm);pdf.drawPath(p)
pdf.setDash();text(left+40,top+100,'CUT 2 / SELF FABRIC',14,bold=True);text(left+40,top+122,'200 x 250 mm CUT BLANK',11);text(left+40,top+144,'180 x 210 mm FINISHED POCKET',11)
pdf.line(left+100*mm,H-top-95*mm,left+100*mm,H-top-185*mm);pdf.line(left+100*mm,H-top-95*mm,left+97*mm,H-top-101*mm);pdf.line(left+100*mm,H-top-95*mm,left+103*mm,H-top-101*mm)
text(left+110*mm,top+140*mm,'GRAIN',10)
text(45,940,'FOLD: 10 mm sides/bottom. Top edge: turn 15 mm, then 15 mm.',11);text(45,963,'STITCH: 2 mm inside side/bottom folds. Secure pocket opening separately.',11)
text(45,986,'Sample on the intended fabric; confirm corner finish and top hem bulk.',11)
pdf.line(45,H-1030,45+100*mm,H-1030);pdf.line(45,H-1024,45,H-1036);pdf.line(45+100*mm,H-1024,45+100*mm,H-1036);text(45,1050,'100 mm CALIBRATION BAR',10,bold=True);foot();pdf.showPage()
W,H=landscape(A3);pdf.setPageSize(landscape(A3));head('04','HARDWARE / PULL 01','Parametric accessory study / 38 x 14 x 3 mm / separate from the button-front overshirt')
# Scaled top and side profiles, clearly not actual size.
scale=12;cx=265;cy=375
pdf.setStrokeColor(HexColor('#26312e'));pdf.setFillColor(HexColor('#d6dbd1'));pdf.roundRect(cx-7*scale,H-cy-19*scale,14*scale,38*scale,4*scale,fill=1)
pdf.setFillColor(HexColor('#ffffff'));pdf.roundRect(cx-4*scale,H-cy-12*scale,8*scale,18*scale,3*scale,fill=1);pdf.roundRect(cx-4*scale,H-cy+11.5*scale,8*scale,3*scale,1.5*scale,fill=1)
text(190,645,'TOP / ENLARGED',10,bold=True);pdf.setFillColor(HexColor('#d6dbd1'));pdf.rect(480,H-580,3*scale,38*scale,fill=1);text(455,645,'SIDE',10,bold=True)
for y,t in [(210,'ENVELOPE: 38 x 14 x 3 mm'),(250,'ATTACHMENT SLOT: 8 x 3 mm'),(290,'MAIN OPENING: 8 x 18 mm / R3'),(330,'OUTSIDE CORNERS: R4'),(370,'EDGE CHAMFER: 0.35 mm'),(430,'EXPORTS: STEP + STL + SOURCE'),(475,'One valid solid; STEP reimport verified.'),(510,'No load rating or material specification.'),(535,'Test attachment, comfort and fabrication'),(556,'method before product use.')]:text(680,y,t,11,bold=y<400)
foot();pdf.save()
# Re-open all delivered CAD files and assert geometry/units.
for name in ['field-01-technical-flats.dxf','field-01-pocket-pattern.dxf']:
 doc=ezdxf.readfile(OUT/name);audit=doc.audit();assert not audit.has_errors;assert doc.units==units.MM
reimport=cq.importers.importStep(str(OUT/'field-01-pull.step'));assert reimport.val().isValid();bb=reimport.val().BoundingBox()
assert all(abs(a-b)<1e-5 for a,b in zip([bb.xlen,bb.ylen,bb.zlen],[14,38,3]))
qa={'dxf_audit':'pass','dxf_units':'millimetres','step_valid':True,'solid_count':len(reimport.solids().vals()),'bounding_box_mm':[round(bb.xlen,5),round(bb.ylen,5),round(bb.zlen,5)],'volume_mm3':round(reimport.val().Volume(),3),'mesh_vertices':len(vertices),'mesh_triangles':len(triangles),'pocket_blank_mm':[200,250],'pocket_finished_mm':[180,210],'status':'Development study; no fit, material, manufacturing or load validation'}
(OUT/'geometry-checks.json').write_text(json.dumps(qa,indent=2));(OUT/'parameters.json').write_text(json.dumps(P,indent=2))
shutil.copy(__file__,OUT/'build_field01.py')
(OUT/'README.txt').write_text('FIELD 01 / REV A\nOriginal CAD development study for Indus Blue, by Luqman Ismat.\n\nFILES\n- field-01-technical-flats.dxf: finished garment views, mm, 1:1; NOT sewing patterns.\n- field-01-pocket-pattern.dxf: pocket cut/fold/stitch template, mm, 1:1.\n- field-01-drawing-set.pdf: four sheets; only page 3 is full-scale on A3 portrait at 100%.\n- field-01-pull.step: solid hardware geometry.\n- field-01-pull.stl: triangulated export (millimetres; STL carries no unit metadata).\n- build_field01.py: editable parametric source. Rebuild with Python and cadquery==2.8.0, ezdxf==1.4.4, reportlab>=4.\n- measurements.csv / bill-of-materials.csv: proposed sample targets.\n- geometry-checks.json: CAD integrity checks.\n\nManufacturing status: untested development sample. Garment fit, grading, fabric shrinkage, sewing finish, hardware attachment, load and fabrication method require physical validation. Digital colors are not supplier standards. The optional pull is a separate accessory concept, not attached to the button-front overshirt.\n\nTools: https://cadquery.readthedocs.io/en/stable/ ; https://ezdxf.readthedocs.io/en/stable/\n')
with zipfile.ZipFile(OUT/'field-01-cad-package.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['field-01-technical-flats.dxf','field-01-pocket-pattern.dxf','field-01-pull.step','field-01-pull.stl','field-01-drawing-set.pdf','measurements.csv','bill-of-materials.csv','parameters.json','geometry-checks.json','build_field01.py','README.txt']:z.write(OUT/name,name)
print(json.dumps(qa,indent=2))
