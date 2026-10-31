import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H,W,_ = im.shape
mn = im.min(2); spread = im.max(2)-mn
white = (mn > 228) & (spread < 22)
lab, n = nd.label(white)
border = np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]]))
bg = np.isin(lab, border[border>0])
# also enclosed white pockets that are large (gaps between arms etc.)
sizes = nd.sum(white, lab, range(1,n+1))
for i,s in enumerate(sizes,1):
    if s > 1500 and i not in border: bg |= lab==i
fg = ~bg
fg = nd.binary_opening(fg, iterations=1)
# soft alpha: every silhouette is bounded by a dark outline, so in the outer edge band
# treat each pixel as outline-over-white and recover coverage from its brightness
fg = nd.binary_dilation(fg, iterations=1)
edge = fg & ~nd.binary_erosion(fg, iterations=4)
a = fg.astype(np.float32)
lum = im.mean(2)
# only fade light pixels that sit OUTSIDE the outline (connected to the background),
# so white interiors (sneakers, white bass) next to their outline stay opaque
light = edge & (lum > 110)
cl, _ = nd.label(light | ~fg)
outside_ids = np.unique(cl[~fg]); outside_ids = outside_ids[outside_ids > 0]
edge = (edge & (lum <= 110)) | (light & np.isin(cl, outside_ids))
a[edge] = np.clip((255 - lum[edge]) / (255 - 70), 0, 1) ** 1.15
a[a < 0.12] = 0
rgb = im.copy()
m = edge & (a > 0)
rgb[m] = np.clip((im[m] - 255 * (1 - a[m, None])) / a[m, None], 0, 255)
rgb[a == 0] = 0
rgba = np.dstack([rgb, a*255]).astype(np.uint8)
Image.fromarray(rgba).save(out)
lab2,n2 = nd.label(fg)
objs = nd.find_objects(lab2)
for i,o in enumerate(objs,1):
    s = (lab2[o]==i).sum()
    if s>2000: print(i, s, 'x', o[1].start, o[1].stop, 'y', o[0].start, o[0].stop)
