import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve(process.cwd(), "src");

// Patterns for visual hover/focus modifier prefixes
const HOVER_PROPERTY_PATTERNS = {
  colors: /^(?:hover|group-hover|peer-hover|focus-visible):(bg|text|border|outline|ring|from|to|via)-/,
  transform: /^(?:hover|group-hover|peer-hover|focus-visible):(scale|translate|-translate|rotate|-rotate|skew|-skew)-/,
  opacity: /^(?:hover|group-hover|peer-hover|focus-visible):opacity-/,
  shadow: /^(?:hover|group-hover|peer-hover|focus-visible):shadow(?:-|$)/,
  filter: /^(?:hover|group-hover|peer-hover|focus-visible):(blur|brightness|contrast|grayscale|invert|saturate|sepia|drop-shadow)-/,
};

function getTsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTsxFiles(filePath));
    } else if (file.endsWith(".tsx")) {
      results.push(filePath);
    }
  }
  return results;
}

function extractClassStrings(content) {
  const matches = [];
  // Matches className="..." or className={`...`} or className={'...'}
  const regex = /className\s*=\s*(?:["']([^"']+)["']|{`([^`]+)`}|{["']([^"']+)["']})/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawClass = match[1] || match[2] || match[3] || "";
    const index = match.index;
    const lineNumber = content.substring(0, index).split("\n").length;
    matches.push({ rawClass, lineNumber });
  }
  return matches;
}

function analyzeClassString(classStr) {
  // Extract all class tokens, ignoring template variable interpolations (${...})
  const cleaned = classStr.replace(/\$\{[^}]+\}/g, " ");
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const hoverProps = {
    colors: false,
    transform: false,
    opacity: false,
    shadow: false,
    filter: false,
  };

  let hasHoverModifier = false;
  const hoverTokens = [];

  for (const token of tokens) {
    if (
      token.startsWith("hover:") ||
      token.startsWith("group-hover:") ||
      token.startsWith("peer-hover:") ||
      token.startsWith("focus-visible:")
    ) {
      hasHoverModifier = true;
      hoverTokens.push(token);

      if (HOVER_PROPERTY_PATTERNS.colors.test(token)) hoverProps.colors = true;
      if (HOVER_PROPERTY_PATTERNS.transform.test(token)) hoverProps.transform = true;
      if (HOVER_PROPERTY_PATTERNS.opacity.test(token)) hoverProps.opacity = true;
      if (HOVER_PROPERTY_PATTERNS.shadow.test(token)) hoverProps.shadow = true;
      if (HOVER_PROPERTY_PATTERNS.filter.test(token)) hoverProps.filter = true;
    }
  }

  const transitionTokens = tokens.filter((t) => t.startsWith("transition"));
  const hasTransitionAll = tokens.includes("transition-all");
  const hasTransitionNone = tokens.includes("transition-none");

  // Check if transition is missing
  const needsTransition =
    hoverProps.colors ||
    hoverProps.transform ||
    hoverProps.opacity ||
    hoverProps.shadow ||
    hoverProps.filter;

  const hasTransition = transitionTokens.length > 0;

  return {
    hasHoverModifier,
    needsTransition,
    hoverProps,
    hoverTokens,
    transitionTokens,
    hasTransitionAll,
    hasTransitionNone,
    hasTransition,
    raw: classStr,
  };
}

function runAudit() {
  const files = getTsxFiles(SRC_DIR);
  let totalViolations = 0;
  let totalFilesWithViolations = 0;
  const violationDetails = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const classStrings = extractClassStrings(content);
    const fileViolations = [];

    for (const item of classStrings) {
      const analysis = analyzeClassString(item.rawClass);

      // Skip elements that explicitly declare transition-none
      if (analysis.hasTransitionNone) continue;

      if (analysis.needsTransition && !analysis.hasTransition) {
        fileViolations.push({
          type: "MISSING_TRANSITION",
          line: item.lineNumber,
          hoverTokens: analysis.hoverTokens,
          classSnippet: item.rawClass.slice(0, 100),
        });
      }

      if (analysis.hasTransitionAll) {
        fileViolations.push({
          type: "TRANSITION_ALL_USED",
          line: item.lineNumber,
          hoverTokens: analysis.hoverTokens,
          classSnippet: item.rawClass.slice(0, 100),
        });
      }
    }

    if (fileViolations.length > 0) {
      totalViolations += fileViolations.length;
      totalFilesWithViolations++;
      violationDetails.push({
        file: path.relative(process.cwd(), file),
        violations: fileViolations,
      });
    }
  }

  console.log("==========================================");
  console.log("  Hover & Focus Transition Audit Report");
  console.log("==========================================");
  console.log(`Total files scanned: ${files.length}`);
  console.log(`Files with violations: ${totalFilesWithViolations}`);
  console.log(`Total violations: ${totalViolations}`);
  console.log("------------------------------------------");

  if (totalViolations > 0) {
    for (const item of violationDetails) {
      console.log(`\n📁 ${item.file} (${item.violations.length} issues)`);
      for (const v of item.violations) {
        console.log(`  [Line ${v.line}] ${v.type}: [${v.hoverTokens.join(", ")}]`);
        console.log(`    Snippet: "${v.classSnippet}..."`);
      }
    }
    console.log("\n❌ Audit failed: Unresolved transition violations found.");
    return false;
  } else {
    console.log("✅ All hover and focus styles have matching transitions with no transition-all!");
    return true;
  }
}

const isClean = runAudit();
if (!isClean) {
  process.exit(1);
} else {
  process.exit(0);
}
