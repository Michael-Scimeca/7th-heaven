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
    },
    {
      name: "heroCtaLink",
      title: "Hero Button Link",
      type: "string",
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
