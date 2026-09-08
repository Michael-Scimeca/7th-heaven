"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import LazyMount from "@/components/LazyMount";
import { FAQS_EXTENDED } from "../cruiseData";

export default function CruiseFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div id="faqs" className="pt-20 pb-10" style={{ contentVisibility: "auto", containIntrinsicSize: "600px" }}>
      <LazyMount minHeight="600px" rootMargin="300px 0px">
        <div className="text-left w-full mb-10">
          <h2 className="font-bold uppercase text-white leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
            Frequently Asked <span className="accent-gradient-text">Questions</span>
          </h2>
          <p className="mt-3 font-semibold max-w-2xl">
            Find answers to important passport requirements, dining configurations, payment plans, and booking rules.
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-3 mb-0 text-left max-w-4xl">
          {FAQS_EXTENDED.map((faq, i) => (
            <div key={faq.q} className="bg-[#59595929] border border-white/10 backdrop-blur-[16px] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/10 transition-colors cursor-pointer rounded-none border-none bg-transparent"
              >
                <span className="font-bold text-white pr-4">{faq.q}</span>
                <div className={`p-1.5 rounded-lg bg-white/10 text-white/70 transform transition-transform duration-200 shrink-0 ${openFaq === i ? 'rotate-90 text-purple-400' : ''}`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
              {openFaq === i && (
                <div className="px-5 py-4 bg-[#59595929] border border-white/10 backdrop-blur-[16px]">
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
