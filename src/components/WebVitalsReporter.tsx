"use client";

import { useEffect } from "react";
import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals";

export default function WebVitalsReporter() {
  useEffect(() => {
    // Report Core Web Vitals metrics in production
    if (process.env.NODE_ENV === "production") {
      onLCP((metric) => {
        if (metric.value > 2500) {
          console.warn(`[Core Web Vitals] Poor LCP: ${Math.round(metric.value)}ms`, metric);
        }
      });

      onINP((metric) => {
        if (metric.value > 200) {
          console.warn(`[Core Web Vitals] High INP latency: ${Math.round(metric.value)}ms`, metric);
        }
      });

      onCLS((metric) => {
        if (metric.value > 0.1) {
          console.warn(`[Core Web Vitals] Layout Shift (CLS): ${metric.value.toFixed(3)}`, metric);
        }
      });

      onFCP((metric) => {
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "web_vitals", {
            event_category: "Web Vitals",
            event_action: metric.name,
            event_value: Math.round(metric.value),
            non_interaction: true,
          });
        }
      });

      onTTFB(() => {});
    }
  }, []);

  return null;
}
