import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { data, error } = await supabase
      .from('cruise_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let total = 0;
    let adults = 0;
    let children = 0;

    const recentSignups: { id: string; name: string; email: string; phone: string; date: string; partySize: number; checkedOff: boolean; depositPaid: boolean; fullPaid: boolean; notes: string }[] = [];

    for (const signup of data) {
      total += (signup.guest_count || 1);
      
      // Primary booker is assumed to be an adult
      adults += 1;

      recentSignups.push({
        id: signup.id,
        name: signup.name || 'Unknown',
        email: signup.email || '',
        phone: signup.phone || '',
        date: new Date(signup.created_at).toLocaleDateString(),
        partySize: signup.guest_count || 1,
        checkedOff: signup.checked_off || false,
        depositPaid: signup.deposit_paid || false,
        fullPaid: signup.full_paid || false,
        notes: signup.notes || '',
      });

      if (signup.notes && signup.notes.includes('Guest Details: [')) {
        try {
          const jsonStr = signup.notes.split('Guest Details: ')[1];
          const guests = JSON.parse(jsonStr);

          for (const guest of guests) {
            if (guest.type === 'child') {
              children += 1;
            } else {
              adults += 1;
            }
          }
        } catch (e) {
          // ignore parsing errors for individual rows
        }
      }
    }

    return NextResponse.json({
      total,
      adults,
      children,
      signups: data.length,
      recentSignups,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id, checked_off, deposit_paid, full_paid } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing signup id' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (checked_off !== undefined) updatePayload.checked_off = checked_off;
    if (deposit_paid !== undefined) updatePayload.deposit_paid = deposit_paid;
    if (full_paid !== undefined) updatePayload.full_paid = full_paid;

    const { error } = await supabase
      .from('cruise_signups')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Verify caller is an authenticated admin
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing signup id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('cruise_signups')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
