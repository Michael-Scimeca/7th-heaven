"use client";

import React from "react";

interface ReturnsClientProps {
  sanityContent?: any;
}

export default function ReturnsClient({ sanityContent }: ReturnsClientProps) {

  return (
    <main className="site-container pt-[100px] min-h-screen text-left">
      <header className="mb-12 text-left">
        <h1 className="text-[clamp(2rem,4vw,3rem)] mb-2">
          {sanityContent?.heroHeading || sanityContent?.title || "Return & Refund Policy"}
        </h1>
        <p className="text-white/70">
          {sanityContent?.lastUpdated || sanityContent?.subtitle || "Last Updated: April 12, 2026"}
        </p>
      </header>

      <div className="prose-legal flex flex-col gap-10 text-base">
        {sanityContent?.sections && Array.isArray(sanityContent.sections) && sanityContent.sections.length > 0 ? (
          sanityContent.sections.map((sec: any, idx: number) => {
            const sectionKey = sec._key || sec.sectionId || sec._id || sec.title || `returns-sec-${sec._key || sec.sectionId}`;
            const headingId = `returns-sec-${sec.sectionId || sec._key || idx + 1}`;
            return (
              <section key={sectionKey} aria-labelledby={`${headingId}-heading`}>
                <h2 id={`${headingId}-heading`} className="mb-3">
                  {sec.title || `${idx + 1}. Policy Section`}
                </h2>
                {sec.subtitle && <p className="mb-2 text-white/70">{sec.subtitle}</p>}
                {sec.body && <div className="whitespace-pre-line">{sec.body}</div>}
              </section>
            );
          })
        ) : (
          <>
            {/* Section 1 */}
            <section aria-labelledby="returns-sec-1-heading">
              <h2 id="returns-sec-1-heading" className="mb-3">1. In-Person Concert Sales (Merch Table)</h2>
              <p>
                All purchases made directly at a 7th Heaven concert merch table (cash or credit card) are final sale. Due to mobile event inventory constraints, we cannot offer refunds or returns on in-person sales once you leave the merch table.
              </p>
            </section>

            {/* Section 2 */}
            <section aria-labelledby="returns-sec-2-heading">
              <h2 id="returns-sec-2-heading" className="mb-3">2. Online Store Orders (Shipped to Home)</h2>
              <p className="mb-3">
                For merchandise purchased directly through our online store (processed via the Shopify Storefront API) and shipped to your home:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You have <strong>14 calendar days</strong> from the delivery confirmation date to request a return or size exchange.
                </li>
                <li>
                  To be eligible, items must be unworn, unwashed, unaltered, and in their original packaging with all original product tags intact.
                </li>
                <li>
                  Return shipping labels and logistics are the responsibility of the customer. 7th Heaven only covers return shipping costs if the return is a direct result of our fulfillment error (e.g., incorrect size or incorrect item shipped).
                </li>
                <li>
                  Once we receive and inspect your returned items, we will notify you of the status. Approved refunds will be automatically credited back to your original payment method within 5 to 7 business days.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section aria-labelledby="returns-sec-3-heading">
              <h2 id="returns-sec-3-heading" className="mb-3">3. Merch Table Pickups (Pre-Ordered Online)</h2>
              <p className="mb-3">
                For orders pre-purchased online and designated for pickup at our concert merch tables:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Pickup orders are fully verified via a secure QR code emailed to you. Once verified and scanned, our crew will release the order to you.
                </li>
                <li>
                  If you try on a pickup apparel item at the venue and find it does not fit, you may request an immediate size swap at the table, subject to our on-site stock availability.
                </li>
                <li>
                  Once you leave the concert venue with your pickup order, the items are governed by our live concert final sale policy and are no longer eligible for returns or refunds.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section aria-labelledby="returns-sec-4-heading">
              <h2 id="returns-sec-4-heading" className="mb-3">4. Damaged or Defective Items</h2>
              <p>
                If your online order arrives damaged, defective, or misprinted, please send a brief email to <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] hover:underline">info@7thheavenband.com</a> with your order number and photo evidence of the issue. We will arrange a replacement or issue a full refund at no additional cost.
              </p>
            </section>

            {/* Section 5 */}
            <section aria-labelledby="returns-sec-5-heading">
              <h2 id="returns-sec-5-heading" className="mb-3">5. Contact Information</h2>
              <p className="mb-2">
                If you have any questions about returns, exchanges, or refunds, please reach out to us:
              </p>
              <div className="space-y-1">
                <p className="font-semibold text-white">7th Heaven Support</p>
                <p>Email: <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] hover:underline">info@7thheavenband.com</a></p>
                <p>Website: <a href="https://7thheavenband.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">7thheavenband.com</a></p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
