/* eslint-disable react-doctor/no-array-index-as-key */
"use client";

import React from "react";

interface PrivacyClientProps {
  sanityContent?: any;
}

export default function PrivacyClient({ sanityContent }: PrivacyClientProps) {

  return (
    <section className="site-container pt-[100px] min-h-screen text-left">
      <div className="mb-12 text-left">
        <h1 className=" mb-2">
          {sanityContent?.heroHeading || sanityContent?.title || "Privacy Policy"}
        </h1>
        <p>
          {sanityContent?.lastUpdated || sanityContent?.subtitle || "Last Updated: April 12, 2026"}
        </p>
      </div>

      <div className="prose-legal flex flex-col gap-10 text-base">
        {sanityContent?.sections && Array.isArray(sanityContent.sections) && sanityContent.sections.length > 0 ? (
          sanityContent.sections.map((sec: any, idx: number) => (
            <div key={sec.sectionId || sec.title || `privacy-sec-${idx}`}>
              <h2 className="mb-3">{sec.title || `${idx + 1}. Policy Section`}</h2>
              {sec.subtitle && <p className="mb-2 text-white/70">{sec.subtitle}</p>}
              {sec.body && <div className="whitespace-pre-line">{sec.body}</div>}
            </div>
          ))
        ) : (
          <>
            {/* 1 */}
            <div>
              <h2 className="mb-3">1. Introduction</h2>
              <p>
                7th Heaven (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting
                your personal information. This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you visit our website at{" "}
                <span className="text-[var(--color-accent)]">7thheavenband.com</span> (the &quot;Site&quot;),
                use our member portal, or subscribe to our SMS show alerts.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h2 className="mb-3">2. Information We Collect</h2>
              <p className="mb-3">We may collect the following types of information:</p>
              <div className="flex flex-col gap-3">
                <div className="py-2 border-0 shadow-none">
                  <p className="mb-1">Account Information</p>
                  <p>Name, email address, and password when you create a member account.</p>
                </div>
                <div className="py-2 border-0 shadow-none">
                  <p className="mb-1">SMS Alert Information</p>
                  <p>Name, zip code, and phone number when you subscribe to show alerts. We also record your consent timestamp and IP address as required by law.</p>
                </div>
                <div className="py-2 border-0 shadow-none">
                  <p className="mb-1">Location Data</p>
                  <p>Approximate geolocation (latitude/longitude) only when you explicitly enable the &quot;Nearby Shows&quot; feature. This data is stored locally in your browser and is not transmitted to our servers.</p>
                </div>
                <div className="py-2 border-0 shadow-none">
                  <p className="mb-1">Usage Data</p>
                  <p>Browser type, pages visited, and interaction patterns collected automatically through standard web analytics.</p>
                </div>
              </div>
            </div>

            {/* 3 */}
            <div>
              <h2 className="mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To send you SMS show alerts when 7th Heaven is playing near your area</li>
                <li>To operate and maintain your member account, including rewards and tier tracking</li>
                <li>To process purchases and order history</li>
                <li>To notify you of upcoming shows, new music releases, and special events</li>
                <li>To improve our website and user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            {/* 4 */}
            <div>
              <h2 className="mb-3">4. Proximity Alerts & Web Push Program</h2>
              <div className="py-2 border-0 shadow-none">
                <p className="mb-3">By subscribing to 7th Heaven Proximity & Show Alerts, you consent to receive automated notifications regarding nearby concerts and show updates. Key details:</p>
                <ul className="list-disc pl-5 space-y-2 text-base">
                  <li><strong>Data Collected:</strong> Full name (optional), email address (optional), zip code or city, distance radius (e.g. 15 mi, 30 mi, 50 mi, 100 mi, or all shows), show type filter preferences, and browser web push subscription credentials.</li>
                  <li><strong>Notification Frequency:</strong> Varies based on tour date additions. Typically 1–4 notifications per month for nearby shows.</li>
                  <li><strong>Web Push & Browser Control:</strong> Browser push notifications are delivered directly to your device when permissions are granted. You may grant or block push notifications at any time via your browser settings.</li>
                  <li><strong>Opt-Out & Preference Updates:</strong> You can modify your distance radius, toggle show types, or unsubscribe from alerts at any time via the alert preferences panel in the site footer or fan dashboard.</li>
                </ul>
                <p className="mt-3">Your consent to receive alerts is not a condition of any purchase.</p>
              </div>
            </div>

            {/* 5 */}
            <div>
              <h2 className="mb-3">5. How We Share Your Information</h2>
              <p className="mb-3">We do <strong>not</strong> sell, rent, or trade your personal information. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., Twilio for SMS delivery, payment processors for merchandise). These providers only access data necessary to perform their services.</li>
                <li><strong>Legal Requirements:</strong> When required by law, subpoena, or to protect our rights.</li>
              </ul>
            </div>

            {/* 6 */}
            <div>
              <h2 className="mb-3">6. Data Security</h2>
              <p>We implement reasonable security measures to protect your information, including encrypted connections (HTTPS), secure password hashing, and restricted access to personal data. However, no method of electronic transmission or storage is 100% secure.</p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="mb-3">7. Data Retention</h2>
              <p>We retain your information for as long as your account is active or as needed to provide services. SMS opt-in records (including consent timestamps) are retained for a minimum of 5 years as required by TCPA regulations. You may request deletion of your account and personal data at any time by contacting us.</p>
            </div>

            {/* 8 */}
            <div>
              <h2 className="mb-3">8. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements).</li>
                <li><strong>Opt-Out of SMS:</strong> Text STOP or use the unsubscribe feature in the fan dashboard.</li>
              </ul>
            </div>

            {/* 9 */}
            <div>
              <h2 className="mb-3">9. Cookies & Tracking</h2>
              <p>Our site uses essential cookies and localStorage to maintain your login session and preferences. We do not use third-party advertising trackers. YouTube embeds on our video pages may set their own cookies per Google&apos;s privacy policy.</p>
            </div>

            {/* 10 */}
            <div>
              <h2 className="mb-3">10. Children&apos;s Privacy</h2>
              <p>Our website, member portal, and SMS alert service are not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover we have collected such information, we will delete it promptly.</p>
            </div>

            {/* 11 */}
            <div>
              <h2 className="mb-3">11. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last Updated&quot; date. Continued use of the Site or SMS service after changes constitutes acceptance of the updated policy.</p>
            </div>

            {/* 12 */}
            <div>
              <h2 className="mb-3">12. Contact Us</h2>
              <p className="mb-2">If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:</p>
              <div className="py-2 border-0 shadow-none">
                <p>Email: <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] hover:underline !mt-0">info@7thheavenband.com</a></p>
                <p className="mt-0">Website: <a href="https://7thheavenband.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">7thheavenband.com</a></p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
