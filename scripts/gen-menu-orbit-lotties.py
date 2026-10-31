import json, math, os, sys
# Generates the "Orbit" menu-icon Lotties (three menu lines <-> three pulsing sound bars).
# The outer lines orbit counter-clockwise around the middle line into the side bars,
# top line first; the middle line turns upright in place.
# Timeline (60fps): open 0-30, pulse 30-90 (loops), close 90-120 (open played backwards).
# Canvas 96x84 (= the 32x28 icon at 3x).
# Run: python3 scripts/gen-menu-orbit-lotties.py public/lottie
P = math.pi
RY = [24, 42, 60]
BX = [34.5, 48, 61.5]
BL = [30, 60, 30]
LO = [0.6, 0.55, 0.6]
STROKE = 7.2

def clamp(x): return max(0.0, min(1.0, x))
def lerp(a, b, k): return a + (b - a) * k
def eio(t): return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2
def back(t, c1=1.70158): c3 = c1 + 1; return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2

BASE = dict(d=[0, 0.15, 0.3], dur=0.7, sweep=P / 2, bulge=4, rot=lambda k: -90 * back(k))
VARIANTS = {
    "menu-orbit.json": {},                                                  # #1 original (#67)
    "menu-orbit-quick.json": dict(dur=0.5, d=[0, 0.12, 0.25]),              # #5 quick
    "menu-orbit-calm.json": dict(dur=0.9, d=[0, 0.05, 0.1], rot=lambda k: -90 * eio(k)),  # #6 slow and calm
}

def state(o, i, p):
    k = clamp((p - o["d"][i]) / o["dur"])
    pe = eio(k)
    x, y = 48.0, 42.0
    if i != 1:
        a0 = -P / 2 if i == 0 else P / 2
        a = a0 - pe * o["sweep"]
        r = lerp(18, 13.5, pe) + o["bulge"] * math.sin(pe * P)
        x, y = 48 + r * math.cos(a), 42 + r * math.sin(a)
    kl = eio(k) if i == 1 else eio(min(1.0, k * 1.5))
    return x, y, o["rot"](k), lerp(60, BL[i], kl)

def pulse(f):
    ph = ((f - 30) / 30) % 1
    return 1 - eio(ph / 0.87) if ph < 0.87 else eio((ph - 0.87) / 0.13)

LIN1 = {"i": {"x": [1], "y": [1]}, "o": {"x": [0], "y": [0]}}
LINS = {"i": {"x": 1, "y": 1}, "o": {"x": 0, "y": 0}}
def r3(v): return round(v, 3)
def shp(l): l = max(0.1, l); return {"i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[r3(-l / 2), 0], [r3(l / 2), 0]], "c": False}

def build(o):
    layers = []
    for i in range(3):
        pos, rot, ln = [], [], []
        def push(f, s, lm=1.0):
            x, y, r, l = s
            pos.append({"t": f, "s": [r3(x), r3(y), 0], "to": [0, 0, 0], "ti": [0, 0, 0], **LINS})
            rot.append({"t": f, "s": [r3(r)], **LIN1})
            ln.append({"t": f, "s": [shp(l * lm)], **LIN1})
        for f in range(0, 31, 2): push(f, state(o, i, f / 30))
        end = state(o, i, 1)
        for f in range(32, 89, 2): push(f, end, LO[i] + (1 - LO[i]) * pulse(f))
        for f in range(90, 121, 2): push(f, state(o, i, 1 - (f - 90) / 30))
        layers.append({
            "ddd": 0, "ind": i + 1, "ty": 4, "nm": f"line {i + 1}", "sr": 1,
            "ks": {"o": {"a": 0, "k": 100}, "r": {"a": 1, "k": rot}, "p": {"a": 1, "k": pos}, "a": {"a": 0, "k": [0, 0, 0]}, "s": {"a": 0, "k": [100, 100, 100]}},
            "ao": 0,
            "shapes": [{"ty": "gr", "it": [
                {"ty": "sh", "ks": {"a": 1, "k": ln}},
                {"ty": "st", "c": {"a": 0, "k": [1, 1, 1, 1]}, "o": {"a": 0, "k": 100}, "w": {"a": 0, "k": STROKE}, "lc": 2, "lj": 2, "ml": 4},
                {"ty": "tr", "p": {"a": 0, "k": [0, 0]}, "a": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [100, 100]}, "r": {"a": 0, "k": 0}, "o": {"a": 0, "k": 100}, "sk": {"a": 0, "k": 0}, "sa": {"a": 0, "k": 0}},
            ]}],
            "ip": 0, "op": 121, "st": 0, "bm": 0,
        })
    return {"v": "5.7.4", "fr": 60, "ip": 0, "op": 121, "w": 96, "h": 84, "nm": "menu-orbit", "ddd": 0, "assets": [], "layers": layers,
            "markers": [{"tm": 0, "cm": "open", "dr": 30}, {"tm": 30, "cm": "pulse", "dr": 60}, {"tm": 90, "cm": "close", "dr": 30}]}

out = sys.argv[1] if len(sys.argv) > 1 else "public/lottie"
for name, ov in VARIANTS.items():
    o = {**BASE, **ov}
    with open(os.path.join(out, name), "w") as fh:
        json.dump(build(o), fh, separators=(",", ":"))
    print(name, os.path.getsize(os.path.join(out, name)))
