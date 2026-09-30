import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://7thheavenband.com";
  const cronSecret = process.env.CRON_SECRET || "";

  try {
    const res = await fetch(`${siteUrl}/api/cron/drain-email-queue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(JSON.stringify({ error: `HTTP ${res.status}: ${errorText}` }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Scheduled execution failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  schedule: "5 0 * * *", // 00:05 UTC daily
};
