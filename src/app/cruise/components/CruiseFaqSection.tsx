"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import FaqChevronButton from "@/components/FaqChevronButton";
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
    <section
      id="faqs"
      aria-labelledby="faqs-heading"
      className="section site-container"
    >
      <div className="mx-auto">
        {/* Header Box */}
        <SectionHeader
          id="faqs-heading"
          title={
            <>
              Frequently Asked{" "}
              <span className="accent-gradient-text">Questions</span>
            </>
          }
          subtitle={sectionSubtitle}
          icon={HelpCircle}
        />

        {/* Clean Border-Separated Accordion Dropdown Layout */}
        <ul className="divide-y divide-white/20">
          {faqList.map((faq: { q: string; a: string }, i: number) => {
            const isExpanded = expandedIndex === i;
            return (
              <li
                key={faq.q}
                className="overflow-hidden"
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
                  className="accordion-trigger focus-ring flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left sm:py-6"
                >
                  <span
                    className={`font-semibold ${isExpanded ? "text-purple-300" : "text-white"}`}
                  >
                    {faq.q}
                  </span>
                  <FaqChevronButton isExpanded={isExpanded} />
                </button>

                {/* Expanded Answer with smooth height transition */}
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-label={faq.q}
                  className={`grid transition-[grid-template-rows,opacity] ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-3 pb-6 text-left">
                      <p className="text-white/80">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
