import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { schemaTypes } from "./src/sanity/schemas";

export default defineConfig({
 name: "7th-heaven",
 title: "7th Heaven",
 projectId: "1dg5ciuj",
 dataset: "production",
 basePath: "/studio",
 plugins: [
  structureTool({
   structure: (S) =>
    S.list()
     .title("Content")
     .items([
      // Singleton: Site Settings
      S.listItem()
       .title("Site Settings")
       .id("siteSettings")
       .child(
        S.document()
         .schemaType("siteSettings")
         .documentId("siteSettings")
         .title("Site Settings")
       ),
      S.divider(),

      // Page Content Submenu — Direct access to edit all site pages
      S.listItem()
       .title("Page Content")
       .id("pageContent")
       .child(
        S.list()
         .title("Select Page to Edit")
         .items([
          S.listItem().title("Home Page").id("homePage").child(S.document().schemaType("pageContent").documentId("pageContent-home").title("Home Page")),
          S.listItem().title("Caribbean Cruise").id("caribbeanCruise").child(S.document().schemaType("pageContent").documentId("pageContent-cruise").title("Caribbean Cruise")),
          S.listItem().title("Book Us").id("bookUs").child(S.document().schemaType("pageContent").documentId("pageContent-book").title("Book Us")),
          S.listItem().title("Contact Us").id("contactUs").child(S.document().schemaType("pageContent").documentId("pageContent-contact").title("Contact Us")),
          S.listItem().title("Media Vault").id("mediaVault").child(S.document().schemaType("pageContent").documentId("pageContent-media").title("Media Vault")),
          S.listItem().title("FAQ Page").id("faqPage").child(S.document().schemaType("pageContent").documentId("pageContent-faq").title("FAQ Page")),
          S.listItem().title("Rock 'n' Roll Kids").id("rockAndRollKids").child(S.document().schemaType("pageContent").documentId("pageContent-rock-and-roll-kids").title("Rock 'n' Roll Kids")),
          S.listItem().title("Fan Photo Wall").id("fanPhotoWall").child(S.document().schemaType("pageContent").documentId("pageContent-fan-photo-wall").title("Fan Photo Wall")),
          S.listItem().title("Past Shows Archive").id("pastShowsArchive").child(S.document().schemaType("pageContent").documentId("pageContent-shows-past").title("Past Shows Archive")),
          S.listItem().title("Privacy Policy").id("privacyPolicy").child(S.document().schemaType("pageContent").documentId("pageContent-privacy").title("Privacy Policy")),
          S.listItem().title("Terms of Service").id("termsOfService").child(S.document().schemaType("pageContent").documentId("pageContent-terms").title("Terms of Service")),
          S.listItem().title("Returns Policy").id("returnsPolicy").child(S.document().schemaType("pageContent").documentId("pageContent-returns").title("Returns Policy")),
          S.listItem().title("Crew PIN Verify").id("crewPinVerify").child(S.document().schemaType("pageContent").documentId("pageContent-crew-verify").title("Crew PIN Verify")),
          S.listItem().title("Planner PIN Verify").id("plannerPinVerify").child(S.document().schemaType("pageContent").documentId("pageContent-planner-verify").title("Planner PIN Verify")),
          S.listItem().title("Cruise PIN Verify").id("cruisePinVerify").child(S.document().schemaType("pageContent").documentId("pageContent-cruise-verify").title("Cruise PIN Verify")),
          S.listItem().title("Live Concert Hub").id("liveConcertHub").child(S.document().schemaType("pageContent").documentId("pageContent-live").title("Live Concert Hub")),
          S.divider(),
          S.documentTypeListItem("pageContent").title("All Page Documents"),
         ])
       ),
      S.divider(),

      // Tour Dates
      S.documentTypeListItem("tourDate").title("Tour Dates"),
      // News
      S.documentTypeListItem("newsPost").title("News"),
      // Band Members
      S.documentTypeListItem("bandMember").title("Band Members"),
      // Videos
      S.documentTypeListItem("video").title("Videos"),
     ]),
  }),
  presentationTool({
   previewUrl: {
    previewMode: {
     enable: "/api/draft-mode/enable",
    },
   },
  }),
 ],
 schema: {
  types: schemaTypes,
 },
});
