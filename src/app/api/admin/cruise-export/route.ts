import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('cruise_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Build CSV Headers
    const headers = [
      'Signup Date',
      'Primary Booker Name',
      'Primary Booker Email',
      'Guest/Member Name',
      'Email',
      'Phone',
      'Type',
      'Age',
      'Is Primary',
      'Total Party Size',
      'Anonymous'
    ];

    let csvContent = headers.join(',') + '\n';

    // Flatten data
    for (const signup of data) {
      const date = new Date(signup.created_at).toLocaleDateString();
      const primaryName = `"${(signup.name || '').replace(/"/g, '""')}"`;
      const primaryEmail = signup.email;
      const totalPartySize = signup.guest_count;
      const isAnon = signup.anonymous ? 'Yes' : 'No';

      // 1. Add Primary Booker Row
      csvContent += [
        date,
        primaryName,
        primaryEmail,
        primaryName, // Guest/Member Name
        primaryEmail,
        `"${signup.phone || ''}"`,
        'Adult', // Type
        '', // Age
        'Yes', // Is Primary
        totalPartySize,
        isAnon
      ].join(',') + '\n';

      // 2. Parse and Add Additional Guests
      if (signup.notes && signup.notes.includes('Guest Details: [')) {
        try {
          const jsonStr = signup.notes.split('Guest Details: ')[1];
          const guests = JSON.parse(jsonStr);

          for (const guest of guests) {
            const guestName = `"${(guest.name || '').replace(/"/g, '""')}"`;
            const guestEmail = guest.email || '';
            const guestPhone = `"${guest.phone || ''}"`;
            const guestType = guest.type === 'child' ? 'Child' : 'Adult';
            const guestAge = guest.age || '';

            csvContent += [
              date,
              primaryName,
              primaryEmail,
              guestName,
              guestEmail,
              guestPhone,
              guestType,
              guestAge,
              'No', // Is Primary
              totalPartySize,
              isAnon
            ].join(',') + '\n';
          }
        } catch (e) {
          console.error("Error parsing guest details for", signup.email);
        }
      }
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="7th-heaven-cruise-roster.csv"'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
