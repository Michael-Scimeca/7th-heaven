"""Green-screen key for the Midjourney band video.
Background is near-pure green (r,b ~0); the drumsticks are pale mint (high r,b), so
the matte keys on how much green exceeds red/blue rather than on hue alone."""
import sys, glob, os, numpy as np
from PIL import Image
from scipy import ndimage as nd
src_dir, out_dir = sys.argv[1], sys.argv[2]
os.makedirs(out_dir, exist_ok=True)
K = np.array([2, 251, 7], np.float32)
KD = K[1] - max(K[0], K[2])
for f in sorted(glob.glob(f'{src_dir}/*.png')):
    p = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
    r, g, b = p[..., 0], p[..., 1], p[..., 2]
    mx = np.maximum(r, b); d = g - mx
    bg = (mx < 45) & (g > 190)                       # certain background
    near = nd.binary_dilation(bg, iterations=5)      # only the edge zone can be partially transparent
    a = np.ones_like(g)
    dark = near & (mx < 50)                          # black outline blended into green
    a[dark] = 1 - np.clip(d[dark] / KD, 0, 1)
    lite = near & ~dark                              # coloured edge blended into green
    a[lite] = 1 - np.clip((d[lite] - 45) / (KD - 45), 0, 1)
    a[bg] = 0
    a = np.where(a < 0.06, 0, a)
    # un-mix the green out of partially transparent pixels, then clamp leftover spill on edges
    out = p.copy()
    m = (a > 0) & (a < 1)
    out[m] = np.clip((p[m] - (1 - a[m, None]) * K) / a[m, None], 0, 255)
    sp = near & (a > 0)
    # mint drumsticks are high in BOTH red and blue; green fringe on hair/skin/outline is not
    mn = np.minimum(out[..., 0], out[..., 2]); mxo = np.maximum(out[..., 0], out[..., 2])
    mint = (out[..., 2] > 110) & (out[..., 0] > 80) & (out[..., 2] >= out[..., 0] - 10)
    cap = np.where(mint, mxo + 70, mxo + 12)
    out[..., 1] = np.where(a > 0, np.minimum(out[..., 1], cap), out[..., 1])
    out[a == 0] = 0
    Image.fromarray(np.dstack([out, a * 255]).astype(np.uint8)).save(f'{out_dir}/{os.path.basename(f)}')
print('done')
