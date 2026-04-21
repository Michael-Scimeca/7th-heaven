"use client";

import { MemberProvider } from "@/context/MemberContext";
import { AuthProvider } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";

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
