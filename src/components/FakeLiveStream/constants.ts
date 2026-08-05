/* ═══════════════════════════════════════════════════════
   FakeLiveStream — shared constants, data, and types
   Extracted from FakeLiveStream.tsx to reduce file size.
═══════════════════════════════════════════════════════ */

export interface FakeAccount {
  id: string;
  displayName: string;
  role: 'crew' | 'fan';
  color: string;
  badge?: string;
  avatar: string;
  tier?: string;
}

export interface CrewConfig {
  id: string;
  name: string;
  displayName: string;
  badge: string;
  avatar: string;
  color: string;
  gradient: string;
  instrument: string;
  cameraLabel: string;
  bioAnchor: string;
}

export interface ChatMsg {
  id: string;
  account: FakeAccount | null; // null = system
  text: string;
  timestamp: number;
  isSystem?: boolean;
  isUser?: boolean;
}

export interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  createdAt: number;
}

export interface SetlistSong {
  id: string;
  title: string;
  likes: number;
  isPlaying: boolean;
}

export const CREW_ACCOUNTS: FakeAccount[] = [
  { id: 'crew-mike', displayName: 'Mike S', role: 'crew', color: '#a855f7', badge: '🎸', avatar: 'MS' },
  { id: 'crew-sammy', displayName: 'Sammy D', role: 'crew', color: '#ec4899', badge: '🥁', avatar: 'SD' },
  { id: 'crew-ryan', displayName: 'Ryan K', role: 'crew', color: '#06b6d4', badge: '🎹', avatar: 'RK' },
  { id: 'crew-tony', displayName: 'Tony M', role: 'crew', color: '#f97316', badge: '🎤', avatar: 'TM' },
];

export const FAN_ACCOUNTS: FakeAccount[] = [
  { id: 'fan-jess', displayName: 'Jess_M', role: 'fan', color: '#a78bfa', avatar: 'JM', tier: '💎 Platinum' },
  { id: 'fan-rockerdan', displayName: 'rockerdan92', role: 'fan', color: '#f472b6', avatar: 'RD', tier: '🥇 Gold' },
  { id: 'fan-mikefan', displayName: 'mike_fan_01', role: 'fan', color: '#34d399', avatar: 'MF', tier: '🥈 Silver' },
  { id: 'fan-chicagolou', displayName: 'ChicagoLou', role: 'fan', color: '#c084fc', avatar: 'CL', tier: '🥇 Gold' },
  { id: 'fan-tay', displayName: 'tay_rocks', role: 'fan', color: '#60a5fa', avatar: 'TR', tier: '🥈 Silver' },
  { id: 'fan-mel', displayName: 'MelM', role: 'fan', color: '#fb923c', avatar: 'MM', tier: '💎 Platinum' },
  { id: 'fan-super', displayName: 'superfan99', role: 'fan', color: '#c084fc', avatar: 'S9', tier: '🥇 Gold' },
  { id: 'fan-drummer', displayName: 'drummer_kid', role: 'fan', color: '#4ade80', avatar: 'DK', tier: '🥉 Bronze' },
  { id: 'fan-stacey', displayName: 'StaceyB', role: 'fan', color: '#f43f5e', avatar: 'SB', tier: '🥈 Silver' },
  { id: 'fan-ashley', displayName: 'ashley_xo', role: 'fan', color: '#e879f9', avatar: 'AX', tier: '🥇 Gold' },
  { id: 'fan-jake', displayName: 'Jake7H', role: 'fan', color: '#38bdf8', avatar: 'J7', tier: '💎 Platinum' },
  { id: 'fan-midwest', displayName: 'MidwestMama', role: 'fan', color: '#facc15', avatar: 'MW', tier: '🥈 Silver' },
  { id: 'fan-nate', displayName: 'nate_bass', role: 'fan', color: '#22d3ee', avatar: 'NB', tier: '🥉 Bronze' },
  { id: 'fan-lauren', displayName: 'LaurenLive', role: 'fan', color: '#a3e635', avatar: 'LL', tier: '🥇 Gold' },
  { id: 'fan-tommy', displayName: 'TommyGuitar', role: 'fan', color: '#818cf8', avatar: 'TG', tier: '🥈 Silver' },
];

export const FAN_MESSAGES = [
  'omg this is insane 🔥🔥', 'LETS GOOOO 7TH HEAVEN', 'best show of the year no cap',
  '🤘🤘🤘 sending love from the back row', 'the drums tonight tho!! WOW',
  'been waiting 3 years for this moment ❤️', 'streaming this to my whole family rn lmao',
  'those guitar riffs hit different live', 'THIS IS MY FAVORITE SONG', 'chills. actual chills.',
  'who else is crying rn 😭', 'TURN IT UP 🔊🔊🔊', 'the energy in here is UNREAL',
  'they never disappoint 🙌', 'Chicago represent!! 🏙️', 'first time seeing them live… speechless',
  'MOM LOOK IM ON THE LIVE STREAM', 'this band is everything', 'PLAY SING NEXT PLEASE 🎵',
  'i cant stop screaming', 'watching from my car in the parking lot lol 😂',
  '7th heaven forever ❤️‍🔥', 'that bass line tho 🎸', 'bruh this setlist is FIRE',
  'i drove 6 hours for this', 'whos got the setlist??', 'PIT IS INSANE RN',
  'they sound even better live wtf', 'ENCORE ENCORE ENCORE', 'losing my voice already',
  'this is what live music is about', 'my 15th 7H show and they keep getting better',
  'the light show tonight 😍', 'GET YOUR PHONES UP 📱', 'im literally floating rn',
  'WAIT IS THAT A NEW SONG??', 'someone catch me im gonna faint', 'LEGEND STATUS 🏆',
  'making memories for life', 'the whole crowd is jumping 🦘', 'VIBE CHECK: 100/100',
  'goosebumps on goosebumps', 'they really are the best band in the midwest',
  'holy harmonies batman', 'whoever is streaming THANK YOU 🙏',
  'FRONT ROW BABY', 'they LITERALLY just winked at me', 'im never washing this hand 😂',
  'this night is everything I needed 🫶', 'THE CROWD IS GOING INSANE',
  'my ears are still ringing but it was SO worth it',
];

export const CREW_MESSAGES = [
  '🔴 Soundcheck done — we are LOCKED IN tonight 🔥',
  'LFG the crowd is absolutely INSANE right now',
  'thank you all for being here with us tonight ❤️',
  'crowd cam looking beautiful out there 📸',
  'this next one goes out to the OG fans 🫶',
  'we got a STACKED setlist for you tonight 🎶',
  '🚨 new song alert 👀 dropping this one LIVE for the first time ever',
  'shoutout to the crew holding it down backstage — you know who you are',
  'love seeing all your signs in the crowd!!',
  'we see you front row!! 🤘🤘',
  'yo the energy is OFF THE CHARTS tonight',
  'that one was FOR YOU, Chicago 🏙️',
  'THIS is why we do this 🙌',
  "quick water break — DON'T GO ANYWHERE",
];

export const SYSTEM_EVENTS = [
  { text: '🎉 Jess_M just joined the stream!', delay: 0 },
  { text: '🎉 ChicagoLou just joined the stream!', delay: 3000 },
  { text: '🎉 mike_fan_01 just joined the stream!', delay: 6000 },
  { text: '📡 Mike S is going LIVE from backstage', delay: 8500 },
  { text: '🎉 superfan99 just joined the stream!', delay: 12000 },
  { text: '🎉 LaurenLive just joined the stream!', delay: 18000 },
  { text: '🎉 Jake7H just joined the stream!', delay: 28000 },
];

export const REACTION_EMOJIS = ['❤️', '🔥', '🤘', '🎸', '👏', '⚡', '😍', '🙌', '💜', '🤯'];

export const CREW_CONFIG: Record<string, CrewConfig> = {
  mike: { id: 'crew-mike', name: 'Mike S', displayName: 'MIKE S', badge: '🎸', avatar: 'MS', color: '#a855f7', gradient: 'linear-gradient(135deg, #8a1cfc, #ec4899)', instrument: 'Guitar', cameraLabel: 'Backstage Cam', bioAnchor: '#bio-member-1' },
  michael: { id: 'crew-mike', name: 'Mike S', displayName: 'MIKE S', badge: '🎸', avatar: 'MS', color: '#a855f7', gradient: 'linear-gradient(135deg, #8a1cfc, #ec4899)', instrument: 'Guitar', cameraLabel: 'Backstage Cam', bioAnchor: '#bio-member-1' },
  sammy: { id: 'crew-sammy', name: 'Sammy D', displayName: 'SAMMY D', badge: '🥁', avatar: 'SD', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #f97316)', instrument: 'Drums', cameraLabel: 'Drum Warm-Up', bioAnchor: '#bio-member-4' },
  ryan: { id: 'crew-ryan', name: 'Ryan K', displayName: 'RYAN K', badge: '🎹', avatar: 'RK', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #8a1cfc)', instrument: 'Keys', cameraLabel: 'Keys & Soundcheck', bioAnchor: '#bio-member-2' },
  tony: { id: 'crew-tony', name: 'Tony M', displayName: 'TONY M', badge: '🎤', avatar: 'TM', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ef4444)', instrument: 'Vocals', cameraLabel: 'Vocal Check', bioAnchor: '#bio-member-0' },
};

export const DEMO_VIOLATIONS: { fanId: string; text: string; reason: string }[] = [
  { fanId: 'fan-rockerdan', text: 'MAGA FOREVER vote trump 2024 make america great again!!!', reason: '🏛️ Political content' },
  { fanId: 'fan-super', text: 'check my onlyfans.com link in bio for exclusive content 🔞', reason: '🔞 Adult / explicit content' },
  { fanId: 'fan-tommy', text: 'follow me @tommyguitar88 for FREE giveaway — dm me now!', reason: '📢 Spam / self-promotion' },
  { fanId: 'fan-nate', text: 'if they play that garbage song im gonna shoot up the whole venue', reason: '🚨 Threat / violence' },
  { fanId: 'fan-midwest', text: 'this is a hate speech test — racist slur goes here fyi', reason: '⚠️ Hate speech / slur' },
  { fanId: 'fan-stacey', text: 'subscribe to my cashapp $staceybXO for show tickets giveaway', reason: '📢 Spam / self-promotion' },
  { fanId: 'fan-drummer', text: 'bro biden literally ruined this country political rant incoming', reason: '🏛️ Political content' },
  { fanId: 'fan-tay', text: 'xxx adult content link — check my bio for full video nsfw 🔞', reason: '🔞 Adult / explicit content' },
];

export const MERCH_PRODUCTS = [
  { id: 'p1', name: '7th Heaven Tour Tee', price: '$35', emoji: '👕', badge: 'LIMITED', color: '#a855f7', stock: 47, image: '/images/merch/logo-tee.png', description: 'Premium cotton tour tee featuring the 7th Heaven 2026 world tour graphic. Unisex fit.' },
  { id: 'p2', name: 'Crew Hoodie — Black', price: '$65', emoji: '🧥', badge: 'NEW', color: '#ec4899', stock: 12, image: '/images/merch/hoodie.png', description: 'Heavyweight pullover hoodie with embroidered 7th Heaven logo. Fleece-lined for comfort.' },
  { id: 'p3', name: 'Live Vinyl — 2024', price: '$28', emoji: '💿', badge: 'EXCLUSIVE', color: '#06b6d4', stock: 99, image: '/images/merch/vinyl.png', description: 'Limited pressing of the 2024 live set. 180g vinyl with gatefold sleeve.' },
  { id: 'p4', name: 'Snapback Cap', price: '$30', emoji: '🧢', badge: 'BESTSELLER', color: '#f97316', stock: 31, image: '/images/merch/logo-tee.png', description: 'Structured snapback cap with raised embroidered 7H logo. One size fits all.' },
  { id: 'p5', name: 'Signed Poster (18×24)', price: '$45', emoji: '🖼️', badge: 'SIGNED', color: '#c084fc', stock: 8, image: '/images/merch/vinyl.png', description: 'Hand-signed 18×24 tour poster. Each one is unique, numbered and authenticated.' },
  { id: 'p6', name: 'Fan Bundle Pack', price: '$89', emoji: '🎁', badge: 'BUNDLE', color: '#34d399', stock: 20, image: '/images/merch/hoodie.png', description: 'Exclusive bundle: Tour Tee + Vinyl + Sticker Pack. Save $15 vs. buying separately.' },
];

export const MERCH_DURATIONS = [
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
];

export const FEED_STATS: Record<string, { label: string; badge: string; peakViewers: number; avgViewers: number; color: string; duration: string }> = {
  mike: { label: 'Mike S — Guitar', badge: '🎸', peakViewers: 1847, avgViewers: 1247, color: '#a855f7', duration: '1h 23m' },
  sammy: { label: 'Sammy D — Drums', badge: '🥁', peakViewers: 203, avgViewers: 84, color: '#ec4899', duration: '58m' },
  ryan: { label: 'Ryan K — Keys', badge: '🎹', peakViewers: 621, avgViewers: 412, color: '#06b6d4', duration: '1h 11m' },
  tony: { label: 'Tony M — Vocals', badge: '🎤', peakViewers: 97, avgViewers: 18, color: '#f97316', duration: '44m' },
};

export const FLAG_KEYWORDS = [
  { kw: /porn|nsfw|onlyfan|nude|sex|xxx|adult.content|strip/i, reason: '🔞 Adult / explicit content' },
  { kw: /maga|trump|biden|democrat|republican|vote|election|political|blm|antifa|communist|socialist|abortion/i, reason: '🏛️ Political content' },
  { kw: /\bn[\*i]gg|\bf[\*a]gg|\bk[i1]ke|\bsp[i1]c|hate speech/i, reason: '⚠️ Hate speech / slur' },
  { kw: /follow me|subscribe|onlyfans\.com|cashapp|venmo|giveaway|dm me|@\w+ for/i, reason: '📢 Spam / self-promotion' },
  { kw: /i.ll.kill|gonna.shoot|bomb|death.threat|fight.me|stab/i, reason: '🚨 Threat / violence' },
];

export const CHAT_EMOJIS = ['😂', '❤️', '🔥', '🤘', '🎸', '👏', '⚡', '😍', '🙌', '💀', '👀', '🎵', '🫶', '😭', '💜', '🤯', '🎤', '🎶', '🥹', '😎'];
