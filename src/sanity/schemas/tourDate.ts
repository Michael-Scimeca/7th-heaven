// Sanity Schema: Tour Date

const tourDate = {
 name: "tourDate",
 title: "Tour Date",
 type: "document",
 fields: [
  {
   name: "venue",
   title: "Venue",
   type: "string",
   validation: (Rule: { required: () => unknown }) => Rule.required(),
  },
  {
   name: "city",
   title: "City",
   type: "string",
   validation: (Rule: { required: () => unknown }) => Rule.required(),
  },
  {
   name: "state",
   title: "State",
   type: "string",
  },
  {
   name: "date",
   title: "Date",
   type: "date",
   validation: (Rule: { required: () => unknown }) => Rule.required(),
  },
  {
   name: "day",
   title: "Day of Week",
   type: "string",
   options: {
    list: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
   },
  },
  {
   name: "time",
   title: "Show Time",
   type: "string",
   description: "e.g. '8:00pm'",
  },
  {
   name: "ticketLink",
   title: "Ticket Link",
   type: "url",
  },
  {
   name: "directionsLink",
   title: "Directions Link",
   type: "url",
  },
  {
   name: "isSoldOut",
   title: "Sold Out",
   type: "boolean",
   initialValue: false,
  },
  {
   name: "isFestival",
   title: "Is Festival",
   type: "boolean",
   initialValue: false,
  },
  {
   name: "tags",
   title: "Tags",
   type: "array",
   of: [{ type: "string" }],
   options: {
    list: [
     { title: "Outdoor", value: "outdoor" },
     { title: "Festival", value: "festival" },
     { title: "Private", value: "private" },
     { title: "Cruise", value: "cruise" },
     { title: "Corporate", value: "corporate" },
     { title: "Club", value: "club" },
    ],
   },
  },
  {
   name: "notes",
   title: "Notes",
   type: "text",
   rows: 2,
  },
  {
   name: "lat",
   title: "Latitude",
   type: "number",
  },
  {
   name: "lng",
   title: "Longitude",
   type: "number",
  },
 ],
 orderings: [
  {
   title: "Date (Upcoming First)",
   name: "dateAsc",
   by: [{ field: "date", direction: "asc" }],
  },
 ],
 preview: {
  select: { venue: "venue", city: "city", state: "state", date: "date" },
  prepare: ({ venue, city, state, date }: { venue: string; city: string; state: string; date: string }) => ({
   title: venue,
   subtitle: `${city}${state ? `, ${state}` : ""} — ${date || "TBD"}`,
  }),
 },
};

export default tourDate;
