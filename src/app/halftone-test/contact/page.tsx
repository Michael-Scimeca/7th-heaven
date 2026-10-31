import { HalftoneLink } from "@/components/HalftoneTransition/HalftoneTransition";
import { TestNav } from "../_components/TestNav";

export default function HalftoneContactPage() {
  return (
    <main className="flex min-h-[100svh] flex-col gap-10 px-6 pt-32 pb-16 md:px-12 lg:px-20">
      <TestNav current="/halftone-test/contact" />
      <p className="font-mono text-xs tracking-[0.14em] text-white/70 uppercase">Booking</p>
      {/* heading-size-ok: transition test page */}
      <h1 className="font-heading text-[clamp(56px,11vw,168px)] leading-[0.9] uppercase">
        Book <span className="text-[#ffb627]">the band</span>
      </h1>
      <div className="mt-auto grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
        <p className="max-w-[46ch] text-base text-white/85 md:text-lg">
          Weddings, festivals, corporate nights. Tell us the date and we&apos;ll check the calendar.
        </p>
        <div className="grid gap-6">
          {["Name", "Email", "Event date"].map((f) => (
            <div key={f} className="border-b-2 border-white/80 pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
              {f}
            </div>
          ))}
          <HalftoneLink
            href="/halftone-test"
            className="justify-self-start rounded-full bg-[#ffb627] px-6 py-3 text-xs font-semibold tracking-[0.12em] text-[#1a0f12] uppercase transition-transform duration-200 hover:scale-[1.03]"
          >
            See tour dates
          </HalftoneLink>
        </div>
      </div>
    </main>
  );
}
