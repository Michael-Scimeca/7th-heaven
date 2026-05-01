"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Member {
 id: string;
 name: string;
 username: string;
 email: string;
 joinDate: string;
 avatar: string;
 points: number;
 tier: "Bronze" | "Silver" | "Gold" | "Platinum";
 showsAttended: number;
 favoriteVenues: string[];
 location?: { lat: number; lng: number };
 notificationsEnabled: boolean;
 notificationRadius: number; // miles
 role: "fan" | "crew" | "admin" | "merch" | "event_planner";
 phone?: string;
}

interface MemberContextType {
 member: Member | null;
 isLoggedIn: boolean;
 hydrated: boolean;
 isModalOpen: boolean;
 openModal: (mode?: "login" | "signup") => void;
 closeModal: () => void;
 modalMode: "login" | "signup";
 setModalMode: (mode: "login" | "signup") => void;
 login: (email: string, password: string) => Promise<boolean>;
 signup: (name: string, email: string, password: string, phone?: string, username?: string) => Promise<{ success: boolean; confirmationRequired?: boolean; error?: string }>;
 logout: () => void;
 addPoints: (amount: number) => void;
 updateLocation: (lat: number, lng: number) => void;
 toggleNotifications: (enabled: boolean) => void;
 setNotificationRadius: (miles: number) => void;
}

const MemberContext = createContext<MemberContextType | null>(null);

export function useMember() {
 const ctx = useContext(MemberContext);
 if (!ctx) throw new Error("useMember must be used within MemberProvider");
 return ctx;
}

function getTier(points: number): Member["tier"] {
 if (points >= 5000) return "Platinum";
 if (points >= 2000) return "Gold";
 if (points >= 500) return "Silver";
 return "Bronze";
}

const tierColors: Record<Member["tier"], string> = {
 Bronze: "#cd7f32",
 Silver: "#c0c0c0",
 Gold: "#ffd700",
 Platinum: "#a855f7",
};

export { tierColors };

export function MemberProvider({ children }: { children: ReactNode }) {
 const [member, setMember] = useState<Member | null>(null);
 const [hydrated, setHydrated] = useState(false);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [modalMode, setModalMode] = useState<"login" | "signup">("login");

 // Load member from localStorage on mount
 useEffect(() => {
  const stored = localStorage.getItem("7h_member");
  if (stored) {
   try {
    const parsed = JSON.parse(stored);
    // Role email lists
    const crewEmails = ["mike@test.com", "mikeyscimeca.dev@gmail.com"];
    const merchEmails = ["merch@test.com", "merch@7thheaven.com"];
    const plannerEmails = ["planner@example.com", "chicago_manager@example.com", "planner@test.com"];
    // Ensure role field exists for legacy accounts
    if (!parsed.role) {
     parsed.role = crewEmails.includes(parsed.email) ? "crew" : merchEmails.includes(parsed.email) ? "merch" : plannerEmails.includes(parsed.email) ? "event_planner" : "fan";
    }
    // Auto-promote by email
    if (crewEmails.includes(parsed.email) && parsed.role !== "crew") parsed.role = "crew";
    if (merchEmails.includes(parsed.email) && parsed.role !== "merch") parsed.role = "merch";
    if (plannerEmails.includes(parsed.email) && parsed.role !== "event_planner") parsed.role = "event_planner";
    setMember(parsed);
   } catch {}
  }
  setHydrated(true);
 }, []);

 // Persist member to localStorage
 useEffect(() => {
  if (member) {
   localStorage.setItem("7h_member", JSON.stringify(member));
  } else {
   localStorage.removeItem("7h_member");
  }
 }, [member]);

 const openModal = (mode: "login" | "signup" = "login") => {
  setModalMode(mode);
  setIsModalOpen(true);
 };
 const closeModal = () => setIsModalOpen(false);

 const login = async (email: string, password: string): Promise<boolean> => {
  // Authenticate via Supabase Auth
  try {
   const { createClient } = await import("@/utils/supabase/client");
   const supabase = createClient();
   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
   if (error || !data.user) return false;

   // Fetch profile for role
   const { data: profile } = await supabase.from("profiles").select("role, username").eq("id", data.user.id).single();
   const role = profile?.role || "fan";
   const fullName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User";
   const profileUsername = profile?.username || data.user.user_metadata?.username || '';

   const supabaseMember: Member = {
    id: data.user.id,
    name: fullName,
    username: profileUsername,
    email: data.user.email?.toLowerCase() || email.toLowerCase(),
    joinDate: data.user.created_at || new Date().toISOString(),
    avatar: fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    points: 0,
    tier: "Bronze",
    showsAttended: 0,
    favoriteVenues: [],
    notificationsEnabled: false,
    notificationRadius: 25,
    role: role as Member["role"],
   };

   // Cache member profile (NOT the password) for fast access
   localStorage.setItem("7h_member", JSON.stringify(supabaseMember));

   setMember(supabaseMember);
   setIsModalOpen(false);
   localStorage.removeItem('vip_inbox_messages');
   return true;
  } catch (e) {
   console.error("Login error:", e);
   return false;
  }
 };

 const signup = async (name: string, email: string, password: string, phone?: string, username?: string): Promise<{ success: boolean; confirmationRequired?: boolean; error?: string }> => {
  // Determine role based on email
  const role = ["mikeyscimeca@gmail.com"].includes(email.toLowerCase()) ? "admin"
   : ["mike@test.com", "mikeyscimeca.dev@gmail.com"].includes(email.toLowerCase()) ? "crew"
   : ["merch@test.com", "merch@7thheaven.com"].includes(email.toLowerCase()) ? "merch"
   : ["planner@example.com", "chicago_manager@example.com", "planner@test.com"].includes(email.toLowerCase()) ? "event_planner"
   : "fan";

  let userId = crypto.randomUUID();

  // Create account in Supabase Auth (persistent, cross-device)
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, username: username || '', role, phone: phone || '' },
          emailRedirectTo: `${window.location.origin}/fans`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        // Confirmation required
        return { success: true, confirmationRequired: true };
      }

      if (data.user && data.session) {
        userId = data.user.id;
        // Update role in profiles if trigger didn't set it correctly
        await supabase.from("profiles").update({ role, username: username || '' }).eq("id", data.user.id);
      }
    } catch (e) {
      console.error("Supabase signup error:", e);
      return { success: false, error: "Network error" };
    }

  const newMember: Member = {
   id: userId,
   name,
   username: username || '',
   email: email.toLowerCase(),
   phone: phone || undefined,
   joinDate: new Date().toISOString(),
   avatar: name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
   points: 0,
   tier: "Bronze",
   showsAttended: 0,
   favoriteVenues: [],
   notificationsEnabled: false,
   notificationRadius: 25,
   role: role as Member["role"],
  };

  // Cache member profile (NOT the password) for fast access
  localStorage.setItem("7h_member", JSON.stringify(newMember));

  setMember(newMember);
  setIsModalOpen(false);
  localStorage.removeItem('vip_inbox_messages');

  // ── Send welcome + admin alert emails (fire-and-forget) ──
  try {
    const { welcomeFan, welcomePlanner, newAccountAdminAlert } = await import('@/lib/email-templates');
    const welcomeHtml = role === 'event_planner'
      ? welcomePlanner({ name, email })
      : welcomeFan({ name });
    const welcomeSubject = role === 'event_planner'
      ? '📋 Your Planner Account is Ready — 7th Heaven'
      : '🎸 Welcome to the 7th Heaven Family';

    // Send welcome email to new member
    fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, subject: welcomeSubject, html: welcomeHtml }),
    }).catch(() => {});

    // Send admin alert
    const roleLabel = role === 'event_planner' ? 'Planner' : role.charAt(0).toUpperCase() + role.slice(1);
    const alertHtml = newAccountAdminAlert({
      accountName: name,
      accountEmail: email,
      accountUsername: username || undefined,
      accountRole: role,
    });
    fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'mikeyscimeca@gmail.com',
        subject: `🔔 New ${roleLabel} Account: ${name}`,
        html: alertHtml,
      }),
    }).catch(() => {});
  } catch {}

  return { success: true, confirmationRequired: false };
 };

 const logout = async () => {
  // Sign out of Supabase too
  try {
   const { createClient } = await import("@/utils/supabase/client");
   const supabase = createClient();
   await supabase.auth.signOut();
  } catch {}
  setMember(null);
 };

 const addPoints = (amount: number) => {
  setMember(prev => {
   if (!prev) return prev;
   const newPoints = prev.points + amount;
   return { ...prev, points: newPoints, tier: getTier(newPoints) };
  });
 };

 const updateLocation = (lat: number, lng: number) => {
  setMember(prev => prev ? { ...prev, location: { lat, lng } } : prev);
 };

 const toggleNotifications = (enabled: boolean) => {
  setMember(prev => prev ? { ...prev, notificationsEnabled: enabled } : prev);
 };

 const setNotificationRadius = (miles: number) => {
  setMember(prev => prev ? { ...prev, notificationRadius: miles } : prev);
 };

 return (
  <MemberContext.Provider value={{
   member,
   isLoggedIn: !!member,
   hydrated,
   isModalOpen,
   openModal,
   closeModal,
   modalMode,
   setModalMode,
   login,
   signup,
   logout,
   addPoints,
   updateLocation,
   toggleNotifications,
   setNotificationRadius,
  }}>
   {children}
  </MemberContext.Provider>
 );
}
