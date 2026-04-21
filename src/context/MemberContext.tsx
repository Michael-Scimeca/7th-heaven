"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Member {
 id: string;
 name: string;
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
 role: "fan" | "crew" | "admin" | "merch";
}

interface MemberContextType {
 member: Member | null;
 isLoggedIn: boolean;
 isModalOpen: boolean;
 openModal: (mode?: "login" | "signup") => void;
 closeModal: () => void;
 modalMode: "login" | "signup";
 setModalMode: (mode: "login" | "signup") => void;
 login: (email: string, password: string) => Promise<boolean>;
 signup: (name: string, email: string, password: string) => Promise<boolean>;
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
    // Ensure role field exists for legacy accounts
    if (!parsed.role) {
     parsed.role = crewEmails.includes(parsed.email) ? "crew" : merchEmails.includes(parsed.email) ? "merch" : "fan";
    }
    // Auto-promote by email
    if (crewEmails.includes(parsed.email) && parsed.role !== "crew") parsed.role = "crew";
    if (merchEmails.includes(parsed.email) && parsed.role !== "merch") parsed.role = "merch";
    setMember(parsed);
   } catch {}
  }
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

 const login = async (email: string, _password: string): Promise<boolean> => {
  // Check if member exists in localStorage accounts
  const accounts = JSON.parse(localStorage.getItem("7h_accounts") || "{}");
  const account = accounts[email.toLowerCase()];
  if (!account) return false;

  setMember(account);
  setIsModalOpen(false);
  return true;
 };

 const signup = async (name: string, email: string, _password: string): Promise<boolean> => {
  const newMember: Member = {
   id: crypto.randomUUID(),
   name,
   email: email.toLowerCase(),
   joinDate: new Date().toISOString(),
   avatar: name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
   points: 100, // Welcome bonus
   tier: "Bronze",
   showsAttended: 0,
   favoriteVenues: [],
   notificationsEnabled: false,
   notificationRadius: 25,
   role: ["mike@test.com", "mikeyscimeca.dev@gmail.com"].includes(email.toLowerCase()) ? "crew" : ["merch@test.com", "merch@7thheaven.com"].includes(email.toLowerCase()) ? "merch" : "fan",
  };

  // Store account
  const accounts = JSON.parse(localStorage.getItem("7h_accounts") || "{}");
  accounts[email.toLowerCase()] = newMember;
  localStorage.setItem("7h_accounts", JSON.stringify(accounts));

  setMember(newMember);
  setIsModalOpen(false);
  return true;
 };

 const logout = () => {
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
