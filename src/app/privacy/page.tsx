import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — 7th Heaven",
    description: "How 7th Heaven collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
    return (
        <section className="py-32 min-h-screen    text-[var(--text-color)]">
            <div className="site-container max-w-[900px] mx-auto">
                <h1 className="text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight mb-2 font-extrabold text-[var(--text-color)]">
                    Privacy <span className="text-[var(--color-accent)]">Policy</span>
                </h1>
                <p className="text-sm text-[var(--muted-text)] uppercase tracking-[0.15em] font-bold mb-12">
                    Last Updated: April 12, 2026
                </p>

                <div className="prose-legal flex flex-col gap-10 text-[var(--text-color)] text-base leading-relaxed">

                    {/* 1 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">1. Introduction</h2>
                        <p>
                            7th Heaven (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting
                            your personal information. This Privacy Policy explains how we collect, use, disclose, and
                            safeguard your information when you visit our website at{" "}
                            <span className="text-[var(--color-accent)] font-bold">7thheavenband.com</span> (the &quot;Site&quot;),
                            use our member portal, or subscribe to our SMS show alerts.
                        </p>
                    </div>

                    {/* 2 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">2. Information We Collect</h2>
                        <p className="mb-3 text-[var(--muted-text)]">We may collect the following types of information:</p>
                        <div className="flex flex-col gap-3">
                            <div className="py-2 border-0 bg-transparent shadow-none">
                                <p className="text-[var(--text-color)] font-bold text-sm mb-1">Account Information</p>
                                <p className="text-sm text-[var(--muted-text)]">Name, email address, and password when you create a member account.</p>
                            </div>
                            <div className="py-2 border-0 bg-transparent shadow-none">
                                <p className="text-[var(--text-color)] font-bold text-sm mb-1">SMS Alert Information</p>
                                <p className="text-sm text-[var(--muted-text)]">Name, zip code, and phone number when you subscribe to show alerts. We also record your consent timestamp and IP address as required by law.</p>
                            </div>
                            <div className="py-2 border-0 bg-transparent shadow-none">
                                <p className="text-[var(--text-color)] font-bold text-sm mb-1">Location Data</p>
                                <p className="text-sm text-[var(--muted-text)]">Approximate geolocation (latitude/longitude) only when you explicitly enable the &quot;Nearby Shows&quot; feature. This data is stored locally in your browser and is not transmitted to our servers.</p>
                            </div>
                            <div className="py-2 border-0 bg-transparent shadow-none">
                                <p className="text-[var(--text-color)] font-bold text-sm mb-1">Usage Data</p>
                                <p className="text-sm text-[var(--muted-text)]">Browser type, pages visited, and interaction patterns collected automatically through standard web analytics.</p>
                            </div>
                        </div>
                    </div>

                    {/* 3 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
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
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">4. SMS/Text Message Program</h2>
                        <div className="py-2 border-0 bg-transparent shadow-none">
                            <p className="mb-3">By subscribing to 7th Heaven Show Alerts, you consent to receive recurring automated text messages at the phone number you provided. Key details:</p>
                            <ul className="list-disc pl-5 space-y-2 text-base">
                                <li><strong className="text-[var(--text-color)]">Message Frequency:</strong> Varies. Typically 1–4 messages per month, with occasional additional messages for special events.</li>
                                <li><strong className="text-[var(--text-color)]">Message & Data Rates:</strong> Standard message and data rates may apply depending on your mobile carrier plan.</li>
                                <li><strong className="text-[var(--text-color)]">Opt-Out:</strong> Text <strong className="text-[var(--color-accent)] font-bold">STOP</strong> to any message to unsubscribe immediately. You will receive one final confirmation text.</li>
                                <li><strong className="text-[var(--text-color)]">Help:</strong> Text <strong className="text-[var(--color-accent)] font-bold">HELP</strong> for assistance, or contact us at the information below.</li>
                                <li><strong className="text-[var(--text-color)]">Carriers:</strong> Compatible with all major US carriers including AT&T, T-Mobile, Verizon, and others.</li>
                            </ul>
                            <p className="mt-3 text-sm text-[var(--muted-text)]">Your consent to receive texts is not a condition of any purchase. You can also unsubscribe via the fan dashboard at any time.</p>
                        </div>
                    </div>

                    {/* 5 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">5. How We Share Your Information</h2>
                        <p className="mb-3">We do <strong className="text-[var(--text-color)]">not</strong> sell, rent, or trade your personal information. We may share data with:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
                            <li><strong className="text-[var(--text-color)]">Service Providers:</strong> Third-party services that help us operate (e.g., Twilio for SMS delivery, payment processors for merchandise). These providers only access data necessary to perform their services.</li>
                            <li><strong className="text-[var(--text-color)]">Legal Requirements:</strong> When required by law, subpoena, or to protect our rights.</li>
                        </ul>
                    </div>

                    {/* 6 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">6. Data Security</h2>
                        <p className="text-[var(--muted-text)]">We implement reasonable security measures to protect your information, including encrypted connections (HTTPS), secure password hashing, and restricted access to personal data. However, no method of electronic transmission or storage is 100% secure.</p>
                    </div>

                    {/* 7 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">7. Data Retention</h2>
                        <p className="text-[var(--muted-text)]">We retain your information for as long as your account is active or as needed to provide services. SMS opt-in records (including consent timestamps) are retained for a minimum of 5 years as required by TCPA regulations. You may request deletion of your account and personal data at any time by contacting us.</p>
                    </div>

                    {/* 8 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">8. Your Rights</h2>
                        <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
                            <li><strong className="text-[var(--text-color)]">Access:</strong> Request a copy of the personal data we hold about you.</li>
                            <li><strong className="text-[var(--text-color)]">Correction:</strong> Request correction of inaccurate information.</li>
                            <li><strong className="text-[var(--text-color)]">Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements).</li>
                            <li><strong className="text-[var(--text-color)]">Opt-Out of SMS:</strong> Text STOP or use the unsubscribe feature in the fan dashboard.</li>
                        </ul>
                    </div>

                    {/* 9 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">9. Cookies & Tracking</h2>
                        <p className="text-[var(--muted-text)]">Our site uses essential cookies and localStorage to maintain your login session and preferences. We do not use third-party advertising trackers. YouTube embeds on our video pages may set their own cookies per Google&apos;s privacy policy.</p>
                    </div>

                    {/* 10 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">10. Children&apos;s Privacy</h2>
                        <p className="text-[var(--muted-text)]">Our website, member portal, and SMS alert service are not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover we have collected such information, we will delete it promptly.</p>
                    </div>

                    {/* 11 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">11. Changes to This Policy</h2>
                        <p className="text-[var(--muted-text)]">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last Updated&quot; date. Continued use of the Site or SMS service after changes constitutes acceptance of the updated policy.</p>
                    </div>

                    {/* 12 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">12. Contact Us</h2>
                        <p className="mb-2 text-[var(--muted-text)]">If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:</p>
                        <div className="py-2 border-0 bg-transparent shadow-none">
                            <p className="text-[var(--text-color)] font-bold text-sm">7th Heaven</p>
                            <p className="text-base mt-1">Email: <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] font-bold hover:underline">info@7thheavenband.com</a></p>
                            <p className="text-base">Website: <a href="https://7thheavenband.com" className="text-[var(--color-accent)] font-bold hover:underline">7thheavenband.com</a></p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
