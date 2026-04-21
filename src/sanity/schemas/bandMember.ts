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
   name: "bio",
   title: "Bio",
   type: "text",
   rows: 6,
  },
  {
   name: "qaPairs",
   title: "Q&A",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      { name: "question", title: "Question", type: "string" },
      { name: "answer", title: "Answer", type: "text", rows: 3 },
     ],
     preview: {
      select: { title: "question" },
     },
    },
   ],
  },
  {
   name: "instruments",
   title: "Instruments",
   type: "array",
   of: [{ type: "string" }],
  },
  {
   name: "order",
   title: "Display Order",
   type: "number",
   initialValue: 0,
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
