import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DEFAULT_THEME_TOKENS, parseAndValidateThemeJson, flattenThemeTokens, ThemeTokens } from "@/lib/theme-tokens";

const THEME_FILE_PATH = path.join(process.cwd(), "src/data/theme.json");
const GLOBALS_CSS_PATH = path.join(process.cwd(), "src/app/globals.css");

async function syncTokensToGlobalsCss(tokens: ThemeTokens): Promise<void> {
  try {
    let css = await fs.readFile(GLOBALS_CSS_PATH, "utf-8");
    const flat = flattenThemeTokens(tokens);

    Object.entries(flat).forEach(([varName, val]) => {
      // Escape regex special characters in variable name
      const escaped = varName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${escaped}\\s*:\\s*)[^;]+(;)` , "g");
      css = css.replace(regex, `$1${val}$2`);
    });

    await fs.writeFile(GLOBALS_CSS_PATH, css, "utf-8");
  } catch (e) {
    console.warn("Could not sync tokens to globals.css:", e);
  }
}

async function readThemeTokens(): Promise<ThemeTokens> {
  try {
    const raw = await fs.readFile(THEME_FILE_PATH, "utf-8");
    const parsed = parseAndValidateThemeJson(raw);
    return parsed || DEFAULT_THEME_TOKENS;
  } catch {
    return DEFAULT_THEME_TOKENS;
  }
}

async function writeThemeTokens(tokens: ThemeTokens): Promise<boolean> {
  try {
    const content = JSON.stringify(tokens, null, 2);
    await fs.writeFile(THEME_FILE_PATH, content, "utf-8");
    await syncTokensToGlobalsCss(tokens);
    return true;
  } catch (err) {
    console.error("Failed to write theme.json:", err);
    return false;
  }
}

export async function GET() {
  const tokens = await readThemeTokens();
  return NextResponse.json({ success: true, tokens });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tokens: ThemeTokens | undefined = body.tokens;

    if (!tokens || typeof tokens !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid tokens payload" },
        { status: 400 }
      );
    }

    const validated = parseAndValidateThemeJson(JSON.stringify(tokens));
    if (!validated) {
      return NextResponse.json(
        { success: false, error: "Failed to validate theme tokens structure" },
        { status: 400 }
      );
    }

    const saved = await writeThemeTokens(validated);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Disk write failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tokens: validated });
  } catch (error) {
    console.error("POST /api/admin/theme error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const reset = await writeThemeTokens(DEFAULT_THEME_TOKENS);
  if (!reset) {
    return NextResponse.json(
      { success: false, error: "Failed to reset theme.json" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, tokens: DEFAULT_THEME_TOKENS });
}
