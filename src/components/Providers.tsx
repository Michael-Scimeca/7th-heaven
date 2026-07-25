"use client";

import { useEffect } from "react";
import { MemberProvider } from "@/context/MemberContext";
import { AuthProvider } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";

if (typeof window !== "undefined") {
  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("THREE.Clock: This module has been deprecated") ||
       args[0].includes("Clock: This module has been deprecated"))
    ) {
      return;
    }
    origWarn.apply(console, args);
  };
}

export default function Providers({ children }: { children: React.ReactNode }) {
 return (
  <AuthProvider>
   <MemberProvider>
    {children}
    <LoginModal />
   </MemberProvider>
  </AuthProvider>
 );
}

