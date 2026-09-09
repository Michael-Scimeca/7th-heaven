"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import LazyMount from "@/components/LazyMount";
import { FAQS_EXTENDED } from "../cruiseData";

interface CruiseFaqSectionProps {
  sanityContent?: any;
}

export default function CruiseFaqSection({ sanityContent }: CruiseFaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqList = sanityContent?.faqs?.length
    ? sanityContent.faqs.map((item: any) => ({ q: item.question, a: item.answer }))
    : FAQS_EXTENDED;

  const sectionTitle = sanityContent?.sections?.find((s: any) => s.sectionId === "faqs")?.title || "Frequently Asked Questions";
  const sectionSubtitle = sanityContent?.sections?.find((s: any) => s.sectionId === "faqs")?.subtitle || "Find answers to important passport requirements, dining configurations, payment plans, and booking rules.";

  return (
    <div id="faqs" className="pt-20 pb-10" style={{ contentVisibility: "auto", containIntrinsicSize: "600px" }}>
      <LazyMount minHeight="600px" rootMargin="300px 0px">
        <div className="text-left w-full mb-10">
          <h2 className="uppercase text-white leading-none">
            {sectionTitle}
          </h2>
          <p className="mt-3 font-semibold max-w-2xl">
            {sectionSubtitle}
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-3 mb-0 text-left max-w-4xl">
          {faqList.map((faq: { q: string; a: string }, i: number) => (
            <div key={faq.q} className="bg-[#59595929] border border-white/10 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/10 transition-colors cursor-pointer rounded-none border-none bg-transparent">
                <span className="text-white pr-4 font-bold">{faq.q}</span>
                <div className={`p-1.5 rounded-lg bg-white/10 text-white/70 transform transition-transform duration-200 shrink-0 ${openFaq === i ? 'rotate-90 text-purple-400' : ''}`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
              {openFaq === i && (
                <div className="px-5 py-4 bg-[#59595929] border border-white/10">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </LazyMount>
    </div>
  );
}
