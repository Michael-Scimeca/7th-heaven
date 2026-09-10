// Sanity Schema: Page Content
// Enables full text, hero headers, section titles, body copy, CTAs, and FAQs to be edited in Sanity Studio for any page.

const getDocKey = (doc: any) => {
  if (!doc) return "";
  return `${doc?.pageKey || ""} ${doc?._id || ""} ${doc?.title || ""}`.toLowerCase();
};

const isContactDoc = (doc: any) => getDocKey(doc).includes("contact");
const isCruiseDoc = (doc: any) => getDocKey(doc).includes("cruise");
const isFaqDoc = (doc: any) => getDocKey(doc).includes("faq");
const isHomeDoc = (doc: any) => getDocKey(doc).includes("home");
const isRockDoc = (doc: any) => getDocKey(doc).includes("rock");
const isBookDoc = (doc: any) => getDocKey(doc).includes("book") || getDocKey(doc).includes("product");
const isMediaDoc = (doc: any) => getDocKey(doc).includes("media");

const pageContent = {
  name: "pageContent",
  title: "Page Content",
  type: "document",
  fields: [
    {
      name: "pageKey",
      title: "Page Identifier",
      type: "string",
      description: "Unique page identifier (e.g. 'home', 'cruise', 'book', 'contact', 'media', 'faq', 'studio-d')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "seo",
      title: "Page SEO Settings",
      type: "object",
      description: "Custom SEO overrides for meta title, meta description, and social sharing image",
      fields: [
        { name: "metaTitle", title: "Meta Title", type: "string" },
        { name: "metaDescription", title: "Meta Description", type: "text", rows: 3 },
        { name: "ogImage", title: "Open Graph Image", type: "image", options: { hotspot: true } },
      ],
    },
    {
      name: "heroHeading",
      title: "Hero Heading",
      type: "string",
    },
    {
      name: "heroSubheading",
      title: "Hero Subheading / Tagline",
      type: "text",
      rows: 3,
    },
    {
      name: "contacts",
      title: "Contact Department Cards",
      type: "array",
      description: "List of contact department cards (Category Pill, Representative Name, Company, Email, Phone)",
      hidden: ({ document }: any) => !isContactDoc(document),
      of: [
        {
          type: "object",
          name: "contactItem",
          title: "Contact Card",
          fields: [
            { name: "category", title: "Category / Department Pill", type: "string" },
            { name: "name", title: "Representative Name", type: "string" },
            { name: "company", title: "Company Name", type: "string" },
            { name: "email", title: "Email Address", type: "string" },
            { name: "phone", title: "Phone Number", type: "string" },
            { name: "note", title: "Internal Note / Special Info", type: "string" },
          ],
          preview: {
            select: { title: "category", subtitle: "name" },
          },
        },
      ],
    },
    {
      name: "videoShowcaseTitle",
      title: "Video Showcase Section Title",
      type: "string",
      description: "Title for the Video Showcase section on the Home Page (e.g. 'Videos & Live Media')",
      hidden: ({ document }: any) => !isHomeDoc(document),
    },
    {
      name: "videoShowcaseSubtitle",
      title: "Video Showcase Section Subtitle",
      type: "text",
      rows: 2,
      description: "Subtitle description for the Video Showcase section on the Home Page",
      hidden: ({ document }: any) => !isHomeDoc(document),
    },
    {
      name: "logosBadge",
      title: "Logos Section Badge Text",
      type: "string",
      description: "Badge header text for the Logos / Featured section on the Home Page (e.g. 'WHO WE'VE PLAYED WITH & WHERE WE'VE BEEN FEATURED')",
      hidden: ({ document }: any) => !isHomeDoc(document),
    },
    {
      name: "logosSubtitle",
      title: "Logos Section Subtitle",
      type: "text",
      rows: 3,
      description: "Description subtitle for the Logos / Featured section on the Home Page",
      hidden: ({ document }: any) => !isHomeDoc(document),
    },
    {
      name: "newsTitle",
      title: "Latest News Section Title",
      type: "string",
      description: "Title for the Latest Band News section on the Home Page (e.g. 'Latest Band News')",
      hidden: ({ document }: any) => !isHomeDoc(document),
    },
    {
      name: "newsSubtitle",
      title: "Latest News Section Subtitle",
      type: "text",
      rows: 2,
      description: "Subtitle description for the Latest Band News section on the Home Page",
      hidden: ({ document }: any) => !isHomeDoc(document),
    },
    {
      name: "artistLogos",
      title: "Artist / Stage Logos (Who We've Played With)",
      type: "array",
      hidden: ({ document }: any) => !isHomeDoc(document),
      of: [
        {
          type: "object",
          name: "logoItem",
          title: "Logo Item",
          fields: [
            { name: "alt", title: "Artist / Band Name", type: "string" },
            { name: "image", title: "Logo Image File", type: "image", options: { hotspot: true } },
            { name: "src", title: "Image Path / URL (Optional)", type: "string", description: "e.g. /images/press-logos/BonJovi.svg" },
          ],
          preview: {
            select: { title: "alt" },
          },
        },
      ],
    },
    {
      name: "pressLogos",
      title: "Press / Media Logos (Where We've Been Featured)",
      type: "array",
      hidden: ({ document }: any) => !isHomeDoc(document),
      of: [
        {
          type: "object",
          name: "pressLogoItem",
          title: "Press Logo Item",
          fields: [
            { name: "alt", title: "Media Outlet Name", type: "string" },
            { name: "image", title: "Logo Image File", type: "image", options: { hotspot: true } },
            { name: "src", title: "Image Path / URL (Optional)", type: "string", description: "e.g. /images/press-logos/Billboard.svg" },
          ],
          preview: {
            select: { title: "alt" },
          },
        },
      ],
    },
    {
      name: "heroCtaText",
      title: "Hero Button Text",
      type: "string",
      hidden: ({ document }: any) => isRockDoc(document) || isContactDoc(document) || isCruiseDoc(document),
    },
    {
      name: "heroCtaLink",
      title: "Hero Button Link",
      type: "string",
      hidden: ({ document }: any) => isRockDoc(document) || isContactDoc(document) || isCruiseDoc(document),
    },
    {
      name: "heroVideoUrl",
      title: "Hero Desktop Video URL / Path",
      type: "string",
      description: "URL or file path for the hero desktop background video (e.g. '/movie/cruise-desktop.mp4')",
      hidden: ({ document }: any) => isContactDoc(document),
    },
    {
      name: "heroVideoMobileUrl",
      title: "Hero Mobile Video URL / Path",
      type: "string",
      description: "URL or file path for the hero mobile background video (e.g. '/movie/cruise-mobile.mp4')",
      hidden: ({ document }: any) => isContactDoc(document),
    },
    {
      name: "heroPosterUrl",
      title: "Hero Video Poster Image URL / Path",
      type: "string",
      description: "URL or file path for the hero video poster image (e.g. '/images/cruise/hero-video-poster.jpg')",
      hidden: ({ document }: any) => isContactDoc(document),
    },
    {
      name: "heroBannerImage",
      title: "Hero Banner Image / Poster File",
      type: "image",
      options: { hotspot: true },
      description: "Full width hero banner or video poster image file",
      hidden: ({ document }: any) => isContactDoc(document) || isCruiseDoc(document),
    },
    {
      name: "sections",
      title: "Page Sections",
      type: "array",
      hidden: ({ document }: any) => isContactDoc(document),
      of: [
        {
          type: "object",
          name: "pageSection",
          title: "Section",
          fields: [
            { name: "sectionId", title: "Section ID / Anchor", type: "string", description: "e.g. 'about', 'pricing', 'features'" },
            { name: "title", title: "Section Title", type: "string" },
            { name: "subtitle", title: "Section Subtitle", type: "string" },
            {
              name: "body",
              title: "Body Copy",
              type: "text",
              rows: 4,
              hidden: ({ document }: any) => isRockDoc(document) || isCruiseDoc(document),
            },
            {
              name: "ctaText",
              title: "CTA Button Text",
              type: "string",
              hidden: ({ document }: any) => isRockDoc(document) || isCruiseDoc(document),
            },
            {
              name: "ctaLink",
              title: "CTA Button Link",
              type: "string",
              hidden: ({ document }: any) => isRockDoc(document) || isCruiseDoc(document),
            },
            {
              name: "image",
              title: "Section Image",
              type: "image",
              options: { hotspot: true },
              hidden: ({ document }: any) => isRockDoc(document) || isCruiseDoc(document),
            },
          ],
          preview: {
            select: { title: "title", subtitle: "sectionId" },
          },
        },
      ],
    },
    {
      name: "characters",
      title: "Character Roster",
      type: "array",
      hidden: ({ document }: any) => !isRockDoc(document),
      of: [
        {
          type: "object",
          name: "characterItem",
          title: "Character",
          fields: [
            { name: "name", title: "Character Name", type: "string" },
            { name: "role", title: "Band / Stage Role", type: "string" },
            { name: "desc", title: "Description", type: "text", rows: 3 },
            { name: "image", title: "Character Image", type: "image", options: { hotspot: true } },
          ],
          preview: {
            select: { title: "name", subtitle: "role" },
          },
        },
      ],
    },
    {
      name: "products",
      title: "Products / Books / Comics",
      type: "array",
      hidden: ({ document }: any) => !isBookDoc(document),
      of: [
        {
          type: "object",
          name: "productItem",
          title: "Book / Product Item",
          fields: [
            { name: "title", title: "Book Title", type: "string" },
            { name: "badge", title: "Badge / Tag", type: "string" },
            { name: "desc", title: "Description", type: "text", rows: 3 },
            { name: "amazonUrl", title: "Amazon / Buy URL", type: "string" },
            { name: "coverImg", title: "Cover Image", type: "image", options: { hotspot: true } },
          ],
          preview: {
            select: { title: "title", subtitle: "badge" },
          },
        },
      ],
    },
    {
      name: "musicSingles",
      title: "Music Singles / Videos",
      type: "array",
      hidden: ({ document }: any) => !isMediaDoc(document) && !isHomeDoc(document),
      of: [
        {
          type: "object",
          name: "singleItem",
          title: "Single / Video",
          fields: [
            { name: "title", title: "Track Title", type: "string" },
            { name: "subtitle", title: "Subtitle", type: "string" },
            { name: "tag", title: "Tag / Category", type: "string" },
            { name: "desc", title: "Description", type: "text", rows: 3 },
            { name: "youtubeId", title: "YouTube Video ID", type: "string" },
            { name: "youtubeUrl", title: "YouTube Link", type: "string" },
          ],
          preview: {
            select: { title: "title", subtitle: "tag" },
          },
        },
      ],
    },
    {
      name: "founders",
      title: "Series Creators / Founders",
      type: "array",
      hidden: ({ document }: any) => !isCruiseDoc(document),
      of: [
        {
          type: "object",
          name: "founderItem",
          title: "Founder / Creator",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "role", title: "Role", type: "string" },
            { name: "desc", title: "Bio / Description", type: "text", rows: 3 },
            { name: "phone", title: "Phone", type: "string" },
            { name: "email", title: "Email", type: "string" },
            { name: "desktopImg", title: "Desktop Image", type: "image", options: { hotspot: true } },
            { name: "mobileImg", title: "Mobile Image", type: "image", options: { hotspot: true } },
          ],
          preview: {
            select: { title: "name", subtitle: "role" },
          },
        },
      ],
    },
    {
      name: "cruiseInfo",
      title: "Cruise Details, Policies & Resources",
      type: "object",
      hidden: ({ document }: any) => !isCruiseDoc(document),
      fields: [
        { name: "stateroomsTitle", title: "Staterooms Section Title", type: "string" },
        { name: "stateroomsSubtitle", title: "Staterooms Section Subtitle", type: "text", rows: 2 },
        { name: "bookingPolicyHeading", title: "Booking Policy Subheading", type: "string" },
        { name: "bookingPolicyBody", title: "Booking Policy Description", type: "text", rows: 3 },
        { name: "bookingEmail", title: "Booking Email", type: "string" },
        { name: "bookingPhone", title: "Booking Phone", type: "string" },
        { name: "depositInfo", title: "Deposit Requirement", type: "string" },
        { name: "finalPayment2027", title: "2027 Final Payment Date", type: "string" },
        { name: "finalPayment2028", title: "2028 Final Payment Date", type: "string" },
        { name: "passportTitle", title: "Passport Guidelines Title", type: "string" },
        { name: "passportSubheading", title: "Passport Subheading", type: "string" },
        { name: "passportBody", title: "Passport Guidelines Description", type: "text", rows: 3 },
        { name: "cancellationTitle", title: "Cancellation Policy Title", type: "string" },
        { name: "cancellationSubheading", title: "Cancellation Subheading", type: "string" },
        { name: "cancellationTerms2027", title: "2027 Cancellation Terms", type: "text", rows: 4 },
        { name: "cancellationTerms2028", title: "2028 Cancellation Terms", type: "text", rows: 4 },
        {
          name: "cabins",
          title: "Stateroom & Suite Cabin Cards",
          type: "array",
          of: [
            {
              type: "object",
              name: "cabinCard",
              title: "Cabin Card",
              fields: [
                { name: "code", title: "Category Code (e.g. Q2, N5, IF, D4, D2, I1)", type: "string" },
                { name: "title", title: "Stateroom Title", type: "string" },
                { name: "year", title: "Sailing Year ('2027' or '2028')", type: "string" },
                { name: "price", title: "Price per Person (e.g. $1,683.27)", type: "string" },
                { name: "status", title: "Status (info, warning, soldout)", type: "string" },
                { name: "badge", title: "Badge Text (e.g. '1 Cabin Left!', 'Group Rate Sold Out')", type: "string" },
                { name: "image", title: "Cabin Image File", type: "image", options: { hotspot: true } },
                { name: "imagePath", title: "Image Path / URL (e.g. '/images/cruise/q2_interior_plus.jpg')", type: "string" },
                { name: "inclusions", title: "Inclusions (e.g. 'Gratuities Included')", type: "string" },
                { name: "selectValue", title: "Form Selection Value", type: "string" },
              ],
              preview: {
                select: { title: "title", subtitle: "price" },
              },
            },
          ],
        },
        {
          name: "shipResources",
          title: "Ship Resources Links",
          type: "array",
          of: [
            {
              type: "object",
              name: "resourceLink",
              title: "Resource Link",
              fields: [
                { name: "label", title: "Link Label", type: "string" },
                { name: "url", title: "URL / File Path", type: "string" },
                { name: "icon", title: "Icon Type (wiki, ship, map, video, doc, film, flame, facebook, instagram)", type: "string" },
              ],
              preview: {
                select: { title: "label", subtitle: "url" },
              },
            },
          ],
        },
      ],
    },
    {
      name: "ports",
      title: "Ports of Call Catalog",
      type: "array",
      hidden: ({ document }: any) => !isCruiseDoc(document),
      of: [
        {
          type: "object",
          name: "portItem",
          title: "Port of Call",
          fields: [
            { name: "name", title: "Port Name", type: "string" },
            { name: "desc", title: "Description", type: "text", rows: 3 },
            { name: "image", title: "Main Image Path / File", type: "string" },
            { name: "highlights", title: "Port Highlights / Badges", type: "array", of: [{ type: "string" }] },
            { name: "gallery", title: "Gallery Images", type: "array", of: [{ type: "string" }] },
          ],
          preview: {
            select: { title: "name", subtitle: "desc" },
          },
        },
      ],
    },
    {
      name: "itinerary2027",
      title: "2027 Concert & Event Itinerary",
      type: "array",
      hidden: ({ document }: any) => !isCruiseDoc(document),
      of: [
        {
          type: "object",
          name: "itineraryDay",
          title: "Itinerary Day",
          fields: [
            { name: "day", title: "Day Number", type: "number" },
            { name: "port", title: "Port / Location", type: "string" },
            { name: "label", title: "Time / Port Hours Label", type: "string" },
            { name: "theme", title: "Day Theme", type: "string" },
            { name: "icon", title: "Icon (e.g. 🚢, 🏝️, 🌊, 🎸, ⚓)", type: "string" },
            { name: "type", title: "Type (depart, island, sea)", type: "string" },
            { name: "photo", title: "Photo Path", type: "string" },
            {
              name: "schedule",
              title: "Daily Schedule Events",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "scheduleEvent",
                  title: "Schedule Event",
                  fields: [
                    { name: "time", title: "Time", type: "string" },
                    { name: "event", title: "Event Title", type: "string" },
                    { name: "cat", title: "Category (ship, band, explore, food)", type: "string" },
                  ],
                  preview: { select: { title: "event", subtitle: "time" } },
                },
              ],
            },
          ],
          preview: { select: { title: "port", subtitle: "label" } },
        },
      ],
    },
    {
      name: "itinerary2028",
      title: "2028 Concert & Event Itinerary",
      type: "array",
      hidden: ({ document }: any) => !isCruiseDoc(document),
      of: [
        {
          type: "object",
          name: "itineraryDay2028",
          title: "Itinerary Day (2028)",
          fields: [
            { name: "day", title: "Day Number", type: "number" },
            { name: "port", title: "Port / Location", type: "string" },
            { name: "label", title: "Time / Port Hours Label", type: "string" },
            { name: "theme", title: "Day Theme", type: "string" },
            { name: "icon", title: "Icon", type: "string" },
            { name: "type", title: "Type (depart, island, sea)", type: "string" },
            { name: "photo", title: "Photo Path", type: "string" },
            {
              name: "schedule",
              title: "Daily Schedule Events",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "scheduleEvent",
                  title: "Schedule Event",
                  fields: [
                    { name: "time", title: "Time", type: "string" },
                    { name: "event", title: "Event Title", type: "string" },
                    { name: "cat", title: "Category (ship, band, explore, food)", type: "string" },
                  ],
                  preview: { select: { title: "event", subtitle: "time" } },
                },
              ],
            },
          ],
          preview: { select: { title: "port", subtitle: "label" } },
        },
      ],
    },
    {
      name: "history",
      title: "Cruise History Milestones (1998 - 2028)",
      type: "array",
      hidden: ({ document }: any) => !isCruiseDoc(document),
      of: [
        {
          type: "object",
          name: "historyItem",
          title: "Cruise History Item",
          fields: [
            { name: "year", title: "Year", type: "string" },
            { name: "ship", title: "Ship Name & Cruise Line", type: "string" },
            { name: "details", title: "Voyage Details", type: "string" },
          ],
          preview: { select: { title: "year", subtitle: "ship" } },
        },
      ],
    },
    {
      name: "featuredArtists",
      title: "Featured Artists & Performers",
      type: "array",
      hidden: ({ document }: any) => !isCruiseDoc(document),
      of: [
        {
          type: "object",
          name: "artistItem",
          title: "Featured Artist",
          fields: [
            { name: "name", title: "Artist Name", type: "string" },
            { name: "role", title: "Role / Instruments", type: "string" },
            { name: "desc", title: "Bio / Description", type: "text", rows: 3 },
            { name: "website", title: "Website URL", type: "string" },
            { name: "logo", title: "Emoji / Logo", type: "string" },
            { name: "photo", title: "Photo Path", type: "string" },
          ],
          preview: { select: { title: "name", subtitle: "role" } },
        },
      ],
    },
    {
      name: "searchPlaceholder",
      title: "Search Input Placeholder",
      type: "string",
      hidden: ({ document }: any) => !isFaqDoc(document),
    },
    {
      name: "faqs",
      title: "Page FAQs",
      type: "array",
      hidden: ({ document }: any) => !isFaqDoc(document) && !isCruiseDoc(document),
      of: [
        {
          type: "object",
          name: "faqItem",
          title: "FAQ Item",
          fields: [
            { name: "question", title: "Question", type: "string" },
            { name: "category", title: "Category (booking, merch, cruise, fan)", type: "string" },
            { name: "answer", title: "Answer", type: "text", rows: 4 },
          ],
          preview: {
            select: { title: "question", subtitle: "category" },
          },
        },
      ],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "pageKey" },
  },
};

export default pageContent;

