import sys, io, json, base64, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
src, out_json, prev_dir = sys.argv[1], sys.argv[2], sys.argv[3]
# layer polygons/pivots below are authored in the original 1312x928 art; OFF shifts them
# onto a trimmed copy of the same art (e.g. `build.py band.webp out.json prev 39 334`)
OFF = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (0, 0)
rgba = np.asarray(Image.open(src).convert('RGBA')).copy()
H, W = rgba.shape[:2]
fg = rgba[..., 3] > 8

def poly(pts):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(x - OFF[0], y - OFF[1]) for x, y in pts], fill=1); return np.asarray(m).astype(bool)

# priority order: first polygon to claim a pixel wins
regions = [
  ('props', [poly([(178,752),(300,752),(300,822),(365,822),(385,840),(385,890),(178,890)]),
             poly([(475,690),(520,640),(560,640),(600,662),(700,662),(755,660),(762,640),(775,622),(860,620),(872,750),(872,845),(760,885),(500,885),(468,800)]),
             poly([(722,548),(790,505),(830,525),(868,560),(862,582),(728,582)]),
             poly([(795,575),(828,575),(828,640),(795,640)])]),
  ('drummer', [poly([(528,370),(562,370),(600,470),(720,470),(762,560),(775,622),(762,640),(755,660),(700,662),(600,662),(560,640),(585,600),(578,540),(545,525),(528,470)])]),
  ('bass2', [poly([(300,370),(528,370),(528,470),(545,525),(578,540),(585,600),(560,640),(520,640),(475,690),(468,800),(500,900),(385,900),(385,840),(365,822),(300,822)])]),
  ('guitar1', [poly([(0,370),(300,370),(300,928),(0,928)])]),
  ('guitar4', [poly([(815,320),(1025,320),(1025,465),(1010,485),(1010,545),(1035,570),(1035,790),(1008,815),(1008,928),(872,928),(872,580),(868,560),(830,525),(815,500)])]),
  ('singer', [poly([(1025,320),(1312,320),(1312,928),(1008,928),(1008,815),(1035,790),(1035,570),(1010,545),(1010,485),(1025,465)])]),
]
names = [r[0] for r in regions]
owner = np.full((H, W), -1, int)
for i, (_, ps) in enumerate(regions):
    for p in ps:
        owner[(owner == -1) & p & fg] = i
# stray fg pixels -> nearest owned pixel
miss = fg & (owner == -1)
if miss.any():
    _, idx = nd.distance_transform_edt(owner == -1, return_indices=True)
    owner[miss] = owner[idx[0][miss], idx[1][miss]]
print('unowned', miss.sum())

# z-order back -> front; each layer bleeds (edge-extends) under pixels owned by layers in front of it
z = ['drummer', 'bass2', 'guitar4', 'singer', 'guitar1', 'props']
BLEED = 14
# only bleed where a layer genuinely continues behind another (not mere side-by-side contact)
OCCLUDERS = {'drummer': ['props', 'bass2'], 'bass2': ['props'], 'guitar1': ['props'],
             'guitar4': ['props', 'singer'], 'singer': []}
layers = {}
for zi, name in enumerate(z):
    i = names.index(name)
    mine = owner == i
    front = np.isin(owner, [names.index(n) for n in OCCLUDERS.get(name, [])])
    dist, idx = nd.distance_transform_edt(~mine, return_indices=True)
    grow = front & (dist <= BLEED) & (dist > 0)
    L = np.zeros_like(rgba)
    L[mine] = rgba[mine]
    src_px = rgba[idx[0], idx[1]]
    L[grow, :3] = src_px[grow, :3]; L[grow, 3] = 255
    ys, xs = np.nonzero(L[..., 3])
    x0, x1, y0, y1 = xs.min(), xs.max()+1, ys.min(), ys.max()+1
    layers[name] = (Image.fromarray(L[y0:y1, x0:x1]), int(x0), int(y0))
    layers[name][0].save(f'{prev_dir}/layer_{name}.png')

# per-layer placement (comp px) for the PNG/CSS version
json.dump({"w": W, "h": H, "layers": {n: {"x": x, "y": y, "w": im.width, "h": im.height}
           for n, (im, x, y) in layers.items()}}, open(f'{prev_dir}/layout.json', 'w'), indent=1)

# ---- Lottie ----
FPS, N = 30, 240  # 8s loop
E_IN = {"x": [0.42], "y": [1]}; E_OUT = {"x": [0.58], "y": [0]}
def anim(frames_vals):
    ks = []
    for t, v in frames_vals:
        k = {"t": t, "s": v if isinstance(v, list) else [v]}
        k.update({"i": E_IN, "o": E_OUT}); ks.append(k)
    return {"a": 1, "k": ks}
def cyc(period, vals, n=N):
    """repeat a keyframe pattern (list of values evenly spaced over `period` frames) until n"""
    out, step = [], period / len(vals)
    t = 0.0; j = 0
    while t <= n + 1e-6:
        out.append((round(t, 2), vals[j % len(vals)])); t += step; j += 1
    return out
def add(a, b): return [x + y for x, y in zip(a, b)]

# pivot (comp coords, near feet) and motion per member
spec = {
  # name: pivot, rotation pattern (period, vals), y-offset pattern (period, vals), scale pattern
  'guitar1': ((150, 860), (30, [-3, 2.5]),   (15, [0, 5]),   None),
  'bass2':   ((430, 870), (60, [-4, 4]),     (15, [0, -12]), None),
  'drummer': ((680, 720), (30, [-2, 2]),     (7.5, [0, 5]),  None),
  'guitar4': ((960, 870), (60, [3.5, -3.5]), (15, [0, 6]),   None),
  'singer':  ((1150, 880),(120,[-5, 4]),     (30, [0, 8]),   (60, [[100,100],[101.5,98.5]])),
}
assets, lyr = [], []
for ind, name in enumerate(reversed(z)):  # lottie: first layer is on top
    img, x0, y0 = layers[name]
    b = io.BytesIO(); img.save(b, 'WEBP', quality=95, alpha_quality=100, method=6, exact=False)
    aid = f'img_{name}'
    assets.append({"id": aid, "w": img.width, "h": img.height, "u": "", "p": "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode(), "e": 1})
    if name in spec:
        (px, py), rot, bob, sc = spec[name]
        px, py = px - OFF[0], py - OFF[1]
        anchor = [px - x0, py - y0, 0]
        ks = {"o": {"a": 0, "k": 100},
              "r": anim(cyc(*rot)),
              "p": anim([(t, [px, py + v, 0]) for t, v in cyc(*bob)]),
              "a": {"a": 0, "k": anchor},
              "s": anim([(t, v + [100]) for t, v in cyc(*sc)]) if sc else {"a": 0, "k": [100, 100, 100]}}
    else:
        ks = {"o": {"a": 0, "k": 100}, "r": {"a": 0, "k": 0}, "p": {"a": 0, "k": [x0, y0, 0]},
              "a": {"a": 0, "k": [0, 0, 0]}, "s": {"a": 0, "k": [100, 100, 100]}}
    lyr.append({"ddd": 0, "ind": ind + 1, "ty": 2, "nm": name, "refId": aid, "sr": 1, "ks": ks,
                "ao": 0, "ip": 0, "op": N, "st": 0, "bm": 0})
doc = {"v": "5.7.4", "fr": FPS, "ip": 0, "op": N, "w": W, "h": H, "nm": "7th Heaven Band Loop", "ddd": 0,
       "assets": assets, "layers": lyr, "markers": []}
json.dump(doc, open(out_json, 'w'), separators=(',', ':'))
print('ok')
