"use client";

import React from "react";
import Link from "next/link";

interface TermsClientProps {
  sanityContent?: any;
}

export default function TermsClient({ sanityContent }: TermsClientProps) {

  return (
    <main className="site-container page-container min-h-screen text-left" id="terms-page">
      <header className="mb-6 text-left">
        <h1 className="mb-2">
          {sanityContent?.heroHeading || sanityContent?.title || "Terms of Service"}
        </h1>
        <p className="text-white/70">
          {sanityContent?.lastUpdated || sanityContent?.subtitle || "Last Updated: April 12, 2026"}
        </p>
      </header>

      <div className="prose-legal flex flex-col gap-10 text-base">
        {sanityContent?.sections && Array.isArray(sanityContent.sections) && sanityContent.sections.length > 0 ? (
          sanityContent.sections.map((sec: any, idx: number) => {
            const sectionKey = sec._key || sec.sectionId || sec._id || sec.title || `terms-sec-${sec._key || sec.sectionId}`;
            const headingId = `terms-sec-${sec.sectionId || sec._key || idx + 1}`;
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
            {/* 1 */}
            <section aria-labelledby="terms-sec-1-heading">
              <h2 id="terms-sec-1-heading" className="mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the 7th Heaven website at{" "}
                <span className="text-[var(--color-accent)] font-semibold">7thheavenband.com</span> (the &quot;Site&quot;),
                creating a member account, or subscribing to our SMS alert service, you agree to be bound
                by these Terms of Service (&quot;Terms&quot;). If you do not agree, please do not use the Site or its services.
              </p>
            </section>

            {/* 2 */}
            <section aria-labelledby="terms-sec-2-heading">
              <h2 id="terms-sec-2-heading" className="mb-3">2. Services Provided</h2>
              <p className="mb-3">7th Heaven provides the following through the Site:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Band information, tour dates, music, videos, and news content</li>
                <li>A member portal with rewards, pick collection, and show tracking</li>
                <li>An SMS text alert service for show notifications based on your location</li>
                <li>Merchandise and ticket purchase capabilities (when available)</li>
              </ul>
            </section>

            {/* 3 */}
            <section aria-labelledby="terms-sec-3-heading">
              <h2 id="terms-sec-3-heading" className="mb-3">3. Member Accounts</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must provide accurate information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must be at least 13 years old to create an account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
                <li>Rewards points, pick awards, and tier status are non-transferable and have no monetary value unless explicitly stated.</li>
              </ul>
            </section>

            {/* 4 */}
            <section aria-labelledby="terms-sec-4-heading">
              <h2 id="terms-sec-4-heading" className="mb-3">4. Proximity Alerts & Web Push Notifications</h2>
              <p className="mb-6">By subscribing to 7th Heaven Proximity Alerts & Show Notifications, you agree to the following:</p>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-white mb-1">4.1 Consent & Subscription</p>
                  <p>You expressly consent to receive automated show notifications, proximity alerts, and event updates via browser web push, email, or digital alerts based on your provided full name, email address, zip code / city, distance radius (e.g., 15 mi, 30 mi, 50 mi, 100 mi, or all shows), and selected show type preferences (e.g., Full Band, Unplugged, Outdoor, Casino, TV, Fundraiser, Special). Consent is not required as a condition of any purchase.</p>
                </div>

                <div>
                  <p className="font-semibold text-white mb-1">4.2 Location & Zip Code Data</p>
                  <p>Proximity alerts calculate distance thresholds to upcoming tour dates based on the zip code or city you provide. Location data is stored securely and used exclusively to filter and deliver relevant nearby concert notifications.</p>
                </div>

                <div>
                  <p className="font-semibold text-white mb-1">4.3 Web Push & Browser Permissions</p>
                  <p>Web push notifications are delivered directly through your web browser or device when push permissions are granted. You may grant or revoke notification permissions at any time through your browser settings or via the site footer alert preferences panel.</p>
                </div>

                <div>
                  <p className="font-semibold text-white mb-1">4.4 Message & Alert Frequency</p>
                  <p>Alert frequency varies based on band concert schedules and new tour date additions in your specified distance radius (typically 1–4 notifications per month).</p>
                </div>

                <div>
                  <p className="font-semibold text-white mb-1">4.5 Unsubscribing & Managing Preferences</p>
                  <p>You can update your distance radius, toggle show type filters, or unsubscribe from proximity alerts at any time using the Proximity & Show Alert Filters panel located in the site footer or by blocking notifications in your browser settings. For assistance, contact us at <a href="mailto:info@7thheavenband.com" className="a-btn">info@7thheavenband.com</a>.</p>
                </div>
              </div>
            </section>

            {/* 5 */}
            <section aria-labelledby="terms-sec-5-heading">
              <h2 id="terms-sec-5-heading" className="mb-3">5. Intellectual Property</h2>
              <p>All content on the Site — including music, lyrics, logos, graphics, text, images, audio clips, and software — is the property of 7th Heaven or its content suppliers and is protected by US and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.</p>
            </section>

            {/* 6 */}
            <section aria-labelledby="terms-sec-6-heading">
              <h2 id="terms-sec-6-heading" className="mb-3">6. User Content & Conduct</h2>
              <p className="mb-3">If you submit content (such as fan photos, setlist votes, chat messages, or reviews), you grant 7th Heaven a non-exclusive, royalty-free, perpetual license to use, display, and distribute that content on the Site and associated media. You agree not to submit content that is:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Unlawful, defamatory, harassing, abusive, or hateful</li>
                <li>Infringing on any third party&apos;s intellectual property or privacy rights</li>
                <li>Spam, commercial solicitation, or malicious code</li>
              </ul>
            </section>

            {/* 7 */}
            <section aria-labelledby="terms-sec-7-heading">
              <h2 id="terms-sec-7-heading" className="mb-3">7. E-Commerce & Merch Purchases</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>All prices are displayed in USD and are subject to change without notice.</li>
                <li>We reserve the right to refuse or cancel orders at our discretion.</li>
                <li>Returns and refunds are governed by our <Link href="/returns" className="a-btn">Returns Policy</Link>.</li>
              </ul>
            </section>

            {/* 8 */}
            <section aria-labelledby="terms-sec-8-heading">
              <h2 id="terms-sec-8-heading" className="mb-3">8. Prohibited Activities</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Attempt to gain unauthorized access to the Site, member accounts, or server infrastructure</li>
                <li>Interfere with or disrupt the operation of the Site or SMS service</li>
                <li>Scrape, mine, or extract data from the Site without written consent</li>
                <li>Use automated bots or scripts to access the Site</li>
              </ul>
            </section>

            {/* 9 */}
            <section aria-labelledby="terms-sec-9-heading">
              <h2 id="terms-sec-9-heading" className="mb-3">9. Disclaimers</h2>
              <p>The Site and its services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. 7th Heaven does not guarantee that the Site will be uninterrupted, error-free, or secure. Show dates, times, and venues are subject to change without notice.</p>
            </section>

            {/* 10 */}
            <section aria-labelledby="terms-sec-10-heading">
              <h2 id="terms-sec-10-heading" className="mb-3">10. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, 7th Heaven and its members, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site, SMS service, or any related services.</p>
            </section>

            {/* 11 */}
            <section aria-labelledby="terms-sec-11-heading">
              <h2 id="terms-sec-11-heading" className="mb-3">11. Changes to These Terms</h2>
              <p>We may update these Terms from time to time. Changes will be posted on this page with an updated date. Your continued use of the Site after changes are posted constitutes acceptance of the updated Terms.</p>
            </section>

            {/* 12 */}
            <section aria-labelledby="terms-sec-12-heading">
              <h2 id="terms-sec-12-heading" className="mb-3">12. Governing Law</h2>
              <p>These Terms are governed by the laws of the State of Illinois, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Cook County, Illinois.</p>
            </section>

            {/* 13 */}
            <section aria-labelledby="terms-sec-13-heading">
              <h2 id="terms-sec-13-heading" className="mb-3">13. Contact</h2>
              <p className="mb-2">For questions about these Terms of Service:</p>
              <div className="space-y-1">
                <p>Email: <a href="mailto:info@7thheavenband.com" className="a-btn">info@7thheavenband.com</a></p>
                <p>Website: <a href="https://7thheavenband.com" target="_blank" rel="noopener noreferrer" className="a-btn">7thheavenband.com</a></p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
