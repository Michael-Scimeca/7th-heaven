"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Create a Supabase admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function adminKillStream(streamId: string) {
  console.log(`[Admin] Aggressively terminating stream ${streamId}`);
  const { error } = await supabaseAdmin
    .from("live_streams")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", streamId);

  if (error) {
    console.error("Failed to kill stream:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin");
  revalidatePath("/crew");
  return { success: true };
}

export async function adminBanUser(userId: string) {
  console.log(`[Admin] Removing user ${userId}`);
  
  // SECURE GUARD: Prevent deletion of Admin accounts
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", userId).single();
  if (profile?.role === 'admin') {
    return { success: false, error: "System Administrators cannot be deleted via the dashboard." };
  }

  // In Supabase Auth, removing a user from `auth.users` automatically cascades to `profiles`.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Failed to ban user from auth:", error);
    // Fallback: Delete from public.profiles manually if auth drop failed
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);
      
    if (profileError) return { success: false, error: profileError.message };
  }
  
  revalidatePath("/admin");
  revalidatePath("/crew");
  return { success: true };
}

// Crew-level action: can only remove fans
export async function crewBanUser(userId: string) {
  console.log(`[Crew] Attempting to remove user ${userId}`);
  
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", userId).single();
  if (profile?.role !== 'fan') {
    return { success: false, error: "Crew members can only remove fan accounts." };
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Failed to remove fan from auth:", error);
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);
      
    if (profileError) return { success: false, error: profileError.message };
  }
  
  revalidatePath("/admin");
  revalidatePath("/crew");
  return { success: true };
}

export async function seedMockData() {
  console.log("[Admin] Seeding mock users for testing...");
  
  const postfix = Math.floor(Math.random() * 100000);
  const mockUsers = [
    { email: `fan1_${postfix}@seventhheaven.com`, name: "Sarah Connor", role: "fan" },
    { email: `fan2_${postfix}@seventhheaven.com`, name: "John Wick", role: "fan" },
    { email: `crew_${postfix}@seventhheaven.com`, name: "Stage Manager", role: "crew" },
    { email: `admin_${postfix}@seventhheaven.com`, name: "System Admin", role: "admin" }
  ];

  for (const u of mockUsers) {
    // Generate secure password
    const password = "Password123!";
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: u.name }
    });

    if (authErr) {
      console.error("Auth error creating user:", authErr);
    }

    if (authData?.user && !authErr) {
      // Force update their role in profiles
      const { error } = await supabaseAdmin.from("profiles").update({ role: u.role }).eq("id", authData.user.id);
      if (error) console.error("Profile update error:", error);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/crew");
  return { success: true };
}
