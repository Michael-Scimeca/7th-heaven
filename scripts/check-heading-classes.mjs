import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve(process.cwd(), "src");

// Heading scale classes — NOT allowed on <h1>–<h6> (the tag sets the size)
const BASE_HEADING_SIZES = new Set([
  "text-display",
  "text-h1",
  "text-h2",
  "text-h3",
  "text-h4",
  "text-h5",
  "text-h6",
]);

// Responsive prefixes
const RESPONSIVE_PREFIXES = ["sm:", "md:", "lg:", "xl:", "2xl:", "max-sm:", "max-md:", "max-lg:"];

// Disallowed text size classes
const RAW_SIZE_PATTERN = /^(?:[a-z0-9-]+:)?text-(?:xs|sm|base|lg|xl|[2-9]xl|\[\d+(?:px|rem|em|vw)\])/;
// Disallowed font weight classes (handled by text-h* scale)
const FONT_WEIGHT_PATTERN = /^(?:[a-z0-9-]+:)?font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[\d+\])/;
// Disallowed leading classes (handled by text-h* scale)
const LEADING_PATTERN = /^(?:[a-z0-9-]+:)?leading-(?:none|tight|snug|normal|relaxed|loose|\d+|\[[^\]]+\])/;
// Disallowed tracking classes (handled by text-h* scale)
const TRACKING_PATTERN = /^(?:[a-z0-9-]+:)?tracking-(?:tighter|tight|normal|wide|wider|widest|\[[^\]]+\])/;

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

export function findHeadings(content, filePath) {
  const headings = [];
  // Regex to match <h1... > up to the end of opening tag
  // Matches <h[1-6] followed by whitespace, >, or /
  const headingRegex = /<h([1-6])\b([^>]*?)(\/?>)/gs;
  const lines = content.split("\n");

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1];
    const attributes = match[2];
    const index = match.index;
    const lineNumber = content.substring(0, index).split("\n").length;

    // Check line above for opt-out comment: `// heading-size-ok: <reason>` or `{/* heading-size-ok: <reason> */}`
    let isOptedOut = false;
    let optOutReason = "";

    const checkLines = [
      lineNumber >= 2 ? lines[lineNumber - 2] : "",
      lineNumber >= 3 ? lines[lineNumber - 3] : "",
      lines[lineNumber - 1], // Same line
    ];

    for (const l of checkLines) {
      const optMatch = l.match(/(?:\/\/|{\/\*)\s*heading-size-ok:\s*(.+?)(?:\*\/|$)/i);
      if (optMatch) {
        isOptedOut = true;
        optOutReason = optMatch[1].trim();
        break;
      }
    }

    // Extract className attribute
    let classString = null;
    const classMatch = attributes.match(/className\s*=\s*(?:["']([^"']+)["']|{`([^`]+)`}|{["']([^"']+)["']})/);
    if (classMatch) {
      classString = classMatch[1] || classMatch[2] || classMatch[3] || "";
    }

    // Check for inline fontSize
    const hasInlineFontSize = /style\s*=\s*\{\{[^}]*fontSize/i.test(attributes);

    headings.push({
      filePath,
      lineNumber,
      tag: `h${level}`,
      attributes,
      classString,
      hasInlineFontSize,
      isOptedOut,
      optOutReason,
    });
  }

  return headings;
}

export function validateHeading(heading) {
  if (heading.isOptedOut) return null;

  const errors = [];
  const classStr = heading.classString || "";

  // Extract classes ignoring variable interpolations ${...}
  const cleaned = classStr.replace(/\$\{[^}]+\}/g, " ");
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const baseSizeClasses = tokens.filter((t) => BASE_HEADING_SIZES.has(t));
  const responsiveHeadingClasses = tokens.filter((t) => {
    for (const prefix of RESPONSIVE_PREFIXES) {
      if (t.startsWith(prefix)) {
        const unprefixed = t.substring(prefix.length);
        if (BASE_HEADING_SIZES.has(unprefixed)) return true;
      }
    }
    return false;
  });

  const rawSizes = tokens.filter((t) => RAW_SIZE_PATTERN.test(t));
  const fontWeights = tokens.filter((t) => FONT_WEIGHT_PATTERN.test(t));
  const leadings = tokens.filter((t) => LEADING_PATTERN.test(t));
  const trackings = tokens.filter((t) => TRACKING_PATTERN.test(t));

  // Check 1: Headings are sized by their TAG (h1–h6 rules in globals.css).
  // No size classes allowed on headings — not even the text-h* scale.
  const sizeClassesOnHeading = [...baseSizeClasses, ...responsiveHeadingClasses];
  if (sizeClassesOnHeading.length > 0) {
    errors.push(`Remove size class(es) ${sizeClassesOnHeading.join(", ")} — headings get their size from the tag level`);
  }

  // Check 2: Disallowed raw text sizes
  if (rawSizes.length > 0) {
    errors.push(`Forbidden raw text-size class(es): ${rawSizes.join(", ")}`);
  }

  // Check 3: Font weight override
  if (fontWeights.length > 0) {
    errors.push(`Forbidden font-weight override(s): ${fontWeights.join(", ")} (scale defines font-weight)`);
  }

  // Check 4: Leading override
  if (leadings.length > 0) {
    errors.push(`Forbidden leading override(s): ${leadings.join(", ")} (scale defines line-height)`);
  }

  // Check 5: Tracking override
  if (trackings.length > 0) {
    errors.push(`Forbidden tracking override(s): ${trackings.join(", ")} (scale defines letter-spacing)`);
  }

  // Check 6: Inline fontSize
  if (heading.hasInlineFontSize) {
    errors.push("Forbidden inline style={{ fontSize }}");
  }

  if (errors.length > 0) {
    return {
      heading,
      errors,
    };
  }

  return null;
}

export function runHeadingCheck() {
  const files = getTsxFiles(SRC_DIR);
  let totalHeadings = 0;
  let totalViolations = 0;
  const violationsByFile = new Map();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const headings = findHeadings(content, file);
    totalHeadings += headings.length;

    for (const h of headings) {
      const violation = validateHeading(h);
      if (violation) {
        totalViolations++;
        const relPath = path.relative(process.cwd(), file);
        if (!violationsByFile.has(relPath)) {
          violationsByFile.set(relPath, []);
        }
        violationsByFile.get(relPath).push(violation);
      }
    }
  }

  return {
    totalFiles: files.length,
    totalHeadings,
    totalViolations,
    violationsByFile,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runHeadingCheck();

  console.log(`\n🔍 Scanned ${result.totalFiles} TSX files. Found ${result.totalHeadings} headings (<h1-h6>).`);

  if (result.totalViolations === 0) {
    console.log("✅ All headings strictly follow the unified fluid type scale!\n");
    process.exit(0);
  } else {
    console.log(`❌ Found ${result.totalViolations} heading style violation(s):\n`);

    for (const [file, list] of result.violationsByFile.entries()) {
      console.log(`📁 ${file}:`);
      for (const v of list) {
        console.log(`  Line ${v.heading.lineNumber} (<${v.heading.tag}>):`);
        for (const err of v.errors) {
          console.log(`    - ${err}`);
        }
        if (v.heading.classString !== null) {
          console.log(`    Current classes: "${v.heading.classString}"`);
        } else {
          console.log(`    Current classes: (none)`);
        }
      }
      console.log("");
    }

    process.exit(1);
  }
}
