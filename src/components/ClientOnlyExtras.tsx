"use client";
import { useState, useEffect, type ComponentType } from "react";

export default function ClientOnlyExtras() {
  const [mounted, setMounted] = useState(false);
  const [DevGuide, setDevGuide] = useState<ComponentType | null>(null);
  const [Drawer, setDrawer] = useState<ComponentType | null>(null);
  const [Vitals, setVitals] = useState<ComponentType | null>(null);
  const [ShaderComp, setShaderComp] = useState<ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);

    const loadExtras = () => {
      import("@/components/DevGuideLine").then((m) => setDevGuide(() => m.default));
      import("@/components/PagesPillDrawer").then((m) => setDrawer(() => m.default));
      import("@/components/WebVitalsReporter").then((m) => setVitals(() => m.default));

      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
      if (isDesktop) {
        import("@/components/HomeShaderGradient").then((m) => setShaderComp(() => m.default));
      }
    };

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(loadExtras, { timeout: 3000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const t = setTimeout(loadExtras, 2000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      {DevGuide && <DevGuide />}
      {Drawer && <Drawer />}
      {Vitals && <Vitals />}
      {ShaderComp && <ShaderComp />}
    </>
  );
}
