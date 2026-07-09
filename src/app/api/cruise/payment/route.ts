import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/encryption';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const {
      bookingNumber,
      email,
      phone,
      cardName,
      cardNumber,
      cardExpiry,
      cardCvv,
      cardZip,
      amount
    } = await req.json();

    if (!bookingNumber || !email || !cardName || !cardNumber || !cardExpiry || !cardCvv || !cardZip || !amount) {
      return NextResponse.json({ error: 'Missing required payment fields.' }, { status: 400 });
    }

    // Lookup existing booking by ID (booking number) and email
    const { data: booking, error: fetchError } = await supabase
      .from('cruise_signups')
      .select('id, notes, name')
      .eq('id', bookingNumber.trim())
      .eq('email', email.toLowerCase().trim())
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found. Please check your Booking Number and Email.' }, { status: 404 });
    }

    // Server-side field level encryption of card data
    const encryptedCardholder = encrypt(cardName);
    const encryptedCardNumber = encrypt(cardNumber);
    const encryptedCardExpiry = encrypt(cardExpiry);
    const encryptedCardCvv = encrypt(cardCvv);
    const encryptedCardZip = encrypt(cardZip);

    // Reconstruct updated notes by appending the secure payment details
    const existingNotes = booking.notes || '';
    const paymentLog = `
=== ADDITIONAL SECURE PAYMENT ===
Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST
Amount Processed: $${parseFloat(amount).toFixed(2)}
--- ENCRYPTED TRANSACTION DETAILS ---
enc_holder: ${encryptedCardholder}
enc_number: ${encryptedCardNumber}
enc_expiry: ${encryptedCardExpiry}
enc_cvv: ${encryptedCardCvv}
enc_zip: ${encryptedCardZip}
===================================`;

    const updatedNotes = existingNotes ? `${existingNotes}\n\n${paymentLog}` : paymentLog;

    // Update the booking notes in the database
    const { error: updateError } = await supabase
      .from('cruise_signups')
      .update({ notes: updatedNotes })
      .eq('id', booking.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to record transaction. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed payment of $${parseFloat(amount).toFixed(2)} for ${booking.name}.`,
      bookingId: booking.id
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error occurred.' }, { status: 500 });
  }
}
