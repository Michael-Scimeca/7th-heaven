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
   name: "memberNo",
   title: "Member No",
   type: "string",
  },
  {
   name: "fullName",
   title: "Full Name",
   type: "string",
  },
  {
   name: "luckyNo",
   title: "Lucky Number",
   type: "string",
  },
  {
   name: "color",
   title: "Color",
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
   name: "favLoveSong",
   title: "Favorite Love Song",
   type: "string",
  },
  {
   name: "favRockSong",
   title: "Favorite Rock Song",
   type: "string",
  },
  {
   name: "favSoundtrack",
   title: "Favorite Soundtrack",
   type: "string",
  },
  {
   name: "favMovie",
   title: "Favorite Movie(s)",
   type: "string",
  },
  {
   name: "favTvShow",
   title: "Favorite TV Show",
   type: "string",
  },
  {
   name: "favCartoon",
   title: "Favorite Cartoon",
   type: "string",
  },
  {
   name: "favMagazine",
   title: "Favorite Magazine",
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
   title: "Hobbies Away From Band",
   type: "string",
  },
  {
   name: "influences",
   title: "Influences",
   type: "string",
  },
  {
   name: "favPet",
   title: "Favorite Pet",
   type: "string",
  },
  {
   name: "favFoods",
   title: "Favorite Foods",
   type: "string",
  },
  {
   name: "favDrink",
   title: "Favorite Drink",
   type: "string",
  },
  {
   name: "favCar",
   title: "Favorite Car",
   type: "string",
  },
  {
   name: "favSportToWatch",
   title: "Favorite Sport To Watch",
   type: "string",
  },
  {
   name: "favBoardGame",
   title: "Favorite Board / Video Game",
   type: "string",
  },
  {
   name: "littleKnownFact",
   title: "Little Known Fact",
   type: "text",
   rows: 2,
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
