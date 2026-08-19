import type { Metadata } from "next";
import { sanityClient, queries, SanitySiteSettings } from "@/lib/sanity";
import { Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact — 7th Heaven",
    description: "Contact 7th heaven for booking, press inquiries, technical & production advance.",
};

export const revalidate = 60;

const FALLBACK_CONTACTS = [
    { category: "Booking", company: "NTD Management", name: null, email: "info@NTDManagement.com", phone: "847-551-5363", note: null },
    { category: "Press • Media", company: "NTD Records", name: "Lenny Rago", email: "LRago@NTDRecords.com", phone: "847-269-6200", note: null },
    { category: "Technical • Production • Advance", company: null, name: "Jeff Dobbs", email: "jeffdobbs64@yahoo.com", phone: "847-772-5333", note: null },
    { category: "Advance — Non-Technical", company: null, name: "Alan McRae", email: "Alan@NTDManagement.com", phone: "630-842-9129", note: null },
];

export default async function ContactPage() {
    const settingsData = await sanityClient.fetch<SanitySiteSettings | null>(queries.siteSettings, {}, { next: { revalidate: 60, tags: ['sanity:settings'] } });
    const settings = settingsData as SanitySiteSettings | null;
    const contacts = settings?.contacts?.length ? settings.contacts : FALLBACK_CONTACTS;

    return (
        <section className="site-container flex flex-col text-[var(--text-color)] pt-[100px]">
            {/* Header */}
            <div className="mb-8 text-left">
                <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-left text-[var(--text-color)]">
                    Contact <span className="gradient-text">Info</span>
                </h1>
                <p className="text-sm md:text-base text-[var(--muted-text)] max-w-xl mt-2 text-left">
                    For booking, press inquiries, and production advance.
                </p>
            </div>

            {/* Contact Items (1 Column Layout) */}
            <div className="grid grid-cols-1 gap-10 md:gap-12 max-w-3xl">
                {contacts.map((contact) => (
                    <div key={contact.category || contact.name} className="flex flex-col justify-between border-b border-white/10 pb-8 last:border-b-0 last:pb-0" id={`contact-card-${contact.category}`}>
                        <div>
                            <h3 className="font-[var(--font-heading)] text-2xl md:text-3xl font-black text-[var(--color-accent)] mb-2">
                                {contact.category}
                            </h3>
                            {contact.company && <p className="text-base md:text-xl font-extrabold text-[var(--text-color)] mb-0.5">{contact.company}</p>}
                            {contact.name && <p className="text-sm md:text-lg font-medium text-[var(--muted-text)]">{contact.name}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8 mt-4">
                            {contact.email && (
                                <a href={`mailto:${contact.email}?subject=7th%20heaven`} className="flex items-center gap-2.5 text-base md:text-xl font-bold text-[var(--text-color)] hover:text-[var(--color-accent)] transition-colors duration-150 group">
                                    <Mail className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-[#c084fc] group-hover:text-white transition-colors" />
                                    <span>{contact.email}</span>
                                </a>
                            )}
                            <a href={`tel:${contact.phone.replace(/-/g, "")}`} className="flex items-center gap-2.5 text-xl md:text-3xl font-black text-[var(--text-color)] hover:text-[var(--color-accent)] transition-colors duration-150 font-mono tracking-tight group">
                                <Phone className="w-6 h-6 md:w-7 md:h-7 shrink-0 text-[#c084fc] group-hover:text-white transition-colors" />
                                <span>{contact.phone}</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
