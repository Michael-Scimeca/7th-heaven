import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
    title: "Privacy Policy — 7th Heaven",
    description: "How 7th Heaven collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
    return <PrivacyClient />;
}

