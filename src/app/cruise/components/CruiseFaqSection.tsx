"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import LazyMount from "@/components/LazyMount";
import { FAQS_EXTENDED } from "../cruiseData";

interface CruiseFaqSectionProps {
  sanityContent?: any;
}

export default function CruiseFaqSection({ sanityContent }: CruiseFaqSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqList = sanityContent?.faqs?.length
    ? sanityContent.faqs.map((item: any) => ({ q: item.question, a: item.answer }))
    : FAQS_EXTENDED;

  const sectionTitle = sanityContent?.sections?.find((s: any) => s.sectionId === "faqs")?.title || "Frequently Asked Questions";
  const sectionSubtitle = sanityContent?.sections?.find((s: any) => s.sectionId === "faqs")?.subtitle || "Find answers to important passport requirements, dining configurations, payment plans, and booking rules.";

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <LazyMount as="section" id="faqs" aria-label="Frequently Asked Questions" className="py-section-fluid site-container" minHeight="600px" rootMargin="300px 0px" style={{ contentVisibility: "auto", containIntrinsicSize: "600px" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center w-full mb-10">
          <h2>
            {sectionTitle}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Clean Border-Separated Accordion Dropdown Layout */}
        <ul className="border-t border-white/10">
          {faqList.map((faq: { q: string; a: string }, i: number) => {
            const isExpanded = expandedIndex === i;
            return (
              <li
                key={faq.q}
                className="overflow-hidden transition-colors duration-300 border-b border-white/10"
                style={{
                  borderBottomColor: isExpanded ? 'rgba(192, 132, 252, 0.6)' : undefined
                }}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left py-6 flex items-center justify-between gap-4 focus:outline-none cursor-pointer group">
                  <span className={`sm:text-lg transition-colors duration-200 ${isExpanded ? "text-purple-300" : "text-white group-hover:text-purple-200"}`}>
                    {faq.q}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-white/10 text-white/70 transform transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-90 text-purple-400" : ""}`}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>

                {/* Expanded Answer with smooth height transition */}
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-label={faq.q}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="pb-6 text-left">
                      <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </LazyMount>
  );
}
