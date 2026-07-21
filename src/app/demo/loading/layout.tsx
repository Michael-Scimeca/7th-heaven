import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loading Screen — 7th Heaven",
};

export default function LoadingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, overflow: "hidden" }}>
      <body style={{ margin: 0, padding: 0, overflow: "hidden", height: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
