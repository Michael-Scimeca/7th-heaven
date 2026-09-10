import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@sanity/client";

const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1dg5ciuj",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, title, year, price, status, badge, inclusions, imagePath, selectValue } = body;

    if (!title || !price || !year) {
      return NextResponse.json(
        { error: "Stateroom Title, Price, and Sailing Year are required." },
        { status: 400 }
      );
    }

    const newCabin = {
      _key: `cabin_${year}_${Date.now()}`,
      code: code ? code.trim().toUpperCase() : "RM",
      title: title.trim(),
      year: String(year),
      price: price.trim(),
      status: status || "info",
      badge: badge ? badge.trim() : "Available",
      inclusions: inclusions ? inclusions.trim() : "Gratuities Included",
      imagePath: imagePath ? imagePath.trim() : "/images/cruise/q2_interior_plus.jpg",
      selectValue: selectValue || `group_${(code || "rm").toLowerCase()}`,
    };

    if (process.env.SANITY_API_TOKEN) {
      // 1. Check if pageContent-cruise document exists
      const doc = await sanityWriteClient.fetch(
        `*[_type == "pageContent" && (pageKey == "cruise" || _id == "pageContent-cruise")][0]._id`
      );
      const targetId = doc || "pageContent-cruise";

      // Ensure doc exists
      await sanityWriteClient.createIfNotExists({
        _id: targetId,
        _type: "pageContent",
        pageKey: "cruise",
        title: "Caribbean Cruise",
      });

      // Append new cabin to cruiseInfo.cabins array
      await sanityWriteClient
        .patch(targetId)
        .setIfMissing({ "cruiseInfo.cabins": [] })
        .append("cruiseInfo.cabins", [newCabin])
        .commit();
    }

    revalidatePath("/cruise");

    return NextResponse.json({
      success: true,
      cabin: newCabin,
    });
  } catch (err: any) {
    console.error("Error saving stateroom cabin to Sanity:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save stateroom to Sanity." },
      { status: 500 }
    );
  }
}
