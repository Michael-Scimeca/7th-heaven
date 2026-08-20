import type { Metadata } from "next";
import { sanityClient, queries, SanitySiteSettings } from "@/lib/sanity";
import ContactClient from "./ContactClient";

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
    { category: "7th Heaven Cruise & Vacations", company: "NTD Vacations", name: "Mary", email: "Mary@NTDVacations.com", phone: null, note: null },
];

export default async function ContactPage() {
    const settingsData = await sanityClient.fetch<SanitySiteSettings | null>(queries.siteSettings, {}, { next: { revalidate: 60, tags: ['sanity:settings'] } });
    const settings = settingsData as SanitySiteSettings | null;
    const contacts = settings?.contacts?.length ? settings.contacts : FALLBACK_CONTACTS;

    return <ContactClient contacts={contacts} />;
}
