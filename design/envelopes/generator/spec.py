import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from envelopes import *
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
import subprocess
from reportlab.lib.fonts import addMapping
addMapping("Pop-Regular",0,0,"Pop-Regular"); addMapping("Pop-Regular",1,0,"Pop-Bold"); addMapping("Pop-Regular",0,1,"Pop-Regular"); addMapping("Pop-Regular",1,1,"Pop-Bold")
st = lambda n, **k: ParagraphStyle(n, fontName=k.pop("f", "Pop-Regular"), fontSize=k.pop("s", 9), leading=k.pop("l", 13), textColor=k.pop("c", INK), **k)
H1 = st("h1", f="Pop-Bold", s=18, l=22, c=BLUE); H2 = st("h2", f="Pop-Bold", s=11.5, l=15, c=BLUE, spaceBefore=8, spaceAfter=4)
B = st("b"); SM = st("sm", s=8, l=11, c=SOFT)
doc = SimpleDocTemplate(os.path.join(OUT, "TnC_Envelope_Print_Specification.pdf"), pagesize=A4, leftMargin=16*mm, rightMargin=16*mm, topMargin=14*mm, bottomMargin=14*mm, title="TnC Pharmacy medicine envelopes - print specification")
s = []
s.append(Paragraph("TnC Pharmacy · Medicine envelopes", H1))
s.append(Paragraph("Print specification for the printing vendor · v1 · October 2026", SM)); s.append(Spacer(1, 8))
s.append(Paragraph("What we need printed", H2))
rows = [["Size", "Finished size (W x H)", "Holds", "Artwork file"]]
for k, v in SIZES.items():
    rows.append([k, v["label"].split(" (")[1].rstrip(")"), Paragraph(v["use"], SM), Paragraph("TnC_Envelope_%s_PrePrint_VENDOR.pdf" % k, SM)])
t = Table(rows, colWidths=[18*mm, 34*mm, 56*mm, 70*mm])
t.setStyle(TableStyle([("FONT", (0,0), (-1,-1), "Pop-Regular", 8), ("FONT", (0,0), (-1,0), "Pop-Bold", 8), ("BACKGROUND", (0,0), (-1,0), BLUE_T), ("GRID", (0,0), (-1,-1), 0.3, RULE), ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("TOPPADDING", (0,0), (-1,-1), 4), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]))
s.append(t)
s.append(Paragraph("Requirements", H2))
for line in [
 "<b>Print side:</b> front face only, full colour (CMYK). Back can be plain or a single blue (#0059B7) brand pattern. Flap and seams on the <b>back</b>; keep the front face flat and free of seams.",
 "<b>Paper:</b> white uncoated (offset / maplitho) 90–100 gsm, or white kraft 80–90 gsm. Paper must be safe for contact with packed medicine strips.",
 "<b>Finish: NO gloss lamination, UV coating or varnish on the front.</b> Patient and dose details are printed afterwards on an office inkjet/laser printer, and coated surfaces smudge or reject toner.",
 "<b>Artwork:</b> PDF, CMYK, 3 mm bleed, crop marks included. Fonts are embedded (Poppins). Please send a printed proof before the full run.",
 "<b>Logo:</b> the TnC Pharmacy logo in these files is from the website (low resolution). Replace it with the vector logo (AI / SVG / PDF) before printing.",
 "<b>Phone number:</b> the header shows +91 XXXXX XXXXX. Replace it with the store number before printing.",
 "<b>Blank boxes and dotted lines</b> are intentional. They are where the order details are printed later; please do not add anything inside them.",
 "<b>Suggested first order:</b> ~1,000 Small, ~1,000 Medium and ~500 Large, then re-order based on use.",
]:
    s.append(Paragraph("• " + line, B)); s.append(Spacer(1, 2))
imgs = []
for k in SIZES:
    for kind, f in (("blank", "TnC_Envelope_%s_PrePrint_VENDOR.pdf" % k), ("filled", "TnC_Envelope_%s_Preview_FILLED.pdf" % k)):
        png = os.path.join(OUT, "_thumb_%s_%s" % (k, kind))
        subprocess.run(["pdftoppm", "-png", "-r", "70", "-singlefile", os.path.join(OUT, f), png], check=True)
        imgs.append((k, kind, png + ".png"))
cells = []
for k in SIZES:
    pair = [i for i in imgs if i[0] == k]
    row = []
    for _, kind, path in pair:
        ir = ImageReader(path); iw, ih = ir.getSize(); w = 58*mm; h = w*ih/iw
        if h > 80*mm: h = 80*mm; w = h*iw/ih
        row.append([Image(path, w, h), Paragraph("%s · %s" % (k, kind), SM)])
    cells.append(row)
tt = Table(cells, colWidths=[86*mm, 86*mm])
tt.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "TOP"), ("BOTTOMPADDING", (0,0), (-1,-1), 8)]))
s.append(PageBreak()); s.append(Paragraph("Previews: blank (as the vendor prints it) and with a sample order filled in", H2)); s.append(tt)
doc.build(s)
for _, _, pth in imgs: os.remove(pth)
print("spec ok")
