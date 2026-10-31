import { HalftoneLink } from "@/components/HalftoneTransition/HalftoneTransition";

const LINKS = [
  { href: "/halftone-test", label: "Tour" },
  { href: "/halftone-test/media", label: "Media" },
  { href: "/halftone-test/contact", label: "Contact" },
];

export function TestNav({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
      <p className="font-mono text-[11px] tracking-[0.14em] text-white/60 uppercase">
        Halftone transition test · click anything
      </p>
      <nav aria-label="Test pages" className="flex gap-6 text-xs font-semibold tracking-[0.14em] uppercase">
        {LINKS.map((l) => (
          <HalftoneLink
            key={l.href}
            href={l.href}
            aria-current={current === l.href ? "page" : undefined}
            className={`border-b pb-1 transition-colors duration-200 ${current === l.href ? "border-white text-white" : "border-transparent text-white/70 hover:text-white"}`}
          >
            {l.label}
          </HalftoneLink>
        ))}
      </nav>
    </div>
  );
}
