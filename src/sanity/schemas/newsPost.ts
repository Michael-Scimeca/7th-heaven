// Sanity Schema: News Post
// Add this to your Sanity Studio schemas

const newsPost = {
 name: "newsPost",
 title: "News Post",
 type: "document",
 fields: [
  {
   name: "title",
   title: "Title",
   type: "string",
   validation: (Rule: { required: () => unknown }) => Rule.required(),
  },
  {
   name: "slug",
   title: "Slug",
   type: "slug",
   options: { source: "title", maxLength: 96 },
   validation: (Rule: { required: () => unknown }) => Rule.required(),
  },
  {
   name: "content",
   title: "Content",
   type: "text",
   rows: 6,
   validation: (Rule: { required: () => unknown }) => Rule.required(),
  },
  {
   name: "date",
   title: "Display Date",
   type: "string",
   description: "e.g. 'January 2026'",
  },
  {
   name: "category",
   title: "Category",
   type: "string",
   options: {
    list: [
     { title: "Announcement", value: "announcement" },
     { title: "Update", value: "update" },
     { title: "Press", value: "press" },
     { title: "Release", value: "release" },
    ],
   },
   initialValue: "update",
  },
  {
   name: "image",
   title: "Image",
   type: "image",
   options: { hotspot: true },
  },
  {
   name: "featured",
   title: "Featured",
   type: "boolean",
   initialValue: false,
  },
  {
   name: "publishedAt",
   title: "Published At",
   type: "datetime",
   initialValue: () => new Date().toISOString(),
  },
  {
   name: "seo",
   title: "SEO Settings",
   type: "object",
   description: "Override global SEO settings for this specific news post",
   fields: [
    { name: "metaTitle", title: "Meta Title", type: "string", description: "Optimal length: 50-60 characters" },
    { name: "metaDescription", title: "Meta Description", type: "text", rows: 3, description: "Optimal length: 150-160 characters" },
   ],
  },
 ],
 orderings: [
  {
   title: "Published Date (New → Old)",
   name: "publishedAtDesc",
   by: [{ field: "publishedAt", direction: "desc" }],
  },
 ],
 preview: {
  select: { title: "title", date: "date", category: "category" },
  prepare: ({ title, date, category }: Record<string, any>) => ({
   title,
   subtitle: `${category?.toUpperCase() || "UPDATE"} — ${date || "No date"}`,
  }),
 },
};

export default newsPost;
