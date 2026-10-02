"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import "./studio.css";

export default function StudioPage() {
  return (
    <div className="min-h-screen">
      <NextStudio config={config} />
    </div>
  );
}
