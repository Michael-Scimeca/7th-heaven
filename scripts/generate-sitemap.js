const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const workspaceRoot = path.resolve(__dirname, '..');
const appDir        = path.join(workspaceRoot, 'src/app');
const outputPublic  = path.join(workspaceRoot, 'public/sitemap.html');

console.log('🗺  Building 7thHeaven Sitemap…');

function walkDir(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    fs.statSync(full).isDirectory() ? files = files.concat(walkDir(full)) : files.push(full);
  }
  return files;
}

const PAGE_FILES  = ['page.tsx','page.ts','page.jsx','page.js'];
const ROUTE_FILES = ['route.ts','route.js'];
const allFiles = walkDir(appDir);
let staticCount = 0, dynamicCount = 0, apiCount = 0;

for (const f of allFiles) {
  const base = path.basename(f);
  const rel  = path.relative(appDir, path.dirname(f));
  const segs = (rel ? rel.split(path.sep) : []).filter(s => !(s.startsWith('(') && s.endsWith(')')));
  const route = '/' + segs.join('/');
  const isDynamic = route.includes('[');
  if (PAGE_FILES.includes(base))  isDynamic ? dynamicCount++ : staticCount++;
  if (ROUTE_FILES.includes(base)) apiCount++;
}

function img(name, alt) {
  return `<img src="/images/mockups/${name}.png" alt="${alt}" onerror="this.style.display='none'" />`;
}

const now = new Date().toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' });

// ── Link Helper for Sitemap Elements ─────────────────────────────────────────
function getMockupLink(imgName) {
  const map = {
    home: '/',
    fans: '/fans',
    cruise_landing: '/cruise',
    cruise_form_b: '/cruise/form-b',
    lounge: '/cruise/dashboard',
    book: '/book',
    planner_verify: '/planner/verify',
    planner: '/planner',
    admin_create_crew: '/admin',
    login_modal: '/?showLogin=true',
    crew_set_password: '/crew-setup-preview',
    crew: '/crew',
    admin_create_form_filled: '/admin',
    admin_login_gate: '/admin',
    admin: '/admin',
    live: '/live',
    live_stream: '/live/live_michael',
    profile: '/fans/super_fan',
    store: '/store',
    merch: '/merch',
    bio: '/bio',
    video: '/video',
    music: '/music',
    news: '/news',
    contact: '/contact',
    privacy: '/privacy',
    terms: '/terms',
    cruise_form_a: '/cruise/form-a',
    cruise_form_c: '/cruise/form-c',
    cruise_gate: '/cruise/verify',
    cruise_cancel: '/cruise/cancel',
    book_success: '/book/success',
    book_cancel: '/book/cancel',
    planner_login: '/planner',
    admin_emails: '/admin/emails',
    admin_email_map: '/admin/email-map',
    admin_checklist: '/admin/checklist',
    admin_features: '/admin/features',
    admin_feed: '/admin/feed',
    admin_legal: '/admin/legal',
    email_welcome_fan: '/admin/emails?template=welcome_fan',
    email_welcome_crew: '/admin/emails?template=welcome_crew',
    email_welcome_planner: '/admin/emails?template=welcome_planner',
    admin_welcome_email: '/admin/emails?template=admin_created',
    email_auth_pin: '/admin/emails?template=auth_pin',
    email_cruise_confirmation: '/admin/emails?template=cruise_confirm',
    email_raffle_win: '/admin/emails?template=raffle_winner',
    email_booking_confirmation: '/admin/emails?template=booking_confirm',
    email_booking_admin: '/admin/emails?template=booking_admin',
    email_cruise_community: '/admin/emails?template=cruise_welcome',
    email_newsletter: '/admin/emails?template=newsletter',
    email_fan_invitation: '/admin/emails?template=fan_invite',
  };
  return map[imgName] || '#';
}

// ── Onboarding Flows ──────────────────────────────────────────────────────────
const onboardingFlows = [
  {
    id:'fan', label:'🚀 Fan Member', color:'#6366f1',
    steps:[
      {n:1,title:'Sign Up Page',img:'home',tag:'Sign up page'},
      {n:2,title:'PIN Email Sent',img:'email_auth_pin',tag:'Email',portrait:true},
      {n:3,title:'Enter PIN on Site',img:'fans',tag:'Sign up page'},
    ],
    branch:[
      {label:'EMAIL',img:'email_welcome_fan',tag:'Confirm Email',portrait:true},
      {label:'PAGE',img:'fans',tag:'Fan Dashboard'},
    ]
  },
  {
    id:'cruise', label:'🚢 Cruise Member', color:'#ef4444',
    steps:[
      {n:1,title:'Form Page',img:'cruise_landing',tag:'Form page'},
      {n:2,title:'PIN Email Sent',img:'email_auth_pin',tag:'Email',portrait:true},
      {n:3,title:'Enter PIN on Site',img:'cruise_form_b',tag:'Verify page'},
    ],
    branch:[
      {label:'EMAIL',img:'email_cruise_confirmation',tag:'Confirm Email',portrait:true},
      {label:'DASHBOARD',img:'lounge',tag:'Cruise Lounge'},
    ]
  },
  {
    id:'planner', label:'📋 Planner Member', color:'#10b981',
    steps:[
      {n:1,title:'Book Page',img:'book',tag:'Book page'},
      {n:2,title:'PIN Email Sent',img:'email_welcome_planner',tag:'Email',portrait:true},
      {n:3,title:'Enter PIN on Site',img:'planner_verify',tag:'Verify page'},
    ],
    branch:[
      {label:'EMAIL',img:'email_welcome_planner',tag:'Planner Confirm Email',portrait:true},
      {label:'DASHBOARD',img:'planner',tag:'Planner Dashboard'},
    ]
  },
  {
    id:'crew', label:'🎙️ Crew Member', color:'#06b6d4',
    steps:[
      {n:1,title:'Admin Creates Account',img:'admin_create_crew',tag:'Admin panel'},
      {n:2,title:'Welcome Email + Temp PW',img:'email_welcome_crew',tag:'Email',portrait:true},
      {n:3,title:'First Login',img:'login_modal',tag:'Login modal'},
      {n:4,title:'Set Your Password',img:'crew_set_password',tag:'Password modal'},
    ],
    endpoint:{title:'Crew Dashboard',img:'crew',tag:'Dashboard'}
  },
  {
    id:'admin', label:'🔐 Admin Access', color:'#f59e0b',
    steps:[
      {n:1,title:'Create Admin Account',img:'admin_create_form_filled',tag:'Admin dashboard'},
      {n:2,title:'Welcome Email + Temp Creds',img:'admin_welcome_email',tag:'Email'},
      {n:3,title:'First Login (Temp Password)',img:'admin_login_gate',tag:'Admin login gate'},
      {n:4,title:'Set New Password',img:'crew_set_password',tag:'Set password modal'},
    ],
    endpoint:{title:'Admin Dashboard',img:'admin',tag:'Dashboard'}
  },
];

// ── Site Architecture ─────────────────────────────────────────────────────────
const siteArchSections = [
  {
    id:'public', label:'🌐 Public Pages', color:'#6366f1',
    description:'Pages anyone can visit without logging in',
    cards:[
      {name:'Home',img:'home',url:'/',type:'page'},
      {name:'Bio',img:'bio',url:'/bio',type:'page'},
      {name:'Music',img:'music',url:'/music',type:'page'},
      {name:'Video',img:'video',url:'/video',type:'page'},
      {name:'Store',img:'store',url:'/store',type:'page'},
      {name:'Live Hub',img:'live',url:'/live',type:'page'},
      {name:'Fan Photo Wall',img:'photowall',url:'/fan-photo-wall',type:'page'},
      {name:'Cruise',img:'cruise',url:'/cruise',type:'page'},
      {name:'Book Us',img:'book',url:'/book',type:'page'},
      {name:'Merch',img:'merch',url:'/merch',type:'page'},
      {name:'News',img:'news',url:'/news',type:'page'},
      {name:'Contact',img:'contact',url:'/contact',type:'page'},
      {name:'Members',img:'members',url:'/members',type:'page'},
      {name:'Privacy Policy',img:'privacy',url:'/privacy',type:'page'},
      {name:'Terms of Service',img:'terms',url:'/terms',type:'page'},
    ]
  },
  {
    id:'auth', label:'🔑 Auth & Modals', color:'#a855f7',
    description:'Login gates, sign-up flows, and modal overlays',
    cards:[
      {name:'Sign In Modal',img:'login_modal',url:'/ → modal',type:'modal'},
      {name:'Sign Up Modal',img:'signup_modal',url:'/ → modal',type:'modal'},
      {name:'Admin Login Gate',img:'admin_login_gate',url:'/admin',type:'page'},
      {name:'OTP / PIN Module',img:'email_auth_pin',url:'Injected via email',type:'component'},
      {name:'Set Password Modal',img:'crew_set_password',url:'→ first login',type:'modal'},
      {name:'Planner Verify',img:'planner_verify',url:'/planner/verify',type:'page'},
    ]
  },
  {
    id:'fan', label:'🚀 Fan Area', color:'#6366f1',
    description:'Fan member dashboard and profile pages',
    cards:[
      {name:'Fan Dashboard',img:'fans',url:'/fans',type:'page'},
      {name:'Fan Profile',img:'profile',url:'/fans/[username]',type:'page'},
      {name:'Complete Profile',img:'fans',url:'/fans/complete-profile',type:'page'},
      {name:'Fan Photo Wall',img:'photowall',url:'/fan-photo-wall',type:'page'},
      {name:'Claim Prize',img:'email_raffle_win',url:'/claim/[pin]',type:'page'},
    ]
  },
  {
    id:'crew', label:'🎙️ Crew Area', color:'#06b6d4',
    description:'Band crew member portal and individual profiles',
    cards:[
      {name:'Crew Portal',img:'crew_portal',url:'/crew',type:'page'},
      {name:'Crew Dashboard',img:'crew',url:'/crew (auth)',type:'page'},
      {name:'Crew — Michael',img:'live_michael',url:'/crew-michael',type:'page'},
      {name:'Crew — Ryan',img:'live_ryan',url:'/crew-ryan',type:'page'},
      {name:'Crew — Sam',img:'live_sammy',url:'/crew-sam',type:'page'},
      {name:'Crew — Tony',img:'live_tony',url:'/crew-tony',type:'page'},
      {name:'Setup Preview',img:'crew_set_password',url:'/crew-setup-preview',type:'page'},
    ]
  },
  {
    id:'cruise', label:'🛳️ Cruise Area', color:'#ef4444',
    description:'Full cruise interest signup flow and community hub',
    cards:[
      {name:'Cruise Landing',img:'cruise',url:'/cruise',type:'page'},
      {name:'Form A — Signup',img:'cruise_form_a',url:'/cruise/form-a',type:'page'},
      {name:'Form B — Guests',img:'cruise_form_b',url:'/cruise/form-b',type:'page'},
      {name:'Form C — Confirm',img:'cruise_form_c',url:'/cruise/form-c',type:'page'},
      {name:'Verify Page',img:'cruise_gate',url:'/cruise/verify',type:'page'},
      {name:'Cruise Lounge',img:'lounge',url:'/cruise/dashboard',type:'page'},
      {name:'Cancel Cruise',img:'cruise_cancel',url:'/cruise/cancel',type:'page'},
      {name:'User Profile',img:'profile',url:'/cruise/[username]',type:'page'},
    ]
  },
  {
    id:'booking', label:'📅 Event Booking', color:'#10b981',
    description:'Booking form, planner dashboard, and confirmation pages',
    cards:[
      {name:'Book Us Form',img:'book',url:'/book',type:'page'},
      {name:'Booking Success',img:'book_success',url:'/book/success',type:'page'},
      {name:'Booking Cancel',img:'book_cancel',url:'/book/cancel',type:'page'},
      {name:'Planner Dashboard',img:'planner',url:'/planner',type:'page'},
      {name:'Planner Login',img:'planner_login',url:'/planner (gate)',type:'page'},
      {name:'Planner Verify',img:'planner_verify',url:'/planner/verify',type:'page'},
    ]
  },
  {
    id:'live', label:'🎥 Live Streams', color:'#f59e0b',
    description:'Live broadcasting hub and individual member streams',
    cards:[
      {name:'Live Hub',img:'live',url:'/live',type:'page'},
      {name:'Live Room',img:'live_stream',url:'/live/[room]',type:'page'},
      {name:'Michael — Stream',img:'live_michael',url:'/live/live_michael',type:'page'},
      {name:'Ryan — Stream',img:'live_ryan',url:'/live/live_ryan',type:'page'},
      {name:'Sammy — Stream',img:'live_sammy',url:'/live/live_sammy',type:'page'},
      {name:'Tony — Stream',img:'live_tony',url:'/live/live_tony',type:'page'},
    ]
  },
  {
    id:'admin', label:'🔐 Admin Area', color:'#f59e0b',
    description:'Full-access admin dashboard and all sub-sections',
    cards:[
      {name:'Admin Dashboard',img:'admin',url:'/admin',type:'page'},
      {name:'Email Viewer',img:'admin_emails',url:'/admin/emails',type:'page'},
      {name:'Email Flow Map',img:'admin_email_map',url:'/admin/email-map',type:'page'},
      {name:'Checklist',img:'admin_checklist',url:'/admin/checklist',type:'page'},
      {name:'Features',img:'admin_features',url:'/admin/features',type:'page'},
      {name:'Feed',img:'admin_feed',url:'/admin/feed',type:'page'},
      {name:'Legal',img:'admin_legal',url:'/admin/legal',type:'page'},
      {name:'Crew Schedule',img:'admin',url:'/admin → section',type:'component'},
    ]
  },
  {
    id:'store', label:'🛍️ Store & Merch', color:'#ec4899',
    description:'Music store, product pages, and merchandise',
    cards:[
      {name:'Store',img:'store',url:'/store',type:'page'},
      {name:'Product Page',img:'product',url:'/store/[slug]',type:'page'},
      {name:'Merch',img:'merch',url:'/merch',type:'page'},
    ]
  },
];

// ── Email Templates ───────────────────────────────────────────────────────────
const emailTemplatesSections = [
  {
    label:'🔐 Auth & Account', color:'#a855f7',
    templates:[
      {name:'Fan — OTP PIN',img:'email_auth_pin',desc:'Sign up / login PIN verification',trigger:'Fan sign up / login'},
      {name:'Welcome — Fan',img:'email_welcome_fan',desc:'Sent after a fan creates their account',trigger:'Fan signup confirmed'},
      {name:'Welcome — Crew',img:'email_welcome_crew',desc:'Sent when admin creates a crew member account',trigger:'Admin creates crew'},
      {name:'Welcome — Planner',img:'email_welcome_planner',desc:'Sent after planner account created from booking flow',trigger:'Booking submitted'},
      {name:'Admin Account Created',img:'admin_welcome_email',desc:'Sent to new admin with temp credentials',trigger:'Admin creates another admin'},
      {name:'Fan Invitation',img:'email_fan_invitation',desc:'Sent when admin bulk-invites a fan via CSV',trigger:'Admin bulk invite'},
    ]
  },
  {
    label:'📅 Booking', color:'#10b981',
    templates:[
      {name:'Booking Confirmation',img:'email_booking_confirmation',desc:'Sent to event planner after submitting booking',trigger:'Book Us form submitted'},
      {name:'Booking Admin Alert',img:'email_booking_admin',desc:'Sent to admin when new booking comes in',trigger:'Booking submitted'},
      {name:'Booking Cancelled',img:'email_booking_confirmation',desc:'Sent to admin when planner cancels via token',trigger:'Planner clicks cancel link'},
      {name:'Booking Status Update',img:'email_booking_confirmation',desc:'Sent when booking is confirmed / cancelled / completed',trigger:'Admin updates status'},
    ]
  },
  {
    label:'🎥 Live Stream', color:'#f59e0b',
    templates:[
      {name:'Raffle Winner',img:'email_raffle_win',desc:'Sent to winning fan with their claim PIN',trigger:'Live raffle drawn'},
      {name:'Raffle Entry Confirmed',img:'email_raffle_win',desc:'Confirmation when a fan enters a raffle',trigger:'Fan enters raffle'},
    ]
  },
  {
    label:'🛳️ Cruise', color:'#ef4444',
    templates:[
      {name:'Cruise Confirmation',img:'email_cruise_confirmation',desc:'Sent to fan after cruise interest signup with guest roster',trigger:'Cruise Form C completed'},
      {name:'Cruise Community Welcome',img:'email_cruise_community',desc:'Welcome to the cruise inner circle',trigger:'Community opt-in checked'},
      {name:'Cruise Cancellation',img:'email_cruise_confirmation',desc:'Sent when fan cancels via token link',trigger:'Fan clicks cancel link'},
      {name:'Cruise Community Blast',img:'email_cruise_community',desc:'Admin blast to all cruise signups',trigger:'Admin sends update'},
    ]
  },
  {
    label:'📣 Newsletter', color:'#6366f1',
    templates:[
      {name:'Newsletter Blast',img:'email_newsletter',desc:'Sent to all fans & subscribers',trigger:'Admin newsletter send'},
    ]
  },
];

// ── Dynamic Feature Extraction ────────────────────────────────────────────────
let FEATURES = [];
try {
  const featuresFilePath = path.join(workspaceRoot, 'src/app/features/page.tsx');
  if (fs.existsSync(featuresFilePath)) {
    const featuresFileContent = fs.readFileSync(featuresFilePath, 'utf8');
    const startIndex = featuresFileContent.indexOf('const FEATURES');
    const equalsIndex = featuresFileContent.indexOf('=', startIndex);
    const arrayStartIndex = featuresFileContent.indexOf('[', equalsIndex);
    let bracketCount = 1;
    let currentIndex = arrayStartIndex + 1;
    while (bracketCount > 0 && currentIndex < featuresFileContent.length) {
      if (featuresFileContent[currentIndex] === '[') bracketCount++;
      else if (featuresFileContent[currentIndex] === ']') bracketCount--;
      currentIndex++;
    }
    const arrayContentStr = featuresFileContent.substring(arrayStartIndex, currentIndex);
    FEATURES = vm.runInNewContext(arrayContentStr);
    console.log(`⚡ Extracted ${FEATURES.length} features dynamically from features/page.tsx`);
  }
} catch (err) {
  console.error('⚠️ Failed to dynamically extract features list:', err.message);
}

// ── Render Helpers ────────────────────────────────────────────────────────────
function renderFlowCard(step, c) {
  const cls = step.portrait ? ' portrait' : '';
  const url = getMockupLink(step.img);
  return `<a href="${url}" class="flow-card-link" style="text-decoration:none;display:block"><div class="flow-card${cls}"><div class="thumb"><div class="step-num" style="background:${c}">${step.n}</div>${img(step.img,step.title)}</div><div class="meta"><span class="meta-tag">${step.tag}</span><strong>${step.title}</strong></div></div></a>`;
}

function renderBranchCard(b, c) {
  const cls = b.portrait ? ' portrait' : '';
  const url = getMockupLink(b.img);
  return `<a href="${url}" class="flow-card-link" style="text-decoration:none;display:block"><div class="flow-card branch-card${cls}"><div class="thumb">${img(b.img,b.label)}</div><div class="meta"><span class="meta-tag" style="color:${c};border-color:${c}44">${b.label}</span><strong>${b.tag}</strong></div></div></a>`;
}

function renderEndpointCard(ep, c) {
  const url = getMockupLink(ep.img);
  return `<a href="${url}" class="flow-card-link" style="text-decoration:none;display:block"><div class="flow-card endpoint-card"><div class="thumb"><div class="check-badge" style="background:${c}">✓</div>${img(ep.img,ep.title)}</div><div class="meta"><span class="meta-tag" style="color:${c};border-color:${c}44">DASHBOARD</span><strong>${ep.title}</strong></div></div></a>`;
}

function renderFlowColumn(flow) {
  const c = flow.color;
  let h = `<div class="flow-col" data-flow="${flow.id}"><div class="col-header" style="border-color:${c};color:${c}">${flow.label}</div>`;
  for (let i=0; i<flow.steps.length; i++) {
    h += renderFlowCard(flow.steps[i], c);
    if (i < flow.steps.length-1 || flow.branch || flow.endpoint) h += `<div class="arrow" style="color:${c}">↓</div>`;
  }
  if (flow.branch) {
    h += `<div class="branch-row">`;
    for (const b of flow.branch) h += renderBranchCard(b, c);
    h += `</div>`;
  }
  if (flow.endpoint) { h += `<div class="arrow" style="color:${c}">↓</div>`; h += renderEndpointCard(flow.endpoint, c); }
  h += `</div>`;
  return h;
}

function renderArchCard(card) {
  const badge = {page:`<span class="type-badge type-page">PAGE</span>`,modal:`<span class="type-badge type-modal">MODAL</span>`,component:`<span class="type-badge type-component">COMPONENT</span>`}[card.type]||'';
  let destination = card.url;
  if (destination.includes('→') || destination.includes('injected') || destination.includes('auth')) {
    destination = getMockupLink(card.img);
  }
  return `<a href="${destination}" class="arch-card-link" style="text-decoration:none;display:block"><div class="arch-card"><div class="arch-thumb">${img(card.img,card.name)}</div><div class="arch-info">${badge}<div class="arch-name">${card.name}</div><div class="arch-url">${card.url}</div></div></div></a>`;
}

function renderArchSection(s) {
  return `<div class="arch-section" id="arch-${s.id}"><div class="arch-section-header"><h2 style="color:${s.color}">${s.label}</h2><p>${s.description}</p></div><div class="arch-grid">${s.cards.map(renderArchCard).join('')}</div></div>`;
}

function renderEmailCard(t) {
  const url = getMockupLink(t.img);
  return `<a href="${url}" class="arch-card-link" style="text-decoration:none;display:block"><div class="arch-card email-card"><div class="arch-thumb">${img(t.img,t.name)}</div><div class="arch-info"><span class="type-badge type-email">EMAIL</span><div class="arch-name">${t.name}</div><div class="arch-url email-desc">${t.desc}</div><div class="email-trigger">⚡ ${t.trigger}</div></div></div></a>`;
}

function renderEmailSection(s) {
  return `<div class="arch-section"><div class="arch-section-header"><h2 style="color:${s.color}">${s.label}</h2></div><div class="arch-grid email-grid">${s.templates.map(renderEmailCard).join('')}</div></div>`;
}

// ── Live Feed Flow ────────────────────────────────────────────────────────────
const livePipeline = [
  { role:'CREW', color:'#06b6d4', icon:'🎙️', title:'Crew Dashboard', subtitle:'/crew', desc:'Crew member clicks Go Live from their personal dashboard. Selects their named room and optionally sets a stream title.', img:'crew', actions:['Click Go Live','Choose room name','Set stream title'] },
  { role:'LIVEKIT SDK', color:'#a855f7', icon:'📡', title:'LiveKit Publisher', subtitle:'/api/livekit/token', desc:'The LiveKit SDK fetches a publisher token, then opens a WebRTC connection. Camera and mic are published into the LiveKit room as SFU tracks.', img:'livekit_server', actions:['Fetch publisher token','Capture camera + mic','WebRTC publish to room'] },
  { role:'SERVER POLL', color:'#f59e0b', icon:'🔴', title:'Live Hub Updates', subtitle:'/live — polls every 5s', desc:'Live Hub polls /api/livekit/rooms every 5s. Active rooms appear as animated cards with crew name, viewer count, and pulsing LIVE badge.', img:'live_hub', actions:['Room list polled every 5s','Live badges shown','Viewer count live'] },
  { role:'FAN', color:'#6366f1', icon:'👁️', title:'Fan Watch Room', subtitle:'/live/[room]', desc:'Fan clicks a live card and enters as a subscriber — fetches a viewer token, joins the room, and video+audio play immediately alongside the reactions panel.', img:'live_room_fan', actions:['Join as subscriber','Video + audio plays','Reactions panel shown'] },
  { role:'FAN FEATURES', color:'#10b981', icon:'🎉', title:'Fan Interactions', subtitle:'Raffle · Reactions · Alerts', desc:'Fans send emoji reactions that burst across the stream. Admin triggers a live raffle mid-stream — winner is drawn in real time and gets an email with a claim PIN.', img:'email_raffle_win', actions:['Send emoji reactions','Enter live raffle','Winner gets PIN email'] },
  { role:'CREW / ADMIN', color:'#ef4444', icon:'⏹️', title:'End Stream', subtitle:'Admin kill also available', desc:'Crew clicks End Stream to close the LiveKit room. Admins can also remotely kill any active stream from the Admin dashboard. Room disappears from Live Hub instantly.', img:'live_crew_dash', actions:['Click End Stream','Room closed in LiveKit','Admin kill available'] },
];

const liveAdminCards = [
  { icon:'🚨', title:'Kill Stream', desc:'Admin can remotely end any live room instantly', color:'#ef4444' },
  { icon:'🏆', title:'Trigger Raffle', desc:'Draw a winner live — fan gets email + claim PIN', color:'#f59e0b' },
  { icon:'📊', title:'Viewer Count', desc:'Real-time participant count on all Live Hub cards', color:'#6366f1' },
  { icon:'📍', title:'Proximity Alerts', desc:'Fans get push alerts when crew goes live nearby', color:'#10b981' },
];

const pipelineLegend = [
  {color:'#06b6d4',label:'Crew'},
  {color:'#a855f7',label:'LiveKit SDK'},
  {color:'#f59e0b',label:'Server / API'},
  {color:'#6366f1',label:'Fan'},
  {color:'#10b981',label:'Fan Features'},
  {color:'#ef4444',label:'Admin Control'},
].map(l=>`<div class="live-legend-item"><div class="live-legend-dot" style="background:${l.color}"></div>${l.label}</div>`).join('');

const pipelineHtml = livePipeline.map(p=>[
  '<div class="pipe-col">',
    '<div class="pipe-role" style="color:'+p.color+'">'+p.role+'</div>',
    `<a href="${getMockupLink(p.img)}" style="text-decoration:none;display:block;width:100%" class="pipe-card-link">`,
      '<div class="pipe-card" style="border-top:3px solid '+p.color+'">',
        '<div class="pipe-thumb">'+img(p.img,p.title)+'</div>',
        '<div class="pipe-body">',
          '<div class="pipe-icon-title"><span style="font-size:15px">'+p.icon+'</span><span class="pipe-title">'+p.title+'</span></div>',
          '<div class="pipe-subtitle">'+p.subtitle+'</div>',
          '<div class="pipe-desc">'+p.desc+'</div>',
          '<div class="pipe-actions">'+p.actions.map(a=>'<div class="pipe-action">'+a+'</div>').join('')+'</div>',
        '</div>',
      '</div>',
    '</a>',
  '</div>',
].join('')).join('');

const adminSidebarHtml = liveAdminCards.map(c=>[
  '<div class="live-admin-card">',
    '<div class="lac-icon">'+c.icon+'</div>',
    '<div class="lac-title" style="color:'+c.color+'">'+c.title+'</div>',
    '<div class="lac-desc">'+c.desc+'</div>',
  '</div>',
].join('')).join('');

// ── Render Features Catalog ──────────────────────────────────────────────────
const CATEGORY_MAP = {
  fan: { label: "🎸 Fan Experience", color: "#6366f1" },
  live: { label: "🎥 Live Streaming & Raffles", color: "#f59e0b" },
  booking: { label: "📅 Booking & Planner Hub", color: "#10b981" },
  ecommerce: { label: "🛍️ E-Commerce & Merch", color: "#ec4899" },
  comms: { label: "📣 Communications & Alerts", color: "#06b6d4" },
  platform: { label: "🔐 Core Platform & Security", color: "#a855f7" }
};

function renderFeatureCard(f) {
  const isPurple = f.highlight;
  const bulletItems = f.bullets.map(b => `<li class="feat-bullet">${b}</li>`).join('');
  const howItWorksItems = f.howItWorks.map(h => `<li class="feat-how-step">${h}</li>`).join('');
  const tagsList = f.tags.map(t => `<span class="feat-tag">${t}</span>`).join('');
  
  const linkBtn = f.link ? `<a href="${f.link}" class="feat-link">Explore feature →</a>` : '';
  const highlightClass = isPurple ? ' feat-highlight' : '';

  return `
    <div class="feat-card${highlightClass}">
      <div class="feat-body">
        <div class="feat-head">
          <span class="feat-icon">${f.icon}</span>
          <div>
            <h3 class="feat-title">${f.title}</h3>
            <span class="feat-tagline">${f.tagline}</span>
          </div>
        </div>
        <p class="feat-desc">${f.description}</p>
        
        <div class="feat-why">
          <strong>Why It Matters</strong>
          ${f.whyItMatters}
        </div>
        
        <ul class="feat-bullets">
          ${bulletItems}
        </ul>
        
        <div class="feat-how">
          <div class="feat-how-title">Behind the Scenes</div>
          <ul class="feat-how-steps">
            ${howItWorksItems}
          </ul>
        </div>
        
        <div class="feat-tags">
          ${tagsList}
        </div>
      </div>
      ${linkBtn}
    </div>
  `;
}

function renderFeaturesByCategories() {
  let html = '';
  Object.keys(CATEGORY_MAP).forEach(catKey => {
    const cat = CATEGORY_MAP[catKey];
    const catFeatures = FEATURES.filter(f => f.category && f.category.includes(catKey));
    if (catFeatures.length === 0) return;
    
    html += `
      <div class="feat-section" id="feat-cat-${catKey}">
        <div class="feat-section-header">
          <h2 style="color:${cat.color}">${cat.label}</h2>
        </div>
        <div class="feat-grid">
          ${catFeatures.map(renderFeatureCard).join('')}
        </div>
      </div>
    `;
  });
  return html;
}

const legendDots = onboardingFlows.map(f=>`<span class="dot" style="background:${f.color}"></span> ${f.label}`).join(' &nbsp; ');
const archNav = siteArchSections.map(s=>`<a href="#arch-${s.id}" class="arch-nav-item" style="border-left-color:${s.color}">${s.label}</a>`).join('\n');
const featNav = Object.keys(CATEGORY_MAP).map(k=>`<a href="#feat-cat-${k}" class="arch-nav-item" style="border-left-color:${CATEGORY_MAP[k].color}">${CATEGORY_MAP[k].label}</a>`).join('\n');

const flowColumnsHtml = onboardingFlows.map(renderFlowColumn).join('\n');
const archSectionsHtml = siteArchSections.map(renderArchSection).join('\n');
const emailSectionsHtml = emailTemplatesSections.map(renderEmailSection).join('\n');
const featuresCatalogHtml = renderFeaturesByCategories();

const totalEmailCount = emailTemplatesSections.reduce((a,s)=>a+s.templates.length,0);
const totalPageCount = siteArchSections.reduce((a,s)=>a+s.cards.length,0);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>7th Heaven — Platform Sitemap</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#08080e;color:#fff;min-height:100vh}
.topbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(8,8,14,0.96);border-bottom:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(12px);height:52px}
.topbar-brand{font-size:15px;font-weight:900;letter-spacing:-0.5px}
.topbar-brand span{color:#7c3aed}
.topbar-brand em{color:rgba(255,255,255,0.35);font-size:11px;font-weight:400;font-style:normal;margin-left:8px}
.tabs{display:flex;gap:4px}
.tab{padding:6px 16px;border-radius:6px;border:1px solid transparent;cursor:pointer;font-size:12px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase;background:transparent;color:rgba(255,255,255,0.4);transition:all 0.2s}
.tab:hover{color:#fff;background:rgba(255,255,255,0.05)}
.tab.active{background:rgba(124,58,237,0.18);color:#a78bfa;border-color:rgba(124,58,237,0.3)}
.topbar-meta{font-size:11px;color:rgba(255,255,255,0.2)}
.tab-panel{display:none}.tab-panel.active{display:block}

/* FLOWS — full bleed */
.flows-header{padding:20px 24px 16px;border-bottom:1px solid rgba(255,255,255,0.05)}
.flows-header h1{font-size:20px;font-weight:900;margin-bottom:4px}
.flows-header p{color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:12px}
.legend{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.55)}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;vertical-align:middle;margin-right:4px}
.flows-scroll{overflow-x:hidden;padding:0;min-height:500px}
.flows-row{display:grid;grid-template-columns:repeat(5,1fr);gap:0;align-items:start;width:100%}
.flow-col{display:flex;flex-direction:column;align-items:center;width:100%;padding:20px 16px;border-right:1px solid rgba(255,255,255,0.04)}
.flow-col:last-child{border-right:none}
.col-header{width:100%;text-align:center;padding:10px 12px;margin-bottom:16px;border:1.5px solid;border-radius:10px;font-size:12px;font-weight:800;letter-spacing:0.3px;background:rgba(255,255,255,0.02)}
.arrow{font-size:18px;margin:5px 0;opacity:0.65}
.flow-card{width:100%;border:1px solid rgba(255,255,255,0.07);border-radius:10px;overflow:hidden;background:#0d0d17;transition:border-color 0.18s,transform 0.15s}
.flow-card:hover{border-color:rgba(255,255,255,0.18);transform:translateY(-2px)}
.flow-card .thumb{position:relative;width:100%;height:150px;background:#11111f;overflow:hidden}
.flow-card .thumb img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.flow-card.portrait .thumb{height:170px}
.flow-card.portrait .thumb img{object-fit:contain;background:#0a0a14}
.flow-card .meta{padding:10px 12px}
.flow-card .meta-tag{display:block;font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:3px}
.flow-card .meta strong{font-size:12px;color:rgba(255,255,255,0.85);line-height:1.3;display:block}
.step-num{position:absolute;top:8px;right:8px;z-index:2;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#000}
.check-badge{position:absolute;top:8px;right:8px;z-index:2;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#000}
.branch-row{display:flex;gap:10px;justify-content:center;width:100%}
.branch-card{flex:1;min-width:0}.branch-card .thumb{height:90px}
.endpoint-card{border:1.5px solid rgba(255,255,255,0.14)}

/* ARCH */
.arch-layout{display:flex;min-height:calc(100vh - 52px)}
.arch-sidebar{width:192px;flex-shrink:0;background:rgba(255,255,255,0.02);border-right:1px solid rgba(255,255,255,0.05);padding:18px 0;position:sticky;top:52px;height:calc(100vh - 52px);overflow-y:auto}
.arch-sidebar-title{padding:0 14px 10px;font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.2)}
.arch-nav-item{display:block;padding:7px 14px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);text-decoration:none;border-left:2px solid transparent;transition:all 0.18s}
.arch-nav-item:hover{color:#fff;background:rgba(255,255,255,0.04)}
.arch-main{flex:1;padding:28px 32px;overflow-y:auto}
.arch-section{margin-bottom:52px}
.arch-section-header{margin-bottom:18px}
.arch-section-header h2{font-size:19px;font-weight:900;margin-bottom:4px}
.arch-section-header p{font-size:13px;color:rgba(255,255,255,0.38)}
.arch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:14px}
.email-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.arch-card{border:1px solid rgba(255,255,255,0.07);border-radius:10px;background:#0d0d17;overflow:hidden;transition:border-color 0.18s,transform 0.15s;cursor:default}
.arch-card:hover{border-color:rgba(255,255,255,0.18);transform:translateY(-2px)}
.arch-thumb{width:100%;height:108px;background:#11111f;overflow:hidden}
.arch-thumb img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.arch-info{padding:9px 11px}
.arch-name{font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);margin-bottom:3px;line-height:1.3}
.arch-url{font-size:10px;color:rgba(255,255,255,0.22);font-family:monospace}
.email-desc{font-size:10px;color:rgba(255,255,255,0.35);margin-bottom:4px;line-height:1.4;white-space:normal;font-family:inherit}
.email-trigger{font-size:10px;color:rgba(245,158,11,0.65);font-weight:600}
.email-card .arch-thumb{height:128px}
.type-badge{display:inline-block;padding:2px 6px;border-radius:4px;margin-bottom:5px;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
.type-page{background:rgba(99,102,241,0.14);color:#818cf8}
.type-modal{background:rgba(168,85,247,0.14);color:#c084fc}
.type-component{background:rgba(6,182,212,0.14);color:#67e8f9}
.type-email{background:rgba(245,158,11,0.1);color:#fbbf24}
.arch-section+.arch-section{border-top:1px solid rgba(255,255,255,0.04);padding-top:40px}

/* LIVE FLOW */
.live-layout{display:flex;min-height:calc(100vh - 52px)}
.live-sidebar{width:220px;flex-shrink:0;background:rgba(239,68,68,0.03);border-right:1px solid rgba(239,68,68,0.1);padding:20px 0;position:sticky;top:52px;height:calc(100vh - 52px);overflow-y:auto}
.live-sidebar-title{padding:0 14px 12px;font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(239,68,68,0.5)}
.live-admin-card{margin:0 10px 10px;padding:12px;border-radius:10px;background:#0e0e18;border:1px solid rgba(255,255,255,0.06)}
.lac-icon{font-size:18px;margin-bottom:5px}
.lac-title{font-size:11px;font-weight:800;margin-bottom:3px}
.lac-desc{font-size:10px;color:rgba(255,255,255,0.35);line-height:1.4}
.live-main{flex:1;padding:28px 32px;overflow-y:auto}
.live-header h1{font-size:20px;font-weight:900;margin-bottom:5px}
.live-header p{font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:20px}
.pipeline{display:grid;grid-template-columns:repeat(6,1fr);gap:0;width:100%;position:relative}
.pipe-col{display:flex;flex-direction:column;align-items:center;padding:0 8px;position:relative}
.pipe-col:not(:last-child)::after{content:'\u2192';position:absolute;right:-10px;top:80px;font-size:20px;color:rgba(255,255,255,0.12);font-weight:900;z-index:2}
.pipe-role{font-size:8px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;opacity:0.8}
.pipe-card{width:100%;border-radius:12px;overflow:hidden;background:#0d0d17;border:1px solid rgba(255,255,255,0.07);transition:border-color 0.18s,transform 0.15s}
.pipe-card:hover{transform:translateY(-3px)}
.pipe-thumb{width:100%;height:120px;overflow:hidden;background:#11111f}
.pipe-thumb img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.pipe-body{padding:11px}
.pipe-icon-title{display:flex;align-items:center;gap:6px;margin-bottom:3px}
.pipe-title{font-size:12px;font-weight:800;color:rgba(255,255,255,0.9)}
.pipe-subtitle{font-size:9px;color:rgba(255,255,255,0.28);font-family:monospace;margin-bottom:7px}
.pipe-desc{font-size:10px;color:rgba(255,255,255,0.42);line-height:1.5;margin-bottom:8px}
.pipe-actions{display:flex;flex-direction:column;gap:3px}
.pipe-action{font-size:9px;font-weight:600;color:rgba(255,255,255,0.48);display:flex;align-items:flex-start;gap:4px}
.pipe-action::before{content:'\u2713';font-weight:900;flex-shrink:0}
.live-legend{display:flex;flex-wrap:wrap;gap:8px 20px;margin-bottom:20px}
.live-legend-item{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.5)}
.live-legend-dot{width:8px;height:8px;border-radius:50%}

/* FEATURES */
.feat-layout{display:flex;min-height:calc(100vh - 52px)}
.feat-sidebar{width:240px;flex-shrink:0;background:rgba(255,255,255,0.02);border-right:1px solid rgba(255,255,255,0.05);padding:18px 0;position:sticky;top:52px;height:calc(100vh - 52px);overflow-y:auto}
.feat-sidebar-title{padding:0 14px 10px;font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.2)}
.feat-nav-item{display:block;padding:8px 16px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);text-decoration:none;border-left:2px solid transparent;transition:all 0.18s}
.feat-nav-item:hover{color:#fff;background:rgba(255,255,255,0.04)}
.feat-main{flex:1;padding:28px 32px;overflow-y:auto}
.feat-section{margin-bottom:52px}
.feat-section-header{margin-bottom:18px}
.feat-section-header h2{font-size:19px;font-weight:900;margin-bottom:4px}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.feat-card{border:1px solid rgba(255,255,255,0.07);border-radius:12px;background:#0d0d17;overflow:hidden;display:flex;flex-direction:column;transition:border-color 0.18s,transform 0.15s}
.feat-card:hover{border-color:rgba(255,255,255,0.18);transform:translateY(-2px)}
.feat-card.feat-highlight{border-color:rgba(133,29,239,0.3);background:radial-gradient(ellipse at top,rgba(133,29,239,0.05),#0d0d17 70%)}
.feat-card.feat-highlight:hover{border-color:rgba(133,29,239,0.6)}
.feat-body{padding:16px;flex:1;display:flex;flex-direction:column;gap:12px}
.feat-head{display:flex;align-items:center;gap:8px}
.feat-icon{font-size:22px}
.feat-title{font-size:14px;font-weight:800;color:#fff}
.feat-tagline{font-size:11px;color:#a78bfa;font-weight:700}
.feat-desc{font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5}
.feat-why{background:rgba(124,58,237,0.06);border:1px solid rgba(124,58,237,0.15);padding:10px 12px;border-radius:8px;font-size:11px;color:rgba(255,255,255,0.85);line-height:1.4}
.feat-why strong{color:#a78bfa;display:block;margin-bottom:2px;font-size:10px;text-transform:uppercase;letter-spacing:1px}
.feat-bullets{list-style:none;display:flex;flex-direction:column;gap:5px}
.feat-bullet{font-size:11px;color:rgba(255,255,255,0.5);display:flex;align-items:flex-start;gap:6px;line-height:1.4}
.feat-bullet::before{content:'\u2713';color:#10b981;font-weight:900;flex-shrink:0}
.feat-how{border-top:1px solid rgba(255,255,255,0.05);padding-top:12px;margin-top:4px}
.feat-how-title{font-size:10px;font-weight:800;text-transform:uppercase;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-bottom:6px}
.feat-how-steps{list-style:none;display:flex;flex-direction:column;gap:5px}
.feat-how-step{font-size:11px;color:rgba(255,255,255,0.4);display:flex;align-items:flex-start;gap:6px;line-height:1.4}
.feat-how-step::before{content:'\u2699';color:#f59e0b;flex-shrink:0}
.feat-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto;padding-top:8px}
.feat-tag{font-size:9px;font-weight:700;padding:2px 6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);border-radius:4px}
.feat-link{display:block;text-align:center;padding:10px;background:rgba(124,58,237,0.1);border-top:1px solid rgba(124,58,237,0.2);color:#a78bfa;font-size:11px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1px;transition:background 0.2s}
.feat-link:hover{background:rgba(124,58,237,0.2);color:#fff}

.footer{padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;font-size:11px;color:rgba(255,255,255,0.18)}
</style>
</head>
<body>

<div class="topbar">
  <div class="topbar-brand"><span>7th</span>Heaven Platform <em>— Sitemap</em></div>
  <div class="tabs">
    <button class="tab active" onclick="switchTab('flows',this)">🚀 Onboarding Flows</button>
    <button class="tab" onclick="switchTab('arch',this)">🌐 Site Architecture</button>
    <button class="tab" onclick="switchTab('emails',this)">📧 Email Templates</button>
    <button class="tab" onclick="switchTab('live',this)">🎥 Live Feed Flow</button>
    <button class="tab" onclick="switchTab('features',this)">✨ Platform Features</button>
  </div>
  <div class="topbar-meta">Generated ${now}</div>
</div>

<div id="tab-flows" class="tab-panel active">
  <div class="flows-header">
    <h1>🚀 Member Onboarding Flows</h1>
    <p>Step-by-step flows for each member type — from sign-up through PIN verification to their dashboard.</p>
    <div class="legend">${legendDots}</div>
  </div>
  <div class="flows-scroll">
    <div class="flows-row">${flowColumnsHtml}</div>
  </div>
  <div class="footer">7th Heaven Band Platform · Developer Sitemap · Generated ${now}</div>
</div>

<div id="tab-arch" class="tab-panel">
  <div class="arch-layout">
    <div class="arch-sidebar">
      <div class="arch-sidebar-title">Sections</div>
      ${archNav}
    </div>
    <div class="arch-main">
      ${archSectionsHtml}
      <div class="footer">7th Heaven Band Platform · ${staticCount} static · ${dynamicCount} dynamic · ${apiCount} API routes · ${totalPageCount} pages mapped</div>
    </div>
  </div>
</div>

<div id="tab-emails" class="tab-panel">
  <div class="arch-layout">
    <div class="arch-main" style="max-width:100%">
      <div class="flows-header" style="border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:28px">
        <h1>📧 Email Templates</h1>
        <p>Every automated email sent by the 7th Heaven platform — with preview thumbnails and trigger conditions.</p>
      </div>
      ${emailSectionsHtml}
      <div class="footer">7th Heaven Band Platform · ${totalEmailCount} email templates total</div>
    </div>
  </div>
</div>

<div id="tab-live" class="tab-panel">
  <div class="live-layout">
    <div class="live-sidebar">
      <div class="live-sidebar-title">Admin Controls</div>
      ${adminSidebarHtml}
    </div>
    <div class="live-main">
      <div class="live-header">
        <h1>🎥 Live Feed Flow</h1>
        <p>How a crew member goes live and fans join the stream — full broadcast pipeline from publisher to viewer.</p>
      </div>
      <div class="live-legend">${pipelineLegend}</div>
      <div class="pipeline">${pipelineHtml}</div>
      <div class="footer">7th Heaven Band Platform · LiveKit WebRTC SFU · Real-time fan engagement</div>
    </div>
  </div>
</div>

<div id="tab-features" class="tab-panel">
  <div class="feat-layout">
    <div class="feat-sidebar">
      <div class="feat-sidebar-title">Feature Categories</div>
      ${featNav}
    </div>
    <div class="feat-main">
      <div class="flows-header" style="border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:28px;padding-left:0">
        <h1>✨ Platform Features Directory</h1>
        <p>Fully parsed feature sheets from the platform catalog — details, impact analysis, and implementation architecture.</p>
      </div>
      ${featuresCatalogHtml}
      <div class="footer">7th Heaven Band Platform · ${FEATURES.length} features mapped from catalog</div>
    </div>
  </div>
</div>

<script>
function switchTab(id,el){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  el.classList.add('active');
}
</script>
</body>
</html>`;

fs.writeFileSync(outputPublic, html);
console.log(`✅ Sitemap written → ${outputPublic}`);
console.log(`   ${staticCount} static · ${dynamicCount} dynamic · ${apiCount} API routes`);
console.log(`   Tabs: Onboarding Flows | Site Architecture (${totalPageCount} pages) | Email Templates (${totalEmailCount} templates) | Live Feed Flow | Features (${FEATURES.length} items)`);
