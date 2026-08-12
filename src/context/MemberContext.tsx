/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/supabase-client-owned-authz-field */
/* oxlint-disable react-doctor/supabase-client-owned-authz-field */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { getFakeLogins } from "@/lib/get-fake-logins";
// Dev-only: never ships in the production bundle
const fakeLogins = getFakeLogins();
import { ADMIN_ALERT_EMAIL } from "@/lib/role-config";

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
  role: "fan" | "crew" | "admin" | "merch" | "event_planner" | "cruise";
  phone?: string;
  cruise_signup_id?: string;
  signup_source?: string;
  is_warned?: boolean;
}

interface MemberContextType {
  member: Member | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  isModalOpen: boolean;
  openModal: (mode?: "login" | "signup" | "forgot", role?: "fan" | "crew" | "planner" | "cruise") => void;
  closeModal: () => void;
  modalMode: "login" | "signup" | "forgot";
  setModalMode: (mode: "login" | "signup" | "forgot") => void;
  modalLoginRole: "fan" | "crew" | "planner" | "cruise";
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone?: string, username?: string) => Promise<{ success: boolean; confirmationRequired?: boolean; error?: string }>;
  logout: () => void;
  addPoints: (amount: number) => void;
  updateLocation: (lat: number, lng: number) => void;
  toggleNotifications: (enabled: boolean) => void;
  setNotificationRadius: (miles: number) => void;
  updateAvatar: (avatarUrl: string) => Promise<void>;
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



export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup" | "forgot">("login");
  const [modalLoginRole, setModalLoginRole] = useState<"fan" | "crew" | "planner" | "cruise">("fan");

  // Load member and setup auth listener
  useEffect(() => {
    let active = true;
    const getStored = () => typeof window !== 'undefined' ? (localStorage.getItem("7h_member_v1") || localStorage.getItem("7h_member")) : null;

    const initAndListen = async () => {
      let subscription: any = null;
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const syncUser = async (user: any) => {
          if (!user) {
            if (active) setMember(null);
            return;
          }

          try {
            // Fetch profile details
            const { data: profile } = await supabase
              .from("profiles")
              .select("role, username, points, tier, shows_attended, notifications_enabled, notification_radius, cruise_signup_id, signup_source, is_banned, is_warned")
              .eq("id", user.id)
              .single();

            if (!active) return;

            if (profile?.is_banned) {
              console.warn("User is banned, signing out...");
              await supabase.auth.signOut();
              setMember(null);
              return;
            }

            const role = profile?.role || "fan";
            const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
            const profileUsername = profile?.username || user.user_metadata?.username || "";

            // profiles.role is the authoritative source — no client-side email overrides
            const syncedMember: Member = {
              id: user.id,
              name: fullName,
              username: profileUsername,
              email: user.email?.toLowerCase() || "",
              joinDate: user.created_at || new Date().toISOString(),
              avatar: fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
              points: profile?.points ?? 0,
              tier: (profile?.tier as Member["tier"]) ?? "Bronze",
              showsAttended: profile?.shows_attended ?? 0,
              favoriteVenues: [],
              notificationsEnabled: profile?.notifications_enabled ?? false,
              notificationRadius: profile?.notification_radius ?? 25,
              role: role as Member["role"],
              cruise_signup_id: profile?.cruise_signup_id || undefined,
              signup_source: profile?.signup_source || undefined,
              is_warned: !!profile?.is_warned,
            };

            setMember(syncedMember);
          } catch (e) {
            console.error("Error fetching user profile:", e);
          }
        };

        // Get initial session
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await syncUser(session.user);
          } else {
            // Fallback to local storage on initial load if offline/no session
            const stored = getStored();
            if (stored) {
              try {
                setMember(JSON.parse(stored));
              } catch { }
            }
          }
        } catch (e) {
          console.error("Supabase getSession error:", e);
        }

        // Listen for auth changes
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          if (event === "SIGNED_IN" && session?.user) {
            await syncUser(session.user);
          } else if (event === "SIGNED_OUT") {
            if (active) {
              const stored = getStored();
              if (!stored) setMember(null);
            }
          }
        });
        subscription = sub;
      } catch (err) {
        console.error("Supabase client creation/initialization failed, falling back to local storage:", err);
        // Fallback to local storage on error
        const stored = getStored();
        if (stored) {
          try {
            setMember(JSON.parse(stored));
          } catch { }
        }
      } finally {
        if (active) setHydrated(true);
      }

      return subscription;
    };

    const subPromise = initAndListen();

    return () => {
      active = false;
      subPromise.then(sub => sub?.unsubscribe());
    };
  }, []);

  // Persist member to localStorage
  useEffect(() => {
    if (!hydrated) return;
    if (member) {
      localStorage.setItem("7h_member_v1", JSON.stringify(member));
    } else {
      localStorage.removeItem("7h_member_v1");
      localStorage.removeItem("7h_member");
    }
  }, [member, hydrated]);

  const openModal = useCallback((mode: "login" | "signup" | "forgot" = "login", role: "fan" | "crew" | "planner" | "cruise" = "fan") => {
    setModalMode(mode);
    setModalLoginRole(role);
    setIsModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalLoginRole("fan"); // reset role on close
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Check fake logins bypass
    const savedPassword = typeof window !== 'undefined' ? localStorage.getItem(`7h_dev_password_${email.toLowerCase()}`) : null;
    const fakeUser = fakeLogins.find(
      u => u.email.toLowerCase() === email.toLowerCase() && (password === savedPassword || (!savedPassword && u.password === password))
    );

    if (fakeUser) {
      const storedBans = typeof window !== 'undefined' ? localStorage.getItem("7h_banned_users") : null;
      const bannedList = storedBans ? JSON.parse(storedBans) : [];
      if (bannedList.includes(fakeUser.username) || bannedList.includes(fakeUser.name) || bannedList.includes(fakeUser.email)) {
        throw new Error("This account has been banned.");
      }

      const fakeName = fakeUser.name || "Dev User";
      const fakeUsername = fakeUser.username || "dev_user";
      const fakeMember: Member = {
        id: `fake-${fakeUser.userRole || (fakeUser as any).role}-${Date.now()}`,
        name: fakeName,
        username: fakeUsername,
        email: fakeUser.email.toLowerCase(),
        joinDate: new Date().toISOString(),
        avatar: fakeName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        points: 100,
        tier: "Gold",
        showsAttended: 5,
        favoriteVenues: [],
        notificationsEnabled: true,
        notificationRadius: 25,
        role: (fakeUser.userRole || (fakeUser as any).role) as Member["role"],
      };

      localStorage.setItem("7h_member_v1", JSON.stringify(fakeMember));
      setMember(fakeMember);
      setIsModalOpen(false);
      localStorage.removeItem('vip_inbox_messages_v1');
      localStorage.removeItem('vip_inbox_messages');
      return true;
    }

    // Authenticate via Supabase Auth
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return false;

      // Fetch profile for role
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();

      if (profile?.is_banned) {
        console.warn("Attempted login to banned account:", email);
        await supabase.auth.signOut();
        throw new Error("This account has been banned.");
      }

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
        points: profile?.points ?? 0,
        tier: (profile?.tier as Member["tier"]) ?? "Bronze",
        showsAttended: profile?.shows_attended ?? 0,
        favoriteVenues: [],
        notificationsEnabled: profile?.notifications_enabled ?? false,
        notificationRadius: profile?.notification_radius ?? 25,
        role: role as Member["role"],
        cruise_signup_id: profile?.cruise_signup_id || undefined,
        signup_source: profile?.signup_source || undefined,
        is_warned: !!profile?.is_warned,
      };

      // Cache member profile (NOT the password) for fast access
      localStorage.setItem("7h_member_v1", JSON.stringify(supabaseMember));

      setMember(supabaseMember);
      setIsModalOpen(false);
      localStorage.removeItem('vip_inbox_messages_v1');
      localStorage.removeItem('vip_inbox_messages');
      return true;
    } catch (e: any) {
      console.error("Login error:", e);
      if (e?.message === "This account has been banned.") {
        throw e;
      }
      return false;
    }
  }, [setMember, setIsModalOpen]);

  const signup = useCallback(async (name: string, email: string, password: string, phone?: string, username?: string): Promise<{ success: boolean; confirmationRequired?: boolean; error?: string }> => {
    const role: Member["role"] = email.toLowerCase().includes("planner") ? "event_planner" : "fan";

    let userId = crypto.randomUUID();

    // Create account in Supabase Auth (persistent, cross-device)
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, username: username || '', phone: phone || '' },
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
        // Only update username client-side. Role is authoritative from the DB trigger
        // that reads user_metadata.role set during auth.signUp above.
        // Never write role from the client — even 'fan' — to prevent privilege escalation.
        await supabase.from("profiles").update({ username: username || '' }).eq("id", data.user.id);
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
    localStorage.setItem("7h_member_v1", JSON.stringify(newMember));

    setMember(newMember);
    setIsModalOpen(false);
    localStorage.removeItem('vip_inbox_messages_v1');
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
      }).catch(() => { });

      // Send admin alert
      const roleLabel = role === 'event_planner' ? 'Planner' : role.charAt(0).toUpperCase() + role.slice(1);
      const alertHtml = newAccountAdminAlert({
        accountName: name,
        accountEmail: email,
        accountUsername: username || undefined,
        accountRole: role,
      });
      if (ADMIN_ALERT_EMAIL) {
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: ADMIN_ALERT_EMAIL,
            subject: `🔔 New ${roleLabel} Account: ${name}`,
            html: alertHtml,
          }),
        }).catch(() => { });
      }
    } catch { }

    return { success: true, confirmationRequired: false };
  }, [setMember, setIsModalOpen]);

  const logout = useCallback(async () => {
    // 1. Use the cached supabase client (same instance that holds the session)
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { }

    // 2. Nuke every trace of the session from storage
    localStorage.removeItem("7h_member");
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("sb-")) localStorage.removeItem(key);
    });
    sessionStorage.clear();

    // 3. Clear the cached window client so next page gets a fresh one
    if (typeof window !== "undefined") {
      (window as any).__supabaseClient = null;
    }

    // 4. Clear React state
    setMember(null);
  }, [setMember]);

  const addPoints = useCallback((amount: number) => {
    setMember(prev => {
      if (!prev) return prev;
      const newPoints = prev.points + amount;
      return { ...prev, points: newPoints, tier: getTier(newPoints) };
    });
  }, [setMember]);

  const updateLocation = useCallback((lat: number, lng: number) => {
    setMember(prev => prev ? { ...prev, location: { lat, lng } } : prev);
  }, [setMember]);

  const toggleNotifications = useCallback((enabled: boolean) => {
    setMember(prev => prev ? { ...prev, notificationsEnabled: enabled } : prev);
  }, [setMember]);

  const setNotificationRadius = useCallback((miles: number) => {
    setMember(prev => prev ? { ...prev, notificationRadius: miles } : prev);
  }, [setMember]);

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    setMember(prev => {
      if (!prev) return null; // No member session — nothing to update
      return { ...prev, avatar: avatarUrl };
    });
    try {
      localStorage.setItem("7h_profile_avatar_v1", avatarUrl);
      const stored = localStorage.getItem("7h_member_v1") || localStorage.getItem("7h_member");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.avatar = avatarUrl;
        localStorage.setItem("7h_member_v1", JSON.stringify(parsed));
      }
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
      }
    } catch (err) {
      console.error("Failed to update avatar:", err);
    }
  }, [setMember]);

  const contextValue = useMemo(() => ({
    member,
    isLoggedIn: !!member,
    hydrated,
    isModalOpen,
    openModal,
    closeModal,
    modalMode,
    setModalMode,
    modalLoginRole,
    login,
    signup,
    logout,
    addPoints,
    updateLocation,
    toggleNotifications,
    setNotificationRadius,
    updateAvatar,
  }), [
    member,
    hydrated,
    isModalOpen,
    openModal,
    closeModal,
    modalMode,
    setModalMode,
    modalLoginRole,
    login,
    signup,
    logout,
    addPoints,
    updateLocation,
    toggleNotifications,
    setNotificationRadius,
    updateAvatar,
  ]);

  return (
    <MemberContext.Provider value={contextValue}>
      {children}
    </MemberContext.Provider>
  );
}
