import type { Metadata } from "next";
import { sanityClient, queries, SanitySiteSettings } from "@/lib/sanity";

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
 <div className="pt-[123px] min-h-[calc(100vh-88px)] flex flex-col justify-center bg-[var(--bg-color)] text-[var(--text-color)]">
 <section className="py-8 md:py-12 flex flex-col justify-center">
 <div className="site-container w-full flex flex-col justify-center">
 {/* Header */}
 <div className="mb-8 text-left">
 <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-left text-[var(--text-color)]">
 Contact <span className="gradient-text">Info</span>
 </h1>
 <p className="text-sm md:text-base text-[var(--muted-text)] max-w-xl mt-2 text-left">
 For booking, press inquiries, and production advance.
 </p>
 </div>

 {/* Contact Cards Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-12 gap-x-12 md:gap-x-16">
 {contacts.map((contact, i) => (
 <div key={i} className="flex flex-col justify-between" id={`contact-card-${i}`}>
 <div>
 <h3 className="font-[var(--font-heading)] text-2xl md:text-3xl font-black text-[var(--color-accent)] mb-2">
 {contact.category}
 </h3>
 {contact.company && <p className="text-base md:text-xl font-extrabold text-[var(--text-color)] mb-0.5">{contact.company}</p>}
 {contact.name && <p className="text-sm md:text-lg font-medium text-[var(--muted-text)]">{contact.name}</p>}
 </div>

 <div className="flex flex-col gap-2 mt-4">
 {contact.email && (
 <a href={`mailto:${contact.email}?subject=7th%20heaven`} className="flex items-center gap-2.5 text-base md:text-xl font-bold text-[var(--text-color)] hover:text-[var(--color-accent)] transition-colors duration-150">
 <span className="text-xl">📧</span> {contact.email}
 </a>
 )}
 <a href={`tel:${contact.phone.replace(/-/g, "")}`} className="flex items-center gap-2.5 text-2xl md:text-4xl font-black text-[var(--text-color)] hover:text-[var(--color-accent)] transition-colors duration-150 font-mono tracking-tight">
 <span className="text-2xl">📞</span> {contact.phone}
 </a>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 </div>
 );
}
