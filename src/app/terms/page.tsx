import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Terms of Service — 7th Heaven",
 description: "Terms and conditions for using the 7th Heaven website and SMS alert service.",
};

export default function TermsPage() {
 return (
  <section className="py-32 bg-[var(--color-bg-primary)]">
   <div className="site-container max-w-[800px]">
    <h1 className="text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight mb-2">
     Terms of <span className="gradient-text">Service</span>
    </h1>
    <p className="text-[0.75rem] text-white/30 uppercase tracking-[0.15em] font-bold mb-12">
     Last Updated: April 12, 2026
    </p>

    <div className="prose-legal flex flex-col gap-10 text-white/60 text-[0.9rem] leading-relaxed">

     {/* 1 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">1. Acceptance of Terms</h2>
      <p>
       By accessing or using the 7th Heaven website at{" "}
       <span className="text-[var(--color-accent)]">7thheavenband.com</span> (the &quot;Site&quot;),
       creating a member account, or subscribing to our SMS alert service, you agree to be bound
       by these Terms of Service (&quot;Terms&quot;). If you do not agree, please do not use the Site or its services.
      </p>
     </div>

     {/* 2 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">2. Services Provided</h2>
      <p className="mb-3">7th Heaven provides the following through the Site:</p>
      <ul className="list-disc pl-5 space-y-2 text-[0.85rem]">
       <li>Band information, tour dates, music, videos, and news content</li>
       <li>A member portal with rewards, pick collection, and show tracking</li>
       <li>An SMS text alert service for show notifications based on your location</li>
       <li>Merchandise and ticket purchase capabilities (when available)</li>
      </ul>
     </div>

     {/* 3 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">3. Member Accounts</h2>
      <ul className="list-disc pl-5 space-y-2 text-[0.85rem]">
       <li>You must provide accurate information when creating an account.</li>
       <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
       <li>You must be at least 13 years old to create an account.</li>
       <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
       <li>Rewards points, pick awards, and tier status are non-transferable and have no monetary value unless explicitly stated.</li>
      </ul>
     </div>

     {/* 4 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">4. SMS Text Alert Service</h2>
      <div className="p-5 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5">
       <p className="mb-4">By subscribing to 7th Heaven Show Alerts, you agree to the following:</p>

       <div className="space-y-4">
        <div>
         <p className="text-white font-bold text-sm">4.1 Consent</p>
         <p className="text-[0.85rem] mt-1">You expressly consent to receive recurring automated promotional text messages from 7th Heaven at the phone number you provided. This consent is not required as a condition of any purchase.</p>
        </div>

        <div>
         <p className="text-white font-bold text-sm">4.2 Message Frequency</p>
         <p className="text-[0.85rem] mt-1">Message frequency varies. You may receive approximately 1–4 messages per month, with occasional additional messages for special events, new releases, or last-minute show additions.</p>
        </div>

        <div>
         <p className="text-white font-bold text-sm">4.3 Costs</p>
         <p className="text-[0.85rem] mt-1">Message and data rates may apply. 7th Heaven does not charge for the SMS service, but your mobile carrier&apos;s standard messaging rates apply.</p>
        </div>

        <div>
         <p className="text-white font-bold text-sm">4.4 Opting Out</p>
         <p className="text-[0.85rem] mt-1">You may opt out at any time by:</p>
         <ul className="list-disc pl-5 mt-1 space-y-1 text-[0.85rem]">
          <li>Texting <strong className="text-[var(--color-accent)]">STOP</strong> in reply to any message</li>
          <li>Using the Unsubscribe feature in the fan dashboard</li>
          <li>Contacting us directly at the information below</li>
         </ul>
         <p className="text-[0.85rem] mt-1">After opting out, you will receive one final confirmation message. No further messages will be sent.</p>
        </div>

        <div>
         <p className="text-white font-bold text-sm">4.5 Help</p>
         <p className="text-[0.85rem] mt-1">Text <strong className="text-[var(--color-accent)]">HELP</strong> for assistance, or email <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] hover:underline">info@7thheavenband.com</a>.</p>
        </div>

        <div>
         <p className="text-white font-bold text-sm">4.6 Supported Carriers</p>
         <p className="text-[0.85rem] mt-1">Compatible with all major US carriers. Carriers are not liable for delayed or undelivered messages.</p>
        </div>
       </div>
      </div>
     </div>

     {/* 5 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">5. Pick Awards & Lottery Program</h2>
      <ul className="list-disc pl-5 space-y-2 text-[0.85rem]">
       <li>Pick Awards are virtual collectible items with no cash value.</li>
       <li>Lottery entries are earned through pick collection and are non-transferable.</li>
       <li>Winners are selected randomly. 7th Heaven reserves the right to modify, suspend, or cancel any lottery at any time.</li>
       <li>Prize fulfillment is subject to availability and geographic limitations.</li>
       <li>Lottery participation may be limited to members 18 years or older depending on local regulations.</li>
      </ul>
     </div>

     {/* 6 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">6. Purchases & Merchandise</h2>
      <ul className="list-disc pl-5 space-y-2 text-[0.85rem]">
       <li>All purchases are final unless otherwise stated at the time of sale.</li>
       <li>Prices are listed in USD and are subject to change without notice.</li>
       <li>We reserve the right to refuse or cancel orders at our discretion.</li>
       <li>Shipping times and availability may vary.</li>
      </ul>
     </div>

     {/* 7 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">7. Intellectual Property</h2>
      <p>All content on this Site — including but not limited to text, images, logos, music, videos, graphics, and the 7th Heaven name and likeness — is owned by 7th Heaven and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without written permission.</p>
     </div>

     {/* 8 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">8. User Conduct</h2>
      <p className="mb-3">You agree not to:</p>
      <ul className="list-disc pl-5 space-y-2 text-[0.85rem]">
       <li>Use the Site for any unlawful purpose</li>
       <li>Attempt to gain unauthorized access to any part of the Site or its systems</li>
       <li>Interfere with the Site&apos;s operation or other users&apos; experience</li>
       <li>Submit false information to any form or service</li>
       <li>Use automated bots or scripts to access the Site</li>
      </ul>
     </div>

     {/* 9 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">9. Disclaimers</h2>
      <div className="p-4 border border-white/5 bg-white/[0.02] text-[0.85rem]">
       <p>The Site and its services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. 7th Heaven does not guarantee that the Site will be uninterrupted, error-free, or secure. Show dates, times, and venues are subject to change without notice.</p>
      </div>
     </div>

     {/* 10 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">10. Limitation of Liability</h2>
      <p>To the fullest extent permitted by law, 7th Heaven and its members, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site, SMS service, or any related services.</p>
     </div>

     {/* 11 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">11. Changes to These Terms</h2>
      <p>We may update these Terms from time to time. Changes will be posted on this page with an updated date. Your continued use of the Site after changes are posted constitutes acceptance of the updated Terms.</p>
     </div>

     {/* 12 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">12. Governing Law</h2>
      <p>These Terms are governed by the laws of the State of Illinois, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Cook County, Illinois.</p>
     </div>

     {/* 13 */}
     <div>
      <h2 className="text-white text-lg font-bold mb-3">13. Contact</h2>
      <p className="mb-2">For questions about these Terms of Service:</p>
      <div className="p-4 border border-white/5 bg-white/[0.02]">
       <p className="text-white font-bold text-sm">7th Heaven</p>
       <p className="text-[0.85rem] mt-1">Email: <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] hover:underline">info@7thheavenband.com</a></p>
       <p className="text-[0.85rem]">Website: <a href="https://7thheavenband.com" className="text-[var(--color-accent)] hover:underline">7thheavenband.com</a></p>
      </div>
     </div>

    </div>
   </div>
  </section>
 );
}
