// Sanity Schema: Band Member

const bandMember = {
 name: "bandMember",
 title: "Band Member",
 type: "document",
 fields: [
  {
   name: "name",
   title: "Name",
   type: "string",
   validation: (Rule: { required: () => unknown }) => Rule.required(),
  },
  {
   name: "slug",
   title: "Slug",
   type: "slug",
   options: { source: "name", maxLength: 96 },
   validation: (Rule: { required: () => unknown }) => Rule.required(),
  },
  {
   name: "role",
   title: "Role",
   type: "string",
   description: "e.g. 'Lead Vocals', 'Guitar / Keys'",
  },
  {
   name: "image",
   title: "Photo",
   type: "image",
   options: { hotspot: true },
  },
  {
   name: "birthday",
   title: "Birthday",
   type: "string",
  },
  {
   name: "zodiac",
   title: "Zodiac Sign",
   type: "string",
  },
  {
   name: "favQuote",
   title: "Favorite Quote",
   type: "string",
  },
  {
   name: "bestTrait",
   title: "Best Trait",
   type: "string",
  },
  {
   name: "worstTrait",
   title: "Worst Trait",
   type: "string",
  },
  {
   name: "favBands",
   title: "Favorite Bands",
   type: "string",
  },
  {
   name: "favAlbum",
   title: "Favorite Album",
   type: "string",
  },
  {
   name: "favMovie",
   title: "Favorite Movie(s)",
   type: "string",
  },
  {
   name: "fav7hSong",
   title: "Favorite 7th Heaven Song",
   type: "string",
  },
  {
   name: "firstSong",
   title: "First Song Learned",
   type: "string",
  },
  {
   name: "bestFeeling",
   title: "Best Feeling",
   type: "string",
  },
  {
   name: "hobbies",
   title: "Hobbies",
   type: "string",
  },
  {
   name: "influences",
   title: "Influences",
   type: "string",
  },
  {
   name: "funFact",
   title: "Fun Fact",
   type: "text",
   rows: 2,
  },
  {
   name: "order",
   title: "Display Order",
   type: "number",
   initialValue: 0,
  },
  {
   name: "seo",
   title: "SEO Settings",
   type: "object",
   description: "Override global SEO settings for this specific band member profile",
   fields: [
    { name: "metaTitle", title: "Meta Title", type: "string", description: "Optimal length: 50-60 characters" },
    { name: "metaDescription", title: "Meta Description", type: "text", rows: 3, description: "Optimal length: 150-160 characters" },
   ],
  },
 ],
 orderings: [
  {
   title: "Display Order",
   name: "orderAsc",
   by: [{ field: "order", direction: "asc" }],
  },
 ],
 preview: {
  select: { title: "name", subtitle: "role", media: "image" },
 },
};

export default bandMember;
