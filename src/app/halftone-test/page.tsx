import { HalftoneLink } from "@/components/HalftoneTransition/HalftoneTransition";
import { TestNav } from "./_components/TestNav";

const SHOWS = [
  { date: "SAT 14 NOV", place: "Chicago, IL · Sample venue" },
  { date: "FRI 20 NOV", place: "Milwaukee, WI · Sample venue" },
  { date: "SAT 05 DEC", place: "Naperville, IL · Sample venue" },
];

export default function HalftoneTourPage() {
  return (
    <main className="flex min-h-[100svh] flex-col gap-10 px-6 pt-32 pb-16 md:px-12 lg:px-20">
      <TestNav current="/halftone-test" />
      <p className="font-mono text-xs tracking-[0.14em] text-white/70 uppercase">Fall tour · sample dates</p>
      {/* heading-size-ok: transition test page */}
      <h1 className="font-heading text-[clamp(56px,11vw,168px)] leading-[0.9] uppercase">
        30 songs in
        <br />
        <span className="text-[#ffb627]">30 minutes</span>
      </h1>
      <div className="mt-auto border-t border-white/15">
        {SHOWS.map((s) => (
          <div key={s.date} className="grid grid-cols-[8rem_1fr_auto] items-center gap-4 border-b border-white/15 py-4 text-sm md:text-base">
            <span className="font-mono text-[#ffb627]">{s.date}</span>
            <span>{s.place}</span>
            <HalftoneLink
              href="/halftone-test/contact"
              className="rounded-full border border-white/40 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-200 hover:bg-white hover:text-black"
            >
              Book
            </HalftoneLink>
          </div>
        ))}
      </div>
    </main>
  );
}
