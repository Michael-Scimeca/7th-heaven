import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if(!url || !key) {
    console.error("Missing config");
    process.exit(1);
}

const supabase = createClient(url, key);

const channel = supabase.channel('live_chat_demo', {
  config: { broadcast: { ack: true } }
});

channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    console.log("Subscribed successfully!");
    const resp = await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: { id: "test-broadcast", text: "Hello from CLI script", account: {}, timestamp: Date.now() }
    });
    console.log("Broadcast response:", resp);
    process.exit(0);
  } else {
    console.error("Status:", status);
  }
});
