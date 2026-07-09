"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { RoomServiceClient } from 'livekit-server-sdk';

// Create a Supabase admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const roomService = new RoomServiceClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function adminKillStream(streamId: string) {
  console.log(`[Admin] Aggressively terminating stream ${streamId}`);
  
  // 1. Get the stream details to find the room name
  const { data: stream } = await supabaseAdmin.from("live_streams").select("user_id, stream_url").eq("id", streamId).single();
  
  // 2. Update Supabase status
  const { error } = await supabaseAdmin
    .from("live_streams")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", streamId);

  if (error) {
    console.error("Failed to kill stream in DB:", error);
    return { success: false, error: error.message };
  }

  // 3. Force-delete the LiveKit room to kick the publisher
  if (stream) {
    const roomName = stream.stream_url || `live_${stream.user_id}`;
    try {
      await roomService.deleteRoom(roomName);
      console.log(`[Admin] LiveKit room ${roomName} deleted.`);
    } catch (lkErr) {
      console.error("Failed to delete LiveKit room:", lkErr);
      // Not a fatal error, maybe the room was already empty
    }
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
    // Generate secure random password
    const password = crypto.randomUUID().slice(0, 12) + "!A1";
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

export async function adminCreateCrewMember({ name, email, password: providedPassword, phone, username }: { name: string; email: string; password?: string; phone?: string; username?: string }) {
  console.log(`[Admin] Creating crew member ${email}`);
  // Use provided password or generate a secure temporary one
  const password = providedPassword || (Math.random().toString(36).slice(-10) + "!A1");
  // Create auth user
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
      username: username || '',
      needs_password_reset: true,   // triggers Set-Your-Password modal on first login
    },
  });
  if (authErr) {
    console.error('Auth error creating crew member:', authErr);
    return { success: false, error: authErr.message };
  }
  // Assign crew role and phone in profiles table
  if (authData?.user) {
    const updateData: any = { role: 'crew' };
    if (phone) updateData.phone = phone;
    if (username) updateData.username = username;
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', authData.user.id);
    if (error) {
      console.error('Profile update error for crew member:', error);
      return { success: false, error: error.message };
    }
  }

  // ── Send emails ──
  try {
    const { welcomeCrew, newAccountAdminAlert } = await import('@/lib/email-templates');
    const { sendEmail } = await import('@/lib/email');
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_FROM_EMAIL || '';

    // 1. Welcome email to the new crew member
    await sendEmail({
      to: email,
      subject: '🛡️ Welcome to the 7th Heaven Crew',
      html: welcomeCrew({ name, email, username: username || undefined, tempPassword: password }),
    });
    console.log(`[Admin] Welcome email sent to crew member ${email}`);

    // 2. Alert email to site admin
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `🔔 New Crew Account: ${name}`,
        html: newAccountAdminAlert({
          accountName: name,
          accountEmail: email,
          accountUsername: username || undefined,
          accountRole: 'crew',
          createdBy: 'Admin Dashboard',
        }),
      });
      console.log(`[Admin] Account alert sent to ${adminEmail}`);
    }
  } catch (emailErr) {
    // Don't fail the account creation if email fails
    console.error('[Admin] Email send failed (non-fatal):', emailErr);
  }

  revalidatePath('/admin');
  revalidatePath('/crew');
  return { success: true, password };
}

export async function adminCreateAdmin({ name, email }: { name: string; email: string }) {
  console.log(`[Admin] Creating admin account for ${email}`);
  // Generate a secure temporary password
  const password = Math.random().toString(36).slice(-10) + '!A7';

  // Create Supabase auth user
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
      needs_password_reset: true,
    },
  });
  if (authErr) {
    console.error('[Admin] Auth error creating admin:', authErr);
    return { success: false, error: authErr.message };
  }

  // Set role = admin in profiles table
  if (authData?.user) {
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);
    if (profileErr) {
      console.error('[Admin] Profile role update error:', profileErr);
      return { success: false, error: profileErr.message };
    }
  }

  // Send welcome email
  try {
    const { sendEmail } = await import('@/lib/email');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await sendEmail({
      to: email,
      subject: '🔐 Your 7th Heaven Admin Account',
      html: `
        <div style="font-family:-apple-system,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
          <div style="padding:36px 32px 24px;background:linear-gradient(135deg,#1a1200,#0a0a0f);text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:4px;color:#f59e0b;font-weight:800;">7th Heaven Live</p>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;">Admin Account Created 🔐</h1>
            <p style="margin:0;color:rgba(255,255,255,0.4);font-size:14px;">You now have full admin access to the 7th Heaven platform.</p>
          </div>
          <div style="padding:32px;">
            <p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0 0 24px;">Hey <strong style="color:#fff;">${name}</strong>, here are your login credentials:</p>
            <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <div style="margin-bottom:12px;"><span style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);">Email</span><br/><strong style="color:#fff;font-size:15px;">${email}</strong></div>
              <div><span style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);">Temporary Password</span><br/><code style="color:#f59e0b;font-size:20px;font-weight:900;letter-spacing:2px;">${password}</code></div>
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0 0 24px;">Please change your password after your first login. Keep these credentials secure — do not share them.</p>
            <a href="${siteUrl}/admin" style="display:inline-block;background:#f59e0b;color:#000;font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:10px;">Access Admin Dashboard →</a>
          </div>
          <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">© 7th Heaven Live · Confidential admin credentials</p>
          </div>
        </div>`,
    });
    console.log(`[Admin] Welcome email sent to new admin ${email}`);
  } catch (emailErr) {
    console.error('[Admin] Admin welcome email failed (non-fatal):', emailErr);
  }

  revalidatePath('/admin');
  return { success: true, password };
}

export async function adminResetPassword(userId: string, email: string) {
  console.log(`[Admin] Resetting password for ${email}`);
  const newPassword = Math.random().toString(36).slice(-10) + "!A1";
  
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) {
    console.error('Reset error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, password: newPassword };
}
