import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service — 7th Heaven",
    description: "Terms and conditions for using the 7th Heaven website and SMS alert service.",
};

export default function TermsPage() {
    return (
        <section className="py-32 min-h-screen    text-[var(--text-color)]">
            <div className="site-container max-w-[900px] mx-auto">
                <h1 className="text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight mb-2 font-extrabold text-[var(--text-color)]">
                    Terms of <span className="text-[var(--color-accent)]">Service</span>
                </h1>
                <p className="text-sm text-[var(--muted-text)] uppercase tracking-[0.15em] font-bold mb-12">
                    Last Updated: April 12, 2026
                </p>

                <div className="prose-legal flex flex-col gap-10 text-[var(--text-color)] text-base leading-relaxed">

                    {/* 1 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the 7th Heaven website at{" "}
                            <span className="text-[var(--color-accent)] font-bold">7thheavenband.com</span> (the &quot;Site&quot;),
                            creating a member account, or subscribing to our SMS alert service, you agree to be bound
                            by these Terms of Service (&quot;Terms&quot;). If you do not agree, please do not use the Site or its services.
                        </p>
                    </div>

                    {/* 2 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">2. Services Provided</h2>
                        <p className="mb-3 text-[var(--muted-text)]">7th Heaven provides the following through the Site:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
                            <li>Band information, tour dates, music, videos, and news content</li>
                            <li>A member portal with rewards, pick collection, and show tracking</li>
                            <li>An SMS text alert service for show notifications based on your location</li>
                            <li>Merchandise and ticket purchase capabilities (when available)</li>
                        </ul>
                    </div>

                    {/* 3 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">3. Member Accounts</h2>
                        <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
                            <li>You must provide accurate information when creating an account.</li>
                            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                            <li>You must be at least 13 years old to create an account.</li>
                            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
                            <li>Rewards points, pick awards, and tier status are non-transferable and have no monetary value unless explicitly stated.</li>
                        </ul>
                    </div>

                    {/* 4 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">4. SMS Text Alert Service</h2>
                        <div className="py-5 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-xl shadow-sm">
                            <p className="mb-4 text-[var(--text-color)]">By subscribing to 7th Heaven Show Alerts, you agree to the following:</p>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[var(--text-color)] font-bold text-sm">4.1 Consent</p>
                                    <p className="text-base mt-1 text-[var(--muted-text)]">You expressly consent to receive recurring automated promotional text messages from 7th Heaven at the phone number you provided. This consent is not required as a condition of any purchase.</p>
                                </div>

                                <div>
                                    <p className="text-[var(--text-color)] font-bold text-sm">4.2 Message Frequency</p>
                                    <p className="text-base mt-1 text-[var(--muted-text)]">Message frequency varies. You may receive approximately 1–4 messages per month, with occasional additional messages for special events, new releases, or last-minute show additions.</p>
                                </div>

                                <div>
                                    <p className="text-[var(--text-color)] font-bold text-sm">4.3 Costs</p>
                                    <p className="text-base mt-1 text-[var(--muted-text)]">Message and data rates may apply. 7th Heaven does not charge for the SMS service, but your mobile carrier&apos;s standard messaging rates apply.</p>
                                </div>

                                <div>
                                    <p className="text-[var(--text-color)] font-bold text-sm">4.4 Opt-Out</p>
                                    <p className="text-base mt-1 text-[var(--muted-text)]">You can opt out at any time by texting <strong className="text-[var(--color-accent)] font-bold">STOP</strong> to any text message received. You will receive one confirmation text. You can also unsubscribe via your account settings on the Site.</p>
                                </div>

                                <div>
                                    <p className="text-[var(--text-color)] font-bold text-sm">4.5 Support</p>
                                    <p className="text-base mt-1 text-[var(--muted-text)]">Text <strong className="text-[var(--color-accent)] font-bold">HELP</strong> to any message for support, or email us at <a href="mailto:info@7thheavenband.com" className="text-[var(--color-accent)] font-bold hover:underline">info@7thheavenband.com</a>.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">5. Intellectual Property</h2>
                        <p className="text-[var(--muted-text)]">All content on the Site — including music, lyrics, logos, graphics, text, images, audio clips, and software — is the property of 7th Heaven or its content suppliers and is protected by US and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.</p>
                    </div>

                    {/* 6 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">6. User Content & Conduct</h2>
                        <p className="mb-3 text-[var(--muted-text)]">If you submit content (such as fan photos, setlist votes, chat messages, or reviews), you grant 7th Heaven a non-exclusive, royalty-free, perpetual license to use, display, and distribute that content on the Site and associated media. You agree not to submit content that is:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
                            <li>Unlawful, defamatory, harassing, abusive, or hateful</li>
                            <li>Infringing on any third party&apos;s intellectual property or privacy rights</li>
                            <li>Spam, commercial solicitation, or malicious code</li>
                        </ul>
                    </div>

                    {/* 7 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">7. E-Commerce & Merch Purchases</h2>
                        <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
                            <li>All prices are displayed in USD and are subject to change without notice.</li>
                            <li>We reserve the right to refuse or cancel orders at our discretion.</li>
                            <li>Returns and refunds are governed by our <a href="/returns" className="text-[var(--color-accent)] font-bold hover:underline">Returns Policy</a>.</li>
                        </ul>
                    </div>

                    {/* 8 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">8. Prohibited Activities</h2>
                        <p className="mb-3 text-[var(--muted-text)]">You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base text-[var(--muted-text)]">
                            <li>Attempt to gain unauthorized access to the Site, member accounts, or server infrastructure</li>
                            <li>Interfere with or disrupt the operation of the Site or SMS service</li>
                            <li>Scrape, mine, or extract data from the Site without written consent</li>
                            <li>Use automated bots or scripts to access the Site</li>
                        </ul>
                    </div>

                    {/* 9 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">9. Disclaimers</h2>
                        <div className="py-4 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-xl shadow-xs text-base">
                            <p className="text-[var(--muted-text)]">The Site and its services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. 7th Heaven does not guarantee that the Site will be uninterrupted, error-free, or secure. Show dates, times, and venues are subject to change without notice.</p>
                        </div>
                    </div>

                    {/* 10 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">10. Limitation of Liability</h2>
                        <p className="text-[var(--muted-text)]">To the fullest extent permitted by law, 7th Heaven and its members, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site, SMS service, or any related services.</p>
                    </div>

                    {/* 11 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">11. Changes to These Terms</h2>
                        <p className="text-[var(--muted-text)]">We may update these Terms from time to time. Changes will be posted on this page with an updated date. Your continued use of the Site after changes are posted constitutes acceptance of the updated Terms.</p>
                    </div>

                    {/* 12 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">12. Governing Law</h2>
                        <p className="text-[var(--muted-text)]">These Terms are governed by the laws of the State of Illinois, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Cook County, Illinois.</p>
                    </div>

                    {/* 13 */}
                    <div>
                        <h2 className="text-[var(--text-color)] text-lg font-bold mb-3">13. Contact</h2>
                        <p className="mb-2 text-[var(--muted-text)]">For questions about these Terms of Service:</p>
                        <div className="py-6 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-xl shadow-sm">
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
