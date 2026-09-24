"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import LazyMount from "@/components/LazyMount";
import { FAQS_EXTENDED } from "../cruiseData";

interface CruiseFaqSectionProps {
  sanityContent?: any;
}

export default function CruiseFaqSection({
  sanityContent,
}: CruiseFaqSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqList = sanityContent?.faqs?.length
    ? sanityContent.faqs.map((item: any) => ({
        q: item.question,
        a: item.answer,
      }))
    : FAQS_EXTENDED;

  const sectionTitle =
    sanityContent?.sections?.find((s: any) => s.sectionId === "faqs")?.title ||
    "Frequently Asked Questions";
  const sectionSubtitle =
    sanityContent?.sections?.find((s: any) => s.sectionId === "faqs")
      ?.subtitle ||
    "Find answers to important passport requirements, dining configurations, payment plans, and booking rules.";

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <LazyMount
      as="section"
      id="faqs"
      aria-label="Frequently Asked Questions"
      className="py-section-fluid site-container"
      minHeight="600px"
      rootMargin="300px 0px"
      style={{ contentVisibility: "auto", containIntrinsicSize: "600px" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 w-full text-center">
          <h2>{sectionTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl">{sectionSubtitle}</p>
        </div>

        {/* Clean Border-Separated Accordion Dropdown Layout */}
        <ul className="border-t border-white/10">
          {faqList.map((faq: { q: string; a: string }, i: number) => {
            const isExpanded = expandedIndex === i;
            return (
              <li
                key={faq.q}
                className="overflow-hidden border-b border-white/10 transition-colors duration-300"
                style={{
                  borderBottomColor: isExpanded
                    ? "rgba(192, 132, 252, 0.6)"
                    : undefined,
                }}
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => toggleFaq(i)}
                  className="group flex w-full cursor-pointer items-center justify-between gap-4 py-6 text-left focus:outline-none"
                >
                  <span
                    className={`transition-colors duration-200 sm:text-lg ${isExpanded ? "text-purple-300" : "text-white group-hover:text-purple-200"}`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`shrink-0 transform rounded-lg bg-white/10 p-1.5 text-white/70 transition-transform duration-200 ${isExpanded ? "rotate-90 text-purple-400" : ""}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>

                {/* Expanded Answer with smooth height transition */}
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-label={faq.q}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-6 text-left">
                      <p className="text-sm leading-relaxed text-white/80 sm:text-base">
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
