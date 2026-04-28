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
