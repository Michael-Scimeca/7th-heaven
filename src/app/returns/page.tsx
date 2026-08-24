import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy — 7th Heaven",
  description: "Official policies governing merchandise returns, refunds, table pickups, and ticket sales for 7th Heaven.",
};

export default function ReturnsPage() {
  return (
    <section className="site-container pt-[var(--page-top-offset)] min-h-screen text-[var(--text-color)]">
      <div className="w-full text-left">
        <h1 className="text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight mb-2 font-bold text-[var(--text-color)]">
          Return & Refund <span className="text-[var(--color-accent)]">Policy</span>
        </h1>
        <p className="text-sm text-[var(--muted-text)] uppercase tracking-[0.15em] font-bold mb-12">
          Last Updated: April 12, 2026
        </p>

        <div className="prose-legal flex flex-col gap-10 text-[var(--text-color)] text-base leading-relaxed">

          {/* Section 1 */}
          <div>
            <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">1. Merchandise Table Purchases (Live Concerts)</h2>
            <p className="text-[var(--muted-text)]">
              All merchandise purchases completed in person at our live concert venues and tour stops are <strong className="text-[var(--text-color)]">final sale</strong>.
              We do not accept returns, refunds, or size exchanges once a transaction is completed at our physical merch tables.
              Please inspect all apparel, CDs, vinyl, and accessories for quality and correct sizing prior to completing your purchase.
              In the rare event of a clear manufacturing defect, please contact our crew at the table immediately, or email us at the contact address below within 7 days.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">2. Online Store Orders (Shipped to Home)</h2>
            <p className="mb-3 text-[var(--muted-text)]">
              For merchandise purchased directly through our online store (processed via the Shopify Storefront API) and shipped to your home:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
              <li>
                You have <strong className="text-[var(--text-color)]">14 calendar days</strong> from the delivery confirmation date to request a return or size exchange.
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
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">3. Merch Table Pickups (Pre-Ordered Online)</h2>
            <p className="mb-3 text-[var(--muted-text)]">
              For orders pre-purchased online and designated for pickup at our concert merch tables:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
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
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">4. Damaged or Defective Items</h2>
            <p className="text-[var(--muted-text)]">
              If your online order arrives damaged, defective, or misprinted, please send a brief email to <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] font-bold hover:underline">info@7thheavenband.com</a> with your order number and photo evidence of the issue. We will arrange a replacement or issue a full refund at no additional cost.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">5. Contact Information</h2>
            <p className="mb-2 text-[var(--muted-text)]">
              If you have any questions about returns, exchanges, or refunds, please reach out to us:
            </p>
            <div className="py-6 border border-[var(--border-color)] bg-[var(--card-bg)]  rounded-lg  ">
              <p className="text-[var(--text-color)] font-bold text-sm">7th Heaven Support</p>
              <p className="text-base mt-1">Email: <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] font-bold hover:underline">info@7thheavenband.com</a></p>
              <p className="text-base">Website: <a href="https://7thheavenband.com" className="text-[var(--color-accent)] font-bold hover:underline">7thheavenband.com</a></p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
