"use client";

import React, { useEffect, useRef } from "react";

const VS_SOURCE = `
attribute vec3 position;
void main(void){
  gl_Position = vec4(position, 1.0);
}
`;

const FS_SOURCE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision highp float;
#endif

uniform vec2 resolution;
uniform float time;
uniform vec4 mouse;
uniform float flameSpeed;
uniform float flameHeight;
uniform float sparkDensity;
uniform float sparkScale;
uniform int paletteTheme;
uniform int useCustomColors;
uniform vec3 colorBase;
uniform vec3 colorMid;
uniform vec3 colorCore;
uniform vec3 colorSpark;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

float prng(in vec2 seed) {
  seed = fract (seed * vec2 (5.3983, 5.4427));
  seed += dot (seed.yx, seed.xy + vec2 (21.5351, 14.3137));
  return fract (seed.x * seed.y );
}

float PI = 3.1415926535897932384626433832795;

vec3 flamePalette(float t, int theme) {
  float s = clamp(t, 0.0, 1.0);
  if (useCustomColors == 1) {
    if (s < 0.5) {
      return mix(colorBase, colorMid, s * 2.0);
    } else {
      return mix(colorMid, colorCore, (s - 0.5) * 2.0);
    }
  }
  if (theme == 1) { // Classic Fiery Orange
    vec3 c0 = vec3(0.2, 0.02, 0.0);
    vec3 c1 = vec3(0.6, 0.1, 0.0);
    vec3 c2 = vec3(0.9, 0.35, 0.0);
    vec3 c3 = vec3(1.0, 0.65, 0.1);
    vec3 c4 = vec3(1.0, 0.95, 0.5);
    return mix(c0, c4, s);
  } else if (theme == 2) { // Cyan Cyber
    vec3 c0 = vec3(0.0, 0.05, 0.2);
    vec3 c1 = vec3(0.0, 0.25, 0.55);
    vec3 c2 = vec3(0.0, 0.6, 0.85);
    vec3 c3 = vec3(0.2, 0.9, 0.95);
    vec3 c4 = vec3(0.85, 1.0, 1.0);
    return mix(c0, c4, s);
  } else if (theme == 3) { // Toxic Emerald
    vec3 c0 = vec3(0.0, 0.1, 0.02);
    vec3 c1 = vec3(0.05, 0.45, 0.1);
    vec3 c2 = vec3(0.2, 0.85, 0.25);
    vec3 c3 = vec3(0.65, 1.0, 0.35);
    vec3 c4 = vec3(0.9, 1.0, 0.75);
    return mix(c0, c4, s);
  } else if (theme == 4) { // Silver Monochrome
    vec3 c0 = vec3(0.05, 0.05, 0.08);
    vec3 c1 = vec3(0.2, 0.2, 0.25);
    vec3 c2 = vec3(0.55, 0.55, 0.6);
    vec3 c3 = vec3(0.85, 0.85, 0.9);
    vec3 c4 = vec3(1.0, 1.0, 1.0);
    return mix(c0, c4, s);
  }
  // Default 0: Deep Violet / Dark Indigo / Burnt Orange
  vec3 c0 = vec3(0.08235, 0.06667, 0.31373);
  vec3 c1 = vec3(0.29020, 0.10588, 0.43529);
  vec3 c2 = vec3(0.37647, 0.04706, 0.49804);
  vec3 c3 = vec3(0.38039, 0.11765, 0.74118);
  vec3 c4 = vec3(0.52157, 0.05882, 0.71765);
  vec3 c5 = vec3(0.64314, 0.24314, 0.09020);
  float val = s * 5.0;
  if (val < 1.0) return mix(c0, c1, val);
  if (val < 2.0) return mix(c1, c2, val - 1.0);
  if (val < 3.0) return mix(c2, c3, val - 2.0);
  if (val < 4.0) return mix(c3, c4, val - 3.0);
  return mix(c4, c5, clamp(val - 4.0, 0.0, 1.0));
}

float noiseStack(vec3 pos,int octaves,float falloff){
  float noise = snoise(vec3(pos));
  float off = 1.0;
  if (octaves>1) {
    pos *= 2.0;
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(vec3(pos));
  }
  if (octaves>2) {
    pos *= 2.0;
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(vec3(pos));
  }
  if (octaves>3) {
    pos *= 2.0;
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(vec3(pos));
  }
  return (1.0+noise)/2.0;
}

vec2 noiseStackUV(vec3 pos,int octaves,float falloff,float diff){
  float displaceA = noiseStack(pos,octaves,falloff);
  float displaceB = noiseStack(pos+vec3(3984.293,423.21,5235.19),octaves,falloff);
  return vec2(displaceA,displaceB);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  float time = time;
  vec2 res = resolution.xy;
  vec2 drag = mouse.xy + sin(time);
  vec2 offset = mouse.xy + cos(time);

  float xpart = fragCoord.x/res.x;
  float ypart = fragCoord.y/res.y;

  float clip = res.y * 0.95 * max(0.1, flameHeight);
  float ypartClip = fragCoord.y/clip;
  float ypartClippedFalloff = clamp(2.0-ypartClip,0.0,1.0);
  float ypartClipped = min(ypartClip,1.0);
  float ypartClippedn = 1.0-ypartClipped;

  float xfuel = 1.0-abs(2.0*xpart-1.0);

  float realTime = flameSpeed * time;

  vec2 coordScaled = 0.01*fragCoord - 0.02*vec2(offset.x,0.0);
  vec3 position = vec3(coordScaled,0.0) + vec3(1223.0,6434.0,8425.0);
  vec3 flow = vec3(4.1*(0.5-xpart)*pow(ypartClippedn,4.0),-2.0*xfuel*pow(ypartClippedn,64.0),0.0);
  vec3 timing = realTime*vec3(0.0,-1.7,1.1) + flow;

  vec3 displacePos = vec3(1.0,0.5,1.0)*2.4*position+realTime*vec3(0.01,-0.7,1.3);
  vec3 displace3 = vec3(noiseStackUV(displacePos,2,0.4,0.1),0.0);

  vec3 noiseCoord = (vec3(2.0,1.0,1.0)*position+timing+0.4*displace3)/1.0;
  float noise = noiseStack(noiseCoord,3,0.4);

  float flames = pow(ypartClipped,0.3*xfuel)*pow(noise,0.3*xfuel);

  float f = ypartClippedFalloff*pow(1.0-flames*flames*flames,8.0);
  vec3 fire = flamePalette(f, paletteTheme) * (0.3 + 1.7*f) * smoothstep(0.02, 0.15, f);

  float sparkGridSize = 18.0;
  vec2 sparkCoord = fragCoord - vec2(2.0*offset.x,190.0*realTime);
  sparkCoord -= 30.0*noiseStackUV(0.01*vec3(sparkCoord,30.0*time),1,0.4,0.1);
  sparkCoord += 100.0*flow.xy;
  if (mod(sparkCoord.y/sparkGridSize,2.0)<1.0) sparkCoord.x += 0.5*sparkGridSize;
  vec2 sparkGridIndex = vec2(floor(sparkCoord/sparkGridSize));
  float sparkRandom = prng(sparkGridIndex);
  float sparkRiseSpan = (36.0 - 24.0 * sparkRandom) * 2.5;
  float sparkLife = min(10.0*(1.0-min((sparkGridIndex.y+(190.0*realTime/sparkGridSize))/sparkRiseSpan,1.0)),1.0);
  vec3 sparks = vec3(0.0);
  if (sparkLife > 0.0 && sparkDensity > 0.0) {
    float sparkSize = xfuel*xfuel*sparkRandom*sparkScale;
    float sparkRadians = 999.0*sparkRandom*2.0*PI + 2.0*time;
    vec2 sparkCircular = vec2(sin(sparkRadians),cos(sparkRadians));
    vec2 sparkOffset = (0.5-sparkSize)*sparkGridSize*sparkCircular;
    vec2 sparkModulus = mod(sparkCoord+sparkOffset,sparkGridSize) - 0.5*vec2(sparkGridSize);
    float sparkLength = length(sparkModulus);
    float sparksGray = max(0.0, 1.0 - sparkLength/(sparkSize*sparkGridSize));
    vec3 sparkColor = useCustomColors == 1 ? colorSpark : (paletteTheme == 2 ? vec3(0.14, 0.85, 1.0) : paletteTheme == 3 ? vec3(0.4, 1.0, 0.2) : paletteTheme == 4 ? vec3(0.9, 0.9, 1.0) : vec3(1.0, 0.38, 0.14));
    sparks = sparkLife * sparkDensity * sparksGray * sparkColor;
  }

  vec3 col = max(fire,sparks);
  float alpha = clamp(length(col) * 1.8, 0.0, 1.0);
  fragColor = vec4(col, alpha);
}

void main() {
  vec4 colorx;
  vec2 uv = gl_FragCoord.xy;
  mainImage(colorx,uv);
  gl_FragColor = colorx;
}
`;

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  }
  if (c.length !== 6) return [0.5, 0.5, 0.5];
  return [
    parseInt(c.substring(0, 2), 16) / 255,
    parseInt(c.substring(2, 4), 16) / 255,
    parseInt(c.substring(4, 6), 16) / 255,
  ];
}

export interface PixelFireplaceCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  flameSpeed?: number;
  flameHeight?: number;
  sparkDensity?: number;
  sparkScale?: number;
  paletteTheme?: number;
  useCustomColors?: boolean;
  colorBaseHex?: string;
  colorMidHex?: string;
  colorCoreHex?: string;
  colorSparkHex?: string;
}

export default function PixelFireplaceCanvas({
  className = "",
  style,
  flameSpeed = 0.6,
  flameHeight = 1.5,
  sparkDensity = 2.0,
  sparkScale = 0.1,
  paletteTheme = 0,
  useCustomColors = false,
  colorBaseHex = "#151150",
  colorMidHex = "#611EBD",
  colorCoreHex = "#FF7A29",
  colorSparkHex = "#FF6124",
}: PixelFireplaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const propsRef = useRef({
    flameSpeed,
    flameHeight,
    sparkDensity,
    sparkScale,
    paletteTheme,
    useCustomColors,
    colorBaseHex,
    colorMidHex,
    colorCoreHex,
    colorSparkHex,
  });

  useEffect(() => {
    propsRef.current = {
      flameSpeed,
      flameHeight,
      sparkDensity,
      sparkScale,
      paletteTheme,
      useCustomColors,
      colorBaseHex,
      colorMidHex,
      colorCoreHex,
      colorSparkHex,
    };
  }, [
    flameSpeed,
    flameHeight,
    sparkDensity,
    sparkScale,
    paletteTheme,
    useCustomColors,
    colorBaseHex,
    colorMidHex,
    colorCoreHex,
    colorSparkHex,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    }) ||
      canvas.getContext("experimental-webgl", {
        alpha: true,
        premultipliedAlpha: false,
      })) as WebGLRenderingContext | null;
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function compileShader(src: string, type: number) {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    const vertexShader = compileShader(VS_SOURCE, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(FS_SOURCE, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    const positions = new Float32Array([
      -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "resolution");
    const uTime = gl.getUniformLocation(program, "time");
    const uMouse = gl.getUniformLocation(program, "mouse");
    const uFlameSpeed = gl.getUniformLocation(program, "flameSpeed");
    const uFlameHeight = gl.getUniformLocation(program, "flameHeight");
    const uSparkDensity = gl.getUniformLocation(program, "sparkDensity");
    const uSparkScale = gl.getUniformLocation(program, "sparkScale");
    const uPaletteTheme = gl.getUniformLocation(program, "paletteTheme");
    const uUseCustomColors = gl.getUniformLocation(program, "useCustomColors");
    const uColorBase = gl.getUniformLocation(program, "colorBase");
    const uColorMid = gl.getUniformLocation(program, "colorMid");
    const uColorCore = gl.getUniformLocation(program, "colorCore");
    const uColorSpark = gl.getUniformLocation(program, "colorSpark");

    let mouseX = 0.5;
    let mouseY = 0.5;

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      if (typeof window === "undefined") return;
      mouseX = e.clientX / window.innerWidth;
      mouseY = 1.0 - e.clientY / window.innerHeight;
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    let animFrameId = 0;
    let isVisible = true;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animFrameId) {
            animFrameId = requestAnimationFrame(render);
          }
        });
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(canvas);

    function resize() {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      const targetW = Math.max(1, Math.floor(width * dpr));
      const targetH = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        gl.viewport(0, 0, targetW, targetH);
      }
    }

    const resizeObserver = new ResizeObserver(() => resize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    const startTime = performance.now();
    function render(now: number) {
      if (!gl || !canvas || !isVisible) {
        animFrameId = 0;
        return;
      }
      const t = (now - startTime) * 0.001;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform4f(uMouse, mouseX, mouseY, 0.0, 0.0);
      gl.uniform1f(uFlameSpeed, propsRef.current.flameSpeed);
      gl.uniform1f(uFlameHeight, propsRef.current.flameHeight);
      gl.uniform1f(uSparkDensity, propsRef.current.sparkDensity);
      gl.uniform1f(uSparkScale, propsRef.current.sparkScale);
      gl.uniform1i(uPaletteTheme, propsRef.current.paletteTheme);
      gl.uniform1i(uUseCustomColors, propsRef.current.useCustomColors ? 1 : 0);

      const baseRgb = hexToRgb(propsRef.current.colorBaseHex || "#151150");
      const midRgb = hexToRgb(propsRef.current.colorMidHex || "#611EBD");
      const coreRgb = hexToRgb(propsRef.current.colorCoreHex || "#FF7A29");
      const sparkRgb = hexToRgb(propsRef.current.colorSparkHex || "#FF6124");

      gl.uniform3f(uColorBase, baseRgb[0], baseRgb[1], baseRgb[2]);
      gl.uniform3f(uColorMid, midRgb[0], midRgb[1], midRgb[2]);
      gl.uniform3f(uColorCore, coreRgb[0], coreRgb[1], coreRgb[2]);
      gl.uniform3f(uColorSpark, sparkRgb[0], sparkRgb[1], sparkRgb[2]);

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animFrameId = requestAnimationFrame(render);
    }

    animFrameId = requestAnimationFrame(render);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none block ${className}`}
      style={{
        display: "block",
        ...style,
      }}
    />
  );
}
