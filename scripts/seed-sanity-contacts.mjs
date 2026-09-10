import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1dg5ciuj",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  console.log("Updating Sanity CMS contacts and pageContent...");

  const contactsData = [
    {
      _key: "contact_booking",
      category: "Booking",
      company: "NTD Management",
      name: "7th Heaven Representative",
      email: "info@NTDManagement.com",
      phone: "847-551-5363",
    },
    {
      _key: "contact_press",
      category: "Press • Media",
      company: "NTD Records",
      name: "Lenny Rago",
      email: "LRago@NTDRecords.com",
      phone: "847-269-6200",
    },
    {
      _key: "contact_tech",
      category: "Technical • Production • Advance",
      company: "",
      name: "Jeff Dobbs",
      email: "jeffdobbs64@yahoo.com",
      phone: "847-772-5333",
    },
    {
      _key: "contact_nontech",
      category: "Advance — Non-Technical",
      company: "",
      name: "Alan McRae",
      email: "Alan@NTDManagement.com",
      phone: "630-842-9129",
    },
    {
      _key: "contact_cruise",
      category: "Cruise • Excursions / Hotels & Air",
      company: "NTD Vacations",
      name: "Mary Grivas",
      email: "Mary@NTDVacations.com",
      phone: "877-683-9753 Ext 5",
    },
  ];

  // 1. Update siteSettings singleton contacts
  const existingSettings = await client.fetch(`*[_type == "siteSettings"][0]._id`);
  const settingsId = existingSettings || "siteSettings";

  await client.createIfNotExists({
    _id: settingsId,
    _type: "siteSettings",
    bandName: "7th Heaven",
  });

  await client.patch(settingsId).set({ contacts: contactsData }).commit();
  console.log("✓ Updated siteSettings.contacts in Sanity!");

  // 2. Create/Update pageContent for 'contact'
  const existingContactDoc = await client.fetch(`*[_type == "pageContent" && (pageKey == "contact" || pageKey == "contactUs")][0]._id`);
  const pageDocId = existingContactDoc || "pageContent-contact";

  await client.createOrReplace({
    _id: pageDocId,
    _type: "pageContent",
    pageKey: "contact",
    title: "CONTACT 7TH HEAVEN",
    heroHeading: "CONTACT 7TH HEAVEN",
    heroSubheading: "Get in touch with the 7th Heaven team. Select a department below for representative details.",
    contacts: contactsData,
  });
  console.log("✓ Updated pageContent for 'contact' in Sanity!");

  // 3. Create/Update pageContent for 'contactUs' as well
  const pageDocUsId = "pageContent-contactUs";
  await client.createOrReplace({
    _id: pageDocUsId,
    _type: "pageContent",
    pageKey: "contactUs",
    title: "CONTACT 7TH HEAVEN",
    heroHeading: "CONTACT 7TH HEAVEN",
    heroSubheading: "Get in touch with the 7th Heaven team. Select a department below for representative details.",
    contacts: contactsData,
  });
  console.log("✓ Updated pageContent for 'contactUs' in Sanity!");

  console.log("All Sanity data populated successfully!");
}

main().catch((err) => {
  console.error("Error updating Sanity:", err);
  process.exit(1);
});
