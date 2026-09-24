import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity";
import * as cheerio from "cheerio";

async function fetchAndParseTourDates() {
  let res = await fetch("https://www.7thheavenband.com/2026.html");
  if (!res.ok) {
    res = await fetch("https://www.7thheavenband.com/tour.html");
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch tour dates source: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  const rows = $("table.dsR1 tbody tr");

  const tourDates: any[] = [];

  rows.each((i, el) => {
    if (i === 0) return; // Header row

    const tds = $(el).find("td");
    if (tds.length < 7) return;

    const day = $(tds[0]).text().trim();
    const dateStr = $(tds[1]).text().trim();
    const venue = $(tds[2]).text().trim();
    const city = $(tds[3])
      .text()
      .trim()
      .replace(/&nbsp;/g, "")
      .trim();
    const state = $(tds[4])
      .text()
      .trim()
      .replace(/&nbsp;/g, "")
      .trim();
    const time = $(tds[5])
      .text()
      .trim()
      .replace(/&nbsp;/g, "")
      .trim();
    const info = $(tds[6])
      .text()
      .trim()
      .replace(/&nbsp;/g, "")
      .trim();
    const mapAnchor = $(tds[7]).find("a");
    const directionsLink = mapAnchor.attr("href") || "";
    const ticketAnchor = $(tds[8]).find("a");
    const ticketLink = ticketAnchor.attr("href") || "";

    if (
      !venue ||
      venue === "Day" ||
      venue === "Venue" ||
      venue.includes("CHECK BACK")
    )
      return;

    let isoDate = "";
    if (dateStr) {
      try {
        let year = 2026;
        let cleanDateStr = dateStr;
        if (dateStr.includes(",")) {
          const parts = dateStr.split(",");
          cleanDateStr = parts[0].trim();
          year = parseInt(parts[1].trim()) || 2026;
        }
        const dateObj = new Date(`${cleanDateStr}, ${year}`);
        if (!isNaN(dateObj.getTime())) {
          const m = String(dateObj.getMonth() + 1).padStart(2, "0");
          const d = String(dateObj.getDate()).padStart(2, "0");
          isoDate = `${year}-${m}-${d}`;
        }
      } catch (err) {
        console.warn(`Failed to parse date: ${dateStr}`);
      }
    }

    if (!isoDate) return;

    const isFestival =
      info.toLowerCase().includes("festival") ||
      info.toLowerCase().includes("fest");

    const isPrivate =
      venue.toLowerCase().includes("private") ||
      info.toLowerCase().includes("private");

    tourDates.push({
      _type: "tourDate",
      venue,
      city,
      state: state || "IL",
      date: isoDate,
      time,
      day,
      notes: info,
      ticketLink,
      directionsLink,
      mapUrl: directionsLink,
      isSoldOut: false,
      isFestival,
      isPrivate,
    });
  });

  return tourDates;
}

export async function runSanityTourSeed() {
  const [scrapedDates, existingDocs] = await Promise.all([
    fetchAndParseTourDates(),
    sanityWriteClient.fetch(
      `*[_type == "tourDate"] { _id, venue, city, state, date, time }`,
    ),
  ]);

  const tx = sanityWriteClient.transaction();
  let createdCount = 0;
  let updatedCount = 0;

  for (const td of scrapedDates) {
    const existing = existingDocs.find((ed: any) => {
      if (ed.date !== td.date) return false;
      const v1 = (ed.venue || "").toLowerCase().trim();
      const v2 = (td.venue || "").toLowerCase().trim();
      return v1 === v2 || v1.includes(v2) || v2.includes(v1);
    });

    if (existing) {
      tx.patch(existing._id, (p) =>
        p.set({
          time: td.time || "",
          day: td.day || "",
          notes: td.notes || "",
          city: td.city || "",
          state: td.state || "IL",
          ticketLink: td.ticketLink || "",
          directionsLink: td.directionsLink || "",
          mapUrl: td.directionsLink || "",
          isFestival: td.isFestival,
          isPrivate: td.isPrivate,
        }),
      );
      updatedCount++;
    } else {
      tx.create(td);
      createdCount++;
    }
  }

  await tx.commit();
  return {
    success: true,
    scrapedTotal: scrapedDates.length,
    createdCount,
    updatedCount,
  };
}

export async function POST() {
  try {
    const res = await runSanityTourSeed();
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const existingDocs = await sanityWriteClient.fetch(
      `*[_type == "tourDate"] { _id, venue, city, state, date, time }`,
    );
    const missingTimeCount = existingDocs.filter((d: any) => !d.time).length;

    return NextResponse.json({
      status: "ready",
      message:
        "Send a POST request to this endpoint to re-seed and update all Sanity tour dates & times from official schedule.",
      totalSanityTourDates: existingDocs.length,
      missingTimeCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
