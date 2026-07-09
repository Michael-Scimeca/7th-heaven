const fs = require("fs");
const path = require("path");

const originalFile = path.join(__dirname, "../src/app/admin/page.tsx");
let fileContent = fs.readFileSync(originalFile, "utf8");

const editsDir = path.join(__dirname, "admin_edits");
const files = fs.readdirSync(editsDir);

// Sort files by step_index and tool index
files.sort((a, b) => {
  const parse = (f) => {
    const m = f.match(/edit_(\d+)_tool_(\d+)\.json/);
    return { step: parseInt(m[1], 10), tool: parseInt(m[2], 10) };
  };
  const pa = parse(a);
  const pb = parse(b);
  if (pa.step !== pb.step) return pa.step - pb.step;
  return pa.tool - pb.tool;
});

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(editsDir, file), "utf8"));
  const { name, args } = data;
  console.log(`Applying step ${data.step_index} (${name})...`);
  
  if (name === "replace_file_content") {
    const target = args.TargetContent;
    const replacement = args.ReplacementContent;
    if (!fileContent.includes(target)) {
      console.warn(`WARNING: Target not found for step ${data.step_index}!`);
    } else {
      fileContent = fileContent.replace(target, replacement);
    }
  } else if (name === "multi_replace_file_content") {
    const chunks = args.ReplacementChunks || args.ReplacementContent;
    if (Array.isArray(chunks)) {
      chunks.forEach((chunk, cIdx) => {
        const target = chunk.TargetContent;
        const replacement = chunk.ReplacementContent;
        if (!fileContent.includes(target)) {
          console.warn(`WARNING: Chunk ${cIdx} target not found for step ${data.step_index}!`);
        } else {
          fileContent = fileContent.replace(target, replacement);
        }
      });
    } else {
      console.warn(`WARNING: multi_replace_file_content in step ${data.step_index} has no chunks array!`);
    }
  } else if (name === "write_to_file") {
    if (args.Overwrite) {
      fileContent = args.CodeContent;
      console.log(`Overwrote file with step ${data.step_index}`);
    }
  }
});

fs.writeFileSync(originalFile, fileContent, "utf8");
console.log("SUCCESS: Replay finished!");
