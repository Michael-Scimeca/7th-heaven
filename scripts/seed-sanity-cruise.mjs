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
  console.log("Seeding Sanity CMS with complete Cruise page data & guidelines...");

  // Concierge Founders / Team
  const founders = [
    {
      _key: "founder_rich",
      name: "Richard Hofherr",
      role: "7th Heaven Founder & Band Representative",
      desc: "Contact Richard for band performances, special events, and music programming on board.",
      email: "info@NTDManagement.com",
      phone: "847-551-5363",
    },
    {
      _key: "founder_mary",
      name: "Mary Grivas",
      role: "Cruise & Reservation Manager (NTD Vacations)",
      desc: "Contact Mary for cabin bookings, stateroom availability, group pricing, payments, and flight/hotel arrangements.",
      email: "Mary@NTDVacations.com",
      phone: "877-683-9753 Ext 5",
    },
    {
      _key: "founder_alan",
      name: "Alan McRae",
      role: "Non-Technical Advance & Group Logistics",
      desc: "Contact Alan for group logistics, non-technical advance questions, and fan event coordination.",
      email: "Alan@NTDManagement.com",
      phone: "630-842-9129",
    },
  ];

  // Cruise Details, Guidelines & Resources
  const cruiseInfo = {
    stateroomsTitle: "STATEROOMS & CRUISE RATES",
    stateroomsSubtitle: "Browse group rate options, prevailing market rates, suite class inclusions, and booking cancellation terms.",
    bookingPolicyHeading: "BOOK THROUGH US TO PARTICIPATE & LOCK IN BEST RATES",
    bookingPolicyBody: "To be part of our events, eat dinner together with the band and fans, and for us to assist you, your reservation must be placed under our official group booking.",
    bookingEmail: "info@NTDVacations.com",
    bookingPhone: "(877) 683-9753 - opt 5",
    depositInfo: "$250/person ($500/room).",
    finalPayment2027: "Oct 1, 2026",
    finalPayment2028: "Oct 1, 2027",
    passportTitle: "PASSPORT GUIDELINES",
    passportSubheading: "ESSENTIAL TRAVEL DOCUMENT GUIDELINES",
    passportBody: "A physical passport book valid for 6 months post-cruise is highly recommended for all travelers. For closed-loop U.S. sailings, a certified state birth certificate accompanied by a government-issued photo ID is legally acceptable.",
    cancellationTitle: "CANCELLATION POLICY",
    cancellationSubheading: "REFUND TERMS BEFORE BOOKING",
    cancellationTerms2027: "Cancel before May 12, 2026: No penalty\nMay 12 – July 12, 2026: $50 pp fee\nJuly 13 – Sept 10, 2026: $100 pp fee\nSept 11 – Nov 10, 2026: $200 pp fee",
    cancellationTerms2028: "Cancel before May 13, 2027: No penalty\nMay 13 – July 13, 2027: $50 pp fee",
    cabins: [
      // 2027 Cabins
      {
        _key: "cabin_2027_q2",
        code: "Q2",
        title: "Interior Plus",
        year: "2027",
        price: "$1,683.27",
        status: "soldout",
        badge: "Group Rate Sold Out - Book Prevailing",
        imagePath: "/images/cruise/q2_interior_plus.jpg",
        selectValue: "group_n5",
      },
      {
        _key: "cabin_2027_n5",
        code: "N5",
        title: "Ocean View",
        year: "2027",
        price: "$1,883.27",
        status: "warning",
        badge: "1 Cabin Left!",
        imagePath: "/images/cruise/n5.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_n5",
      },
      {
        _key: "cabin_2027_if",
        code: "IF",
        title: "Infinite Central Park",
        year: "2027",
        price: "$2,033.27",
        status: "warning",
        badge: "2 Cabins Left!",
        imagePath: "/images/cruise/if.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_if",
      },
      {
        _key: "cabin_2027_d4",
        code: "D4",
        title: "Ocean View Balcony",
        year: "2027",
        price: "$2,433.27",
        status: "info",
        badge: "10 Available",
        imagePath: "/images/cruise/d1_ocean_view_balcony.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_d4",
      },
      {
        _key: "cabin_2027_d2",
        code: "D2",
        title: "Ocean View Balcony",
        year: "2027",
        price: "$2,483.27",
        status: "info",
        badge: "11 Available",
        imagePath: "/images/cruise/d1_ocean_view_balcony.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_d2",
      },
      {
        _key: "cabin_2027_i1",
        code: "I1",
        title: "Infinite Ocean View Balcony",
        year: "2027",
        price: "$2,583.27",
        status: "warning",
        badge: "5 Cabins Left!",
        imagePath: "/images/cruise/i1_infinite_ocean_view_balcony.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_i1",
      },
      // 2028 Cabins
      {
        _key: "cabin_2028_q2",
        code: "Q2",
        title: "Interior Plus",
        year: "2028",
        price: "$1,832.98",
        status: "info",
        badge: "Available",
        imagePath: "/images/cruise/q2_interior_plus.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_n5",
      },
      {
        _key: "cabin_2028_if",
        code: "IF",
        title: "Infinite Central Park",
        year: "2028",
        price: "$2,032.98",
        status: "info",
        badge: "Available",
        imagePath: "/images/cruise/if.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_if",
      },
      {
        _key: "cabin_2028_n5",
        code: "N5",
        title: "Ocean View",
        year: "2028",
        price: "$2,162.98",
        status: "info",
        badge: "Available",
        imagePath: "/images/cruise/n5.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_n5",
      },
      {
        _key: "cabin_2028_d4",
        code: "D4",
        title: "Ocean View Balcony",
        year: "2028",
        price: "$2,472.98",
        status: "info",
        badge: "Available",
        imagePath: "/images/cruise/d1_ocean_view_balcony.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_d4",
      },
      {
        _key: "cabin_2028_d2",
        code: "D2",
        title: "Ocean View Balcony",
        year: "2028",
        price: "$2,492.98",
        status: "info",
        badge: "Available",
        imagePath: "/images/cruise/d1_ocean_view_balcony.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_d2",
      },
      {
        _key: "cabin_2028_i1",
        code: "I1",
        title: "Infinite Ocean View Balcony",
        year: "2028",
        price: "$2,522.98",
        status: "info",
        badge: "Available",
        imagePath: "/images/cruise/i1_infinite_ocean_view_balcony.jpg",
        inclusions: "Gratuities Included",
        selectValue: "group_i1",
      },
    ],
    shipResources: [
      { _key: "res_wiki", label: "WIKI", url: "https://en.wikipedia.org/wiki/Star_of_the_Seas", icon: "wiki" },
      { _key: "res_royal", label: "ROYAL CARIBBEAN PAGE", url: "https://www.royalcaribbean.com/cruise-ships/star-of-the-seas", icon: "ship" },
      { _key: "res_deck", label: "DECK PLAN", url: "https://www.chicagomusiccruise.com/assets/staroftheseasdeckplanjan2026.jpg", icon: "map" },
      { _key: "res_video", label: "VIDEO OF THE SHIP", url: "https://youtu.be/SOf67Ysk04U?si=bduc0EEkLhYFD7GH", icon: "video" },
      { _key: "res_compass", label: "PAST CRUISE COMPASS", url: "https://www.chicagomusiccruise.com/assets/star-of-the-seas_cruisecompass-basic.pdf", icon: "doc" },
      { _key: "res_tour", label: "SHIP TOUR VIDEO", url: "https://youtu.be/0LxUHSdFDtY", icon: "film" },
      { _key: "res_promo", label: "PROMO VIDEO", url: "https://youtu.be/6xCQ4xE7L38", icon: "flame" },
      { _key: "res_fb", label: "FACEBOOK", url: "https://www.facebook.com/chicagomusiccruise/", icon: "facebook" },
      { _key: "res_ig", label: "INSTAGRAM", url: "https://www.instagram.com/chicagomusiccruise", icon: "instagram" },
    ],
  };

  // 13 Cruise FAQs from FAQS_EXTENDED
  const faqs = [
    {
      _key: "faq_1",
      question: "What do I need to book the cruise?",
      answer: "Fill out the online booking form with your Legal Name (as it appears on your Passport), Date of Birth, Citizenship, Phone Number, Email Address, Credit Card Number, Credit Card Expiration Date, Billing Zip Code, 3-Digit Security Code, and desired room category. Submissions are sent directly to info@NTDVacations.com.",
    },
    {
      _key: "faq_2",
      question: "What is the cost?",
      answer: "Rates are based on room category, size, location, and configuration under our exclusive GROUP prices. We can also book you in any prevailing market rate, promotional sale rate, or custom suite class—just let us know your preference!",
    },
    {
      _key: "faq_3",
      question: "Do I need a Passport?",
      answer: "YES. The cruise travels through international waters to foreign island destinations and passes through U.S. Customs upon return to Florida. You MUST have a physical passport with you (valid for 6 months post-cruise, through July 2027 for the 2027 sailing). Passport processing takes 4–5 months at local Post Offices. Certified state birth certificates with government photo IDs are legally acceptable for closed-loop U.S. sailings, but a physical passport book is strongly recommended.",
    },
    {
      _key: "faq_4",
      question: "What does the group price include?",
      answer: "Your cruise fare includes: Accommodations (private room with shower cleaned daily by a stateroom attendant), Unlimited meals across main dining rooms, buffets, cafes, and 24-hour food spots (water, lemonade, juice, coffee, tea included), All Chicago Music Cruise exclusive concerts & band events, Pre-Cruise Party dinner and drinks, Group T-shirt & free giveaways, Youth & Teen programs (Adventure Ocean), Pools, hot tubs, Casino, Nightlife, Comedy Shows, AquaDome Water Shows, Ice Skating Shows, Main Stage Theater Shows, and access to group deals on hotels and shuttles. *NOTE: You must be booked through NTD Vacations to participate in group events and giveaways.",
    },
    {
      _key: "faq_5",
      question: "What is NOT included in the cruise fare?",
      answer: "Airfare, Travel Insurance (optional), Ground Transportation/Shuttles to/from the ship, Shore Excursions, Meals in Specialty restaurants, Alcoholic beverages, Beer, Wine, Cocktails, Soda, Bottled Water, Laundry, Spa & Salon Services, Casino Gambling, Onboard Shopping, and Gratuities. *Note: Gratuities ARE fully included only with our Group Rate rooms.",
    },
    {
      _key: "faq_6",
      question: "When is Payment Due?",
      answer: "Final Payment for the Chicago Music Cruise 2027 is October 1, 2026 (and October 1, 2027 for the 2028 Legend of the Seas cruise). You can make partial payments at any time. If final payment is not met by the due date, the reservation will cancel and the deposit will be refunded (no exceptions). All payments are charged directly by Royal Caribbean Cruises.",
    },
    {
      _key: "faq_7",
      question: "What if I want to sit with someone at dinner?",
      answer: "Send us your dining request when you book! We will request to link your staterooms so you sit together for main group dinners. Space fills up quickly for early dining seating, so let us know right away.",
    },
    {
      _key: "faq_8",
      question: "Should I get Travel Insurance?",
      answer: "Travel insurance is optional. Rates depend on your room category and insurance MUST be requested upon booking to be included on your booking form. Within 120 days of sailing, you will need to contact a private third-party travel insurance company.",
    },
    {
      _key: "faq_9",
      question: "What is the Cancellation Policy?",
      answer: "Group Rate Rooms: Cancel with no penalty before May 12, 2026. Cancel May 12 – July 12, 2026 ($50 pp fee); July 13 – Sept 10, 2026 ($100 pp fee); Sept 11 – Nov 10, 2026 ($200 pp fee); After Nov 10, 2026 (50% room cost); After Dec 10, 2026 (No Refund). If you get in a bind without insurance, we can work with Royal Caribbean to attempt a credit for a future cruise ($100 change fee pp). Prevailing Rate Rooms (Refundable): Cancel by Oct 10, 2026 for no penalty. Cancel Oct 12–26 (lose 25%); Oct 27 – Nov 10 (lose 50%); After Nov 10 (100% loss). Non-Refundable Prevailing Rates: Deposit is non-refundable upon cancellation.",
    },
    {
      _key: "faq_10",
      question: "How Do I Sign-Up For Drink Packages, Shows & Excursions?",
      answer: "After your booking is confirmed, you can manage your reservation online via Royal Caribbean's Cruise Planner portal to add drink packages, specialty dining, show reservations, and shore excursions. Look out for holiday sales for extra savings!",
    },
    {
      _key: "faq_11",
      question: "How do I pay for onboard purchases?",
      answer: "All onboard purchases are charged to your personal Cruise Card (SeaPass), eliminating cash onboard. Register your credit card, debit card, or cash deposit at Cruise Card Activation Points or Guest Services upon boarding.",
    },
    {
      _key: "faq_12",
      question: "Is Internet access available from the ship?",
      answer: "Yes, high-speed VOOM WiFi is available onboard for an additional fee (included in select Suite Class rooms).",
    },
    {
      _key: "faq_13",
      question: "When Do We Depart Port Canaveral, FL (Orlando)?",
      answer: "Guests should arrive at the pier between 12:00 PM and 3:30 PM on sailing day. Online Check-in must be completed via Royal Caribbean no later than 3 days prior to sailing to comply with government manifest regulations.",
    },
  ];

  // Sections metadata
  const sections = [
    {
      _key: "sec_hero",
      sectionId: "hero",
      title: "7TH HEAVEN FAN CRUISE",
      subtitle: "CHICAGO MUSIC CRUISE · OVER 25 YEARS (1998 – 2028)",
    },
    {
      _key: "sec_ports",
      sectionId: "ports",
      title: "Ports of Call Catalog",
      subtitle: "Destination Explorer",
    },
    {
      _key: "sec_cabins",
      sectionId: "cabins",
      title: "STATEROOMS & CRUISE RATES",
      subtitle: "Browse group rate options, prevailing market rates, suite class inclusions, and booking cancellation terms.",
    },
    {
      _key: "sec_itinerary",
      sectionId: "itinerary",
      title: "7th Heaven Cruise Schedule",
      subtitle: "Day-by-Day Concert & Event Itinerary",
    },
    {
      _key: "sec_faqs",
      sectionId: "faqs",
      title: "Frequently Asked Questions",
      subtitle: "Find answers to important passport requirements, dining configurations, payment plans, and booking rules.",
    },
  ];

  // Ports of Call Catalog
  const ports = [
    {
      _key: "port_canaveral",
      name: "Port Canaveral (Orlando), FL",
      desc: "The premier Florida departure port for Star of the Seas, convenient to Orlando theme parks (Disney, Universal Studios) and Kennedy Space Center.",
      image: "/images/cruise/ports/orlando1.jpg",
      gallery: ["/images/cruise/ports/orlando1.jpg", "/images/cruise/ports/orlando2.jpg"],
      highlights: ["Close to Orlando Theme Parks", "Kennedy Space Center Excursions", "Deepwater Cruise Terminal"],
    },
    {
      _key: "port_cococay",
      name: "Perfect Day at CocoCay, Bahamas",
      desc: "Royal Caribbean's award-winning private island destination featuring Thrill Waterpark (with Daredevil's Peak), Coco Beach Club overwater cabanas, Oasis Lagoon, and pristine beaches.",
      image: "/images/cruise/ports/cococay.jpg",
      gallery: [
        "/images/cruise/ports/cococay.jpg",
        "/images/cruise/ports/june_2024.jpg",
        "/images/cruise/ports/rci_cococay_cocobeachclubinfinitypool_ret.jpg",
        "/images/cruise/ports/rci_cococay_overwatercabanas2.jpg",
        "/images/cruise/ports/rci_pdc_042019_daredevilstower_ret.jpg",
        "/images/cruise/ports/cococay2.jpg",
        "/images/cruise/ports/cococay12.jpg",
      ],
      highlights: ["Thrill Waterpark & Daredevil's Peak", "Overwater Cabanas & Infinity Pool", "Oasis Lagoon & Swim-Up Bar"],
    },
    {
      _key: "port_stthomas",
      name: "St. Thomas (USVI)",
      desc: "Pristine turquoise waters, world-famous Magens Bay beach, duty-free shopping in Charlotte Amalie, and breathtaking panoramic overlooks.",
      image: "/images/cruise/ports/stthomas1.jpg",
      gallery: ["/images/cruise/ports/stthomas1.jpg", "/images/cruise/ports/stthomas2.jpg"],
      highlights: ["Magens Bay World Class Beach", "Duty-Free Shopping in Charlotte Amalie", "Skyride to Paradise Point"],
    },
    {
      _key: "port_stmaarten",
      name: "St. Maarten",
      desc: "The stunning dual-culture island featuring Dutch Philipsburg front-street shopping and French Marigot gourmet cafes, plus Maho Beach jet-plane spotting.",
      image: "/images/cruise/ports/stmaartin1.jpg",
      gallery: ["/images/cruise/ports/stmaartin1.jpg", "/images/cruise/ports/stmaarten2.jpg"],
      highlights: ["Dual Dutch/French Island Cultures", "Maho Beach Jet Spotting", "Philipsburg Boardwalk & Shopping"],
    },
    {
      _key: "port_curacao",
      name: "Willemstad, Curacao",
      desc: "A colorful UNESCO World Heritage site famous for Dutch colonial architecture, Queen Emma floating pontoon bridge, and vibrant island culture.",
      image: "/images/cruise/ports/stmaarten2.jpg",
      gallery: ["/images/cruise/ports/stmaarten2.jpg"],
      highlights: ["UNESCO Handelskade Waterfront", "Queen Emma Floating Bridge", "Curacao Liqueur Distilleries"],
    },
    {
      _key: "port_aruba",
      name: "Oranjestad, Aruba",
      desc: "Famous for white sand beaches, flamingo beach islands, Dutch colonial architecture, and crystal-clear Caribbean waters.",
      image: "/images/cruise/ports/cococay12.jpg",
      gallery: ["/images/cruise/ports/cococay12.jpg"],
      highlights: ["Eagle & Palm Beaches", "Dutch Colonial Plaza", "Shipwreck Snorkeling Excursions"],
    },
    {
      _key: "port_caborojo",
      name: "Cabo Rojo, Dominican Republic",
      desc: "Royal Caribbean's newest eco-port destination on the Dominican Republic's southwest coast, featuring untouched white beaches and natural coastal wonders.",
      image: "/images/cruise/ports/cococay.jpg",
      gallery: ["/images/cruise/ports/cococay.jpg"],
      highlights: ["Untouched Eco-Beaches", "Pristine Nature Reserve", "Authentic Dominican Culture"],
    },
  ];

  // 2027 Day-by-Day Itinerary Schedule
  const itinerary2027 = [
    {
      _key: "itin2027_1", day: 1, port: "Port Canaveral, Florida (Orlando)", label: "Depart 4:30pm", theme: "WELCOME ABOARD & SAIL AWAY", icon: "🚢", type: "depart", photo: "/images/cruise/port-canaveral-docked.png",
      schedule: [
        { _key: "s2027_1_1", time: "12:00 PM", event: "VIP Boarding & Check-In at Port Canaveral", cat: "ship" },
        { _key: "s2027_1_2", time: "4:30 PM", event: "🎸 Sail-Away Concert — AquaDome / Pool Deck", cat: "band" },
        { _key: "s2027_1_3", time: "9:00 PM", event: "🎸 7th Heaven: The Classics Live - Main Theater", cat: "band" },
      ],
    },
    {
      _key: "itin2027_2", day: 2, port: "Cococay, Bahamas (Private Island)", label: "7:00am - 4:00pm", theme: "COCOCAY ISLAND BEACH PARTY", icon: "🏝️", type: "island", photo: "/images/cruise/cococay-beach-party.png",
      schedule: [
        { _key: "s2027_2_1", time: "7:00 AM", event: "Dock at Royal Caribbean's Private Island (7:00am - 4:00pm)", cat: "ship" },
        { _key: "s2027_2_2", time: "1:00 PM", event: "🎸 Oasis Lagoon Poolside Jam", cat: "band" },
        { _key: "s2027_2_3", time: "4:00 PM", event: "All Aboard & Sunset Departure", cat: "ship" },
      ],
    },
    {
      _key: "itin2027_3", day: 3, port: "Day At Sea", label: "Rock & Roll At Sea", theme: "ROCK & ROLL DAY AT SEA", icon: "🌊", type: "sea", photo: "/images/cruise/at-sea.png",
      schedule: [
        { _key: "s2027_3_1", time: "11:00 AM", event: "🎸 Band Q&A & Photo Session - Deck 11 Lounge", cat: "band" },
        { _key: "s2027_3_2", time: "3:30 PM", event: "🎸 Poolside Acoustic Set", cat: "band" },
        { _key: "s2027_3_3", time: "10:00 PM", event: "🎸 Late Night 80s Rock Party - Main Theater", cat: "band" },
      ],
    },
    {
      _key: "itin2027_4", day: 4, port: "St. Thomas", label: "12:30pm - 8:00pm", theme: "ST. THOMAS TROPICAL EXCURSIONS", icon: "🏝️", type: "island", photo: "/images/cruise/st-thomas-island.png",
      schedule: [
        { _key: "s2027_4_1", time: "12:30 PM", event: "Dock in St. Thomas (12:30pm - 8:00pm)", cat: "ship" },
        { _key: "s2027_4_2", time: "6:00 PM", event: "Sunset Deck Hang overlooking Magens Bay", cat: "explore" },
        { _key: "s2027_4_3", time: "8:00 PM", event: "Ship Departs St. Thomas", cat: "ship" },
      ],
    },
    {
      _key: "itin2027_5", day: 5, port: "St. Maarten", label: "8:00am - 5:00pm", theme: "ST. MAARTEN ACOUSTIC SUNSET", icon: "🏝️", type: "island", photo: "/images/cruise/roatan.png",
      schedule: [
        { _key: "s2027_5_1", time: "8:00 AM", event: "Dock in St. Maarten (8:00am - 5:00pm)", cat: "ship" },
        { _key: "s2027_5_2", time: "10:30 AM", event: "Maho Beach plane spotting & Marigot French side tour", cat: "explore" },
        { _key: "s2027_5_3", time: "5:00 PM", event: "Ship Departs St. Maarten", cat: "ship" },
        { _key: "s2027_5_4", time: "9:00 PM", event: "🎸 7th Heaven Unplugged: Deep Cuts", cat: "band" },
      ],
    },
    {
      _key: "itin2027_6", day: 6, port: "Day At Sea", label: "Caribbean Cruising", theme: "ROCK THE OCEAN SHOWCASE", icon: "🌊", type: "sea", photo: "/images/cruise/at-sea.png",
      schedule: [
        { _key: "s2027_6_1", time: "1:00 PM", event: "Fan Rock Trivia & Prize Raffle", cat: "food" },
        { _key: "s2027_6_2", time: "4:00 PM", event: "Deck Party & Cocktail Hour", cat: "food" },
        { _key: "s2027_6_3", time: "9:30 PM", event: "🎸 Rock the Ocean Showcase - Main Deck", cat: "band" },
      ],
    },
    {
      _key: "itin2027_7", day: 7, port: "Day At Sea", label: "Grand Finale", theme: "7TH HEAVEN GRAND FINALE", icon: "🎸", type: "sea", photo: "/images/cruise/at-sea.png",
      schedule: [
        { _key: "s2027_7_1", time: "2:00 PM", event: "Farewell Fan Photo & Autographs - Deck 5", cat: "band" },
        { _key: "s2027_7_2", time: "9:00 PM", event: "🎸 7th Heaven Farewell Concert - Grand Theater", cat: "band" },
        { _key: "s2027_7_3", time: "11:30 PM", event: "🎸 After-Party Jam Session - Lounge 360", cat: "band" },
      ],
    },
    {
      _key: "itin2027_8", day: 8, port: "Port Canaveral, Florida (Orlando)", label: "Arrive 6:00am", theme: "DISEMBARKATION", icon: "⚓", type: "depart", photo: "/images/cruise/port-canaveral-docked.png",
      schedule: [
        { _key: "s2027_8_1", time: "6:00 AM", event: "Arrive back in Port Canaveral (Orlando)", cat: "ship" },
        { _key: "s2027_8_2", time: "8:00 AM", event: "Farewell Breakfast & Disembarkation", cat: "ship" },
      ],
    },
  ];

  // 2028 Day-by-Day Itinerary Schedule
  const itinerary2028 = [
    {
      _key: "itin2028_1", day: 1, port: "Ft. Lauderdale, Florida", label: "Embarkation", theme: "SAIL-AWAY COCKTAILS", icon: "🚢", type: "depart", photo: "/images/cruise/miami.png",
      schedule: [
        { _key: "s2028_1_1", time: "12:00 PM", event: "Boarding begins at Ft. Lauderdale port", cat: "ship" },
        { _key: "s2028_1_2", time: "4:30 PM", event: "Legend of the Seas Departs Ft. Lauderdale", cat: "ship" },
        { _key: "s2028_1_3", time: "5:00 PM", event: "🎸 CMC Sail-Away Cocktails & Group Greeting", cat: "band" },
        { _key: "s2028_1_4", time: "8:30 PM", event: "Group dinner in main dining room", cat: "food" },
      ],
    },
    {
      _key: "itin2028_2", day: 2, port: "At Sea", label: "Caribbean Sea Day", theme: "POOLSIDE ROCK", icon: "🌊", type: "sea", photo: "/images/cruise/at-sea.png",
      schedule: [
        { _key: "s2028_2_1", time: "10:00 AM", event: "Explore the ship amenities & pools", cat: "explore" },
        { _key: "s2028_2_2", time: "2:00 PM", event: "🎸 7th Heaven Acoustic Poolside Set", cat: "band" },
        { _key: "s2028_2_3", time: "8:00 PM", event: "Formal Dining & Group Photos", cat: "food" },
      ],
    },
    {
      _key: "itin2028_3", day: 3, port: "At Sea", label: "Heading South", theme: "MAIN THEATER SHOWCASE", icon: "🌊", type: "sea", photo: "/images/cruise/at-sea.png",
      schedule: [
        { _key: "s2028_3_1", time: "1:00 PM", event: "🎸 Live Fan Q&A and Trivia with the Band", cat: "band" },
        { _key: "s2028_3_2", time: "8:30 PM", event: "🎸 Full Electric Concert set in main theater", cat: "band" },
      ],
    },
    {
      _key: "itin2028_4", day: 4, port: "Willemstad, Curacao", label: "Dutch Antilles Port", theme: "HISTORIC WATERFRONT EXPLORER", icon: "🏝️", type: "island", photo: "/images/cruise/roatan.png",
      schedule: [
        { _key: "s2028_4_1", time: "8:00 AM", event: "Dock in Willemstad, Curacao (8:00 AM - 5:00 PM)", cat: "ship" },
        { _key: "s2028_4_2", time: "9:00 AM", event: "Explore pastel historic Dutch waterfront & floating bridge", cat: "explore" },
        { _key: "s2028_4_3", time: "8:00 PM", event: "Late night deck cocktail mixer", cat: "food" },
      ],
    },
    {
      _key: "itin2028_5", day: 5, port: "Oranjestad, Aruba", label: "Southern Caribbean", theme: "BEACH & SNORKEL EXCURSIONS", icon: "🏝️", type: "island", photo: "/images/cruise/cozumel.png",
      schedule: [
        { _key: "s2028_5_1", time: "7:00 AM", event: "Dock in Oranjestad, Aruba (7:00 AM - 4:00 PM)", cat: "ship" },
        { _key: "s2028_5_2", time: "9:00 AM", event: "White beach excursions & crystal water snorkeling", cat: "explore" },
        { _key: "s2028_5_3", time: "8:00 PM", event: "🎸 Caribbean Themed Night dinner & music", cat: "band" },
      ],
    },
    {
      _key: "itin2028_6", day: 6, port: "Cabo Rojo, Dominican Republic", label: "New Eco-Port", theme: "ECO-BEACH EXPERIENCE", icon: "🏝️", type: "island", photo: "/images/cruise/grand-cayman.png",
      schedule: [
        { _key: "s2028_6_1", time: "11:00 AM", event: "Dock in Cabo Rojo, DR (11:00 AM - 6:00 PM)", cat: "ship" },
        { _key: "s2028_6_2", time: "12:00 PM", event: "Untouched beaches & eco-tourism exploration", cat: "explore" },
        { _key: "s2028_6_3", time: "8:30 PM", event: "🎸 CMC Rock Show - Main Deck Stage", cat: "band" },
      ],
    },
    {
      _key: "itin2028_7", day: 7, port: "At Sea", label: "Heading North", theme: "MUSIC HALL ROCK SHOW", icon: "🌊", type: "sea", photo: "/images/cruise/at-sea.png",
      schedule: [
        { _key: "s2028_7_1", time: "2:00 PM", event: "🎸 Group games, activity planners, & giveaways", cat: "band" },
        { _key: "s2028_7_2", time: "8:30 PM", event: "🎸 Final Electric Rock Show in Music Hall", cat: "band" },
      ],
    },
    {
      _key: "itin2028_8", day: 8, port: "Perfect Day at CocoCay, Bahamas", label: "Private Island", theme: "THRILL WATERPARK & DINNER", icon: "🏝️", type: "island", photo: "/images/cruise/cozumel.png",
      schedule: [
        { _key: "s2028_8_1", time: "8:00 AM", event: "Dock in CocoCay, Bahamas (8:00 AM - 5:00 PM)", cat: "ship" },
        { _key: "s2028_8_2", time: "10:00 AM", event: "Thrill Waterpark, beaches, slides & private pools", cat: "explore" },
        { _key: "s2028_8_3", time: "8:00 PM", event: "🎸 Farewell Group Dinner & Speech", cat: "band" },
      ],
    },
    {
      _key: "itin2028_9", day: 9, port: "Ft. Lauderdale, Florida", label: "Return Home", theme: "DISEMBARKATION", icon: "⚓", type: "depart", photo: "/images/cruise/miami.png",
      schedule: [
        { _key: "s2028_9_1", time: "6:00 AM", event: "Arrive back in Ft. Lauderdale", cat: "ship" },
        { _key: "s2028_9_2", time: "8:30 AM", event: "Farewell group picture & disembarkation", cat: "ship" },
      ],
    },
  ];

  // Cruise History (1998 - 2028)
  const history = [
    { _key: "h_2028", year: "2028", ship: "Legend of the Seas (Royal Caribbean)", details: "Southern Caribbean: Curacao, Aruba, Cabo Rojo DR, CocoCay Bahamas" },
    { _key: "h_2027", year: "2027", ship: "Star of the Seas (Royal Caribbean)", details: "Eastern Caribbean: CocoCay, St. Thomas, St. Maarten" },
    { _key: "h_2026", year: "2026", ship: "MSC World America", details: "Western Caribbean voyage with high-energy rock shows" },
    { _key: "h_2025", year: "2025", ship: "Oasis of the Seas & Icon of the Seas", details: "Double cruise years - historic sailing on the world's largest ships" },
    { _key: "h_2024", year: "2024", ship: "Utopia, Ovation & Wonder of the Seas", details: "Triple cruise year covering Eastern, Western, and Pacific routes" },
    { _key: "h_2023", year: "2023", ship: "Wonder of the Seas", details: "7-Night Western Caribbean adventure" },
    { _key: "h_2022", year: "2022", ship: "Wonder of the Seas", details: "March 18, 2022 departure - inaugural season celebrations" },
    { _key: "h_2020", year: "2020", ship: "Allure of the Seas", details: "Eastern Caribbean tour just before the spring season" },
    { _key: "h_2019", year: "2019", ship: "Symphony of the Seas", details: "Sailing January 26, 2019 - high energy deck parties" },
    { _key: "h_2018", year: "2018", ship: "Oasis of the Seas", details: "Sailing January 21, 2018 - fan favorite itinerary" },
    { _key: "h_2017", year: "2017", ship: "Harmony of the Seas", details: "January 7, 2017 departure" },
    { _key: "h_2016", year: "2016", ship: "Oasis of the Seas", details: "January 30, 2016 departure" },
    { _key: "h_2015", year: "2015", ship: "Oasis of the Seas", details: "January 24, 2015 departure" },
    { _key: "h_2012", year: "2012", ship: "Oasis of the Seas", details: "January 28, 2012 departure" },
    { _key: "h_2011", year: "2011", ship: "Allure of the Seas", details: "January 16, 2011 departure" },
    { _key: "h_2010", year: "2010", ship: "Oasis of the Seas", details: "February 20, 2010 departure" },
    { _key: "h_2009", year: "2009", ship: "Carnival Splendor", details: "November 15, 2009 departure" },
    { _key: "h_2008", year: "2008", ship: "Liberty of the Seas", details: "October 18, 2008 departure" },
    { _key: "h_2007", year: "2007", ship: "Liberty of the Seas", details: "October 13, 2007 departure" },
    { _key: "h_2006", year: "2006", ship: "Navigator of the Seas", details: "September 23, 2006 departure" },
    { _key: "h_2005", year: "2005", ship: "Carnival Triumph & Miracle", details: "Double sailing years - Summer and Fall voyages" },
    { _key: "h_2001", year: "2001", ship: "Grand Princess", details: "August 5, 2001 departure" },
    { _key: "h_1998", year: "1998", ship: "Majesty of the Seas", details: "August 16, 1998 - The inaugural 7th Heaven group cruise" },
  ];

  // Featured Artists
  const featuredArtists = [
    {
      _key: "art_nick",
      name: "Nick Cox",
      role: "Guitars • Vocals • Piano",
      desc: "Lead vocalist and guitarist performing high-energy rock sets, acoustic pool jams, and full-production theater concerts.",
      website: "https://www.7thheavenband.com/",
      logo: "🎸",
      photo: "/images/members/nick.webp",
    },
    {
      _key: "art_rich",
      name: "Rich Hofherr",
      role: "Guitars • Vocals • Keys",
      desc: "Founder and guitarist of 7th Heaven leading high-energy performances and crowd favorites.",
      website: "https://www.7thheavenband.com/",
      logo: "🎸",
      photo: "/images/members/dicky.webp",
    },
    {
      _key: "art_tony",
      name: "Tony Ocean",
      role: "Lead Vocals • Entertainer",
      desc: "Classic Pop, standards, crooner pop, and high-energy crowd favorites performing live mixers and special events.",
      website: "https://www.tonyoceanmusic.com/",
      logo: "🎤",
      photo: "/images/members/desktop-tony.png",
    },
  ];

  const pageDocId = "pageContent-cruise";

  await client.createOrReplace({
    _id: pageDocId,
    _type: "pageContent",
    pageKey: "cruise",
    title: "Caribbean Cruise",
    heroHeading: "7TH HEAVEN FAN CRUISE",
    heroSubheading: "CHICAGO MUSIC CRUISE · OVER 25 YEARS (1998 – 2028)",
    heroVideoUrl: "/movie/cruise-desktop.mp4",
    heroVideoMobileUrl: "/movie/cruise-mobile.mp4",
    heroPosterUrl: "/images/cruise/hero-video-poster.jpg",
    seo: {
      metaTitle: "7th Heaven Caribbean Cruise | Official Band Cruise 2027 & 2028",
      metaDescription: "Book your stateroom for 7th Heaven's official Caribbean Music Cruise. Live concerts, pool deck jams, VIP access, and tropical island adventures.",
    },
    founders,
    cruiseInfo,
    ports,
    itinerary2027,
    itinerary2028,
    history,
    featuredArtists,
    faqs,
    sections,
  });

  console.log("✓ Successfully seeded pageContent-cruise with ports, itineraries, history & guidelines into Sanity live!");
}

main().catch((err) => {
  console.error("Error seeding cruise page into Sanity:", err);
  process.exit(1);
});
