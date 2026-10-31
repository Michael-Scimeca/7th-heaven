import { HalftoneLink } from "@/components/HalftoneTransition/HalftoneTransition";
import { TestNav } from "../_components/TestNav";

const TILES = [
  { title: "Live at Arcada", tag: "Video", tone: "from-[#850fb7] to-[#2b0f3a]", href: "/halftone-test" },
  { title: "30 in 30 medley", tag: "Video", tone: "from-[#ffb627] to-[#a43e17]", href: "/halftone-test/contact" },
  { title: "Summer fest", tag: "Photos", tone: "from-[#611ebd] to-[#151150]", href: "/halftone-test" },
  { title: "Studio sessions", tag: "Audio", tone: "from-[#a43e17] to-[#4a1b6f]", href: "/halftone-test/contact" },
  { title: "Fan wall", tag: "Photos", tone: "from-[#4a1b6f] to-[#850fb7]", href: "/halftone-test" },
  { title: "Behind the scenes", tag: "Video", tone: "from-[#151150] to-[#611ebd]", href: "/halftone-test/contact" },
];

export default function HalftoneMediaPage() {
  return (
    <main className="flex min-h-[100svh] flex-col gap-10 px-6 pt-32 pb-16 md:px-12 lg:px-20">
      <TestNav current="/halftone-test/media" />
      {/* heading-size-ok: transition test page */}
      <h1 className="font-heading text-[clamp(56px,9vw,140px)] leading-[0.9] uppercase">All media</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <HalftoneLink key={t.title} href={t.href} className="group flex flex-col gap-3">
            <div className={`aspect-[16/10] w-full rounded-lg bg-gradient-to-br ${t.tone} transition-transform duration-300 group-hover:scale-[1.02]`} />
            <div className="flex items-center justify-between text-xs font-semibold tracking-[0.12em] uppercase">
              <span>{t.title}</span>
              <span className="text-white/60">{t.tag}</span>
            </div>
          </HalftoneLink>
        ))}
      </div>
    </main>
  );
}
