"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import Lenis from "lenis"

export default function HeroScrollEffect() {
  const started = useRef(false)

  useEffect(() => {
    // guard against React 18 StrictMode double-invoke in dev
    if (started.current) return
    started.current = true

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      lerp: 0.06,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.2,
      wheelMultiplier: 1.1,
    })
    lenis.on("scroll", ScrollTrigger.update)
    const raf = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      // hero card shrinks and fades — tracks the scroll directly (like Voldog),
      // finishes early over +=400 so it's responsive both ways
      gsap.to("#hero-card", {
        scale: 0.85,
        opacity: 0.9,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: { trigger: "#hero-card", start: "top top", end: "+=400", scrub: true },
      })

      // tour section rises up to meet it — heavier lag over a longer distance
      // (this is the weighted part, matching Voldog's reveal)
      gsap.fromTo("#tour",
        { y: 120, scale: 0.8, opacity: 0.9, transformOrigin: "bottom center" },
        {
          y: 0, scale: 1, opacity: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: "#hero-card", start: "top top", end: "+=700", scrub: 5 },
        }
      )
    })

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener("load", onLoad)

    // cleanup on unmount / route change
    return () => {
      window.removeEventListener("load", onLoad)
      ctx.revert()
      gsap.ticker.remove(raf)
      lenis.destroy()
      started.current = false
    }
  }, [])

  return null
}
