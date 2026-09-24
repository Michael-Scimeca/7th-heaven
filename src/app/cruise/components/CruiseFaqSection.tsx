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
      <div className="mx-auto border border-white/20 bg-[#00000029] backdrop-blur-md">
        {/* Header Box */}
        <div className="border-b border-white/20 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-bold tracking-wider text-white uppercase sm:text-3xl">
            {sectionTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            {sectionSubtitle}
          </p>
        </div>

        {/* Clean Border-Separated Accordion Dropdown Layout */}
        <ul className="divide-y divide-white/20">
          {faqList.map((faq: { q: string; a: string }, i: number) => {
            const isExpanded = expandedIndex === i;
            return (
              <li
                key={faq.q}
                className="overflow-hidden transition-colors duration-300"
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
                  className="group flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none sm:py-6"
                >
                  <span
                    className={`text-base font-semibold transition-colors duration-200 sm:text-lg ${
                      isExpanded
                        ? "text-purple-300"
                        : "text-white group-hover:text-purple-200"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`shrink-0 transform rounded-lg border border-white/20 bg-white/10 p-1.5 text-white/70 transition-transform duration-200 ${
                      isExpanded ? "rotate-90 border-purple-500/60 text-purple-400" : ""
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>

                {/* Expanded Answer with smooth height transition */}
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-label={faq.q}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-left">
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
