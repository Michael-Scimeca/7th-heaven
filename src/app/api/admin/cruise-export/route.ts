import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/api-utils';
import { decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Extracts and decrypts key-value fields inside notes column
 */
function parseEncryptedField(notes: string, key: string): string {
  if (!notes) return '';
  const lines = notes.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith(`${key}:`)) {
      const parts = line.split(`${key}:`);
      const ciphertext = parts[1] ? parts[1].trim() : '';
      return decrypt(ciphertext);
    }
  }
  return '';
}

/**
 * Extracts and decrypts additional transaction logs
 */
function parseAdditionalPayments(notes: string): string {
  if (!notes || !notes.includes('=== ADDITIONAL SECURE PAYMENT ===')) return '';
  const parts = notes.split('=== ADDITIONAL SECURE PAYMENT ===');
  const payments = [];
  
  for (let i = 1; i < parts.length; i++) {
    const blockParts = parts[i] ? parts[i].split('===================================') : [];
    const block = blockParts[0] || '';
    const lines = block.split('\n');
    let amount = '';
    let holder = '';
    let number = '';
    let expiry = '';
    let cvv = '';
    let zip = '';
    
    for (const line of lines) {
      if (line.includes('Amount Processed:')) amount = line.split('Amount Processed:')[1]?.trim() || '';
      if (line.includes('enc_holder:')) holder = decrypt(line.split('enc_holder:')[1]?.trim() || '');
      if (line.includes('enc_number:')) number = decrypt(line.split('enc_number:')[1]?.trim() || '');
      if (line.includes('enc_expiry:')) expiry = decrypt(line.split('enc_expiry:')[1]?.trim() || '');
      if (line.includes('enc_cvv:')) cvv = decrypt(line.split('enc_cvv:')[1]?.trim() || '');
      if (line.includes('enc_zip:')) zip = decrypt(line.split('enc_zip:')[1]?.trim() || '');
    }
    payments.push(`[Amt: ${amount} | Holder: ${holder} | Card: ${number} | Exp: ${expiry} | CVV: ${cvv} | Zip: ${zip}]`);
  }
  return payments.join('; ');
}

// Utility to safely wrap CSV fields in double quotes and escape existing quotes
const escapeCsv = (str: any) => `"${(str ? String(str) : '').replace(/"/g, '""')}"`;

const CSV_HEADERS = [
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
  'Anonymous',
  'Card 1 Holder',
  'Card 1 Number',
  'Card 1 Expiry',
  'Card 1 CVV',
  'Card 1 Zip',
  'Card 1 Amount',
  'Card 2 Holder',
  'Card 2 Number',
  'Card 2 Expiry',
  'Card 2 CVV',
  'Card 2 Zip',
  'Card 2 Amount',
  'Additional Payments (Decrypted)'
];

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { data, error } = await supabase
      .from('cruise_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Build CSV Headers (including decrypted CC payment info columns)
    const headers = CSV_HEADERS;

    let csvContent = headers.join(',') + '\n';

    // Flatten data
    for (const signup of data) {
      const date = new Date(signup.created_at).toLocaleDateString();
      const primaryName = escapeCsv(signup.name);
      const primaryEmail = signup.email;
      const totalPartySize = signup.guest_count;
      const isAnon = signup.anonymous ? 'Yes' : 'No';

      // Parse decrypted CC Card 1 Details
      const card1Holder = escapeCsv(parseEncryptedField(signup.notes, 'card1_name'));
      const card1Number = escapeCsv(parseEncryptedField(signup.notes, 'card1_number'));
      const card1Expiry = escapeCsv(parseEncryptedField(signup.notes, 'card1_expiry'));
      const card1Cvv = escapeCsv(parseEncryptedField(signup.notes, 'card1_cvv'));
      const card1Zip = escapeCsv(parseEncryptedField(signup.notes, 'card1_zip'));
      const card1Amount = escapeCsv(parseEncryptedField(signup.notes, 'card1_amount'));

      // Parse decrypted CC Card 2 Details
      const card2Holder = escapeCsv(parseEncryptedField(signup.notes, 'card2_name'));
      const card2Number = escapeCsv(parseEncryptedField(signup.notes, 'card2_number'));
      const card2Expiry = escapeCsv(parseEncryptedField(signup.notes, 'card2_expiry'));
      const card2Cvv = escapeCsv(parseEncryptedField(signup.notes, 'card2_cvv'));
      const card2Zip = escapeCsv(parseEncryptedField(signup.notes, 'card2_zip'));
      const card2Amount = escapeCsv(parseEncryptedField(signup.notes, 'card2_amount'));

      // Parse decrypted Additional Payments
      const additionalPayments = escapeCsv(parseAdditionalPayments(signup.notes));

      // 1. Add Primary Booker Row (includes decrypted payment fields)
      csvContent += [
        date,
        primaryName,
        primaryEmail,
        primaryName, // Guest/Member Name
        primaryEmail,
        escapeCsv(signup.phone),
        'Adult', // Type
        '', // Age
        'Yes', // Is Primary
        totalPartySize,
        isAnon,
        card1Holder,
        card1Number,
        card1Expiry,
        card1Cvv,
        card1Zip,
        card1Amount,
        card2Holder,
        card2Number,
        card2Expiry,
        card2Cvv,
        card2Zip,
        card2Amount,
        additionalPayments
      ].join(',') + '\n';

      // 2. Parse and Add Additional Guests
      if (signup.notes && signup.notes.includes('Guest Details: [')) {
        try {
          const jsonStr = signup.notes.split('Guest Details: ')[1];
          const guests = JSON.parse(jsonStr);

          for (const guest of guests) {
            const guestName = escapeCsv(guest.name);
            const guestEmail = guest.email || '';
            const guestPhone = escapeCsv(guest.phone);
            const guestType = guest.type === 'child' ? 'Child' : 'Adult';
            const guestAge = guest.age || '';

            // Additional guest rows do not repeat billing details for clarity
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
              isAnon,
              '', '', '', '', '', '', '', '', '', '', '', '', '' // Empty CC columns
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
