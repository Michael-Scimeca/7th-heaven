const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simulate() {
  const fans = ['Fan-A9F2', 'Fan-B44E', 'Fan-C911', 'Fan-D330', 'Fan-E887'];
  
  const messages = [
    { guest_name: fans[0], content: "This set is absolute fire so far!!", post_type: "fan_moment" },
    { guest_name: fans[1], content: "Can't believe I got front row for this!!", post_type: "fan_moment" },
    { guest_name: fans[2], content: "Play Livin on a prayer next plz!!", post_type: "fan_moment" },
    { guest_name: fans[3], content: "Sound quality is actually crazy good tonight.", post_type: "fan_moment" },
    { guest_name: fans[4], content: "Hello from the back of the venue! 🤘🤘", post_type: "fan_moment" }
  ];

  console.log("Injecting 5 simulated messages into live_feed...");
  
  // Insert with delays so they sort properly by created_at sequentially
  for (let i = 0; i < messages.length; i++) {
    const { error } = await supabase.from('live_feed').insert(messages[i]);
    if (error) {
      console.error("Error inserting message:", error);
    } else {
      console.log(`Inserted message ${i + 1}/5`);
    }
    // sleep for 200ms
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log("Done!");
  process.exit(0);
}

simulate();
