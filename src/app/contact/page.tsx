import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Contact — 7th Heaven",
 description: "Contact 7th heaven for booking, press inquiries, technical & production advance.",
};

const contacts = [
 { category: "Booking", company: "NTD Management", name: null, email: "info@NTDManagement.com", phone: "847-551-5363", note: null },
 { category: "Press • Media", company: "NTD Records", name: "Lenny Rago", email: "LRago@NTDRecords.com", phone: "847-269-6200", note: "No Bookings" },
 { category: "Technical • Production • Advance", company: null, name: "Jeff Dobbs", email: "jeffdobbs64@yahoo.com", phone: "847-772-5333", note: "No Bookings" },
 { category: "Advance — Non-Technical", company: null, name: "Alan McRae", email: "Alan@NTDManagement.com", phone: "630-842-9129", note: "No Bookings" },
];

export default function ContactPage() {
 return (
 <div className="pt-[72px]">
 <section className="pt-24 pb-10 text-center bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
 <div className="site-container">
 <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] ">Get in Touch</span>
 <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-tight tracking-tight">
 Contact <span className="gradient-text">Info</span>
 </h1>
 <p className="text-lg text-[var(--color-text-secondary)] max-w-[600px] mx-auto mt-4">For booking, press inquiries, and production advance.</p>
 </div>
 </section>

 <section className="py-32 bg-[var(--color-bg-primary)]">
 <div className="site-container !max-w-[900px] grid grid-cols-1 md:grid-cols-2 gap-6">
 {contacts.map((contact, i) => (
 <div key={i} className="p-10 bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-300 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-card-hover)] hover:-translate-y-1 hover:shadow-xl" id={`contact-card-${i}`}>
 <div className="flex items-start justify-between gap-4 mb-6">
 <h3 className="font-[var(--font-heading)] text-lg font-extrabold gradient-text">{contact.category}</h3>
 {contact.note && (
 <span className="shrink-0 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--color-warning)] bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] ">{contact.note}</span>
 )}
 </div>
 {contact.company && <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{contact.company}</p>}
 {contact.name && <p className="text-sm text-[var(--color-text-secondary)] mb-6">{contact.name}</p>}
 <div className="flex flex-col gap-2 mt-auto">
 <a href={`mailto:${contact.email}?subject=7th%20heaven`} className="flex items-center gap-2 text-[0.85rem] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150 py-1">
 📧 {contact.email}
 </a>
 <a href={`tel:${contact.phone.replace(/-/g, "")}`} className="flex items-center gap-2 text-[0.85rem] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150 py-1">
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
