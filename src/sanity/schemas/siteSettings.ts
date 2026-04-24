// Sanity Schema: Site Settings (Singleton)
// Controls global site content like hero, stats, latest release, endorsements, socials, contact

const siteSettings = {
 name: "siteSettings",
 title: "Site Settings",
 type: "document",
 fields: [
  {
   name: "bandName",
   title: "Band Name",
   type: "string",
   initialValue: "7th Heaven",
  },
  {
   name: "tagline",
   title: "Tagline",
   type: "string",
   description: "Main tagline displayed in the hero section",
   initialValue: "An experience you just have to see and hear.",
  },
  {
   name: "subTagline",
   title: "Sub-tagline",
   type: "string",
   initialValue: "40 years of rocking the world.",
  },
  {
   name: "bioIntro",
   title: "Bio Intro (Paragraph 1)",
   type: "text",
   rows: 4,
  },
  {
   name: "bioIntro2",
   title: "Bio Intro (Paragraph 2)",
   type: "text",
   rows: 4,
  },
  // Stats strip
  {
   name: "stats",
   title: "Stats Strip",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      { name: "number", title: "Number", type: "string" },
      { name: "label", title: "Label", type: "string" },
     ],
     preview: {
      select: { title: "number", subtitle: "label" },
     },
    },
   ],
  },
  // Latest Release
  {
   name: "latestRelease",
   title: "Latest Release",
   type: "object",
   fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "year", title: "Year", type: "string" },
    { name: "duration", title: "Duration", type: "string" },
    { name: "type", title: "Type", type: "string", description: "e.g. Official Music Video" },
    { name: "description", title: "Description", type: "text", rows: 4 },
    { name: "youtubeId", title: "YouTube ID", type: "string" },
    { name: "buyLink", title: "Buy CD Link", type: "url" },
    { name: "spotifyLink", title: "Spotify Link", type: "url" },
    { name: "appleMusicLink", title: "Apple Music Link", type: "url" },
    {
     name: "credits",
     title: "Credits",
     type: "array",
     of: [
      {
       type: "object",
       fields: [
        { name: "role", title: "Role", type: "string" },
        { name: "name", title: "Name", type: "string" },
       ],
       preview: {
        select: { title: "role", subtitle: "name" },
       },
      },
     ],
    },
    {
     name: "behindTheScenes",
     title: "Behind-the-Scenes Photos",
     type: "array",
     of: [{ type: "image", options: { hotspot: true } }],
    },
   ],
  },
  // Social Links
  {
   name: "socialLinks",
   title: "Social Links",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      { name: "name", title: "Platform Name", type: "string" },
      { name: "url", title: "URL", type: "url" },
     ],
     preview: {
      select: { title: "name", subtitle: "url" },
     },
    },
   ],
  },
  // Platform Links (full list for footer)
  {
   name: "platformLinks",
   title: "Music Platform Links",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      { name: "name", title: "Platform Name", type: "string" },
      { name: "url", title: "URL", type: "url" },
      { name: "label", title: "Display Label", type: "string" },
     ],
     preview: {
      select: { title: "name", subtitle: "url" },
     },
    },
   ],
  },
  // Endorsements
  {
   name: "endorsements",
   title: "Gear Endorsements",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      { name: "name", title: "Brand Name", type: "string" },
      { name: "logo", title: "Logo", type: "image" },
      { name: "logoPath", title: "Logo Path (fallback)", type: "string", description: "e.g. /images/sponsor-logos/SHURE.svg" },
     ],
     preview: {
      select: { title: "name" },
     },
    },
   ],
  },
  // Contact Info
  {
   name: "contacts",
   title: "Contact Cards",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      { name: "category", title: "Category", type: "string" },
      { name: "company", title: "Company", type: "string" },
      { name: "name", title: "Contact Name", type: "string" },
      { name: "email", title: "Email", type: "string" },
      { name: "phone", title: "Phone", type: "string" },
      { name: "note", title: "Note", type: "string", description: "e.g. 'No Bookings'" },
     ],
     preview: {
      select: { title: "category", subtitle: "name" },
     },
    },
   ],
  },
  // Booking info
  {
   name: "bookingPhone",
   title: "Booking Phone",
   type: "string",
  },
  {
   name: "bookingEmail",
   title: "Booking Email",
   type: "string",
  },
  // Accomplishments
  {
   name: "accomplishments",
   title: "Accomplishments",
   type: "array",
   of: [{ type: "string" }],
  },
  // Performed With
  {
   name: "performedWith",
   title: "Performed With Artists",
   type: "array",
   of: [{ type: "string" }],
  },
  // Behind the Scenes Videos
  {
   name: "btsVideos",
   title: "Behind the Scenes Videos",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      { name: "youtubeId", title: "YouTube ID", type: "string" },
      { name: "title", title: "Title", type: "string" },
      { name: "subtitle", title: "Subtitle", type: "string" },
      { name: "director", title: "Director", type: "string" },
      { name: "year", title: "Year", type: "number" },
     ],
     preview: {
      select: { title: "title", subtitle: "director" },
     },
    },
   ],
  },
  // Navigation links
  {
   name: "navLinks",
   title: "Navigation Links",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      { name: "href", title: "Path", type: "string" },
      { name: "label", title: "Label", type: "string" },
     ],
     preview: {
      select: { title: "label", subtitle: "href" },
     },
    },
   ],
  },
 ],
 preview: {
  prepare: () => ({ title: "Site Settings" }),
 },
};

export default siteSettings;
