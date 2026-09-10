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
  console.log("Seeding Sanity CMS with complete FAQ page data...");

  const faqs = [
    // Experience & Booking
    {
      _key: "faq_arrive_time",
      category: "booking",
      question: "What time should I arrive?",
      answer: "Please be sure to arrive promptly at the time booked on your ticket to be sure to get the most out of your experience and screening.",
    },
    {
      _key: "faq_light_sensitivity",
      category: "booking",
      question: "Is this experience suitable for people with light sensitivity?",
      answer: "This film and installation includes flashing lights and strobe effects that may not be suitable for photosensitive individuals.",
    },
    {
      _key: "faq_how_to_book",
      category: "booking",
      question: "How do I book tickets or hire the band for an event?",
      answer: "Navigate to our Book Us page, fill out the booking request form with your event details (date, venue, and time), and submit it. Our system will immediately trigger an admin alert, and you will receive a status confirmation email once our team reviews the event details.",
    },
    {
      _key: "faq_booking_status_changes",
      category: "booking",
      question: "How will I track updates on my booking?",
      answer: "Whenever our event planner changes the status of your booking (e.g., from pending to confirmed), you will automatically receive a detailed status update email outlining all schedule details, venue name, and event setup.",
    },

    // Merch & Store
    {
      _key: "faq_delivery_methods",
      category: "merch",
      question: "What delivery options are available for merchandise?",
      answer: "We support two options during checkout: standard home delivery via our Shopify Storefront API, and Merch Table Pickup. Pickups allow you to collect your items directly at the merch table of our next live concert, saving you shipping costs!",
    },
    {
      _key: "faq_pickup_verification",
      category: "merch",
      question: "How do I verify and collect my pickup orders?",
      answer: "Once you place a pickup order, our system generates a unique QR code and sends it to you via email. Simply present this QR code on your mobile device at the show's merch table, where our crew will scan it to verify and release your items.",
    },
    {
      _key: "faq_shipping_timeframes",
      category: "merch",
      question: "How long does home shipping take?",
      answer: "Standard shipping orders processed via our Shopify API typically ship within 2 to 3 business days, and home delivery takes about 5 to 7 business days depending on your location.",
    },

    // Cruise
    {
      _key: "faq_cruise_signup",
      category: "cruise",
      question: "How do I join the 7th Heaven Cruise community?",
      answer: "Head over to the Cruise page, select the guest count you are planning to bring, fill out your guest contact list, and check the option to join our newsletter. You will receive an immediate welcome invitation email to our cruise hub.",
    },
    {
      _key: "faq_cruise_cancel",
      category: "cruise",
      question: "What if I need to cancel my cruise signup?",
      answer: "Your Cruise Confirmation email contains a secure cancellation link. Clicking it allows you to cancel your signup instantly without needing to contact support, updating the admin roster in real-time.",
    },
    {
      _key: "faq_cruise_blasts",
      category: "cruise",
      question: "What is the Cruise Community Blast?",
      answer: "It's our dedicated news broadcast sent to all signed-up cruisers. These emails keep you up to date on cabin pricing previews, medley setlist votes, shore excursions, and cabin booking timelines.",
    },

    // Fan Club & Portal
    {
      _key: "faq_fan_perks",
      category: "fan",
      question: "What perks do Fan Members get?",
      answer: "Fan members enjoy exclusive perks including a custom Fan Dashboard, VIP rewards, early access to cruise announcements, proximity notifications for nearby concerts, entries into our live-show merch table raffles, and the ability to upload media to our Fan Photo/Video Wall.",
    },
    {
      _key: "faq_upload_moderation",
      category: "fan",
      question: "What happens when I upload photos to the Fan Wall?",
      answer: "To ensure content suitability, all uploaded photos and videos are placed in a moderation queue. Once our crew reviews your media, you will receive an automatic email notifying you if it was approved or rejected (with the specific rejection reason included in the alert).",
    },
    {
      _key: "faq_pin_number_purpose",
      category: "fan",
      question: "What is the security PIN email for?",
      answer: "To keep account creation simple and password-less, we send a secure 6-digit verification PIN to your email address during signup, password reset, or when verifying a new device. This applies to all system roles, including Fans, Planners, Crew, and Admins.",
    },
  ];

  const pageDocId = "pageContent-faq";

  await client.createOrReplace({
    _id: pageDocId,
    _type: "pageContent",
    pageKey: "faq",
    title: "Frequently Asked Questions",
    heroHeading: "FREQUENTLY ASKED QUESTIONS",
    heroSubheading: "Everything you need to know about 7th Heaven shows, booking, merchandise, fan perks, and the annual Caribbean Cruise.",
    searchPlaceholder: "Search questions, keywords, or topics...",
    seo: {
      metaTitle: "FAQ — 7th Heaven | Frequently Asked Questions",
      metaDescription: "Frequently asked questions about 7th Heaven shows, venue bookings, merchandise shipping, fan perks, and Caribbean Cruise details.",
    },
    faqs,
  });

  console.log("✓ Successfully seeded pageContent-faq with all FAQ data into Sanity live!");
}

main().catch((err) => {
  console.error("Error seeding FAQ page into Sanity:", err);
  process.exit(1);
});
