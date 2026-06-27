const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

// Initialize Supabase with Service Role Key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = "reclipse276@aol.com";
  const password = "Password123!";
  const name = "Rachel Eclipse";
  const username = "reclipse276";
  const zip = "60062";

  console.log(`Creating user ${email} with admin client...`);

  // Delete existing user if exists
  const { data: usersList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
  } else {
    const existingUser = usersList.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log(`User ${email} already exists. Deleting first to reset...`);
      await supabase.auth.admin.deleteUser(existingUser.id);
    }
  }

  // Create user with email_confirm: true
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
      username,
      role: 'fan',
      phone: ''
    }
  });

  if (createError) {
    console.error("Failed to create user:", createError.message);
    process.exit(1);
  }

  const userId = userData.user.id;
  console.log(`User created successfully with ID: ${userId}`);

  // Fetch coordinates for the zip code
  let lat = 42.1275; // Default Northbrook IL coordinates
  let lng = -87.8289;
  try {
    const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const place = geoData.places?.[0];
      if (place) {
        lat = parseFloat(place.latitude);
        lng = parseFloat(place.longitude);
        console.log(`Geocoded zip ${zip} to lat: ${lat}, lng: ${lng}`);
      }
    }
  } catch (err) {
    console.warn("Geocoding failed, using default coords:", err.message);
  }

  // Update profile record in the database
  console.log("Updating profile table values...");
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: 'fan',
      zip,
      notification_radius: 50,
      notifications_enabled: true,
      latitude: lat,
      longitude: lng,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Failed to update profile record:", profileError.message);
  } else {
    console.log("Profile record updated successfully!");
  }

  // Also add to local accounts flat-file to trigger any newsletter or other local integrations
  // body: { email, name, source: 'signup' }
  try {
    console.log("Subscribing user to local newsletter...");
    const newsletterRes = await fetch('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, source: 'signup' }),
    });
    const newsletterData = await newsletterRes.json();
    console.log("Newsletter status:", newsletterRes.status, newsletterData);
  } catch (err) {
    console.warn("Local newsletter request failed (is local server running?):", err.message);
  }

  console.log("\nAccount Setup Complete!");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main().catch(console.error);
