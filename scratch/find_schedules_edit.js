const fs = require('fs');
const path = require('path');

const targetFile = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const brainDir = "/Users/michaelscimeca/.gemini/antigravity-ide/brain";

const transcriptFiles = [];
if (fs.existsSync(brainDir)) {
  const dirs = fs.readdirSync(brainDir);
  dirs.forEach(dir => {
    const fullPath = path.join(brainDir, dir, ".system_generated/logs/transcript_full.jsonl");
    const normalPath = path.join(brainDir, dir, ".system_generated/logs/transcript.jsonl");
    if (fs.existsSync(fullPath)) {
      transcriptFiles.push(fullPath);
    } else if (fs.existsSync(normalPath)) {
      transcriptFiles.push(normalPath);
    }
  });
}

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
          const isTarget = args.TargetFile && (
            args.TargetFile.endsWith("admin/page.tsx") || 
            args.TargetFile === targetFile
          );
          if (isTarget && !args.ArtifactMetadata) {
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

edits.sort((a, b) => {
  const timeDiff = new Date(a.created_at) - new Date(b.created_at);
  if (timeDiff !== 0) return timeDiff;
  return a.step_index - b.step_index;
});

edits.forEach((edit, idx) => {
  const { name, args, step_index, tPath } = edit;
  
  let matches = false;
  if (name === "replace_file_content") {
    matches = args.TargetContent.includes("schedules") || args.TargetContent.includes("draggedCrewMemberId");
  } else if (name === "multi_replace_file_content") {
    matches = (args.ReplacementChunks || []).some(c => c.TargetContent.includes("schedules") || c.TargetContent.includes("draggedCrewMemberId"));
  }
  
  if (matches) {
    console.log(`[Edit ${idx + 1}/${edits.length}] matches target state: Conv: ${tPath.substring(0, 8)} | Step ${step_index} | ${name}`);
    console.log("  TargetContent snippet:", JSON.stringify(name === "replace_file_content" ? args.TargetContent.substring(0, 200) : args.ReplacementChunks.map(c => c.TargetContent.substring(0, 100))));
  }
});
