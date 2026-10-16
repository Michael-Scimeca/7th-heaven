/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/supabase-client-owned-authz-field */
/* oxlint-disable react-doctor/supabase-client-owned-authz-field */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
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
  organization?: string;
  venueName?: string;
  venueCity?: string;
  venueState?: string;
  cruise_signup_id?: string;
  signup_source?: string;
  zip?: string;
  is_warned?: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  password?: string;
  phone?: string;
  organization?: string;
  venueName?: string;
  venueCity?: string;
  venueState?: string;
}

interface MemberContextType {
  member: Member | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  isModalOpen: boolean;
  openModal: (
    mode?: "login" | "signup" | "forgot",
    role?: "fan" | "crew" | "planner" | "cruise",
  ) => void;
  closeModal: () => void;
  modalMode: "login" | "signup" | "forgot";
  setModalMode: (mode: "login" | "signup" | "forgot") => void;
  modalLoginRole: "fan" | "crew" | "planner" | "cruise";
  isProfileModalOpen: boolean;
  profileModalUser: Member | null;
  openProfileModal: (targetUser?: Member | null) => void;
  closeProfileModal: () => void;
  updateProfile: (
    updates: UpdateProfilePayload,
    targetUser?: Member | null,
  ) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    username?: string,
  ) => Promise<{
    success: boolean;
    confirmationRequired?: boolean;
    error?: string;
  }>;
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
  const [modalMode, setModalMode] = useState<"login" | "signup" | "forgot">(
    "login",
  );
  const [modalLoginRole, setModalLoginRole] = useState<
    "fan" | "crew" | "planner" | "cruise"
  >("fan");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<Member | null>(null);

  const openProfileModal = useCallback((targetUser?: Member | null) => {
    setProfileModalUser(targetUser || null);
    setIsProfileModalOpen(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
    setProfileModalUser(null);
  }, []);

  // Load member and setup auth listener
  useEffect(() => {
    let active = true;
    const getStored = () =>
      typeof window !== "undefined"
        ? localStorage.getItem("7h_member_v1") ||
          localStorage.getItem("7h_member")
        : null;

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
              .select(
                "role, username, points, tier, shows_attended, notifications_enabled, notification_radius, cruise_signup_id, signup_source, is_banned, is_warned, zip, latitude, longitude",
              )
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
            const fullName =
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User";
            const profileUsername =
              profile?.username || user.user_metadata?.username || "";

            // profiles.role is the authoritative source — no client-side email overrides
            const formattedName = fullName
              .toLowerCase()
              .replace(/\b\w/g, (c: string) => c.toUpperCase());
            const syncedMember: Member = {
              id: user.id,
              name: formattedName,
              username: profileUsername,
              email: user.email?.toLowerCase() || "",
              joinDate: user.created_at || new Date().toISOString(),
              avatar: fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              points: profile?.points ?? 0,
              tier: (profile?.tier as Member["tier"]) ?? "Bronze",
              showsAttended: profile?.shows_attended ?? 0,
              favoriteVenues: [],
              location:
                profile?.latitude && profile?.longitude
                  ? { lat: profile.latitude, lng: profile.longitude }
                  : undefined,
              zip: profile?.zip || undefined,
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
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            await syncUser(session.user);
          } else {
            // Fallback to local storage on initial load if offline/no session
            const stored = getStored();
            if (stored) {
              try {
                setMember(JSON.parse(stored));
              } catch {}
            }
          }
        } catch (e) {
          console.error("Supabase getSession error:", e);
        }

        // Listen for auth changes
        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange(
          async (event: any, session: any) => {
            if (event === "SIGNED_IN" && session?.user) {
              await syncUser(session.user);
            } else if (event === "SIGNED_OUT") {
              if (active) {
                const stored = getStored();
                if (!stored) setMember(null);
              }
            }
          },
        );
        subscription = sub;
      } catch (err) {
        console.error(
          "Supabase client creation/initialization failed, falling back to local storage:",
          err,
        );
        // Fallback to local storage on error
        const stored = getStored();
        if (stored) {
          try {
            setMember(JSON.parse(stored));
          } catch {}
        }
      } finally {
        if (active) setHydrated(true);
      }

      return subscription;
    };

    const subPromise = initAndListen();

    return () => {
      active = false;
      subPromise.then((sub) => sub?.unsubscribe());
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

  const openModal = useCallback(
    (
      mode: "login" | "signup" | "forgot" = "login",
      role: "fan" | "crew" | "planner" | "cruise" = "fan",
    ) => {
      setModalMode(mode);
      setModalLoginRole(role);
      setIsModalOpen(true);
    },
    [],
  );
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalLoginRole("fan"); // reset role on close
  }, []);

  const login = useCallback(
    async (emailOrUsername: string, password: string): Promise<boolean> => {
      const trimmed = emailOrUsername.trim();
      const cleanUser = trimmed.replace(/^@/, "").toLowerCase();

      // Check fake logins bypass by email OR username OR name
      const fakeUser = fakeLogins.find(
        (u) =>
          u.email.toLowerCase() === trimmed.toLowerCase() ||
          (u.username && u.username.toLowerCase() === cleanUser) ||
          (u.name && u.name.toLowerCase() === trimmed.toLowerCase()),
      );

      const emailKey = fakeUser
        ? fakeUser.email.toLowerCase()
        : trimmed.toLowerCase();
      const savedPassword =
        typeof window !== "undefined"
          ? localStorage.getItem(`7h_dev_password_${emailKey}`) ||
            localStorage.getItem(`7h_dev_password_${cleanUser}`)
          : null;

      if (
        fakeUser &&
        (password === savedPassword ||
          (!savedPassword && fakeUser.password === password))
      ) {
        const storedBans =
          typeof window !== "undefined"
            ? localStorage.getItem("7h_banned_users")
            : null;
        const bannedList = storedBans ? JSON.parse(storedBans) : [];
        if (
          bannedList.includes(fakeUser.username) ||
          bannedList.includes(fakeUser.name) ||
          bannedList.includes(fakeUser.email)
        ) {
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
          avatar: fakeName
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
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
        localStorage.removeItem("vip_inbox_messages_v1");
        localStorage.removeItem("vip_inbox_messages");
        return true;
      }

      let emailForAuth = trimmed;
      if (!trimmed.includes("@")) {
        try {
          const raw =
            typeof window !== "undefined"
              ? localStorage.getItem("7h_accounts_v1") ||
                localStorage.getItem("7h_accounts")
              : null;
          if (raw) {
            const accts = JSON.parse(raw);
            const found = Object.values(accts).find(
              (a: any) =>
                a?.username?.toLowerCase() === cleanUser ||
                a?.name?.toLowerCase() === trimmed.toLowerCase(),
            ) as any;
            if (found?.email) {
              emailForAuth = found.email;
            }
          }
          if (!emailForAuth.includes("@")) {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, email, username")
              .ilike("username", cleanUser)
              .single();
            if (profile?.email) {
              emailForAuth = profile.email;
            }
          }
        } catch {}
      }

      // Authenticate via Supabase Auth
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailForAuth,
          password,
        });
        if (error || !data.user) return false;

        // Fetch profile for role
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profile?.is_banned) {
          console.warn("Attempted login to banned account:", emailForAuth);
          await supabase.auth.signOut();
          throw new Error("This account has been banned.");
        }

        const role = profile?.role || "fan";
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "User";
        const profileUsername =
          profile?.username || data.user.user_metadata?.username || "";

        const supabaseMember: Member = {
          id: data.user.id,
          name: fullName,
          username: profileUsername,
          email: data.user.email?.toLowerCase() || emailForAuth.toLowerCase(),
          joinDate: data.user.created_at || new Date().toISOString(),
          avatar: fullName
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
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
        localStorage.removeItem("vip_inbox_messages_v1");
        localStorage.removeItem("vip_inbox_messages");
        return true;
      } catch (e: any) {
        console.error("Login error:", e);
        if (e?.message === "This account has been banned.") {
          throw e;
        }
        return false;
      }
    },
    [setMember, setIsModalOpen],
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone?: string,
      username?: string,
    ): Promise<{
      success: boolean;
      confirmationRequired?: boolean;
      error?: string;
    }> => {
      const role: Member["role"] = email.toLowerCase().includes("planner")
        ? "event_planner"
        : "fan";

      let userId = crypto.randomUUID();

      // Create account in Supabase Auth (persistent, cross-device)
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              username: username || "",
              phone: phone || "",
            },
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
          await supabase
            .from("profiles")
            .update({ username: username || "" })
            .eq("id", data.user.id);
        }
      } catch (e) {
        console.error("Supabase signup error:", e);
        return { success: false, error: "Network error" };
      }

      const newMember: Member = {
        id: userId,
        name,
        username: username || "",
        email: email.toLowerCase(),
        phone: phone || undefined,
        joinDate: new Date().toISOString(),
        avatar: name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
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
      localStorage.removeItem("vip_inbox_messages_v1");
      localStorage.removeItem("vip_inbox_messages");

      // ── Send welcome + admin alert emails (fire-and-forget) ──
      try {
        const { welcomeFan, welcomePlanner, newAccountAdminAlert } =
          await import("@/lib/email-templates");
        const welcomeHtml =
          role === "event_planner"
            ? welcomePlanner({ name, email })
            : welcomeFan({ name });
        const welcomeSubject =
          role === "event_planner"
            ? "📋 Your Planner Account is Ready — 7th Heaven"
            : "🎸 Welcome to the 7th Heaven Family";

        // Send welcome email to new member
        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: welcomeSubject,
            html: welcomeHtml,
          }),
        }).catch(() => {});

        // Send admin alert
        const roleLabel =
          role === "event_planner"
            ? "Planner"
            : role.charAt(0).toUpperCase() + role.slice(1);
        const alertHtml = newAccountAdminAlert({
          accountName: name,
          accountEmail: email,
          accountUsername: username || undefined,
          accountRole: role,
        });
        if (ADMIN_ALERT_EMAIL) {
          fetch("/api/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: ADMIN_ALERT_EMAIL,
              subject: `🔔 New ${roleLabel} Account: ${name}`,
              html: alertHtml,
            }),
          }).catch(() => {});
        }
      } catch {}

      return { success: true, confirmationRequired: false };
    },
    [setMember, setIsModalOpen],
  );

  const logout = useCallback(async () => {
    // 1. Use the cached supabase client (same instance that holds the session)
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}

    // 2. Nuke every trace of the session from storage
    localStorage.removeItem("7h_member");
    Object.keys(localStorage).forEach((key) => {
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

  const addPoints = useCallback(
    (amount: number) => {
      setMember((prev) => {
        if (!prev) return prev;
        const newPoints = prev.points + amount;
        return { ...prev, points: newPoints, tier: getTier(newPoints) };
      });
    },
    [setMember],
  );

  const updateLocation = useCallback(
    (lat: number, lng: number) => {
      setMember((prev) => (prev ? { ...prev, location: { lat, lng } } : prev));
    },
    [setMember],
  );

  const toggleNotifications = useCallback(
    (enabled: boolean) => {
      setMember((prev) =>
        prev ? { ...prev, notificationsEnabled: enabled } : prev,
      );
    },
    [setMember],
  );

  const setNotificationRadius = useCallback(
    (miles: number) => {
      setMember((prev) =>
        prev ? { ...prev, notificationRadius: miles } : prev,
      );
    },
    [setMember],
  );

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      setMember((prev) => {
        if (!prev) return null; // No member session — nothing to update
        return { ...prev, avatar: avatarUrl };
      });
      try {
        localStorage.setItem("7h_profile_avatar_v1", avatarUrl);
        const stored =
          localStorage.getItem("7h_member_v1") ||
          localStorage.getItem("7h_member");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.avatar = avatarUrl;
          localStorage.setItem("7h_member_v1", JSON.stringify(parsed));
        }
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ avatar_url: avatarUrl })
            .eq("id", user.id);
        }
      } catch (err) {
        console.error("Failed to update avatar:", err);
      }
    },
    [setMember],
  );

  const updateProfile = useCallback(
    async (
      updates: UpdateProfilePayload,
      targetUser?: Member | null,
    ): Promise<{ success: boolean; error?: string }> => {
      const activeTarget = targetUser || member;
      if (!activeTarget) {
        return { success: false, error: "No user account to update." };
      }

      const updatedEmail = updates.email
        ? updates.email.trim().toLowerCase()
        : activeTarget.email;
      const updatedName =
        updates.name !== undefined ? updates.name.trim() : activeTarget.name;
      const updatedUsername =
        updates.username !== undefined
          ? updates.username.trim().replace(/^@/, "")
          : activeTarget.username;
      const updatedAvatar =
        updates.avatar !== undefined ? updates.avatar : activeTarget.avatar;
      const updatedPhone =
        updates.phone !== undefined ? updates.phone.trim() : activeTarget.phone;
      const updatedOrg =
        updates.organization !== undefined
          ? updates.organization.trim()
          : activeTarget.organization;
      const updatedVenueName =
        updates.venueName !== undefined
          ? updates.venueName.trim()
          : activeTarget.venueName;
      const updatedVenueCity =
        updates.venueCity !== undefined
          ? updates.venueCity.trim()
          : activeTarget.venueCity;
      const updatedVenueState =
        updates.venueState !== undefined
          ? updates.venueState.trim()
          : activeTarget.venueState;

      const updatedMember: Member = {
        ...activeTarget,
        name: updatedName,
        username: updatedUsername,
        email: updatedEmail,
        avatar: updatedAvatar,
        phone: updatedPhone,
        organization: updatedOrg,
        venueName: updatedVenueName,
        venueCity: updatedVenueCity,
        venueState: updatedVenueState,
      };

      // If we are updating the currently logged-in member, update React state
      if (!targetUser || targetUser.id === member?.id) {
        setMember(updatedMember);
      }

      // Persist to local storage
      try {
        if (!targetUser || targetUser.id === member?.id) {
          localStorage.setItem("7h_member_v1", JSON.stringify(updatedMember));
          if (updatedAvatar) {
            localStorage.setItem("7h_profile_avatar_v1", updatedAvatar);
            localStorage.setItem("7h_profile_avatar", updatedAvatar);
          }
        }

        if (updates.password) {
          localStorage.setItem(
            `7h_dev_password_${updatedEmail}`,
            updates.password,
          );
          if (updatedUsername) {
            localStorage.setItem(
              `7h_dev_password_${updatedUsername.toLowerCase()}`,
              updates.password,
            );
          }
        }

        // Sync into 7h_accounts_v1 and 7h_accounts
        const acctKeys = ["7h_accounts_v1", "7h_accounts"];
        acctKeys.forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            const accts = raw ? JSON.parse(raw) : {};
            const oldEmailKey = activeTarget.email.toLowerCase();
            const existing =
              accts[oldEmailKey] ||
              Object.values(accts).find(
                (a: any) =>
                  a?.username === activeTarget.username ||
                  a?.id === activeTarget.id,
              ) ||
              {};

            delete accts[oldEmailKey];
            accts[updatedEmail] = {
              ...existing,
              id: activeTarget.id,
              name: updatedName,
              username: updatedUsername,
              email: updatedEmail,
              avatar: updatedAvatar,
              avatar_url: updatedAvatar,
              role: activeTarget.role,
              ...(updates.password
                ? { password: updates.password }
                : existing.password
                  ? { password: existing.password }
                  : {}),
              phone: updatedPhone,
              organization: updatedOrg,
              venueName: updatedVenueName,
              venueCity: updatedVenueCity,
              venueState: updatedVenueState,
            };
            localStorage.setItem(key, JSON.stringify(accts));
          } catch {}
        });

        // Sync planner storage if role is event_planner
        if (activeTarget.role === "event_planner") {
          try {
            const pKey = "7h_planner_info_v1";
            const pRaw = localStorage.getItem(pKey);
            const pInfo = pRaw ? JSON.parse(pRaw) : {};
            pInfo.plannerName = updatedName;
            pInfo.plannerEmail = updatedEmail;
            pInfo.plannerPhone = updatedPhone || pInfo.plannerPhone;
            pInfo.organization = updatedOrg || pInfo.organization;
            pInfo.venueName = updatedVenueName || pInfo.venueName;
            pInfo.venueCity = updatedVenueCity || pInfo.venueCity;
            pInfo.venueState = updatedVenueState || pInfo.venueState;
            localStorage.setItem(pKey, JSON.stringify(pInfo));
          } catch {}
        }
      } catch (storageErr) {
        console.error("Local storage sync error in updateProfile:", storageErr);
      }

      // Sync Supabase backend
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && (!targetUser || targetUser.id === user.id)) {
          const authUpdates: any = {
            data: {
              full_name: updatedName,
              username: updatedUsername,
              phone: updatedPhone,
            },
          };
          if (updatedEmail && updatedEmail !== user.email?.toLowerCase()) {
            authUpdates.email = updatedEmail;
          }
          if (updates.password) {
            authUpdates.password = updates.password;
          }

          const { error: authErr } = await supabase.auth.updateUser(authUpdates);
          if (authErr) {
            console.warn("Supabase auth.updateUser notice:", authErr.message);
          }

          await supabase
            .from("profiles")
            .update({
              username: updatedUsername,
              avatar_url: updatedAvatar,
              ...(updatedPhone ? { phone: updatedPhone } : {}),
            })
            .eq("id", user.id);
        } else if (
          targetUser &&
          targetUser.id &&
          !targetUser.id.startsWith("fake-")
        ) {
          const { adminSetUserPassword, adminUpdateUserProfile } = await import(
            "@/app/admin/actions"
          );
          if (updates.password) {
            await adminSetUserPassword(
              targetUser.id,
              updatedEmail,
              updates.password,
            );
          }
          await adminUpdateUserProfile(targetUser.id, updatedEmail, {
            name: updatedName,
            username: updatedUsername,
            email: updatedEmail,
            avatar_url: updatedAvatar,
          });
        }
      } catch (backendErr) {
        console.warn("Backend update error (offline or dev bypass):", backendErr);
      }

      return { success: true };
    },
    [member, setMember],
  );

  const contextValue = useMemo(
    () => ({
      member,
      isLoggedIn: !!member,
      hydrated,
      isModalOpen,
      openModal,
      closeModal,
      modalMode,
      setModalMode,
      modalLoginRole,
      isProfileModalOpen,
      profileModalUser,
      openProfileModal,
      closeProfileModal,
      updateProfile,
      login,
      signup,
      logout,
      addPoints,
      updateLocation,
      toggleNotifications,
      setNotificationRadius,
      updateAvatar,
    }),
    [
      member,
      hydrated,
      isModalOpen,
      openModal,
      closeModal,
      modalMode,
      setModalMode,
      modalLoginRole,
      isProfileModalOpen,
      profileModalUser,
      openProfileModal,
      closeProfileModal,
      updateProfile,
      login,
      signup,
      logout,
      addPoints,
      updateLocation,
      toggleNotifications,
      setNotificationRadius,
      updateAvatar,
    ],
  );

  return (
    <MemberContext.Provider value={contextValue}>
      <>{children}</>
    </MemberContext.Provider>
  );
}
