import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Default share image for every page (Google, iMessage, Facebook, X, Slack).
// Served at /opengraph-image and rendered once at build time.
export const alt = "7th Heaven — Chicago's Premier Rock Band";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoSvg = await readFile(
    join(process.cwd(), "public/images/logos/logo.svg"),
  );
  const logoSrc = `data:image/svg+xml;base64,${logoSvg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#05030a",
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(124, 58, 237, 0.45) 0%, rgba(220, 38, 38, 0.18) 38%, rgba(5, 3, 10, 0) 70%)",
          color: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={760} height={137} alt="" />
        <div
          style={{
            marginTop: 48,
            fontSize: 34,
            letterSpacing: 10,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Chicago&apos;s Premier Rock Band
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            letterSpacing: 2,
            opacity: 0.55,
          }}
        >
          7thheavenband.com
        </div>
      </div>
    ),
    size,
  );
}
