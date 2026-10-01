import { revalidateTag, revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * On-demand revalidation webhook handler for Sanity CMS.
 *
 * Webhook Configuration:
 * - Endpoint URL: https://7thheavenband.com/api/revalidate
 * - HTTP Method: POST
 * - Trigger on: Create, Update, Delete
 * - Filter: _type in ["pageContent", "siteSettings", "tourDate", "bandMember", "video", "newsPost"]
 * - Projection: { _type, "pageKey": pageKey, "slug": slug.current, "category": category }
 * - Secret env var: SANITY_REVALIDATE_SECRET or SANITY_WEBHOOK_SECRET
 */
export async function POST(req: NextRequest) {
  try {
    const secret =
      process.env.SANITY_REVALIDATE_SECRET ||
      process.env.SANITY_WEBHOOK_SECRET ||
      "";

    // 1. Verify Authentication / Secret
    const authHeader = req.headers.get("authorization");
    const secretHeader =
      req.headers.get("x-sanity-secret") || req.headers.get("x-webhook-secret");
    const signatureHeader =
      req.headers.get("sanity-webhook-signature") ||
      req.headers.get("x-sanity-signature");
    const urlSecret = req.nextUrl.searchParams.get("secret");

    const rawBody = await req.text();
    let isAuthorized = false;

    if (secret) {
      if (
        urlSecret === secret ||
        secretHeader === secret ||
        authHeader === `Bearer ${secret}`
      ) {
        isAuthorized = true;
      } else if (signatureHeader) {
        // Sanity webhook signature verification: t=<timestamp>,v1=<hash>
        try {
          const parts = signatureHeader.split(",");
          let timestamp = "";
          let hash = "";
          for (const p of parts) {
            const [k, v] = p.trim().split("=");
            if (k === "t") timestamp = v;
            if (k === "v1") hash = v;
          }
          if (timestamp && hash) {
            const payload = `${timestamp}.${rawBody}`;
            const expectedHash = crypto
              .createHmac("sha256", secret)
              .update(payload)
              .digest("base64");
            if (hash === expectedHash) {
              isAuthorized = true;
            }
          }
        } catch {
          isAuthorized = false;
        }
      }
    } else {
      // In development or if no secret is configured, allow local testing
      if (process.env.NODE_ENV !== "production") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Invalid revalidation secret or signature" },
        { status: 401 },
      );
    }

    // 2. Parse body and revalidate specific tags & paths
    let body: any = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = {};
      }
    }

    const docType = body._type || body.type;
    const pageKey = body.pageKey || (typeof body.slug === "string" ? body.slug : body.slug?.current);
    const revalidatedTags: string[] = ["sanity"];

    // Base tag
    revalidateTag("sanity", { expire: 0 });

    if (docType === "pageContent" && pageKey) {
      const tag = `page:${pageKey}`;
      revalidateTag(tag, { expire: 0 });
      revalidatedTags.push(tag);
      const path = pageKey === "home" ? "/" : `/${pageKey}`;
      revalidatePath(path);
    } else if (docType === "siteSettings") {
      revalidateTag("settings", { expire: 0 });
      revalidatedTags.push("settings");
      revalidatePath("/", "layout");
    } else if (docType === "tourDate") {
      revalidateTag("tour", { expire: 0 });
      revalidatedTags.push("tour");
      revalidatePath("/");
      revalidatePath("/shows/past");
    } else if (docType === "bandMember") {
      revalidateTag("members", { expire: 0 });
      revalidatedTags.push("members");
      if (pageKey) {
        revalidateTag(`member:${pageKey}`, { expire: 0 });
        revalidatedTags.push(`member:${pageKey}`);
      }
      revalidatePath("/");
    } else if (docType === "video") {
      revalidateTag("videos", { expire: 0 });
      revalidatedTags.push("videos");
      if (body.category) {
        revalidateTag(`videos:${body.category}`, { expire: 0 });
        revalidatedTags.push(`videos:${body.category}`);
      }
      revalidatePath("/media");
    } else if (docType === "newsPost") {
      revalidateTag("news", { expire: 0 });
      revalidatedTags.push("news");
      revalidatePath("/");
    } else {
      // Revalidate everything if docType is unspecified or generic
      revalidatePath("/", "layout");
    }

    return NextResponse.json({
      success: true,
      revalidatedTags,
      timestamp: Date.now(),
      docType: docType || "all",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Revalidation failed" },
      { status: 500 },
    );
  }
}
