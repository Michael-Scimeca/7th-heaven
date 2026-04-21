#!/bin/bash
# 7th Heaven — Live Feed Simulator
# Sends a realistic mix of fan messages (guests + logged-in users)
# into the live_feed table for room: demo-feed

SUPABASE_URL="https://acfzdcyqdskrmfuuoesb.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnpkY3lxZHNrcm1mdXVvZXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA0MjU2OCwiZXhwIjoyMDkxNjE4NTY4fQ.fxcoKdzPMaPOEVLxkH99uMukzzIzMkw1Ue1ukqpcmfY"
ROOM="demo-feed"

# -------- helpers --------

# Guest fan (temp invite / no account) — uses a fake UUID prefixed with "guest-"
guest_msg() {
  GUEST_ID="00000000-0000-0000-0000-$(echo "$1" | md5 | cut -c1-12)"
  curl -s -X POST "$SUPABASE_URL/rest/v1/live_feed" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"user_id\": \"$GUEST_ID\", \"guest_name\": \"$1\", \"content\": \"$2\", \"post_type\": \"fan_moment\", \"room_id\": \"$ROOM\"}"
  echo "  [guest]  $1: $2"
}

# Logged-in fan (has a real user_id UUID)
user_msg() {
  curl -s -X POST "$SUPABASE_URL/rest/v1/live_feed" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"user_id\": \"$1\", \"content\": \"$2\", \"post_type\": \"fan_moment\", \"room_id\": \"$ROOM\"}"
  echo "  [user]   $(echo $1 | cut -c1-8)...: $2"
}

# Crew member post
crew_msg() {
  curl -s -X POST "$SUPABASE_URL/rest/v1/live_feed" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"user_id\": \"00000000-0000-0000-0000-0000000crew1\", \"guest_name\": \"crew_mike\", \"content\": \"$1\", \"post_type\": \"update\", \"room_id\": \"$ROOM\"}"
  echo "  [crew]   crew_mike: $1"
}

rand_sleep() {
  sleep $(awk "BEGIN {printf \"%.1f\", $1 + rand() * $2}" /dev/null 2>/dev/null || echo $1)
}

# -------- simulation --------

echo ""
echo "🎸 7TH HEAVEN — Live Feed Simulation"
echo "   Room: $ROOM"
echo "   Sending 25 messages with mixed user types..."
echo ""

# Kick off with a crew announcement
crew_msg "🔴 We are LIVE — welcome to the show Chicago!! 🎸🔥"
sleep 1

# Wave 1 — guests flood in
guest_msg "JessM_84"      "OMG THIS IS HAPPENING 🔥🔥🔥"
sleep 0.4
user_msg  "a1b2c3d4-0000-0000-0000-111111111111" "been waiting for this night for 2 years!!"
sleep 0.6
guest_msg "tay_rocks"     "front row energy is INSANE right now"
sleep 0.3
guest_msg "ChicagoLou"    "HELLO FROM SECTION C 🤘🤘🤘"
sleep 0.5
user_msg  "b2c3d4e5-0000-0000-0000-222222222222" "the sound system hits so hard tonight"
sleep 0.4

# Wave 2 — mid-show excitement
guest_msg "rockerdan92"   "play My Chemical Romance next plz 😭"
sleep 0.7
user_msg  "c3d4e5f6-0000-0000-0000-333333333333" "that last guitar solo tho... WOW"
sleep 0.4
guest_msg "MelM"          "streaming this to my grandma rn she loves 7th Heaven lmao"
sleep 0.5
guest_msg "superfan99"    "this is better than the LA show and that was PERFECT"
sleep 0.3
user_msg  "d4e5f6a7-0000-0000-0000-444444444444" "❤️❤️❤️❤️❤️"
sleep 0.6

# Crew update
crew_msg "Next up: new single from the album 👀👀 stay tuned"
sleep 1

# Wave 3 — reaction to crew post
guest_msg "drummer_kid"   "WAIT IS THIS THE NEW SONG?? 😱"
sleep 0.3
user_msg  "e5f6a7b8-0000-0000-0000-555555555555" "i heard this in soundcheck it SLAPS"
sleep 0.4
guest_msg "Fan-A9F2"      "chatting from the parking lot I snuck my phone in 💀"
sleep 0.5
guest_msg "mikefan_tx"    "drove 4 hours for this. worth every mile."
sleep 0.3
user_msg  "f6a7b8c9-0000-0000-0000-666666666666" "the bass drop on this track is going to destroy this venue"
sleep 0.6

# Wave 4 — late arrivals / encore hype
guest_msg "Fan-B44E"      "just got here omg what did I miss"
sleep 0.4
user_msg  "a7b8c9d0-0000-0000-0000-777777777777" "only the ENTIRE first set lol hurry"
sleep 0.3
guest_msg "XandriaV"      "ENCORE ENCORE ENCORE 👏👏👏"
sleep 0.5
guest_msg "liveshow_junky" "this setlist is top 3 I've ever seen them play"
sleep 0.4
user_msg  "b8c9d0e1-0000-0000-0000-888888888888" "they look like they're having the time of their lives up there"
sleep 0.6

# Final crew sign-off
crew_msg "Thank you Chicago — you are the best crowd we've ever played for 🖤🖤"
sleep 0.5
guest_msg "JessM_84"      "WE LOVE YOU!! 😭😭😭🔥"
sleep 0.3
guest_msg "ChicagoLou"    "already buying tickets for the next one"

echo ""
echo "✅ Done — 25 messages sent to room: $ROOM"
echo ""
