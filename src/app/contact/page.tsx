import type { Metadata } from "next";
import ReactDOM from "react-dom";
import {
  sanityClient,
  queries,
  fetchPageContent,
  SanitySiteSettings,
} from "@/lib/sanity";
import ContactClient from "./ContactClient";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("contact");
  const title =
    content?.seo?.metaTitle ||
    (content?.title
      ? `${content.title} — 7th Heaven`
      : "Contact 7th Heaven | Band Management, Booking & Media Contacts");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Get in touch with 7th Heaven management for show booking, press inquiries, technical production advance, and cruise details.";
  const canonicalUrl = "https://7thheavenband.com/contact";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "7th Heaven",
      type: "website",
      images: [
        {
          url: "https://7thheavenband.com/images/logos/7thheavenlogo.jpg",
          width: 1200,
          height: 630,
          alt: "Contact 7th Heaven Band Management",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@7thheavenband",
      title,
      description,
      images: ["https://7thheavenband.com/images/logos/7thheavenlogo.jpg"],
    },
  };
}

export const revalidate = 60;

const MARY_CONTACT = {
  category: "Cruise • Excursions / Hotels & Air",
  company: "NTD Vacations",
  name: "Mary Grivas",
  email: "Mary@NTDVacations.com",
  phone: "877-683-9753 Ext 5",
  note: null,
};

const FALLBACK_CONTACTS = [
  {
    category: "Booking",
    company: "NTD Management",
    name: null,
    email: "info@NTDManagement.com",
    phone: "847-551-5363",
    note: null,
  },
  {
    category: "Press • Media",
    company: "NTD Records",
    name: "Lenny Rago",
    email: "LRago@NTDRecords.com",
    phone: "847-269-6200",
    note: null,
  },
  {
    category: "Technical • Production • Advance",
    company: null,
    name: "Jeff Dobbs",
    email: "jeffdobbs64@yahoo.com",
    phone: "847-772-5333",
    note: null,
  },
  {
    category: "Advance — Non-Technical",
    company: null,
    name: "Alan McRae",
    email: "Alan@NTDManagement.com",
    phone: "630-842-9129",
    note: null,
  },
  MARY_CONTACT,
];

export default async function ContactPage() {
  ReactDOM.preload("/images/contact/dickie-contact.webp", {
    as: "image",
    fetchPriority: "high",
    media: "(min-width: 769px)",
  });
  ReactDOM.preload("/images/contact/dickie-contact-mobile.webp", {
    as: "image",
    fetchPriority: "high",
    media: "(max-width: 768px)",
  });

  const [settingsData, pageContent] = await Promise.all([
    sanityClient.fetch<SanitySiteSettings | null>(
      queries.siteSettings,
      {},
      { next: { revalidate: 60, tags: ["sanity:settings"] } },
    ),
    fetchPageContent("contact"),
  ]);

  const settings = settingsData as SanitySiteSettings | null;
  const baseContacts = pageContent?.contacts?.length
    ? pageContent.contacts
    : settings?.contacts?.length
      ? settings.contacts
      : FALLBACK_CONTACTS;

  const contacts = [...baseContacts];
  if (
    !contacts.some((c) =>
      c.email?.toLowerCase().includes("mary@ntdvacations.com"),
    )
  ) {
    contacts.push(MARY_CONTACT);
  }

  const title = pageContent?.heroHeading || pageContent?.title || "CONTACT";
  const subtitle =
    pageContent?.heroSubheading ||
    "Get in touch with the 7th Heaven team. Hover or select a contact department below to view representative details.";

  const contactPageLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact 7th Heaven Band Management",
    description: "Official contact directory for 7th Heaven booking, press, technical advance, and cruise management.",
    url: "https://7thheavenband.com/contact",
    mainEntity: {
      "@type": "Organization",
      name: "7th Heaven Band & NTD Management",
      telephone: "847-551-5363",
      email: "info@NTDManagement.com",
      url: "https://7thheavenband.com",
    },
  };

  return (
    <>
      <script
        id="contact-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactPageLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      <ContactClient contacts={contacts} title={title} subtitle={subtitle} />
    </>
  );
}
