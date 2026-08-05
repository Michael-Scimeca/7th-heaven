/* ═══════════════════════════════════════════════════════
   CrewDashboard — shared constants, data, and types
   Extracted from CrewDashboard.tsx to reduce file size.
═══════════════════════════════════════════════════════ */

// --- Types ---
export interface FakeAccount {
  id: string;
  name: string;
  displayName: string;
  role: 'fan' | 'crew' | 'admin';
  color: string;
  avatar: string;
}

export interface ChatMsg {
  id: string;
  account?: FakeAccount | null;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  isUser?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  contactPerson: string;
  contactPhone?: string;
  parkingNotes: string;
  stageSpecs: string;
  wifiPassword?: string;
}

// --- Seed data ---

export const MEMBER_SEEDS: Record<string, { id: string; name: string; email: string; avatar: string }> = {
  sammy:   { id: 'sammy',   name: 'Sammy D',         email: 'sammy@7thheaven.com',   avatar: 'SD' },
  michael: { id: 'michael', name: 'Michael Scimeca',  email: 'michael@7thheaven.com', avatar: 'MS' },
  ryan:    { id: 'ryan',    name: 'Ryan K',           email: 'ryan@7thheaven.com',    avatar: 'RK' },
  tony:    { id: 'tony',    name: 'Tony M',           email: 'tony@7thheaven.com',    avatar: 'TM' },
  abbie:   { id: 'abbie',   name: 'Abbie Janssen',   email: 'abbie@7thheaven.com',   avatar: 'AJ' },
};

export function getAvatarColor(name: string) {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#c084fc', '#f87171', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const COMMON_EMOJIS = ['😊','😂','🔥','❤️','🎉','🤘','🎸','🎶','😍','🙌','💀','👀'];

export const getShopifyProductAdminUrl = (productGid?: string) => {
  const shopName = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '7th-heaven-7012.myshopify.com')
    .replace(/"/g, '')
    .split('.')[0];
  if (!productGid) {
    return `https://admin.shopify.com/store/${shopName}/products`;
  }
  const match = productGid.match(/\/Product\/(\d+)/) || productGid.match(/Product_(\d+)/);
  const numericId = match ? match[1] : '';
  if (numericId) {
    return `https://admin.shopify.com/store/${shopName}/products/${numericId}`;
  }
  return `https://admin.shopify.com/store/${shopName}/products`;
};

export const ROLE_REQUIREMENTS: Record<string, { certifications: string[]; training: string[] }> = {
  'SERVER': {
    certifications: ['BASSET Alcohol Cert', 'Food Handler Card'],
    training: ['Customer Service Excellence']
  },
  'HOST': {
    certifications: ['Food Handler Card'],
    training: ['Guest Relations']
  },
  'BUSSER': {
    certifications: ['Food Handler Card'],
    training: ['Safety & Sanitation']
  },
  'CHEF': {
    certifications: ['ServSafe Food Protection Manager'],
    training: ['HACCP Safety Protocols']
  },
  'LINE COOK': {
    certifications: ['Food Handler Card'],
    training: ['Grill & Fryer Safety']
  },
  'MANAGER': {
    certifications: ['ServSafe Manager', 'CPR/AED Certified'],
    training: ['Shift Leadership']
  },
  'AUDIO MIX': {
    certifications: ['AVIXA CTS (Certified Technology Specialist)'],
    training: ['Digital Audio Console Setup']
  },
  'CAMERA': {
    certifications: ['General Safety Cert'],
    training: ['Equipment Inspection']
  },
  'POSITION': {
    certifications: ['General Safety Cert'],
    training: ['Venue Setup & Logistics']
  }
};

export const CREW_QUALIFICATIONS: Record<string, { certifications: string[]; training: string[] }> = {
  abbie: {
    certifications: ['BASSET Alcohol Cert', 'Food Handler Card'],
    training: ['POS Terminal Operation', 'Customer Service Excellence']
  },
  al: {
    certifications: ['Food Handler Card'],
    training: ['Table Bussing Procedure', 'Safety & Sanitation']
  },
  andrea: {
    certifications: ['ServSafe Food Protection Manager', 'Culinary Arts Degree'],
    training: ['Kitchen Operations Management', 'HACCP Safety Protocols']
  },
  arjun: {
    certifications: ['Food Handler Card'],
    training: ['Customer Relations', 'Table Service Basics']
  },
  chris: {
    certifications: ['BASSET Alcohol Cert', 'Food Handler Card'],
    training: ['Guest Relations', 'Reservation Software']
  },
  daniel: {
    certifications: ['ServSafe Manager', 'CPR/AED Certified', 'Crowd Manager Cert'],
    training: ['Shift Leadership', 'Emergency Response Procedures']
  },
  dave_croke: {
    certifications: ['Food Handler Card'],
    training: ['Line Station Setup', 'Grill & Fryer Safety']
  },
  dave_maas: {
    certifications: ['ServSafe Food Protection Manager'],
    training: ['Menu Development', 'Food Cost Controls']
  },
  david_xu: {
    certifications: ['ServSafe Manager', 'CPR/AED Certified'],
    training: ['Staff Scheduling', 'Inventory Auditing']
  },
  emily: {
    certifications: ['BASSET Alcohol Cert', 'Food Handler Card'],
    training: ['Upselling Techniques', 'Host Desk Protocols']
  },
  emma: {
    certifications: ['Food Handler Card'],
    training: ['Prep Cook Station Basics', 'Knife Handling Safety']
  },
  erin: {
    certifications: ['General Safety Cert'],
    training: ['Venue Setup & Logistics', 'Equipment Inspection']
  },
  francesca: {
    certifications: ['ServSafe Manager', 'Crowd Manager Cert'],
    training: ['Event Coordination', 'Conflict De-escalation']
  },
  michael: {
    certifications: ['AVIXA CTS (Certified Technology Specialist)', 'OSHA 10 Safety'],
    training: ['Digital Audio Console Setup', 'Wireless Frequency Management']
  },
  sammy: {
    certifications: ['BASSET Alcohol Cert', 'Food Handler Card'],
    training: ['Fine Dining Table Etiquette', 'Point-of-Sale Checkout']
  },
  ryan: {
    certifications: ['Food Handler Card'],
    training: ['Trash Disposal Procedures', 'Floor Safety & Sweeping']
  },
  tony: {
    certifications: ['Food Handler Card'],
    training: ['Grill Station Mastery', 'High-Volume Kitchen Prep']
  }
};

export const qualificationMap: Record<string, string[]> = {
  abbie: ['SERVER', 'HOST'],
  al: ['SERVER', 'BUSSER'],
  andrea: ['CHEF'],
  arjun: ['SERVER'],
  chris: ['SERVER', 'HOST'],
  daniel: ['MANAGER'],
  dave_croke: ['LINE COOK'],
  dave_maas: ['CHEF'],
  david_xu: ['MANAGER'],
  emily: ['SERVER', 'HOST'],
  emma: ['LINE COOK'],
  erin: ['POSITION'],
  francesca: ['MANAGER'],
  michael: ['AUDIO MIX'],
  sammy: ['SERVER'],
  ryan: ['BUSSER'],
  tony: ['LINE COOK']
};

export const MOCK_VENUES: Venue[] = [
  {
    id: 'venue_1',
    name: 'The Chicago Theatre',
    address: '175 N State St, Chicago, IL 60601',
    capacity: 3600,
    contactPerson: 'Sarah Jenkins (Prod Manager)',
    contactPhone: '(312) 555-0199',
    parkingNotes: 'Load-in at the alley off Benton Place. Backstage parking requires security pass. Crew trucks park in designated street bays.',
    stageSpecs: 'Proscenium stage. 60ft wide x 45ft deep. Full fly system, 48 linesets. Stage power: 3x 400A 3-phase.',
    wifiPassword: 'BackstageGuest2026!'
  },
  {
    id: 'venue_2',
    name: 'Station 34',
    address: '34 S Main St, Mount Prospect, IL 60056',
    capacity: 250,
    contactPerson: 'Dave Miller (Owner)',
    contactPhone: '(847) 555-3434',
    parkingNotes: 'Free street parking around the building. Load-in through the double doors on the west side of the building.',
    stageSpecs: 'Raised deck stage. 20ft wide x 12ft deep. Basic LED wash lights, 16-channel digital console. Stage power: 2x 20A dedicated circuits.',
    wifiPassword: 'station34_wifi'
  },
  {
    id: 'venue_3',
    name: 'Durty Nellies',
    address: '180 N Smith St, Palatine, IL 60067',
    capacity: 1000,
    contactPerson: 'Mark Benson (Production Coordinator)',
    contactPhone: '(847) 555-0142',
    parkingNotes: 'Band bus/van park in the rear lot next to the loading dock. Public parking garage across the street.',
    stageSpecs: 'Professional stage. 32ft wide x 20ft deep. Full DMX light rig, Behringer X32 console, 4 monitor mixes. Stage power: 200A 3-phase.',
    wifiPassword: 'nellies_backstage'
  },
  {
    id: 'venue_4',
    name: "Joe's Live",
    address: '5441 Park Pl, Rosemont, IL 60018',
    capacity: 1500,
    contactPerson: 'Tony Ross (Sound Engineer)',
    contactPhone: '(847) 555-9088',
    parkingNotes: 'Use the loading bay at Parkway Bank Park. Buses park in the designated lane behind the venue. Validate parking at the box office.',
    stageSpecs: 'Main stage. 40ft wide x 24ft deep. High-end L-Acoustics PA system, GrandMA2 lighting console. Stage power: 2x 400A 3-phase.',
    wifiPassword: 'joes_guest_pass'
  }
];
