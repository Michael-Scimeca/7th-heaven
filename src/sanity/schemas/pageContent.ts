// Sanity Schema: Page Content
// Enables full text, hero headers, section titles, body copy, CTAs, and FAQs to be edited in Sanity Studio for any page.

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
      name: "heroCtaText",
      title: "Hero Button Text",
      type: "string",
      hidden: ({ document }: any) => document?.pageKey === "rock-and-roll-kids" || document?.title?.toLowerCase()?.includes("rock"),
    },
    {
      name: "heroCtaLink",
      title: "Hero Button Link",
      type: "string",
      hidden: ({ document }: any) => document?.pageKey === "rock-and-roll-kids" || document?.title?.toLowerCase()?.includes("rock"),
    },
    {
      name: "heroBannerImage",
      title: "Hero Banner Image",
      type: "image",
      options: { hotspot: true },
      description: "Full width hero banner image (e.g. all characters cast lineup)",
    },
    {
      name: "sections",
      title: "Page Sections",
      type: "array",
      of: [
        {
          type: "object",
          name: "pageSection",
          title: "Section",
          fields: [
            { name: "sectionId", title: "Section ID / Anchor", type: "string", description: "e.g. 'about', 'pricing', 'features'" },
            { name: "title", title: "Section Title", type: "string" },
            { name: "subtitle", title: "Section Subtitle", type: "string" },
            { name: "body", title: "Body Copy", type: "text", rows: 4 },
            { name: "ctaText", title: "CTA Button Text", type: "string" },
            { name: "ctaLink", title: "CTA Button Link", type: "string" },
            { name: "image", title: "Section Image", type: "image", options: { hotspot: true } },
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
      name: "faqs",
      title: "Page FAQs",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          title: "FAQ Item",
          fields: [
            { name: "question", title: "Question", type: "string" },
            { name: "answer", title: "Answer", type: "text", rows: 4 },
          ],
          preview: {
            select: { title: "question" },
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
