/**
 * Halftone page transition shader.
 *
 * Recreates the Buttermax (buttermax.net) page transition: dots grow out of the
 * point the visitor clicked, melt together like liquid (blurred dots summed and
 * cut at a threshold), and reveal the next page. The old page zooms toward the
 * viewer, rotates, bulges like a CRT and splits red/blue vertically; the new page
 * starts at 0.6x and turned, then grows and straightens. A rainbow rim sits just
 * inside each hole for the first half.
 *
 * Both pages are snapshots of the page CONTENT only (transparent backgrounds),
 * so the site's background canvas stays visible the whole time.
 *
 * Timing and transform values were taken from the Buttermax site; the code is our own.
 */

export const HALFTONE_VERT = /* glsl */ `
attribute vec2 p;
varying vec2 vUv;
void main() {
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

export const HALFTONE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform sampler2D uFrom;   // old page content (premultiplied alpha)
uniform sampler2D uTo;     // new page content (premultiplied alpha)
uniform vec4 uFromRect;    // where each snapshot sits on screen: x, y (from top), width, height, as viewport fractions
uniform vec4 uToRect;
uniform float uHasTo;
uniform vec2 uRes;
uniform vec2 uMouse;       // click point, 0..1, y measured from the top
uniform float uT;          // eased progress 0..1
uniform float uBlur;       // 1 -> 1.3 over the run
uniform float uSize2;      // 0.35 -> -0.2 over the run
uniform float uZoom;       // dots across the screen
uniform float uTime;

// tunable (see HalftoneSettings; Buttermax values in brackets)
uniform float uDotBlur;    // [0.55] softness of each dot; higher = more liquid merging
uniform float uSpread;     // [15] how fast the circle grows out of the click point
uniform float uAnchorPull; // [0.2] zoom anchor pulled from the click toward the centre
uniform float uOldZoom;    // [1.2] extra zoom on the old page (1 -> 1 + this)
uniform float uOldTurn;    // [0.3] old page rotation, radians x click x
uniform float uRGB;        // [0.01] red/blue split on the old page
uniform float uCRT;        // [0.1] CRT bulge amount
uniform float uNewScale;   // [0.6] new page starting scale
uniform float uNewTurn;    // [0.3] new page starting rotation, radians x click x
uniform float uRimWidth;   // [0.15] rainbow rim width (0 = off)
uniform float uRimEnd;     // [0.52] progress where the rim has faded out
uniform float uTIn;        // new page progress, eased separately (can overshoot 1 for a spring)
uniform float uNewRise;    // new page starts this far below and floats up
uniform float uNewBlur;    // new page starts blurred
uniform float uNewSplit;   // new page starts with a red/blue split

vec2 scaleAbout(vec2 p, float s, vec2 o) { return (p - o) / s + o; }

vec2 turn(vec2 p, float r) {
  float c = cos(r), s = sin(r);
  vec2 q = p - 0.5;
  q = vec2(c * q.x + s * q.y, -s * q.x + c * q.y);
  return q + 0.5;
}

// CRT-style bulge (barrel) / pinch (pincushion)
vec2 lens(vec2 p, float barrel, float pin) {
  if (barrel > 0.0 || pin > 0.0) {
    p = p * 2.0 - 1.0; p *= 1.0 + length(p) * barrel; p = p * 0.5 + 0.5;
    p = p * 2.0 - 1.0; p *= 1.0 + p.x * p.x * pin;  p = p * 0.5 + 0.5;
  }
  return p;
}

float softDot(vec2 g, vec2 off, float size, float blur) {
  vec2 c = mod(g + off, 3.0) - 1.5;
  return 1.0 - smoothstep(size - blur - 0.02, size + blur + 0.02, length(c));
}

// soft circle growing out of the click point; dots inside it swell first
float growCircle(vec2 m, float scale) {
  float aspect = uRes.x / uRes.y;
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 c = vec2(m.x, 1.0 - m.y) * vec2(aspect, 1.0);
  float r = 0.2 * scale;
  return 1.0 - smoothstep(r - 0.8, r, length(p - c));
}

vec3 hueRGB(float h) {
  return clamp(abs(fract(h + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
}

vec4 pageTex(sampler2D s, vec4 r, vec2 p) {
  vec2 q = vec2((p.x - r.x) / r.z, ((1.0 - p.y) - r.y) / r.w);
  if (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) return vec4(0.0);
  return texture2D(s, vec2(q.x, 1.0 - q.y));
}

// new page sample with optional blur (9 taps)
vec4 newTex(vec2 p, float r) {
  if (r < 0.0005) return pageTex(uTo, uToRect, p);
  vec2 k = vec2(r / (uRes.x / uRes.y), r);
  vec4 acc = pageTex(uTo, uToRect, p) * 0.2;
  acc += (pageTex(uTo, uToRect, p + vec2(k.x, 0.0)) + pageTex(uTo, uToRect, p - vec2(k.x, 0.0))
        + pageTex(uTo, uToRect, p + vec2(0.0, k.y)) + pageTex(uTo, uToRect, p - vec2(0.0, k.y))) * 0.12;
  acc += (pageTex(uTo, uToRect, p + k * 0.7) + pageTex(uTo, uToRect, p - k * 0.7)
        + pageTex(uTo, uToRect, p + vec2(k.x, -k.y) * 0.7) + pageTex(uTo, uToRect, p + vec2(-k.x, k.y) * 0.7)) * 0.08;
  return acc;
}

void main() {
  float t = uT;
  vec2 m = uMouse;

  // ---- dots ----
  vec2 sq = vUv / vec2(1.0, uRes.x / uRes.y);
  vec2 g = mix(lens(sq, uCRT, -uCRT), scaleAbout(sq, 1.0 + t, m), t) * uZoom;
  float circle = growCircle(m, clamp(t * uSpread, 0.0, uSpread));
  float grow = clamp(t * 2.0, 0.0, 2.0) * circle;
  float blur = uDotBlur * uBlur;
  float dots = -0.1;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 q = g + vec2(fi, 0.0);
    dots += softDot(q, vec2(0.0, fi), 0.35 * grow, blur);
    dots += softDot(q, vec2(1.0, fi), 0.35 * grow, blur);
    dots += softDot(q, vec2(2.0, fi), uSize2 * grow, 0.0);
  }
  dots *= 1.0 - smoothstep(0.6, 1.0, t);
  float field = dots + circle * 0.5;

  // ---- old page: zoom toward the anchor, rotate, bulge, vertical RGB split ----
  vec2 o = mix(m, vec2(0.5), uAnchorPull);
  o.y += 0.2 - t * 0.5;
  vec2 uf = mix(vUv, lens(vUv, uCRT, -uCRT), t);
  uf = scaleAbout(uf, 1.0 + t * uOldZoom, o);
  uf = turn(uf, -t * m.x * uOldTurn);
  vec2 sh = vec2(0.0, uRGB * t);
  vec4 cR = pageTex(uFrom, uFromRect, uf + sh);
  vec4 cG = pageTex(uFrom, uFromRect, uf);
  vec4 cB = pageTex(uFrom, uFromRect, uf - sh);
  vec4 oldC = vec4(cR.r, cG.g, cB.b, max(cG.a, max(cR.a, cB.a)));

  // ---- new page: starts smaller and turned (optionally lower, blurred, colour-split) and settles ----
  float ti = uTIn;              // may overshoot 1 for a spring landing
  float rest = 1.0 - ti;        // what's left of the arrival (negative while overshooting)
  vec2 o2 = o;
  o2.y -= t * 0.5;
  vec2 ut = mix(lens(vUv, -uCRT, uCRT), vUv, clamp(ti, 0.0, 1.0));
  ut = scaleAbout(ut, max(0.05, uNewScale + (1.0 - uNewScale) * ti), o2);
  ut = turn(ut, rest * m.x * uNewTurn);
  ut.y += uNewRise * rest;      // content sits lower, then floats up
  float nb = uNewBlur * clamp(rest, 0.0, 1.0);
  vec4 newC = vec4(0.0);
  if (uHasTo > 0.5) {
    float ns = uNewSplit * clamp(rest, 0.0, 1.0);
    if (ns > 0.0001) {
      vec4 nR = newTex(ut + vec2(0.0, ns), nb);
      vec4 nG = newTex(ut, nb);
      vec4 nB = newTex(ut - vec2(0.0, ns), nb);
      newC = vec4(nR.r, nG.g, nB.b, max(nG.a, max(nR.a, nB.a)));
    } else {
      newC = newTex(ut, nb);
    }
  }

  // ---- rainbow rim just inside each hole ----
  float dist = length(vUv - m);
  vec3 rainbow = mix(vec3(1.0), hueRGB(0.5 + sin(uTime * 0.2 - dist * 6.0 + t * 5.0 + dots * 8.0 + circle * 2.0)), 0.85);
  float rim = uRimWidth * mix(1.0, 0.667, smoothstep(0.2, 1.0, dist)) * (1.0 - smoothstep(0.2, max(uRimEnd, 0.21), t));

  if (field < 0.5) gl_FragColor = oldC;
  else if (field < 0.5 + rim) gl_FragColor = vec4(rainbow, 1.0);
  else gl_FragColor = newC;
}`;
