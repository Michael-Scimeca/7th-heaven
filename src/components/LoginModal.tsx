"use client";
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
/* oxlint-disable react-doctor/no-giant-component */

import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import { Lock, Mail, Zap, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMember } from "@/context/MemberContext";
import { isValidEmail } from "@/lib/validation";
import { SquishyToggle } from "./SquishyToggle";
import GooeyDropdown from "./GooeyDropdown";
import Dropdown from "@/components/Dropdown";
import SeventhButton from "@/components/SeventhButton";
import { getFakeLogins } from "@/lib/get-fake-logins";
// Dev-only: never ships in the production bundle
const fakeLogins = getFakeLogins();

/** Convert a display name to a username suggestion: "Jane Doe" → "jane_doe" */
function nameToUsername(n: string): string {
  return n
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, "") // strip special chars
    .replace(/\s+/g, "_") // spaces → underscores
    .replace(/_+/g, "_") // collapse multiple underscores
    .slice(0, 24); // max length
}

function getStoredMemberData(): any {
  if (typeof window === "undefined") return {};
  const v1 = localStorage.getItem("7h_member_v1");
  if (v1) {
    try {
      return JSON.parse(v1);
    } catch {}
  }
  const fallback = localStorage.getItem("7h_member");
  if (fallback) {
    try {
      return JSON.parse(fallback);
    } catch {}
  }
  return {};
}

interface ModalFormState {
  name: string;
  email: string;
  password: string;
  zipCode: string;
  alertRadius: string;
  wantNotifications: boolean;
  wantNewsletter: boolean;
  error: string;
  isAgeConfirmed: boolean;
  loading: boolean;
  loginRole: "fan" | "crew" | "planner" | "cruise";
  confirmationRequired: boolean;
  website: string;
  usernameField: string;
  pinSent: boolean;
  pinCode: string;
  signUpPayload: any;
  forgotPinSent: boolean;
  forgotPinCode: string;
  isInviteFlow: boolean;
  adminMode: boolean;
  adminEmail: string;
  adminPassword: string;
  adminError: string;
  adminLoading: boolean;
}

type ModalFormAction =
  | { type: "SET_FIELD"; field: keyof ModalFormState; value: any }
  | { type: "RESET_FORM" };

const initialFormState: ModalFormState = {
  name: "",
  email: "",
  password: "",
  zipCode: "",
  alertRadius: "50",
  wantNotifications: false,
  wantNewsletter: true,
  error: "",
  isAgeConfirmed: false,
  loading: false,
  loginRole: "fan",
  confirmationRequired: false,
  website: "",
  usernameField: "",
  pinSent: false,
  pinCode: "",
  signUpPayload: null,
  forgotPinSent: false,
  forgotPinCode: "",
  isInviteFlow: false,
  adminMode: false,
  adminEmail: "",
  adminPassword: "",
  adminError: "",
  adminLoading: false,
};

function modalFormReducer(
  state: ModalFormState,
  action: ModalFormAction,
): ModalFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET_FORM":
      return { ...initialFormState };
    default:
      return state;
  }
}

function useLoginFormState() {
  const [state, dispatch] = useReducer(modalFormReducer, initialFormState);

  const setName = useCallback(
    (val: string) => dispatch({ type: "SET_FIELD", field: "name", value: val }),
    [],
  );
  const setEmail = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "email", value: val }),
    [],
  );
  const setPassword = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "password", value: val }),
    [],
  );
  const setZipCode = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "zipCode", value: val }),
    [],
  );
  const setAlertRadius = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "alertRadius", value: val }),
    [],
  );
  const setWantNotifications = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "wantNotifications",
        value:
          typeof val === "function"
            ? (val as any)(state.wantNotifications)
            : val,
      }),
    [state.wantNotifications],
  );
  const setWantNewsletter = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "wantNewsletter",
        value:
          typeof val === "function" ? (val as any)(state.wantNewsletter) : val,
      }),
    [state.wantNewsletter],
  );
  const setError = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "error", value: val }),
    [],
  );
  const setIsAgeConfirmed = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "isAgeConfirmed",
        value:
          typeof val === "function" ? (val as any)(state.isAgeConfirmed) : val,
      }),
    [state.isAgeConfirmed],
  );
  const setLoading = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "loading",
        value: typeof val === "function" ? (val as any)(state.loading) : val,
      }),
    [state.loading],
  );
  const setLoginRole = useCallback(
    (val: "fan" | "crew" | "planner" | "cruise") =>
      dispatch({ type: "SET_FIELD", field: "loginRole", value: val }),
    [],
  );
  const setConfirmationRequired = useCallback(
    (val: boolean) =>
      dispatch({
        type: "SET_FIELD",
        field: "confirmationRequired",
        value: val,
      }),
    [],
  );
  const setWebsite = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "website", value: val }),
    [],
  );
  const setUsernameField = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "usernameField", value: val }),
    [],
  );
  const setPinSent = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "pinSent",
        value: typeof val === "function" ? (val as any)(state.pinSent) : val,
      }),
    [state.pinSent],
  );
  const setPinCode = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "pinCode", value: val }),
    [],
  );
  const setSignUpPayload = useCallback(
    (val: any) =>
      dispatch({ type: "SET_FIELD", field: "signUpPayload", value: val }),
    [],
  );
  const setForgotPinSent = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "forgotPinSent",
        value:
          typeof val === "function" ? (val as any)(state.forgotPinSent) : val,
      }),
    [state.forgotPinSent],
  );
  const setForgotPinCode = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "forgotPinCode", value: val }),
    [],
  );
  const setIsInviteFlow = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "isInviteFlow",
        value:
          typeof val === "function" ? (val as any)(state.isInviteFlow) : val,
      }),
    [state.isInviteFlow],
  );
  const setAdminMode = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "adminMode",
        value: typeof val === "function" ? (val as any)(state.adminMode) : val,
      }),
    [state.adminMode],
  );
  const setAdminEmail = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "adminEmail", value: val }),
    [],
  );
  const setAdminPassword = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "adminPassword", value: val }),
    [],
  );
  const setAdminError = useCallback(
    (val: string) =>
      dispatch({ type: "SET_FIELD", field: "adminError", value: val }),
    [],
  );
  const setAdminLoading = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) =>
      dispatch({
        type: "SET_FIELD",
        field: "adminLoading",
        value:
          typeof val === "function" ? (val as any)(state.adminLoading) : val,
      }),
    [state.adminLoading],
  );

  return {
    state,
    dispatch,
    setName,
    setEmail,
    setPassword,
    setZipCode,
    setAlertRadius,
    setWantNotifications,
    setWantNewsletter,
    setError,
    setIsAgeConfirmed,
    setLoading,
    setLoginRole,
    setConfirmationRequired,
    setWebsite,
    setUsernameField,
    setPinSent,
    setPinCode,
    setSignUpPayload,
    setForgotPinSent,
    setForgotPinCode,
    setIsInviteFlow,
    setAdminMode,
    setAdminEmail,
    setAdminPassword,
    setAdminError,
    setAdminLoading,
  };
}

export default function LoginModal() {
  const {
    isModalOpen,
    closeModal,
    modalMode,
    setModalMode,
    login,
    signup,
    openModal,
    modalLoginRole,
  } = useMember();
  const formState = useLoginFormState();
  const { state } = formState;

  const {
    name,
    email,
    password,
    zipCode,
    alertRadius,
    wantNotifications,
    wantNewsletter,
    error,
    isAgeConfirmed,
    loading,
    loginRole,
    confirmationRequired,
    website,
    usernameField,
    pinSent,
    pinCode,
    signUpPayload,
    forgotPinSent,
    forgotPinCode,
    isInviteFlow,
    adminMode,
    adminEmail,
    adminPassword,
    adminError,
    adminLoading,
  } = state;

  const {
    setName,
    setEmail,
    setPassword,
    setZipCode,
    setWantNotifications,
    setWantNewsletter,
    setError,
    setIsAgeConfirmed,
    setLoading,
    setLoginRole,
    setConfirmationRequired,
    setWebsite,
    setUsernameField,
    setPinSent,
    setPinCode,
    setSignUpPayload,
    setForgotPinSent,
    setForgotPinCode,
    setIsInviteFlow,
    setAdminMode,
    setAdminEmail,
    setAdminPassword,
    setAdminError,
    setAdminLoading,
  } = formState;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const inviteEmail = params.get("inviteEmail");
      const invitePin = params.get("invitePin");
      const inviteName = params.get("inviteName");
      if (inviteEmail) {
        setEmail(inviteEmail);
        setIsInviteFlow(true);
        if (inviteName) {
          setName(inviteName);
          // Auto-generate username from name
          setUsernameField(nameToUsername(inviteName));
        }
        setModalMode("signup");
        openModal("signup");
        if (invitePin) {
          setPinCode(invitePin);
        }
      } else if (params.get("showLogin") === "true") {
        setModalMode("login");
        openModal("login");
      } else if (params.get("showSignup") === "true") {
        setModalMode("signup");
        openModal("signup");
      }
      // Pre-select role tab if ?role= is present
      const r = params.get("role");
      if (r === "crew" || r === "planner" || r === "cruise") {
        setLoginRole(r as any);
      }
    }
  }, [
    openModal,
    setLoginRole,
    setEmail,
    setIsInviteFlow,
    setName,
    setUsernameField,
    setModalMode,
    setPinCode,
  ]);

  // Sync loginRole when modal initially opens
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isModalOpen && !prevIsOpenRef.current && modalLoginRole) {
      setLoginRole(modalLoginRole as any);
    }
    prevIsOpenRef.current = isModalOpen;
  }, [isModalOpen, modalLoginRole, setLoginRole]);

  if (!isModalOpen) return null;

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!pinCode || pinCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pinCode,
          ...signUpPayload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          const loginOk = await login(
            signUpPayload.email,
            signUpPayload.password,
          );
          if (loginOk) {
            window.location.href = `/fans/${signUpPayload.username || "me"}`;
          } else {
            setError(
              "Account created, but automatic login failed. Please sign in manually.",
            );
          }
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Verification failed.");
      }
    } catch (err) {
      setError("Failed to verify code. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (modalMode === "forgot") {
      if (!isValidEmail(email)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      if (!forgotPinSent) {
        try {
          const res = await fetch("/api/auth/send-pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.error) {
              setError(data.error);
            } else {
              setForgotPinSent(true);
              setError("");
            }
          } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to send reset code.");
          }
        } catch (err) {
          setError("Failed to request reset PIN. Try again.");
        }
        setLoading(false);
        return;
      } else {
        if (!forgotPinCode || forgotPinCode.length !== 6) {
          setError("Please enter a valid 6-digit code.");
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setError("Password must be 4+ characters.");
          setLoading(false);
          return;
        }

        try {
          const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, pin: forgotPinCode, password }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.error) {
              setError(data.error);
            } else {
              if (
                typeof window !== "undefined" &&
                (data.devBypass || process.env.NODE_ENV !== "production")
              ) {
                localStorage.setItem(
                  `7h_dev_password_${email.toLowerCase()}`,
                  password,
                );
              }
              const loginOk = await login(email, password);
              if (loginOk) {
                setForgotPinSent(false);
                setForgotPinCode("");
                setPassword("");
                const stored = getStoredMemberData();
                const acctRole = stored.role;
                const acctUsername = stored.username || "me";
                if (loginRole === "planner" || acctRole === "event_planner") {
                  window.location.href = "/planner";
                } else if (loginRole === "cruise" || acctRole === "cruise") {
                  window.location.href = `/cruise/${acctUsername || "dashboard"}`;
                } else if (loginRole === "crew" || acctRole === "crew") {
                  window.location.href = "/crew";
                } else if (acctRole === "admin") {
                  window.location.href = "/admin";
                } else {
                  window.location.href = `/fans/${acctUsername}`;
                }
              } else {
                setError(
                  "Password updated, but automatic login failed. Please sign in manually.",
                );
              }
            }
          } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to reset password.");
          }
        } catch (err) {
          setError("Error resetting password. Please try again.");
        } finally {
          setLoading(false);
        }
        return;
      }
    }

    if (modalMode === "login") {
      try {
        const ok = await login(email, password);
        if (!ok) {
          setError("Invalid email or password. Try again or sign up.");
        } else {
          // Redirect based on selected login role or user's account role
          const stored = getStoredMemberData();
          const acctRole = stored.role;
          const acctUsername = stored.username || "me";
          if (loginRole === "planner" || acctRole === "event_planner") {
            window.location.href = "/planner";
          } else if (loginRole === "cruise" || acctRole === "cruise") {
            window.location.href = `/cruise/${acctUsername || "dashboard"}`;
          } else if (loginRole === "crew" || acctRole === "crew") {
            window.location.href = "/crew";
          } else if (acctRole === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = `/fans/${acctUsername}`;
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to log in.");
      }
    } else {
      if (!name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }
      if (!isValidEmail(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      if (password.length < 4) {
        setError("Password must be 4+ characters");
        setLoading(false);
        return;
      }
      if (!isAgeConfirmed) {
        setError("You must confirm you are over 18 years old to sign up");
        setLoading(false);
        return;
      }
      if (wantNotifications && !zipCode.trim()) {
        setError("Enter your zip code to receive local show alerts");
        setLoading(false);
        return;
      }

      if (website) {
        // Honeypot triggered
        console.warn("Honeypot triggered");
        setLoading(false);
        return;
      }

      // ── Dev bypass: if email matches a fake-login, skip PIN entirely and just log in ──
      if (process.env.NODE_ENV === "development") {
        const devUser = fakeLogins.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (devUser) {
          try {
            const ok = await login(email, devUser.password || "");
            if (ok) {
              const slug =
                devUser.username ||
                usernameField.trim() ||
                nameToUsername(name);
              const role = devUser.role;
              if (role === "crew") window.location.href = "/crew";
              else if (role === "event_planner")
                window.location.href = "/planner";
              else if (role === "admin") window.location.href = "/admin";
              else window.location.href = `/fans/${slug}`;
            } else {
              setError("Dev login bypass failed.");
            }
          } finally {
            setLoading(false);
          }
          return;
        }
      }

      // ── Invite flow: skip PIN verification (clicking the email link already proves ownership) ──
      if (isInviteFlow && pinCode && pinCode.length === 6) {
        try {
          const payload = {
            name,
            email,
            password,
            username: usernameField.trim() || nameToUsername(name),
            zip: zipCode,
            wantNotifications,
            wantNewsletter,
          };
          const res = await fetch("/api/auth/verify-pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pin: pinCode,
              inviteBypass: true,
              ...payload,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.error) {
              setError(data.error);
            } else {
              const loginOk = await login(email, password);
              if (loginOk) {
                window.location.href = `/fans/${payload.username || "me"}`;
              } else {
                setError(
                  "Account created, but automatic login failed. Please sign in manually.",
                );
              }
            }
          } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Account creation failed.");
          }
        } catch (err) {
          setError("Failed to create account. Please try again.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // ── Normal flow: verify existing PIN if user already has one ──
      if (pinCode && pinCode.length === 6) {
        try {
          const payload = {
            name,
            email,
            password,
            username: usernameField.trim(),
            zip: zipCode,
            wantNotifications,
            wantNewsletter,
          };
          const res = await fetch("/api/auth/verify-pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pin: pinCode,
              ...payload,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.error) {
              setError(data.error);
            } else {
              const loginOk = await login(email, password);
              if (loginOk) {
                window.location.href = `/fans/${payload.username || "me"}`;
              } else {
                setError(
                  "Account created, but automatic login failed. Please sign in manually.",
                );
              }
            }
          } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Verification failed.");
          }
        } catch (err) {
          setError("Failed to verify code. Please try again.");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/send-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setSignUpPayload({
              name,
              email,
              password,
              username: usernameField.trim(),
              zip: zipCode,
              wantNotifications,
              wantNewsletter,
            });
            setPinSent(true);
          }
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to send verification code.");
        }
      } catch (err) {
        setError("Failed to send verification code. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (
    provider: "google" | "facebook" | "apple",
  ) => {
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?role=${loginRole}`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred during social login.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close backdrop"
        className="absolute inset-0 cursor-default border-0 bg-black/80 p-0 backdrop-blur-[45px] transition-opacity"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg animate-[fadeIn_0.3s_ease] overflow-hidden rounded-lg border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
        style={{
          background: "#120a22",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
        }}
      >
        {/* Close */}
        <button
          onClick={closeModal}
          aria-label="Close login modal"
          className="absolute top-4 right-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <LoginModalBodyContent
          modalMode={modalMode}
          setModalMode={setModalMode}
          isInviteFlow={isInviteFlow}
          adminMode={adminMode}
          setAdminMode={setAdminMode}
          loginRole={loginRole}
          setLoginRole={setLoginRole}
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          adminError={adminError}
          setAdminError={setAdminError}
          adminLoading={adminLoading}
          setAdminLoading={setAdminLoading}
          pinSent={pinSent}
          setPinSent={setPinSent}
          pinCode={pinCode}
          setPinCode={setPinCode}
          signUpPayload={signUpPayload}
          error={error}
          setError={setError}
          loading={loading}
          setLoading={setLoading}
          confirmationRequired={confirmationRequired}
          website={website}
          setWebsite={setWebsite}
          name={name}
          setName={setName}
          usernameField={usernameField}
          setUsernameField={setUsernameField}
          wantNotifications={wantNotifications}
          setWantNotifications={setWantNotifications}
          wantNewsletter={wantNewsletter}
          setWantNewsletter={setWantNewsletter}
          zipCode={zipCode}
          setZipCode={setZipCode}
          forgotPinSent={forgotPinSent}
          setForgotPinSent={setForgotPinSent}
          forgotPinCode={forgotPinCode}
          setForgotPinCode={setForgotPinCode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isAgeConfirmed={isAgeConfirmed}
          setIsAgeConfirmed={setIsAgeConfirmed}
          closeModal={closeModal}
          handleVerifyPin={handleVerifyPin}
          handleSubmit={handleSubmit}
          handleOAuthLogin={handleOAuthLogin}
          login={login}
        />
      </div>
    </div>
  );
}

function LoginModalBodyContent(props: any) {
  const {
    modalMode,
    setModalMode,
    isInviteFlow,
    adminMode,
    setAdminMode,
    loginRole,
    setLoginRole,
    adminEmail,
    setAdminEmail,
    adminPassword,
    setAdminPassword,
    adminError,
    setAdminError,
    adminLoading,
    setAdminLoading,
    pinSent,
    setPinSent,
    pinCode,
    setPinCode,
    signUpPayload,
    error,
    setError,
    loading,
    setLoading,
    confirmationRequired,
    setConfirmationRequired,
    website,
    setWebsite,
    name,
    setName,
    usernameField,
    setUsernameField,
    wantNotifications,
    setWantNotifications,
    wantNewsletter,
    setWantNewsletter,
    zipCode,
    setZipCode,
    forgotPinSent,
    setForgotPinSent,
    forgotPinCode,
    setForgotPinCode,
    email,
    setEmail,
    password,
    setPassword,
    isAgeConfirmed,
    setIsAgeConfirmed,
    closeModal,
    handleVerifyPin,
    handleSubmit,
    handleOAuthLogin,
    login,
  } = props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbRatio, setThumbRatio] = useState(0.35);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(el.scrollTop / maxScroll);
      setThumbRatio(Math.max(0.2, el.clientHeight / el.scrollHeight));
    } else {
      setScrollProgress(0);
      setThumbRatio(1);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    const handleScroll = () => updateScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateScroll, modalMode, loginRole]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        className="max-h-[85vh] [scrollbar-width:none] overflow-y-auto p-6 sm:p-8 [&::-webkit-scrollbar]:hidden"
      >
        {/* Logo */}
        <div className="mb-5 text-center">
          <h2 className="er">
            <span className="text-[var(--color-accent)]">7</span>th{" "}
            <span className="not- text-[var(--color-accent)]">HEAVEN</span>
          </h2>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
            {modalMode === "forgot" ? (
              "Reset Your Password"
            ) : modalMode === "login" ? (
              "Sign In to Your Account"
            ) : isInviteFlow ? (
              "Complete Your Profile"
            ) : (
              <span>
                SIGN UP FOR FREE{" "}
                <span className="mx-1 inline-block rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)] px-2.5 py-0.5 text-base sm:text-lg">
                  FAN
                </span>{" "}
                MEMBERSHIP
              </span>
            )}
          </div>
        </div>

        {/* Prominent High-Contrast Sliding Toggle Tabs */}
        {modalMode !== "forgot" && (
          <div className="relative mx-auto mb-6 grid max-w-sm grid-cols-2 border border-white/10 bg-white/10 p-1 shadow-inner backdrop-blur-[45px] select-none">
            <div
              className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-gradient-to-r from-[#7c00ff] to-[#a855f7] shadow-[0_0_15px_rgba(124,0,255,0.6)] transition-transform duration-300 ease-out"
              style={{
                transform:
                  modalMode === "signup"
                    ? "translateX(100%)"
                    : "translateX(0%)",
              }}
            />
            <button
              type="button"
              onClick={() => setModalMode("login")}
              className={`relative z-10 cursor-pointer rounded-lg px-4 py-2.5 text-center transition-colors ${modalMode === "login" ? " " : "hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setModalMode("signup");
                if (loginRole === "crew" || loginRole === "cruise")
                  setLoginRole("fan");
              }}
              className={`relative z-10 cursor-pointer rounded-lg px-4 py-2.5 text-center transition-colors ${modalMode === "signup" ? " " : "hover:text-white"}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Role selector toggle setup */}
        {modalMode !== "forgot" && (
          <div className="my-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="block text-[10px] text-white/70">
                ACCOUNT TYPE:
              </span>
            </div>
            <div
              className={`grid gap-1 rounded-lg border border-white/10 bg-black/40 p-1 backdrop-blur-[45px] select-none ${modalMode === "signup" ? "grid-cols-2" : "grid-cols-5"}`}
            >
              {[
                { id: "fan", label: "Fan" },
                ...(modalMode === "signup"
                  ? []
                  : [{ id: "crew", label: "Crew" }]),
                { id: "planner", label: "Planner" },
                ...(modalMode === "signup"
                  ? []
                  : [
                      { id: "cruise", label: "Cruise" },
                      { id: "admin", label: "Admin" },
                    ]),
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setLoginRole(role.id as any);
                    if (role.id === "admin") {
                      setAdminMode(true);
                    } else {
                      setAdminMode(false);
                    }
                  }}
                  className={`cursor-pointer rounded-lg px-1.5 py-1.5 text-center text-[10px] transition-all ${loginRole === role.id || (role.id === "admin" && adminMode) ? "border border-purple-400/40 bg-gradient-to-r from-[#7c00ff] to-[#a855f7] shadow-[0_0_15px_rgba(124,0,255,0.6)]" : "/90 bg-[#00000029] text-white/50 hover:text-white"}`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Invite flow banner */}
        {isInviteFlow && (
          <div className="mb-6 flex items-start gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <span className="block">Invited Member Signup</span>
              Your details have been pre-filled from your invitation. Just set a
              password to activate your account.
            </div>
          </div>
        )}

        {/* PIN Verification Step */}
        {pinSent ? (
          <div className="my-4 flex flex-col gap-4">
            <div className="rounded-lg border border-white/10 bg-emerald-500/10 px-3 py-2 text-center">
              A 6-digit verification code has been sent to{" "}
              <strong>{signUpPayload?.email || email}</strong>
            </div>

            <div>
              <label
                htmlFor="login-pin-input"
                className="mb-2 block text-center"
              >
                Enter 6-Digit Verification PIN
              </label>
              <input
                id="login-pin-input"
                type="text"
                maxLength={6}
                value={pinCode}
                onChange={(e) =>
                  setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                className="placeholder: w-full border border-white/10 bg-black/60 px-4 py-3 text-center text-xl tracking-[0.5em] text-white/30 transition-colors outline-none focus:border-[var(--color-accent)] sm:text-base"
                required
              />
            </div>

            {error && (
              <p className="border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-rose-400">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleVerifyPin}
              disabled={loading || pinCode.length !== 6}
              className="mx-auto block w-full max-w-sm cursor-pointer bg-[var(--color-accent)] px-6 py-2.5 shadow-[0_0_20px_rgba(124,0,255,0.4)] transition-colors hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPinSent(false);
                setPinCode("");
                setError("");
              }}
              className="cursor-pointer text-center transition-colors hover:text-white"
            >
              ← Back to details
            </button>
          </div>
        ) : confirmationRequired ? (
          <div className="my-6 flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-300">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="r">Check Your Email</h3>
            <p className="max-w-sm">
              We sent a confirmation link to <strong>{email}</strong>. Please
              click the link in that email to confirm your account and sign in.
            </p>
            <button
              type="button"
              onClick={() => {
                setConfirmationRequired(false);
                setError("");
              }}
              className="w-full cursor-pointer border border-black/10 py-3 transition-colors hover:bg-black/5"
            >
              Got it, thanks
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2.5"
            autoComplete="off"
            data-form-type="other"
          >
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {modalMode === "signup" && (
              <SignUpExtraFields
                name={name}
                setName={setName}
                usernameField={usernameField}
                setUsernameField={setUsernameField}
                isInviteFlow={isInviteFlow}
                loginRole={loginRole}
                wantNotifications={wantNotifications}
                setWantNotifications={setWantNotifications}
                wantNewsletter={wantNewsletter}
                setWantNewsletter={setWantNewsletter}
                zipCode={zipCode}
                setZipCode={setZipCode}
              />
            )}

            {modalMode === "forgot" && (
              <div className="my-4 flex flex-col gap-4">
                {!forgotPinSent ? (
                  <div>
                    <label htmlFor="forgot-email-input" className="mb-2 block">
                      Email Address
                    </label>
                    <input
                      id="forgot-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white transition-colors outline-none placeholder:text-white/30"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-white/10 bg-emerald-500/10 px-3 py-2 text-center">
                      A verification code has been sent to{" "}
                      <strong>{email}</strong>
                    </div>
                    <div>
                      <label htmlFor="forgot-pin-input" className="mb-2 block">
                        Verification PIN
                      </label>
                      <input
                        id="forgot-pin-input"
                        type="text"
                        maxLength={6}
                        value={forgotPinCode}
                        onChange={(e) =>
                          setForgotPinCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="123456"
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-center tracking-[0.5em] text-white transition-colors outline-none placeholder:text-white/30"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="forgot-new-password-input"
                        className="mb-2 block"
                      >
                        New Password
                      </label>
                      <input
                        id="forgot-new-password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white transition-colors outline-none placeholder:text-white/30"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {modalMode !== "forgot" && (
              <div
                className={
                  modalMode === "signup"
                    ? "my-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
                    : "my-4 flex flex-col gap-4"
                }
              >
                <div>
                  <label htmlFor="login-email-input" className="mb-2 block">
                    Email{" "}
                    {isInviteFlow && (
                      <span className="flex inline-flex items-center gap-1 text-[var(--color-accent)]">
                        <Check className="h-3 w-3" /> on file
                      </span>
                    )}
                  </label>
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      loginRole === "planner"
                        ? "planner@company.com"
                        : loginRole === "crew"
                          ? "crew@7thheaven.com"
                          : loginRole === "cruise"
                            ? "cruiser@7thheaven.com"
                            : "your@email.com"
                    }
                    autoComplete="email"
                    readOnly={isInviteFlow}
                    data-lpignore="true"
                    data-form-type="other"
                    className={`w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-white transition-colors outline-none placeholder:text-white/30 sm:text-base ${isInviteFlow ? "cursor-not-allowed opacity-60" : ""}`}
                  />
                </div>
                <div>
                  <label htmlFor="login-password-input" className="mb-2 block">
                    Password
                  </label>
                  <input
                    id="login-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={
                      modalMode === "signup"
                        ? "new-password"
                        : "current-password"
                    }
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white transition-colors outline-none placeholder:text-white/30 sm:text-base"
                    />
                  {modalMode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalMode("forgot");
                        setError("");
                        setForgotPinSent(false);
                      }}
                      className="mt-2 block w-full cursor-pointer text-right text-purple-300 transition-colors hover:text-white"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
              </div>
            )}

            {modalMode === "signup" && (
              <div className="my-3 flex w-full items-center gap-3.5 text-left select-none">
                <SquishyToggle
                  id="modal-age-confirmed-toggle"
                  label="I confirm that I am 18 years of age or older"
                  checked={isAgeConfirmed}
                  onChange={(checked) => setIsAgeConfirmed(checked)}
                />
                <label
                  htmlFor="modal-age-confirmed-toggle"
                  className={`cursor-pointer ${isAgeConfirmed ? " " : " "}`}
                >
                  I confirm that I am{" "}
                  <span className="text-[#c27aff]">
                    18 years of age or older
                  </span>
                </label>
              </div>
            )}

            {error && (
              <p className="border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-rose-400">
                {error}
              </p>
            )}

            <SeventhButton
              type="submit"
              icon={false}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4.5 w-4.5 shrink-0 animate-spin rounded-full border-[3.5px] border-white border-t-transparent" />
                  <span>Processing...</span>
                </span>
              ) : modalMode === "forgot" ? (
                forgotPinSent ? (
                  "Reset Password"
                ) : (
                  "Send Verification Code"
                )
              ) : modalMode === "login" ? (
                "Sign In"
              ) : isInviteFlow ? (
                "Activate Account"
              ) : (
                "Create Account"
              )}
            </SeventhButton>

            {modalMode === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setModalMode("login");
                  setError("");
                  setForgotPinSent(false);
                }}
                className="mt-2 cursor-pointer text-center transition-colors hover:text-white"
              >
                ← Back to Sign In
              </button>
            )}
          </form>
        )}

        {/* OAuth Social Logins */}
        {!pinSent && !confirmationRequired && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="r bg-[#0f0b18] px-3">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-[#EA4335] px-3 py-2.5 transition-colors hover:bg-[#d9382a] disabled:opacity-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761H12.545z" />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin("facebook")}
                disabled={loading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-400/30 bg-[#1877F2] px-3 py-2.5 transition-colors hover:bg-[#166fe5] disabled:opacity-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin("apple")}
                disabled={loading}
                style={{ backgroundColor: "#000000" }}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none px-3 py-2.5 transition-colors hover:bg-zinc-900 disabled:opacity-50"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.246-3.83-1.207.052-2.662.805-3.532 1.818-.688.792-1.35 2.233-1.168 3.61 1.343.104 2.61-.69 3.454-1.598z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </>
        )}

        {/* Quick Demo Login Bar for Testing */}
        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] text-purple-300">
              <Zap className="h-3 w-3" /> Quick Demo One-Click Logins:
            </span>
            <button
              type="button"
              onClick={() => {
                if (!adminMode) {
                  setAdminMode(true);
                  setEmail("admin@7thheaven.com");
                  setPassword("password123");
                  setLoginRole("crew");
                } else {
                  setAdminMode(false);
                  setEmail("");
                  setPassword("");
                  setLoginRole("fan");
                }
              }}
              className="cursor-pointer text-[10px] text-white/40 hover:text-white"
            >
              {adminMode ? "Exit Admin Mode" : "Admin Quick Mode"}
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={async () => {
                setAdminMode(false);
                setLoginRole("fan");
                setEmail("admin@7thheaven.com");
                setPassword("password123");
                await login("admin@7thheaven.com", "password123");
                window.location.href = "/admin";
              }}
              className="cursor-pointer rounded-lg border border-white/10 bg-[var(--color-accent)]/20 px-1 py-2.5 text-center text-[11px] transition-colors hover:bg-[var(--color-accent)]/40 hover:text-white"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={async () => {
                setAdminMode(false);
                setLoginRole("crew");
                setEmail("crew@7thheaven.com");
                setPassword("password123");
                await login("crew@7thheaven.com", "password123");
                window.location.href = "/crew";
              }}
              className="cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-1 py-2.5 text-center text-[11px] text-emerald-200 transition-colors hover:bg-emerald-500/40 hover:text-white"
            >
              Crew
            </button>
            <button
              type="button"
              onClick={async () => {
                setAdminMode(false);
                setLoginRole("planner");
                setEmail("planner@7thheaven.com");
                setPassword("password123");
                await login("planner@7thheaven.com", "password123");
                window.location.href = "/planner";
              }}
              className="cursor-pointer rounded-lg border border-white/10 bg-[var(--color-accent)]/20 px-1 py-2.5 text-center text-[11px] transition-colors hover:bg-[var(--color-accent)]/40 hover:text-white"
            >
              Planner
            </button>
            <button
              type="button"
              onClick={async () => {
                setAdminMode(false);
                setLoginRole("cruise");
                setEmail("cruise@7thheaven.com");
                setPassword("password123");
                await login("cruise@7thheaven.com", "password123");
                window.location.href = "/cruise/cruise_guest";
              }}
              className="cursor-pointer rounded-lg border border-sky-500/30 bg-sky-500/20 px-1 py-2.5 text-center text-[11px] text-sky-200 transition-colors hover:bg-sky-500/40 hover:text-white"
            >
              Cruise
            </button>
            <button
              type="button"
              onClick={async () => {
                setAdminMode(false);
                setLoginRole("fan");
                setEmail("fan@7thheaven.com");
                setPassword("password123");
                await login("fan@7thheaven.com", "password123");
                window.location.href = "/fans/super_fan";
              }}
              className="cursor-pointer rounded-lg border border-blue-500/30 bg-blue-500/20 px-1 py-2.5 text-center text-[11px] text-blue-200 transition-colors hover:bg-blue-500/40 hover:text-white"
            >
              Fan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OAuthSocialButtons({
  onOAuthLogin,
}: {
  onOAuthLogin: (provider: string) => void;
}) {
  return (
    <>
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/20" />
        <span className="px-1 text-white/70">Or continue with</span>
        <div className="h-px flex-1 bg-white/20" />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onOAuthLogin("google")}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-[#EA4335] px-3 py-2.5 transition-colors hover:bg-[#d9382a]"
          title="Sign in with Google"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761H12.545z" />
          </svg>
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={() => onOAuthLogin("facebook")}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-400/30 bg-[#1877F2] px-3 py-2.5 transition-colors hover:bg-[#166fe5]"
          title="Sign in with Facebook"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>
        <button
          type="button"
          onClick={() => onOAuthLogin("apple")}
          style={{ backgroundColor: "#000000" }}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none px-3 py-2.5 transition-colors hover:bg-zinc-900"
          title="Sign in with Apple"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.246-3.83-1.207.052-2.662.805-3.532 1.818-.688.792-1.35 2.233-1.168 3.61 1.343.104 2.61-.69 3.454-1.598z" />
          </svg>
          <span>Apple</span>
        </button>
      </div>
    </>
  );
}

function QuickLoginDemoButtons({
  login,
  setAdminMode,
  setAdminEmail,
  setAdminPassword,
  setEmail,
  setPassword,
  setLoginRole,
}: {
  login: (e: string, p: string) => Promise<boolean>;
  setAdminMode: (v: boolean) => void;
  setAdminEmail: (v: string) => void;
  setAdminPassword: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setLoginRole: (v: "fan" | "crew" | "planner" | "cruise") => void;
}) {
  return (
    <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
      <p className="text-center text-purple-400">
        1-Click Quick Demo Login (Instant Live Access)
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        <button
          type="button"
          onClick={async () => {
            setAdminMode(true);
            setAdminEmail("admin@7thheaven.com");
            setAdminPassword("password123");
            setEmail("admin@7thheaven.com");
            setPassword("password123");
            await login("admin@7thheaven.com", "password123");
            window.location.href = "/admin";
          }}
          className="cursor-pointer rounded-lg border border-white/10 bg-[var(--color-accent)]/20 px-1 py-2.5 text-center text-[11px] transition-colors hover:bg-[var(--color-accent)]/40 hover:text-white"
        >
          Admin
        </button>
        <button
          type="button"
          onClick={async () => {
            setAdminMode(false);
            setLoginRole("crew");
            setEmail("crew@7thheaven.com");
            setPassword("password123");
            await login("crew@7thheaven.com", "password123");
            window.location.href = "/crew";
          }}
          className="cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-1 py-2.5 text-center text-[11px] text-emerald-200 transition-colors hover:bg-emerald-500/40 hover:text-white"
        >
          Crew
        </button>
        <button
          type="button"
          onClick={async () => {
            setAdminMode(false);
            setLoginRole("planner");
            setEmail("planner@7thheaven.com");
            setPassword("password123");
            await login("planner@7thheaven.com", "password123");
            window.location.href = "/planner";
          }}
          className="cursor-pointer rounded-lg border border-white/10 bg-[var(--color-accent)]/20 px-1 py-2.5 text-center text-[11px] transition-colors hover:bg-[var(--color-accent)]/40 hover:text-white"
        >
          Planner
        </button>
        <button
          type="button"
          onClick={async () => {
            setAdminMode(false);
            setLoginRole("cruise");
            setEmail("cruise@7thheaven.com");
            setPassword("password123");
            await login("cruise@7thheaven.com", "password123");
            window.location.href = "/cruise/cruise_guest";
          }}
          className="cursor-pointer rounded-lg border border-sky-500/30 bg-sky-500/20 px-1 py-2.5 text-center text-[11px] text-sky-200 transition-colors hover:bg-sky-500/40 hover:text-white"
        >
          Cruise
        </button>
        <button
          type="button"
          onClick={async () => {
            setAdminMode(false);
            setLoginRole("fan");
            setEmail("fan@7thheaven.com");
            setPassword("password123");
            await login("fan@7thheaven.com", "password123");
            window.location.href = "/fans/super_fan";
          }}
          className="cursor-pointer rounded-lg border border-blue-500/30 bg-blue-500/20 px-1 py-2.5 text-center text-[11px] text-blue-200 transition-colors hover:bg-blue-500/40 hover:text-white"
        >
          Fan
        </button>
      </div>
    </div>
  );
}

function SignUpExtraFields({
  name,
  setName,
  usernameField,
  setUsernameField,
  isInviteFlow,
  loginRole,
  wantNotifications,
  setWantNotifications,
  wantNewsletter,
  setWantNewsletter,
  zipCode,
  setZipCode,
  alertRadius = "50",
  setAlertRadius,
}: {
  name: string;
  setName: (v: string) => void;
  usernameField: string;
  setUsernameField: (v: string) => void;
  isInviteFlow: boolean;
  loginRole: string;
  wantNotifications: boolean;
  setWantNotifications: (v: any) => void;
  wantNewsletter: boolean;
  setWantNewsletter: (v: any) => void;
  zipCode: string;
  setZipCode: (v: string) => void;
  alertRadius?: string;
  setAlertRadius?: (v: string) => void;
}) {
  return (
    <div className="my-4 flex flex-col gap-4">
      {loginRole === "planner" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-full-name" className="mb-2 block">
              Full Name
            </label>
            <div className="input-glow-border w-full">
              <input
                id="signup-full-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="placeholder: w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white/30 transition-colors outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="signup-company-name" className="mb-2 block">
              Company / Venue Name
            </label>
            <div className="input-glow-border w-full">
              <input
                id="signup-company-name"
                type="text"
                placeholder="e.g. Dream Events / Venue"
                className="placeholder: w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white/30 transition-colors outline-none"
              />
            </div>
          </div>
        </div>
      ) : loginRole === "cruise" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-full-name" className="mb-2 block">
              Full Name
            </label>
            <div className="input-glow-border w-full">
              <input
                id="signup-full-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="placeholder: w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white/30 transition-colors outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="signup-cabin-no" className="mb-2 block">
              Stateroom / Cabin #{" "}
              <span className="text-white/40 normal-case">(optional)</span>
            </label>
            <div className="input-glow-border w-full">
              <input
                id="signup-cabin-no"
                type="text"
                placeholder="e.g. Stateroom 7102"
                className="placeholder: w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white/30 transition-colors outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Name + Username — side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="signup-full-name" className="mb-2 block">
                Full Name{" "}
                {isInviteFlow && (
                  <span className="flex inline-flex items-center gap-1 text-[var(--color-accent)]">
                    <Check className="h-3 w-3" /> on file
                  </span>
                )}
              </label>
              <div className="input-glow-border w-full">
                <input
                  id="signup-full-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  readOnly={isInviteFlow && !!name}
                  className={`placeholder: w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-white/30 transition-colors outline-none sm:text-base ${isInviteFlow && name ? "cursor-not-allowed opacity-60" : ""}`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="signup-username-input" className="mb-2 block">
                Username{" "}
                <span className="tracking-normal text-white/40 normal-case">
                  (optional)
                </span>
              </label>
              <div className="input-glow-border w-full">
                <input
                  id="signup-username-input"
                  type="text"
                  value={usernameField}
                  onChange={(e) =>
                    setUsernameField(
                      e.target.value
                        .replace(/[^a-zA-Z0-9_]/g, "")
                        .toLowerCase(),
                    )
                  }
                  placeholder={
                    name ? nameToUsername(name) : "e.g. rocknroller_7h"
                  }
                  maxLength={24}
                  className="placeholder: w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white/30 transition-colors outline-none sm:text-base"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Toggles — side by side */}
            <div className="my-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex w-full items-center gap-3 select-none">
                <SquishyToggle
                  id="signup-want-notifications-toggle"
                  label="Show alerts near me"
                  checked={wantNotifications}
                  onChange={(checked) => setWantNotifications(checked)}
                />
                <label
                  htmlFor="signup-want-notifications-toggle"
                  className={`cursor-pointer text-left ${wantNotifications ? " " : " "}`}
                >
                  Show alerts near me
                </label>
              </div>
              <div className="flex w-full items-center gap-3 select-none">
                <SquishyToggle
                  id="signup-want-newsletter-toggle"
                  label="News & updates"
                  checked={wantNewsletter}
                  onChange={(checked) => setWantNewsletter(checked)}
                />
                <label
                  htmlFor="signup-want-newsletter-toggle"
                  className={`cursor-pointer text-left ${wantNewsletter ? " " : " "}`}
                >
                  News & updates
                </label>
              </div>
            </div>

            {/* Zip code & radius — only if opted in */}
            {wantNotifications && (
              <div className="pt-1">
                <label htmlFor="signup-zip-code" className="mb-2 block">
                  Zip Code & Radius
                </label>
                <div className="flex items-center gap-2">
                  <div className="input-glow-border flex-1 rounded-lg">
                    <input
                      id="signup-zip-code"
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="Zip code"
                      maxLength={10}
                      className="placeholder: w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white/30 transition-colors outline-none"
                    />
                  </div>
                  <div className="relative z-30 shrink-0">
                    <GooeyDropdown
                      label={`${alertRadius || "50"} MI`}
                      accentColor="#242630"
                      glassOpacity={1.0}
                      backdropBlur={0}
                      items={[
                        {
                          label: "15 MI",
                          onClick: () => setAlertRadius?.("15"),
                        },
                        {
                          label: "25 MI",
                          onClick: () => setAlertRadius?.("25"),
                        },
                        {
                          label: "50 MI",
                          onClick: () => setAlertRadius?.("50"),
                        },
                        {
                          label: "100 MI",
                          onClick: () => setAlertRadius?.("100"),
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
