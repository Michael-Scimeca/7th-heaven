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
 <div className="pt-[95px] min-h-[calc(100vh-95px)] flex flex-col justify-center">
 <section className="py-8 md:py-12 flex flex-col justify-center">
 <div className="site-container w-full flex flex-col justify-center">
 {/* Header */}
 <div className="mb-8 text-left">
 <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-3 px-4 py-1 border border-[rgba(133,29,239,0.3)]">
 Get in Touch
 </span>
 <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-left">
 Contact <span className="gradient-text">Info</span>
 </h1>
 <p className="text-sm md:text-base text-white/60 max-w-xl mt-2 text-left">
 For booking, press inquiries, and production advance.
 </p>
 </div>

 {/* Contact Cards Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-12 md:gap-x-16">
 {contacts.map((contact, i) => (
 <div key={i} className="flex flex-col justify-between" id={`contact-card-${i}`}>
 <div>
 <h3 className="font-[var(--font-heading)] text-lg md:text-xl font-black text-[var(--color-accent)] mb-1">
 {contact.category}
 </h3>
 {contact.company && <p className="text-xs md:text-sm font-bold text-white/90">{contact.company}</p>}
 {contact.name && <p className="text-xs md:text-sm text-white/60">{contact.name}</p>}
 </div>

 <div className="flex flex-col gap-1 mt-3">
 {contact.email && (
 <a href={`mailto:${contact.email}?subject=7th%20heaven`} className="flex items-center gap-2 text-xs md:text-sm text-white/70 hover:text-white transition-colors duration-150">
 📧 {contact.email}
 </a>
 )}
 <a href={`tel:${contact.phone.replace(/-/g, "")}`} className="flex items-center gap-2.5 text-xl md:text-2xl font-black text-white hover:text-[var(--color-accent)] transition-colors duration-150 font-mono tracking-tight">
 📞 {contact.phone}
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
