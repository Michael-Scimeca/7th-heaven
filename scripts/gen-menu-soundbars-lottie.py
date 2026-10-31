import json, sys
# Menu icon Lottie: 3 menu lines swing/rotate into 3 sound bars (short/tall/short),
# pulse loop, then keep rotating the same way back into 3 lines.
# Canvas 96x84 (= 32x28 icon at 3x), 60fps.
# Markers: open 0-30, pulse 30-90 (loop), close 90-120.
# Run: python3 scripts/gen-menu-soundbars-lottie.py public/lottie/menu-soundbars.json

CX = 48            # centre x of the resting lines
REST_Y = [24, 42, 60]
LINE_LEN = 60
BAR_X = [34.5, 48, 61.5]
BAR_Y = 42
BAR_LEN = [30, 60, 30]
STROKE = 7.2
PULSE_LO = [0.6, 0.55, 0.6]
STAGGER = [3, 0, 6]      # middle line leads, then top, then bottom
OPEN_DUR = 24
CLOSE_START, END = 90, 120

SMOOTH = {"i": {"x": [0.33], "y": [1]}, "o": {"x": [0.67], "y": [0]}}
SETTLE = {"i": {"x": [0.25], "y": [1]}, "o": {"x": [0.45], "y": [0]}}
SNAP = {"i": {"x": [0.3], "y": [1]}, "o": {"x": [0.7], "y": [0]}}
SP_SMOOTH = {"i": {"x": 0.33, "y": 1}, "o": {"x": 0.67, "y": 0}}

def kf(t, v, ease=SMOOTH):
    k = {"t": t, "s": v if isinstance(v, list) else [v]}
    if ease: k.update(ease)
    return k

def seg(L):
    return {"i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[round(-L / 2, 3), 0], [round(L / 2, 3), 0]], "c": False}

def layer(i):
    d = STAGGER[i]
    o0, o1 = d, d + OPEN_DUR              # open window for this line
    c0, c1 = CLOSE_START + d, CLOSE_START + d + 24
    rest = [CX, REST_Y[i], 0]
    barp = [BAR_X[i], BAR_Y, 0]
    side = 0 if i == 1 else (-1 if i == 0 else 1)

    # position: the outer lines orbit counter-clockwise around the middle like a pinwheel.
    # open:  top line swings left then down into the left bar; bottom swings right then up.
    # close: they keep going the same way (left bar -> bottom line, right bar -> top line).
    #        The lines are identical, so ending on swapped rows is invisible.
    if side == 0:
        pos = {"a": 0, "k": rest}
    else:
        end_rest = [CX, REST_Y[2 - i], 0]
        pos = {"a": 1, "k": [
            {"t": 0, "s": rest, **SP_SMOOTH, "to": [0, 0, 0], "ti": [0, 0, 0]},
            {"t": o0, "s": rest, **SP_SMOOTH, "to": [side * 12, 0, 0], "ti": [0, side * 10, 0]},
            {"t": o1, "s": barp, **SP_SMOOTH, "to": [0, 0, 0], "ti": [0, 0, 0]},
            {"t": c0, "s": barp, **SP_SMOOTH, "to": [0, -side * 10, 0], "ti": [side * 12, 0, 0]},
            {"t": c1, "s": end_rest},
        ]}

    # rotation (counter-clockwise, matching the orbit): 0 -> -90 with overshoot; close -90 -> -180
    # (a line at -180deg looks the same as 0deg)
    rot = {"a": 1, "k": [
        kf(0, 0), kf(o0, 0), kf(o1 - 5, -101), kf(o1, -90, SETTLE),
        kf(c0, -90), kf(c1 - 4, -184), kf(c1, -180, None),
    ]}

    # length (pulse lives here)
    full, lo = BAR_LEN[i], BAR_LEN[i] * PULSE_LO[i]
    # outer lines shrink early in their swing so they don't sweep across the middle bar
    early = [] if side == 0 else [kf(o0 + 9, [seg(full * 1.15)])]
    late = [] if side == 0 else [kf(c1 - 9, [seg(full * 1.15)])]
    length = [
        kf(0, [seg(LINE_LEN)]), kf(o0, [seg(LINE_LEN)]), *early,
        kf(o1 - 5, [seg(full * 1.12)]), kf(30, [seg(full)], SETTLE),
        kf(56, [seg(lo)], SNAP), kf(60, [seg(full)], SETTLE),
        kf(86, [seg(lo)], SNAP), kf(90, [seg(full)]),
        kf(c0, [seg(full)]), *late, kf(c1, [seg(LINE_LEN)], None),
    ]
    # make sure keyframes are strictly increasing in time
    def dedupe(keys):
        out = []
        for k in keys:
            if out and k["t"] <= out[-1]["t"]:
                out[-1] = k
            else:
                out.append(k)
        return out
    rot["k"] = dedupe(rot["k"])
    length = dedupe(length)
    if pos["a"] == 1:
        pos["k"] = dedupe(pos["k"])

    return {
        "ddd": 0, "ind": i + 1, "ty": 4, "nm": f"line {i + 1}", "sr": 1,
        "ks": {"o": {"a": 0, "k": 100}, "r": rot, "p": pos, "a": {"a": 0, "k": [0, 0, 0]}, "s": {"a": 0, "k": [100, 100, 100]}},
        "ao": 0,
        "shapes": [{
            "ty": "gr", "nm": "g",
            "it": [
                {"ty": "sh", "nm": "path", "ks": {"a": 1, "k": length}},
                {"ty": "st", "nm": "stroke", "c": {"a": 0, "k": [1, 1, 1, 1]}, "o": {"a": 0, "k": 100}, "w": {"a": 0, "k": STROKE}, "lc": 2, "lj": 2, "ml": 4},
                {"ty": "tr", "p": {"a": 0, "k": [0, 0]}, "a": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [100, 100]}, "r": {"a": 0, "k": 0}, "o": {"a": 0, "k": 100}, "sk": {"a": 0, "k": 0}, "sa": {"a": 0, "k": 0}},
            ],
        }],
        "ip": 0, "op": END, "st": 0, "bm": 0,
    }

data = {
    "v": "5.7.4", "fr": 60, "ip": 0, "op": END, "w": 96, "h": 84, "nm": "menu-soundbars", "ddd": 0,
    "assets": [], "layers": [layer(i) for i in range(3)],
    "markers": [{"tm": 0, "cm": "open", "dr": 30}, {"tm": 30, "cm": "pulse", "dr": 60}, {"tm": 90, "cm": "close", "dr": 30}],
}
json.dump(data, open(sys.argv[1], "w"), separators=(",", ":"))
