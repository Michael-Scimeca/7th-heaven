"use client";

import { MemberProvider } from "@/context/MemberContext";
import { AuthProvider } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import ClientFeedbackNotes from "@/components/ClientFeedbackNotes";

export default function Providers({ children }: { children: React.ReactNode }) {
 return (
  <AuthProvider>
   <MemberProvider>
    {children}
    <LoginModal />
    <ClientFeedbackNotes />
   </MemberProvider>
  </AuthProvider>
 );
}
