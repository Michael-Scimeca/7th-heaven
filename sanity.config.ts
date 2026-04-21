import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { schemaTypes } from "./src/sanity/schemas";

export default defineConfig({
 name: "7th-heaven",
 title: "7th Heaven",
 projectId: "1dg5ciuj",
 dataset: "production",
 plugins: [
  structureTool(),
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
