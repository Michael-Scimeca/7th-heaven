/**
 * Background shader ported from federicopian.com: three samples of 3D simplex noise
 * drive both the blend between two colors and how much of them covers the base color,
 * with a soft hole that trails the cursor.
 */
export const NOISE_VERT = `attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;

export const NOISE_FRAG = `precision highp float;
varying vec2 vUv;
uniform float u_ratio, u_time, u_mouseInteraction, u_coverage, u_lift;
uniform vec2 u_point, u_resolution;
uniform vec3 u_color1, u_color2, u_bg;

vec4 permute(vec4 x){ return mod(((x*34.)+1.)*x, 289.); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - .85373472095314*r; }

float snoise(vec3 v){
  const vec2 C = vec2(1./6., 1./3.);
  const vec4 D = vec4(0., .5, 1., 2.);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1. - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.*C.xxx;
  vec3 x3 = x0 - 1. + 3.*C.xxx;
  i = mod(i, 289.);
  vec4 p = permute(permute(permute(i.z + vec4(0., i1.z, i2.z, 1.)) + i.y + vec4(0., i1.y, i2.y, 1.)) + i.x + vec4(0., i1.x, i2.x, 1.));
  float n_ = 1./7.;
  vec3 ns = n_*D.wyz - D.xzx;
  vec4 j = p - 49.*floor(p*ns.z*ns.z);
  vec4 x_ = floor(j*ns.z);
  vec4 y_ = floor(j - 7.*x_);
  vec4 x = x_*ns.x + ns.yyyy;
  vec4 y = y_*ns.x + ns.yyyy;
  vec4 h = 1. - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2. + 1.;
  vec4 s1 = floor(b1)*2. + 1.;
  vec4 sh = -step(h, vec4(0.));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.);
  m = m*m;
  return 42.*dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float circle_s(vec2 dist, float radius){
  return smoothstep(0., radius, pow(dot(dist, dist), .6)*.1);
}

void main(){
  vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.);
  vec2 uv = vUv*aspect;
  vec2 mouse = vUv - u_point;
  mouse.y /= u_ratio;

  float noise  = snoise(vec3(uv, u_time*3.));
  float noise1 = snoise(vec3(uv + .1, u_time*3.));
  float noise2 = snoise(vec3(uv - .1, u_time*3.));

  // reference: alpha = avg(noise). u_coverage / u_lift let a dark palette read (1.0 / 0.0 = exact reference)
  float alpha = (noise + noise1 + noise2)/3.*u_coverage + u_lift;
  alpha *= mix(0.55, 1.0, circle_s(mouse, .015*u_mouseInteraction));

  float x = 1. - noise;
  vec3 col = u_color1/255.;
  vec3 newColor = u_color2/255.;
  float blendFactor = smoothstep(.1, 1., x);
  vec3 blended = mix(newColor, col, blendFactor);

  vec3 outc = mix(u_bg/255., blended, clamp(alpha, 0., 1.));
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)))*43758.5453);
  gl_FragColor = vec4(outc + (dither - .5)/255., 1.);
}`;
