import { NextResponse } from "next/server";

const HIVE_API_KEY = process.env.HIVE_MODERATION_API_KEY;
const HIVE_ENDPOINT = "https://api.thehive.ai/api/v2/task/sync";

/**
 * POST /api/fans/moderate
 *
 * Accepts a multipart/form-data body with a single `image` File field.
 * Calls Hive Moderation and returns:
 *   { action: "allow" | "flag" | "block", reason?: string }
 *
 * action meanings:
 *   allow — safe, upload can proceed without a flag
 *   flag  — borderline, upload proceeds but is queued for admin review
 *   block — explicit content, upload is rejected client-side
 */
export async function POST(request: Request) {
  if (!HIVE_API_KEY) {
    // If no key is configured, allow the upload (fail open) so fans aren't blocked
    console.warn("[moderate] HIVE_MODERATION_API_KEY not set — skipping moderation");
    return NextResponse.json({ action: "allow", reason: "moderation_skipped" });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Forward the file to Hive as multipart/form-data
    const hiveForm = new FormData();
    hiveForm.append("media", image);

    const hiveRes = await fetch(HIVE_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Token ${HIVE_API_KEY}` },
      body: hiveForm,
    });

    if (!hiveRes.ok) {
      const errText = await hiveRes.text();
      console.error("[moderate] Hive API error:", hiveRes.status, errText);
      // Fail open — don't block the user if Hive is unavailable
      return NextResponse.json({ action: "allow", reason: "moderation_unavailable" });
    }

    const hiveData = await hiveRes.json();

    // Hive returns: { status: { code, message }, code: [...], output: [{ time, classes: [{ class, score }] }] }
    const classes: Array<{ class: string; score: number }> =
      hiveData?.status?.[0]?.response?.output?.[0]?.classes ?? [];

    const score = (name: string) =>
      classes.find((c) => c.class === name)?.score ?? 0;

    const sexualExplicit = score("sexual_explicit");          // hard pornography
    const sexualSuggestive = score("sexual_suggestive");      // suggestive, borderline
    const hateVisual = score("hate_visual");
    const violence = score("general_violence_very_graphic");

    // Hard block thresholds
    if (sexualExplicit > 0.4 || hateVisual > 0.6 || violence > 0.7) {
      return NextResponse.json({
        action: "block",
        reason: "explicit_content",
      });
    }

    // Soft flag thresholds — send to admin review queue
    if (sexualSuggestive > 0.55 || sexualExplicit > 0.15) {
      return NextResponse.json({
        action: "flag",
        reason: "suggestive_content",
      });
    }

    return NextResponse.json({ action: "allow" });
  } catch (err) {
    console.error("[moderate] Unexpected error:", err);
    // Fail open
    return NextResponse.json({ action: "allow", reason: "moderation_error" });
  }
}
