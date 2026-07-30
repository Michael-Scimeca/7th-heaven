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
 <div className="pt-[72px]">
 <section className="pt-24 pb-10 text-left bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
 <div className="site-container flex flex-col items-start text-left">
 <span className="inline-block text-sm font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">Get in Touch</span>
 <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-tight tracking-tight text-left">
 Contact <span className="gradient-text">Info</span>
 </h1>
 <p className="text-lg text-[var(--color-text-secondary)] max-w-[600px] mt-4 text-left">For booking, press inquiries, and production advance.</p>
 </div>
 </section>

 <section className="py-16">
 <div className="site-container grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
 {contacts.map((contact, i) => (
 <div key={i} className="py-6 px-2 flex flex-col justify-between bg-transparent border-none" id={`contact-card-${i}`}>
 <div className="flex items-start justify-between gap-4 mb-3">
 <h3 className="font-[var(--font-heading)] text-xl font-black text-[var(--color-accent)]">{contact.category}</h3>
 </div>
 {contact.company && <p className="text-sm font-bold text-white/90 mb-0.5">{contact.company}</p>}
 {contact.name && <p className="text-sm text-white/60 mb-4">{contact.name}</p>}

 <div className="flex flex-col gap-2 mt-auto pt-2">
 {contact.email && (
 <a href={`mailto:${contact.email}?subject=7th%20heaven`} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors duration-150">
 📧 {contact.email}
 </a>
 )}
 <a href={`tel:${contact.phone.replace(/-/g, "")}`} className="flex items-center gap-3 text-2xl md:text-3xl font-black text-white hover:text-[var(--color-accent)] transition-colors duration-150 mt-1 font-mono tracking-tight">
 📞 {contact.phone}
 </a>
 </div>
 </div>
 ))}
 </div>
 </section>
 </div>
 );
}
