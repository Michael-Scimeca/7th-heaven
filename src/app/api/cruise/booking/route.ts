import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET booking info by email
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cruise_signups')
      .select('id, name, email, phone, guest_count, notes, anonymous, created_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let guests = [];
    if (data.notes && data.notes.includes('Guest Details: [')) {
      try {
        const jsonStr = data.notes.split('Guest Details: ')[1];
        guests = JSON.parse(jsonStr);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, booking: { ...data, guests } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PUT update booking info
export async function PUT(req: NextRequest) {
  try {
    const { email, guest_count, phone, anonymous, guests } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Fetch existing notes to preserve them
    const { data: existing } = await supabase.from('cruise_signups').select('notes').eq('email', email.toLowerCase().trim()).single();
    let originalNotes = existing?.notes || '';
    if (originalNotes.includes('Guest Details: [')) {
      originalNotes = originalNotes.split('Guest Details: [')[0].trim();
    }
    
    const guestDetails = guests && guests.length > 0 ? JSON.stringify(guests) : null;
    const newNotes = originalNotes ? `${originalNotes}${guestDetails ? `\n\nGuest Details: ${guestDetails}` : ''}` : (guestDetails ? `Guest Details: ${guestDetails}` : null);

    const { data, error } = await supabase
      .from('cruise_signups')
      .update({
        guest_count: parseInt(guest_count) || 1,
        phone: phone || null,
        anonymous: !!anonymous,
        notes: newNotes
      })
      .eq('email', email.toLowerCase().trim())
      .select('id, name, email, phone, guest_count, notes, anonymous, created_at')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
    }

    let updatedGuests = [];
    if (data.notes && data.notes.includes('Guest Details: [')) {
      try {
        const jsonStr = data.notes.split('Guest Details: ')[1];
        updatedGuests = JSON.parse(jsonStr);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, booking: { ...data, guests: updatedGuests } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
