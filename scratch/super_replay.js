const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const brainDir = "/Users/michaelscimeca/.gemini/antigravity-ide/brain";

const allowedConvs = new Set([
  "45b27373-5fa6-4d5c-96f0-8de98cabbbe0",
  "5b928c13-b0a2-435e-b7e0-d92d8b4f05e1",
  "7a782648-dcd4-4049-92ea-c8b2c06128ed",
  "941361fa-206b-472d-865a-8e83da284b9c",
  "b39cfa05-0624-4d5c-af19-e02b7f6e20b2",
  "d30f1eed-82e7-4ce8-bc61-b2a2c5d3acb3",
  "db788c89-e07f-48f3-bc24-5f424c20cc6a"
]);

// 1. Revert page.tsx to git HEAD baseline
console.log("Reverting admin/page.tsx to git baseline...");
execSync("git checkout -- " + targetFile);

let currentContent = fs.readFileSync(targetFile, "utf8");
console.log(`Baseline size: ${currentContent.length} bytes`);

// 2. Find all transcript files in the brain directory for allowed conversations
const transcriptFiles = [];
allowedConvs.forEach(convId => {
  const fullPath = path.join(brainDir, convId, ".system_generated/logs/transcript_full.jsonl");
  const normalPath = path.join(brainDir, convId, ".system_generated/logs/transcript.jsonl");
  if (fs.existsSync(fullPath)) {
    transcriptFiles.push(fullPath);
  } else if (fs.existsSync(normalPath)) {
    transcriptFiles.push(normalPath);
  }
});

console.log(`Found ${transcriptFiles.length} transcript log files.`);

const edits = [];

transcriptFiles.forEach(tPath => {
  const lines = fs.readFileSync(tPath, "utf8").split("\n").filter(Boolean);
  lines.forEach((line) => {
    try {
      const data = JSON.parse(line);
      if (data.tool_calls) {
        data.tool_calls.forEach(tc => {
          const name = tc.name;
          const args = tc.args || {};
          
          // Check if this tool call modifies the target file
          const isTarget = args.TargetFile && (
            args.TargetFile.endsWith("admin/page.tsx") || 
            args.TargetFile === targetFile
          );
          
          if (isTarget) {
            // Ignore artifact writes that mistakenly target the code file
            if (args.ArtifactMetadata) return;

            if (name === "replace_file_content" || name === "multi_replace_file_content" || name === "write_to_file") {
              edits.push({
                created_at: data.created_at || "2000-01-01T00:00:00Z",
                step_index: data.step_index,
                name,
                args,
                tPath: path.basename(path.dirname(path.dirname(path.dirname(tPath))))
              });
            }
          }
        });
      }
    } catch (err) {}
  });
});

// Sort edits chronologically by created_at, then step_index
edits.sort((a, b) => {
  const timeDiff = new Date(a.created_at) - new Date(b.created_at);
  if (timeDiff !== 0) return timeDiff;
  return a.step_index - b.step_index;
});

console.log(`Found ${edits.length} edits targeting admin/page.tsx from the relevant sessions.`);

let appliedCount = 0;

edits.forEach((edit, idx) => {
  const { name, args, step_index, tPath } = edit;
  
  console.log(`[Edit ${idx + 1}/${edits.length}] Conv: ${tPath.substring(0, 8)} | Step ${step_index} | ${name}`);

  if (name === "write_to_file") {
    if (args.CodeContent) {
      console.log(`  write_to_file: Overwriting entire file content...`);
      currentContent = args.CodeContent;
      appliedCount++;
    }
  } else if (name === "replace_file_content") {
    const target = args.TargetContent;
    const replacement = args.ReplacementContent;
    
    if (currentContent.includes(target)) {
      currentContent = currentContent.replace(target, replacement);
      console.log(`  replace_file_content: Applied replacement.`);
      appliedCount++;
    } else {
      console.log(`  replace_file_content: Target content NOT FOUND!`);
      console.log("    Target snippet:", JSON.stringify(target.substring(0, 100)));
    }
  } else if (name === "multi_replace_file_content") {
    console.log(`  multi_replace_file_content: Processing chunks...`);
    const chunks = args.ReplacementChunks || [];
    let success = true;
    
    chunks.forEach((chunk, cIdx) => {
      const target = chunk.TargetContent;
      const replacement = chunk.ReplacementContent;
      
      if (currentContent.includes(target)) {
        currentContent = currentContent.replace(target, replacement);
        console.log(`    Chunk ${cIdx + 1}: Applied.`);
      } else {
        console.log(`    Chunk ${cIdx + 1}: Target NOT FOUND!`);
        console.log("      Target snippet:", JSON.stringify(target.substring(0, 100)));
        success = false;
      }
    });
    
    if (success) appliedCount++;
  }
});

fs.writeFileSync(targetFile, currentContent, "utf8");
console.log(`Successfully applied ${appliedCount} out of ${edits.length} edits.`);
console.log(`Final file size: ${currentContent.length} bytes`);
