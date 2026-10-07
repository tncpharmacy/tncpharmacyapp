"""TnC Pharmacy medicine envelopes: pre-print (vendor) + overprint (office printer) from ONE layout.

Every size is described once as a list of zones. The same coordinates drive
  * the vendor artwork  (static colour design, with bleed + crop marks)
  * the overprint file  (only the order data, black, printed onto the finished envelope)
so the two can never drift apart. Units are millimetres, origin = top-left of the envelope face.
"""
import json, os, io
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import CMYKColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
FD = "/usr/share/fonts/truetype/google-fonts/"
for n in ("Regular", "Medium", "Bold", "Light"):
    pdfmetrics.registerFont(TTFont("Pop-" + n, FD + "Poppins-%s.ttf" % n))
LOGO = os.path.join(HERE, "logo.png") if os.path.exists(os.path.join(HERE, "logo.png")) else "/mnt/user-data/uploads/tncpharmacyapp/public/images/logo.png"

def cmyk(hexs):
    h = hexs.lstrip("#"); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    k = 1 - max(r, g, b)
    if k >= 1: return CMYKColor(0, 0, 0, 1)
    return CMYKColor((1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k)

BLUE = cmyk("#0059B7"); BLUE_D = cmyk("#00428A"); BLUE_T = cmyk("#E6F0FF")
ORANGE = cmyk("#FF7B00"); ORANGE_T = cmyk("#FFF1E0"); ORANGE_INK = cmyk("#A85200")
INK = cmyk("#15202B"); SOFT = cmyk("#4A5967"); RULE = cmyk("#CBD7E6"); WHITE = CMYKColor(0, 0, 0, 0)
BLACK = CMYKColor(0, 0, 0, 1)

SIZES = {
    "Small":  {"w": 101.6, "h": 127.0, "label": "Small 4 x 5 in (101.6 x 127 mm)", "use": "One medicine, 1-2 strips"},
    "Medium": {"w": 127.0, "h": 177.8, "label": "Medium 5 x 7 in (127 x 177.8 mm)", "use": "One medicine, several strips / small bottle"},
    "Large":  {"w": 177.8, "h": 254.0, "label": "Large 7 x 10 in (177.8 x 254 mm)", "use": "Whole order, up to 8 medicines"},
}

# ------------------------------------------------------------------ drawing helpers
class Pen:
    def __init__(self, c, H, ox=0, oy=0):
        self.c, self.H, self.ox, self.oy = c, H, ox, oy
    def X(self, x): return (self.ox + x) * mm
    def Y(self, y): return (self.oy + self.H - y) * mm
    def rect(self, x, y, w, h, fill=None, stroke=None, r=0, lw=0.3, dash=None):
        c = self.c; c.saveState()
        if fill is not None: c.setFillColor(fill)
        if stroke is not None: c.setStrokeColor(stroke); c.setLineWidth(lw)
        if dash: c.setDash(*dash)
        args = (self.X(x), self.Y(y + h), w * mm, h * mm)
        if r: c.roundRect(*args, r * mm, fill=fill is not None, stroke=stroke is not None)
        else: c.rect(*args, fill=fill is not None, stroke=stroke is not None)
        c.restoreState()
    def line(self, x1, y1, x2, y2, col=RULE, lw=0.3, dash=None):
        c = self.c; c.saveState(); c.setStrokeColor(col); c.setLineWidth(lw)
        if dash: c.setDash(*dash)
        c.line(self.X(x1), self.Y(y1), self.X(x2), self.Y(y2)); c.restoreState()
    def text(self, x, y, s, size=7, font="Pop-Regular", col=INK, align="l", maxw=None, track=0):
        """y = baseline from top. shrinks to maxw."""
        c = self.c
        if maxw:
            while size > 4.5 and pdfmetrics.stringWidth(s, font, size) > maxw * mm: size -= 0.25
        c.saveState(); c.setFillColor(col)
        t = c.beginText(); t.setFont(font, size); t.setCharSpace(track)
        w = pdfmetrics.stringWidth(s, font, size) + track * max(len(s) - 1, 0)
        xx = self.X(x) - (w if align == "r" else w / 2 if align == "c" else 0)
        t.setTextOrigin(xx, self.Y(y)); t.textOut(s); c.drawText(t); c.restoreState()
    def wrap(self, x, y, s, w, size=7, font="Pop-Regular", col=INK, lead=1.35, maxlines=3, bullet=False):
        words, lines, cur = s.split(), [], ""
        for wd in words:
            t = (cur + " " + wd).strip()
            if pdfmetrics.stringWidth(t, font, size) <= (w - (2.6 if bullet else 0)) * mm: cur = t
            else: lines.append(cur); cur = wd
        if cur: lines.append(cur)
        if len(lines) > maxlines:
            lines = lines[:maxlines]; lines[-1] = lines[-1].rstrip(".,") + "…"
        for i, ln in enumerate(lines):
            yy = y + i * size * lead * 0.3528
            if bullet and i == 0: self.text(x, yy, "•", size, font, col)
            self.text(x + (2.6 if bullet else 0), yy, ln, size, font, col)
        return y + len(lines) * size * lead * 0.3528
    def image(self, path, x, y, w):
        ir = ImageReader(path); iw, ih = ir.getSize(); h = w * ih / iw
        self.c.drawImage(ir, self.X(x), self.Y(y + h), w * mm, h * mm, mask="auto")
        return h

# simple vector icons (drawn in pre-print only)
def icon_sun(p, cx, cy, r, col, mode="full", bg=WHITE):
    c = p.c; c.saveState(); c.setStrokeColor(col); c.setFillColor(col); c.setLineWidth(0.6)
    import math
    X, Y = p.X(cx), p.Y(cy)
    if mode == "moon":
        c.circle(X, Y, r * mm, stroke=0, fill=1); c.setFillColor(bg)
        c.circle(X + r * 0.55 * mm, Y + r * 0.35 * mm, r * 0.85 * mm, stroke=0, fill=1)
    else:
        c.circle(X, Y, r * 0.55 * mm, stroke=0, fill=1)
        angles = range(0, 360, 45) if mode == "full" else range(0, 181, 45)
        for a in angles:
            ra = math.radians(a)
            c.line(X + math.cos(ra) * r * 0.8 * mm, Y + math.sin(ra) * r * 0.8 * mm, X + math.cos(ra) * r * 1.15 * mm, Y + math.sin(ra) * r * 1.15 * mm)
        if mode != "full":
            c.setStrokeColor(col); c.line(X - r * 1.3 * mm, Y - r * 0.75 * mm, X + r * 1.3 * mm, Y - r * 0.75 * mm)
            c.setFillColor(bg); c.rect(X - r * 1.3 * mm, Y - r * 1.4 * mm, r * 2.6 * mm, r * 0.6 * mm, stroke=0, fill=1)
    c.restoreState()

def icon_badge(p, x, y, s, col, kind):
    """small rounded square with a glyph"""
    p.rect(x, y, s, s, fill=col, r=s * 0.22)
    c = p.c; c.saveState(); c.setStrokeColor(WHITE); c.setFillColor(WHITE); c.setLineWidth(0.7)
    X0, Y0, S = p.X(x), p.Y(y + s), s * mm
    if kind == "cal":
        c.rect(X0 + S * .25, Y0 + S * .22, S * .5, S * .48, stroke=1, fill=0); c.line(X0 + S * .25, Y0 + S * .55, X0 + S * .75, Y0 + S * .55)
    elif kind == "list":
        for k in (.32, .5, .68): c.line(X0 + S * .3, Y0 + S * k, X0 + S * .7, Y0 + S * k)
    elif kind == "warn":
        pth = c.beginPath(); pth.moveTo(X0 + S * .5, Y0 + S * .75); pth.lineTo(X0 + S * .78, Y0 + S * .27); pth.lineTo(X0 + S * .22, Y0 + S * .27); pth.close(); c.drawPath(pth, stroke=1, fill=0)
    elif kind == "box":
        c.rect(X0 + S * .27, Y0 + S * .25, S * .46, S * .42, stroke=1, fill=0); c.line(X0 + S * .22, Y0 + S * .67, X0 + S * .78, Y0 + S * .67)
    elif kind == "pill":
        c.roundRect(X0 + S * .2, Y0 + S * .38, S * .6, S * .26, S * .13, stroke=1, fill=0); c.line(X0 + S * .5, Y0 + S * .38, X0 + S * .5, Y0 + S * .64)
    c.restoreState()

# ------------------------------------------------------------------ field registry
class Template:
    """collects field rectangles so the overprint & JSON field map share the pre-print geometry"""
    def __init__(self, name, W, H):
        self.name, self.W, self.H, self.fields = name, W, H, []
    def field(self, key, x, y, w, h, size, font="Pop-Medium", kind="text", align="l", lines=1, **kw):
        f = dict(key=key, x=round(x, 2), y=round(y, 2), w=round(w, 2), h=round(h, 2), size=size, font=font, kind=kind, align=align, lines=lines)
        f.update(kw); self.fields.append(f); return f

# ------------------------------------------------------------------ shared blocks
def header(p, T, W, h, compact=False):
    m = 6 if compact else 8
    lw = 30 if compact else (36 if W < 150 else 44)
    lh = p.image(LOGO, m, (h - lw * 84 / 249) / 2, lw)
    tx = m + lw + 4
    if not compact:
        p.line(tx - 2, h * .22, tx - 2, h * .78, RULE, 0.4)
        p.text(tx + 1, h * .45, "Your medicine,", 8.5 if W < 150 else 10, "Pop-Bold", BLUE)
        p.text(tx + 1, h * .45 + (3.6 if W < 150 else 4.2), "clearly explained", 8.5 if W < 150 else 10, "Pop-Bold", BLUE)
    cx = W - m
    fs = 5.6 if compact else 6.6
    rows = ["tncpharmacy.com", "+91 XXXXX XXXXX", "Delhi NCR"] if not compact else ["tncpharmacy.com", "+91 XXXXX XXXXX"]
    y0 = h / 2 - (len(rows) - 1) * (2.0 if compact else 2.3)
    for i, r in enumerate(rows):
        p.text(cx, y0 + i * (4.0 if compact else 4.6) + 1, r, fs, "Pop-Regular", SOFT, align="r")
    p.rect(0, h - 0.9, W, 0.9, fill=BLUE)

def footer(p, W, H, h, small=False):
    p.rect(0, H - h, W, h, fill=BLUE)
    yb = H - h / 2 + 1.2
    p.text(6 if small else 8, yb, "TnC PHARMACY", 7 if small else 9, "Pop-Bold", WHITE)
    if small:
        p.text(W - 6, yb, "Keep out of reach of children", 5.4, "Pop-Medium", WHITE, align="r")
    elif W < 150:
        p.text(W - 8, yb, "Keep out of reach of children  ·  Pharmacist on call", 6, "Pop-Medium", WHITE, align="r")
    else:
        p.text(8 + pdfmetrics.stringWidth("TnC PHARMACY", "Pop-Bold", 9) / mm + 2.5, yb, "Trust and Care", 7, "Pop-Regular", CMYKColor(.1, .03, 0, 0))
        p.text(W - 8, yb, "100% genuine medicines   ·   Home delivery   ·   Pharmacist on call", 6, "Pop-Medium", WHITE, align="r")

def patient_box(p, T, x, y, w, h, with_doctor=False):
    p.rect(x, y, w, h, fill=BLUE_T, r=2.2)
    rows = [("Patient name", "patient.name", 9.5, "Pop-Bold"), ("Age / Gender", "patient.age_gender", 8, "Pop-Medium")]
    if with_doctor: rows.append(("Prescribed by", "patient.doctor", 8, "Pop-Medium"))
    rh = (h - 3) / len(rows); lx = x + 4; vx = x + (24 if w < 100 else 30)
    for i, (lab, key, sz, ft) in enumerate(rows):
        yb = y + 1.5 + rh * i + rh * .62
        p.text(lx, yb, lab, 6.4, "Pop-Regular", SOFT)
        p.line(vx, yb + 1.2, x + w - 4, yb + 1.2, RULE, 0.35)
        T.field(key, vx, yb - sz * .3528, x + w - 4 - vx, sz * .3528 + 1.2, sz, ft)

def medicine_box(p, T, x, y, w, big=False):
    s1, s2, s3 = (13, 8.5, 7) if big else (11, 7.5, 6.4)
    nt = y + 6.2; ft = nt + s1 * .3528 + 1.8; ut = ft + s2 * .3528 + 1.5
    h = ut + s3 * .3528 + 2.4 - y
    p.rect(x, y, w, h, fill=ORANGE_T, stroke=cmyk("#FFC48A"), r=2.2, lw=0.35)
    p.rect(x, y, 1.6, h, fill=ORANGE)
    p.text(x + 5, y + 4.4, "MEDICINE", 5.6, "Pop-Bold", ORANGE_INK, track=0.6)
    T.field("medicine.name", x + 5, nt, w - 9, s1 * .3528 + 1, s1, "Pop-Bold")
    T.field("medicine.form", x + 5, ft, w - 9, s2 * .3528 + .8, s2, "Pop-Medium")
    T.field("medicine.use", x + 5, ut, w - 9, s3 * .3528 + .6, s3, "Pop-Regular")
    return h

def dose_grid(p, T, x, y, w, h, big=False):
    hh = 8 if big else 6.5
    p.rect(x, y, w, h, fill=WHITE, stroke=BLUE, r=2.2, lw=0.5)
    p.rect(x, y, w, hh, fill=BLUE, r=2.2); p.rect(x, y + hh - 2.2, w, 2.2, fill=BLUE)
    icon_badge(p, x + 2.5, y + (hh - 4) / 2, 4, BLUE_D, "pill")
    p.text(x + 8, y + hh / 2 + 1.3, "How to take it", 8.5 if big else 7.2, "Pop-Bold", WHITE)
    cw = w / 4
    slots = [("MORNING", "morning", "rise", ORANGE), ("AFTERNOON", "afternoon", "full", ORANGE), ("EVENING", "evening", "set", ORANGE), ("NIGHT", "night", "moon", BLUE)]
    bt = y + hh
    ir, lb, qt, qs, us, fs = (2.0, 9.6, 11.0, 15, 6.6, 6.0) if big else (1.6, 7.8, 9.0, 12, 5.8, 5.3)
    for i, (lab, key, ic, col) in enumerate(slots):
        cx = x + cw * i + cw / 2
        if i: p.line(x + cw * i, bt + 1.5, x + cw * i, y + h - 1.5, RULE, 0.35)
        icon_sun(p, cx, bt + ir * 1.9, ir, col, ic)
        p.text(cx, bt + lb, lab, 5.6 if big else 4.9, "Pop-Bold", SOFT, align="c", track=0.3)
        T.field("dose.%s.qty" % key, cx - cw / 2 + 1, bt + qt, cw - 2, qs * .3528 + 1, qs, "Pop-Bold", align="c")
        ut = bt + qt + qs * .3528 + 1.6
        T.field("dose.%s.unit" % key, cx - cw / 2 + 1, ut, cw - 2, us * .3528 + .6, us, "Pop-Medium", align="c")
        T.field("dose.%s.food" % key, cx - cw / 2 + 1, ut + us * .3528 + 1.4, cw - 2, fs * .3528 + .6, fs, "Pop-Regular", align="c")

def duration_box(p, T, x, y, w, h, big=False):
    p.rect(x, y, w, h, fill=BLUE_T, r=2.2)
    s = 6 if big else 4.6
    icon_badge(p, x + 3, y + (h - s) / 2, s, BLUE, "cal")
    tx = x + 3 + s + 3
    p.text(tx, y + (4.6 if big else 3.4), "CONTINUE FOR", 5.8 if big else 5.0, "Pop-Bold", SOFT, track=0.5)
    vs = 12 if big else 10
    T.field("duration", tx, y + (5.4 if big else 3.9), w - (3 + s + 6), vs * .3528 + 1, vs, "Pop-Bold")
    if big: p.text(tx, y + h - 2.0, "Exactly as prescribed by your doctor", 5.6, "Pop-Regular", SOFT)

def text_block(p, T, x, y, w, h, title, key, kind, color, lines, size, bullet=False):
    s = 4.6
    icon_badge(p, x, y, s, color, kind)
    p.text(x + s + 2.2, y + s * .75, title, 7.4 if size >= 6.5 else 6.6, "Pop-Bold", INK)
    top = y + s + 2.2; lh = (h - (s + 2.2)) / lines
    for i in range(lines):
        p.line(x + s + 2.2, top + lh * (i + 1) - 0.2, x + w, top + lh * (i + 1) - 0.2, RULE, 0.25, dash=(0.6, 0.9))
    T.field(key, x + s + 2.2, top, w - s - 2.2, h - s - 2.2, size, "Pop-Regular", kind="lines", lines=lines, line_h=round(lh, 2), bullet=bullet)

def qr_box(p, T, x, y, w, h):
    p.rect(x, y, w, h, fill=WHITE, stroke=BLUE, r=2, lw=0.45)
    q = min(w - 6, h - 9)
    p.rect(x + (w - q) / 2, y + 2.5, q, q, stroke=RULE, lw=0.3, dash=(1, 1))
    T.field("reorder_qr", x + (w - q) / 2 + .5, y + 3, q - 1, q - 1, 0, kind="qr")
    p.text(x + w / 2, y + h - 3.6, "Scan to reorder", 5.6, "Pop-Bold", BLUE, align="c")
    p.text(x + w / 2, y + h - 1.4, "on WhatsApp", 5.0, "Pop-Regular", SOFT, align="c")

# ------------------------------------------------------------------ layouts
def layout_small(p, T):
    W, H = T.W, T.H; m = 5.5; iw = W - 2 * m
    header(p, T, W, 15, compact=True)
    patient_box(p, T, m, 17.5, iw, 13)
    mh = medicine_box(p, T, m, 32, iw)
    gy = 32 + mh + 2
    dose_grid(p, T, m, gy, iw, 29.5)
    dy = gy + 31.5
    duration_box(p, T, m, dy, iw, 8.5)
    text_block(p, T, m, dy + 10.5, iw, H - 9 - (dy + 10.5) - 1.5, "Important instructions", "instructions", "list", BLUE, 3, 6.0, bullet=True)
    footer(p, W, H, 9, small=True)

def layout_medium(p, T):
    W, H = T.W, T.H; m = 7; iw = W - 2 * m
    header(p, T, W, 21)
    patient_box(p, T, m, 24, iw, 15)
    mh = medicine_box(p, T, m, 41, iw, big=True)
    gy = 41 + mh + 2.5
    dose_grid(p, T, m, gy, iw, 34, big=True)
    col = (iw - 5) / 2; rx = m + col + 5; ry = gy + 37
    duration_box(p, T, m, ry, col, 16, big=True)
    text_block(p, T, rx, ry, col, 28, "Possible side effects", "side_effects", "warn", ORANGE, 4, 6.2)
    text_block(p, T, m, ry + 19, col, 28, "Important instructions", "instructions", "list", BLUE, 5, 6.2, bullet=True)
    fy = H - 12
    text_block(p, T, m, ry + 49.5, col, fy - 1.5 - (ry + 49.5), "Storing it", "storage", "box", BLUE, 2, 6.0)
    qr_box(p, T, rx + (col - 30) / 2, ry + 31, 30, fy - 2 - (ry + 31))
    footer(p, W, H, 12)

def layout_large(p, T):
    W, H = T.W, T.H; m = 10; iw = W - 2 * m
    header(p, T, W, 26)
    patient_box(p, T, m, 30, iw * .64, 20, with_doctor=True)
    # order summary chip (fill)
    bx = m + iw * .64 + 4; bw = iw - iw * .64 - 4
    p.rect(bx, 30, bw, 20, fill=ORANGE_T, r=2.2)
    p.text(bx + 4, 36, "MEDICINES IN THIS PACK", 5.6, "Pop-Bold", ORANGE_INK, track=0.4)
    T.field("item_count", bx + 4, 38.5, bw - 8, 8, 18, "Pop-Bold")
    # schedule table
    ty = 54; hh = 11; rows = 8; rh = 13.5
    cols = [("#", 7), ("Medicine", 58), ("MORNING", 16.5), ("AFTERNOON", 16.5), ("EVENING", 16.5), ("NIGHT", 16.5), ("WHEN", 16), ("DAYS", iw - 7 - 58 - 66 - 16)]
    p.rect(m, ty, iw, hh + rows * rh, fill=WHITE, stroke=BLUE, r=2.4, lw=0.5)
    p.rect(m, ty, iw, hh, fill=BLUE, r=2.4); p.rect(m, ty + hh - 2.4, iw, 2.4, fill=BLUE)
    xs = [m]
    for _, cw in cols: xs.append(xs[-1] + cw)
    ic = {"MORNING": ("rise", ORANGE), "AFTERNOON": ("full", ORANGE), "EVENING": ("set", ORANGE), "NIGHT": ("moon", CMYKColor(.1, .03, 0, 0))}
    for i, (lab, cw) in enumerate(cols):
        cx = xs[i] + cw / 2
        if lab in ic:
            icon_sun(p, cx, ty + 3.6, 1.5, WHITE, ic[lab][0], bg=BLUE)
            p.text(cx, ty + hh - 1.6, lab, 4.6, "Pop-Bold", WHITE, align="c", track=0.2)
        else:
            p.text(xs[i] + (cw / 2 if lab in ("#", "WHEN", "DAYS") else 3), ty + hh / 2 + 1.2, lab if lab != "Medicine" else "MEDICINE", 5.6, "Pop-Bold", WHITE, align="c" if lab in ("#", "WHEN", "DAYS") else "l", track=0.3)
    for r in range(rows):
        ry = ty + hh + r * rh
        if r % 2: p.rect(m + .3, ry, iw - .6, rh, fill=cmyk("#F5F8FC"))
        if r: p.line(m, ry, m + iw, ry, RULE, 0.3)
        p.text(xs[0] + 3.5, ry + rh / 2 + 1.2, str(r + 1), 7, "Pop-Bold", RULE, align="c")
        T.field("items[%d].name" % r, xs[1] + 3, ry + 2.4, cols[1][1] - 5, 4.2, 8, "Pop-Bold")
        T.field("items[%d].detail" % r, xs[1] + 3, ry + 7.6, cols[1][1] - 5, 3.2, 6, "Pop-Regular")
        for k, key in enumerate(("morning", "afternoon", "evening", "night")):
            T.field("items[%d].%s" % (r, key), xs[2 + k] + 1, ry + rh / 2 - 2.4, cols[2 + k][1] - 2, 5, 11, "Pop-Bold", align="c")
        T.field("items[%d].when" % r, xs[6] + 1, ry + rh / 2 - 1.6, cols[6][1] - 2, 3.4, 6, "Pop-Medium", align="c", lines=2)
        T.field("items[%d].days" % r, xs[7] + 1, ry + rh / 2 - 2.2, cols[7][1] - 2, 4.6, 9, "Pop-Bold", align="c")
    for i in range(2, len(xs) - 1):
        p.line(xs[i], ty + hh, xs[i], ty + hh + rows * rh, RULE, 0.3)
    by = ty + hh + rows * rh + 6
    col = (iw - 6) / 2; rx = m + col + 6
    text_block(p, T, m, by, col, 34, "Important instructions", "instructions", "list", BLUE, 5, 6.6, bullet=True)
    text_block(p, T, rx, by, col - 30, 34, "Possible side effects", "side_effects", "warn", ORANGE, 5, 6.4)
    qr_box(p, T, W - m - 26, by, 26, 31)
    sy = by + 38
    p.rect(m, sy, iw, 12, fill=BLUE_T, r=2.2)
    icon_badge(p, m + 3, sy + 3.5, 5, BLUE, "box")
    p.text(m + 11, sy + 5.2, "Storing your medicines", 6.6, "Pop-Bold", INK)
    T.field("storage", m + 11, sy + 6.6, iw - 15, 3.6, 6.4, "Pop-Regular")
    p.text(m, sy + 18, "Pharmacist", 6.6, "Pop-Regular", SOFT)
    p.line(m + 15, sy + 19, m + 80, sy + 19, RULE, 0.3)
    T.field("pharmacist", m + 15, sy + 15.2, 65, 3.6, 7.5, "Pop-Medium")
    p.text(W - m, sy + 18, "Keep out of reach of children", 6.6, "Pop-Medium", ORANGE_INK, align="r")
    footer(p, W, H, 14)

LAYOUTS = {"Small": layout_small, "Medium": layout_medium, "Large": layout_large}

# ------------------------------------------------------------------ overprint renderer (what the app will do)
def get(data, key):
    cur = data
    for part in key.replace("]", "").replace("[", ".").split("."):
        if cur is None: return None
        cur = (cur[int(part)] if int(part) < len(cur) else None) if part.isdigit() else cur.get(part) if isinstance(cur, dict) else None
    return cur

def overprint(p, T, data):
    for f in T.fields:
        v = get(data, f["key"])
        if v in (None, "", []): continue
        if f["kind"] == "qr":
            img = qrcode.make(v, border=0); buf = io.BytesIO(); img.save(buf, "PNG"); buf.seek(0)
            p.c.drawImage(ImageReader(buf), p.X(f["x"]), p.Y(f["y"] + f["h"]), f["w"] * mm, f["h"] * mm)
            continue
        col = BLACK
        if f["kind"] == "lines":
            items = v if isinstance(v, list) else [v]
            bullet = f.get("bullet") and isinstance(v, list)
            ind = 2.6 if bullet else 0
            def wrap_all(sz):
                out = []
                for it in items:
                    cur = ""; first = True
                    for wd in str(it).split():
                        t = (cur + " " + wd).strip()
                        if pdfmetrics.stringWidth(t, f["font"], sz) <= (f["w"] - ind) * mm: cur = t
                        else: out.append((first, cur)); first = False; cur = wd
                    out.append((first, cur))
                return out
            sz = f["size"]; rows = wrap_all(sz)
            while len(rows) > f["lines"] and sz > 5.0:
                sz -= 0.25; rows = wrap_all(sz)
            if len(rows) > f["lines"]:
                rows = rows[:f["lines"]]; rows[-1] = (rows[-1][0], rows[-1][1].rstrip(".,;") + "…")
            for n, (first, ln) in enumerate(rows):
                yb = f["y"] + f["line_h"] * (n + 1) - 1.1
                if bullet and first: p.text(f["x"], yb, "•", sz, f["font"], col)
                p.text(f["x"] + ind, yb, ln, sz, f["font"], col)
            continue
        s = str(v)
        if f.get("lines", 1) == 2 and pdfmetrics.stringWidth(s, f["font"], f["size"]) > f["w"] * mm and " " in s:
            a, b = s.split(" ", 1)
            p.text(f["x"] + f["w"] / 2, f["y"] + f["size"] * .3528, a, f["size"], f["font"], col, align="c", maxw=f["w"])
            p.text(f["x"] + f["w"] / 2, f["y"] + f["size"] * .3528 * 2.2, b, f["size"], f["font"], col, align="c", maxw=f["w"])
            continue
        x = f["x"] + (f["w"] / 2 if f["align"] == "c" else f["w"] if f["align"] == "r" else 0)
        p.text(x, f["y"] + f["size"] * .3528 * .85 + (f["h"] - f["size"] * .3528) / 2, s, f["size"], f["font"], col, align=f["align"], maxw=f["w"])

# ------------------------------------------------------------------ outputs
BLEED = 3.0
def crop_marks(c, W, H, b):
    c.saveState(); c.setStrokeColor(CMYKColor(1, 1, 1, 1)); c.setLineWidth(0.25)
    L = 5
    for (x, y) in ((b, b), (b + W, b), (b, b + H), (b + W, b + H)):
        sx = -1 if x == b else 1; sy = -1 if y == b else 1
        c.line((x + sx * 1) * mm, y * mm, (x + sx * (1 + L)) * mm, y * mm)
        c.line(x * mm, (y + sy * 1) * mm, x * mm, (y + sy * (1 + L)) * mm)
    c.restoreState()

def make_preprint(size):
    S = SIZES[size]; W, H = S["w"], S["h"]; slug = BLEED + 6
    path = os.path.join(OUT, "TnC_Envelope_%s_PrePrint_VENDOR.pdf" % size)
    c = canvas.Canvas(path, pagesize=((W + 2 * slug) * mm, (H + 2 * slug) * mm))
    c.setTitle("TnC Pharmacy envelope - %s - vendor artwork" % size); c.setAuthor("TnC Pharmacy")
    # bleed: extend white bg + blue footer/header rule colours to bleed edge
    p = Pen(c, H, slug, slug)
    c.setFillColor(WHITE); c.rect((slug - BLEED) * mm, (slug - BLEED) * mm, (W + 2 * BLEED) * mm, (H + 2 * BLEED) * mm, stroke=0, fill=1)
    fh = {"Small": 9, "Medium": 12, "Large": 14}[size]
    hh = {"Small": 15, "Medium": 21, "Large": 26}[size]
    c.setFillColor(BLUE)
    c.rect((slug - BLEED) * mm, (slug - BLEED) * mm, (W + 2 * BLEED) * mm, (fh + BLEED) * mm, stroke=0, fill=1)  # footer to bleed
    c.rect((slug - BLEED) * mm, (slug + H - hh) * mm, (W + 2 * BLEED) * mm, 0.9 * mm, stroke=0, fill=1)  # header rule to bleed
    T = Template(size, W, H)
    LAYOUTS[size](p, T)
    crop_marks(c, W, H, slug)
    c.setFont("Pop-Regular", 5); c.setFillColor(CMYKColor(0, 0, 0, .6))
    c.drawString((slug + 1) * mm, (slug + H + 3.5) * mm, "TnC Pharmacy · Medicine envelope FRONT · %s · trim at crop marks · 3 mm bleed · CMYK" % S["label"])
    c.showPage(); c.save()
    return T

def make_overprint(size, T, data, path, with_design=False, guides=False, title=""):
    S = SIZES[size]; W, H = S["w"], S["h"]
    c = canvas.Canvas(path, pagesize=(W * mm, H * mm)); c.setTitle(title)
    p = Pen(c, H)
    if with_design:
        LAYOUTS[size](p, Template(size, W, H))
    if guides:
        for f in T.fields:
            p.rect(f["x"], f["y"], f["w"], f["h"], stroke=CMYKColor(0, .8, .9, 0), lw=0.25, dash=(1, 1))
        c.setFont("Pop-Regular", 5); c.setFillColor(CMYKColor(0, 0, 0, .7))
        c.drawString(4 * mm, 2.5 * mm, "Alignment test: print on plain paper, hold against an envelope to the light, then adjust printer offset.")
    if data: overprint(p, T, data)
    c.showPage(); c.save()

SAMPLE_ONE = {
    "patient": {"name": "Sharath Kumar P", "age_gender": "33 Y / Male", "doctor": "Dr. A. Mehta"},
    "medicine": {"name": "Azithromycin 250 mg", "form": "Tablet", "use": "Antibiotic — treats bacterial infections"},
    "dose": {"morning": {"qty": "1", "unit": "Tablet", "food": "After food"}, "afternoon": {"qty": "—", "unit": "", "food": "Skip"},
             "evening": {"qty": "1", "unit": "Tablet", "food": "After food"}, "night": {"qty": "—", "unit": "", "food": "Skip"}},
    "duration": "3 days",
    "instructions": ["Take after food to avoid stomach upset.", "Finish the full course even if you feel better.", "Do not skip doses or double up on a missed one.", "Do not share this medicine with anyone else."],
    "side_effects": "Stomach upset, nausea or loose motions. Contact your doctor straight away if you get a severe rash, swelling or difficulty breathing.",
    "storage": "Keep below 30 °C, away from sunlight and damp.",
    "pharmacist": "[Pharmacist name / Reg. no.]",
    "reorder_qr": "https://wa.me/91XXXXXXXXXX?text=Reorder%20TNC-ORDER-ID",
}
SAMPLE_ORDER = {
    "patient": {"name": "Sharath Kumar P", "age_gender": "33 Y / Male", "doctor": "Dr. A. Mehta"},
    "item_count": "4 medicines",
    "items": [
        {"name": "Azithromycin 250 mg", "detail": "Tablet · Antibiotic", "morning": "1", "afternoon": "—", "evening": "1", "night": "—", "when": "After food", "days": "3"},
        {"name": "Pantoprazole 40 mg", "detail": "Tablet · Acidity", "morning": "1", "afternoon": "—", "evening": "—", "night": "—", "when": "Before food", "days": "5"},
        {"name": "Paracetamol 650 mg", "detail": "Tablet · Fever / pain", "morning": "1", "afternoon": "1", "evening": "—", "night": "1", "when": "After food", "days": "3"},
        {"name": "Cetirizine 10 mg", "detail": "Tablet · Allergy", "morning": "—", "afternoon": "—", "evening": "—", "night": "1", "when": "After food", "days": "5"},
    ],
    "instructions": ["Complete every course even if you feel better.", "Paracetamol: no more than 4 tablets in 24 hours.", "Cetirizine may cause drowsiness — avoid driving.", "Do not share these medicines with anyone else."],
    "side_effects": "Mild stomach upset or drowsiness can occur. Contact your doctor if you get a rash, swelling or difficulty breathing.",
    "storage": "Keep below 30 °C, away from sunlight, damp and children.",
    "pharmacist": "[Pharmacist name / Reg. no.]",
    "reorder_qr": "https://wa.me/91XXXXXXXXXX?text=Reorder%20TNC-ORDER-ID",
}

if __name__ == "__main__":
    fieldmap = {}
    for size in SIZES:
        T = make_preprint(size)
        data = SAMPLE_ORDER if size == "Large" else SAMPLE_ONE
        make_overprint(size, T, data, os.path.join(OUT, "TnC_Envelope_%s_Overprint_SAMPLE.pdf" % size), title="Overprint sample %s" % size)
        make_overprint(size, T, data, os.path.join(OUT, "TnC_Envelope_%s_Preview_FILLED.pdf" % size), with_design=True, title="Filled preview %s" % size)
        make_overprint(size, T, None, os.path.join(OUT, "TnC_Envelope_%s_AlignmentTest.pdf" % size), guides=True, title="Alignment test %s" % size)
        fieldmap[size] = {"page_mm": [SIZES[size]["w"], SIZES[size]["h"]], "origin": "top-left, millimetres", "use": SIZES[size]["use"], "fields": T.fields}
    json.dump({"version": 1, "templates": fieldmap, "sample_single_medicine": SAMPLE_ONE, "sample_whole_order": SAMPLE_ORDER},
              open(os.path.join(OUT, "tnc_envelope_templates.json"), "w"), indent=1, ensure_ascii=False)
    print("done")
