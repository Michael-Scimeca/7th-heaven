import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
    title: "Terms of Service — 7th Heaven",
    description: "Terms and conditions for using the 7th Heaven website and SMS alert service.",
};

export default function TermsPage() {
    return <TermsClient />;
}

