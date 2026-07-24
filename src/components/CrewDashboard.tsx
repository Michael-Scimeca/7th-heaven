"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LiveKitStream } from '@/components/LiveKitStream';
import { getProducts } from '@/lib/shopify';
import { shiftCoverageRequest } from '@/lib/email-templates';

// --- Types ---
interface FakeAccount {
  id: string;
  name: string;
  displayName: string;
  role: 'fan' | 'crew' | 'admin';
  color: string;
  avatar: string;
}

interface ChatMsg {
  id: string;
  account?: FakeAccount | null;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  isUser?: boolean;
}

const MEMBER_SEEDS: Record<string, { id: string; name: string; email: string; avatar: string }> = {
  sammy:   { id: 'sammy',   name: 'Sammy D',         email: 'sammy@7thheaven.com',   avatar: 'SD' },
  michael: { id: 'michael', name: 'Michael Scimeca',  email: 'michael@7thheaven.com', avatar: 'MS' },
  ryan:    { id: 'ryan',    name: 'Ryan K',           email: 'ryan@7thheaven.com',    avatar: 'RK' },
  tony:    { id: 'tony',    name: 'Tony M',           email: 'tony@7thheaven.com',    avatar: 'TM' },
  abbie:   { id: 'abbie',   name: 'Abbie Janssen',   email: 'abbie@7thheaven.com',   avatar: 'AJ' },
};

function getAvatarColor(name: string) {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const COMMON_EMOJIS = ['😊','😂','🔥','❤️','🎉','🤘','🎸','🎶','😍','🙌','💀','👀'];

const getShopifyProductAdminUrl = (productGid?: string) => {
  const shopName = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '7th-heaven-7012.myshopify.com')
    .replace(/"/g, '')
    .split('.')[0];
  if (!productGid) {
    return `https://admin.shopify.com/store/${shopName}/products`;
  }
  // Extract number from gid://shopify/Product/123456789
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
    name: 'Joe\'s Live',
    address: '5441 Park Pl, Rosemont, IL 60018',
    capacity: 1500,
    contactPerson: 'Tony Ross (Sound Engineer)',
    contactPhone: '(847) 555-9088',
    parkingNotes: 'Use the loading bay at Parkway Bank Park. Buses park in the designated lane behind the venue. Validate parking at the box office.',
    stageSpecs: 'Main stage. 40ft wide x 24ft deep. High-end L-Acoustics PA system, GrandMA2 lighting console. Stage power: 2x 400A 3-phase.',
    wifiPassword: 'joes_guest_pass'
  }
];

export function CrewDashboard({ defaultMemberId }: { defaultMemberId?: string } = {}) {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<'fan' | 'crew' | 'admin'>('crew');
  const [email, setEmail] = useState('');
  const [isBroadcastPanelCollapsed, setIsBroadcastPanelCollapsed] = useState(false);
  const [isScheduleCollapsed, setIsScheduleCollapsed] = useState(false);
  const [isSetlistCollapsed, setIsSetlistCollapsed] = useState(false);

  // --- Work Schedule State ---
  const [crewSchedules, setCrewSchedules] = useState<{ id: string; crewId: string; crewName: string; date: string; time: string; role: string; location: string; notes: string; isDraft?: boolean; approvalStatus?: 'pending' | 'approved' | 'declined'; declineReason?: string; isCoverageRequested?: boolean }[]>([]);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [decliningShiftId, setDecliningShiftId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [tourDates, setTourDates] = useState<any[]>([]);
  const [activeScheduleTab, setActiveScheduleTab] = useState<'my_schedule' | 'tour_events'>('my_schedule');

  // --- Availability & Time Off States ---
  interface AvailabilityItem {
    id: string;
    crewId: string;
    date: string;
    type: 'available' | 'unavailable';
    note?: string;
  }
  interface TimeOffRequest {
    id: string;
    crewId: string;
    crewName: string;
    date: string;
    reason: string;
    status: 'pending' | 'approved' | 'denied';
    declineReason?: string;
  }
  const [myAvailabilities, setMyAvailabilities] = useState<AvailabilityItem[]>([]);
  const [myTimeOffRequests, setMyTimeOffRequests] = useState<TimeOffRequest[]>([]);
  
  const [availDate, setAvailDate] = useState('');
  const [availType, setAvailType] = useState<'available' | 'unavailable'>('unavailable');
  const [availNote, setAvailNote] = useState('');
  
  const [timeOffDate, setTimeOffDate] = useState('');
  const [timeOffReason, setTimeOffReason] = useState('');

  // --- Venue database states ---
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenuePopup, setSelectedVenuePopup] = useState<Venue | null>(null);

  // --- Show lineup, comments & swap states ---
  interface SetAct {
    id: string;
    actName: string;
    startTime: string;
    endTime: string;
  }
  interface GigComment {
    id: string;
    date: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
    parentId?: string;
  }
  const [setLineups, setSetLineups] = useState<Record<string, SetAct[]>>({});
  const [gigComments, setGigComments] = useState<GigComment[]>([]);
  const [activeDiscussionDate, setActiveDiscussionDate] = useState<string | null>(null);
  
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [requestingCoverageShift, setRequestingCoverageShift] = useState<any | null>(null);
  const [swapTargetColleagueId, setSwapTargetColleagueId] = useState<string>('');

  // --- Toast state ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; title?: string; visible: boolean }>({ message: '', type: 'info', visible: false });
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    setToast({ message, type, title, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 6000);
  };

  // --- Email Admins States & Handlers ---
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmailToAdmins = async () => {
    setIsSendingEmail(true);
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin');

      let adminEmails: string[] = [];
      if (admins && admins.length > 0) {
        adminEmails = admins.map((a: any) => a.email).filter(Boolean);
      }
      if (adminEmails.length === 0) {
        adminEmails = ['michael@7thheaven.com'];
      }

      const htmlContent = `
        <div style="font-family: sans-serif; background-color: #0c0d12; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2937;">
          <h2 style="color: #fbbf24; margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Crew Member Message</h2>
          <p style="font-size: 14px; color: #e5e7eb; margin-bottom: 20px;">
            You have received a new message from crew member <strong>${displayName}</strong> (${email}):
          </p>
          
          <div style="background-color: #111827; padding: 16px; border-radius: 8px; border: 1px solid #374151; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #9ca3af; margin-top: 0; font-weight: bold; text-transform: uppercase;">Subject:</p>
            <p style="font-size: 15px; color: #ffffff; margin-bottom: 16px; font-weight: bold;">${emailSubject}</p>
            
            <p style="font-size: 14px; color: #9ca3af; margin-top: 0; font-weight: bold; text-transform: uppercase;">Message:</p>
            <p style="font-size: 14px; color: #e5e7eb; white-space: pre-wrap; line-height: 1.6;">${emailMessage}</p>
          </div>
          
          <p style="font-size: 12px; color: #6b7280; border-top: 1px solid #1f2937; padding-top: 16px; margin-top: 24px;">
            Sent via 7th Heaven Crew Portal.
          </p>
        </div>
      `;

      for (const recipient of adminEmails) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient,
            subject: `✉️ Message from Crew Member (${displayName}): ${emailSubject}`,
            html: htmlContent
          })
        });
      }

      alert('✉️ Email sent successfully to administrators!');
      setIsEmailModalOpen(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (err) {
      console.error(err);
      alert('Failed to send email: ' + err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isQualifiedForRole = (crewId: string, roleName: string): boolean => {
    const normRole = roleName.toUpperCase().trim();
    const baseRoles = qualificationMap[crewId.toLowerCase()] || [];
    const hasBaseRole = baseRoles.some(q => q.toUpperCase() === normRole);
    const hasExistingShift = crewSchedules.some(s => s.crewId === crewId && s.role.toUpperCase().trim() === normRole);

    if (!hasBaseRole && !hasExistingShift) return false;

    const requirements = ROLE_REQUIREMENTS[normRole];
    if (!requirements) return true;

    const userQuals = CREW_QUALIFICATIONS[crewId.toLowerCase()];
    if (!userQuals) return false;

    const hasAllCerts = requirements.certifications.every(cert => 
      userQuals.certifications.includes(cert)
    );
    const hasAllTraining = requirements.training.every(train => 
      userQuals.training.includes(train)
    );

    return hasAllCerts && hasAllTraining;
  };

  const getCrewMemberEmail = (crewId: string): string => {
    const fallbackMap: Record<string, string> = {
      abbie: 'abbie@7thheaven.com',
      al: 'al@7thheaven.com',
      andrea: 'andrea@7thheaven.com',
      arjun: 'arjun@7thheaven.com',
      chris: 'chris@7thheaven.com',
      daniel: 'daniel@7thheaven.com',
      dave_croke: 'dave.croke@7thheaven.com',
      dave_maas: 'dave.maas@7thheaven.com',
      david_xu: 'david.xu@7thheaven.com',
      emily: 'emily@7thheaven.com',
      emma: 'emma@7thheaven.com',
      erin: 'erin@7thheaven.com',
      francesca: 'francesca@7thheaven.com'
    };
    return fallbackMap[crewId] || `${crewId}@7thheaven.com`;
  };

  const handleRequestCoverage = async (shiftId: string, swapTargetColleagueId?: string | null) => {
    try {
      const updated = crewSchedules.map(s => {
        if (s.id === shiftId) {
          return {
            ...s,
            isCoverageRequested: true,
            swapRequestId: swapTargetColleagueId || undefined
          };
        }
        return s;
      });
      setCrewSchedules(updated);
      localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      const res = await fetch('/api/crew/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (!res.ok) {
        throw new Error('Failed to sync coverage request.');
      }

      // Broadcast notifications via email to qualified crew members
      const targetShift = crewSchedules.find(s => s.id === shiftId);
      if (targetShift) {
        const mockCrewList = [
          { id: 'abbie', name: 'Abbie Janssen', email: 'abbie@7thheaven.com' },
          { id: 'al', name: 'Al Hollie', email: 'al@7thheaven.com' },
          { id: 'andrea', name: 'Andrea Kinzinger', email: 'andrea@7thheaven.com' },
          { id: 'arjun', name: 'Arjun Patel', email: 'arjun@7thheaven.com' },
          { id: 'chris', name: 'Chris Loxely', email: 'chris@7thheaven.com' },
          { id: 'daniel', name: 'Daniel Kim', email: 'daniel@7thheaven.com' },
          { id: 'dave_croke', name: 'Dave Croke', email: 'dave.croke@7thheaven.com' },
          { id: 'dave_maas', name: 'Dave Maas', email: 'dave.maas@7thheaven.com' },
          { id: 'david_xu', name: 'David Xu', email: 'david.xu@7thheaven.com' },
          { id: 'emily', name: 'Emily Hafften', email: 'emily@7thheaven.com' },
          { id: 'emma', name: 'Emma Smid', email: 'emma@7thheaven.com' },
          { id: 'erin', name: 'Erin Eagan', email: 'erin@7thheaven.com' },
          { id: 'francesca', name: 'Francesca Troast', email: 'francesca@7thheaven.com' },
          { id: 'michael', name: 'Michael Scimeca', email: 'michael@7thheaven.com' },
          { id: 'sammy', name: 'Sammy D', email: 'sammy@7thheaven.com' },
          { id: 'ryan', name: 'Ryan K', email: 'ryan@7thheaven.com' },
          { id: 'tony', name: 'Tony M', email: 'tony@7thheaven.com' }
        ];

        // Fetch dynamic crew from Supabase profiles
        let dynamicCrew: any[] = [];
        try {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('role', 'crew');
          if (data) {
            dynamicCrew = data.map((u: any) => ({ id: u.id, name: u.full_name || u.id, email: u.email }));
          }
        } catch (err) {
          console.error("Failed to fetch dynamic crew profiles:", err);
        }

        const mergedCrewList = [
          ...mockCrewList,
          ...dynamicCrew.filter(dc => !mockCrewList.some(mc => mc.id === dc.id || mc.email === dc.email))
        ];

        const qualifiedRecipients = mergedCrewList.filter(c => 
          c.id !== slug && isQualifiedForRole(c.id, targetShift.role)
        );

        for (const rec of qualifiedRecipients) {
          const htmlContent = shiftCoverageRequest({
            requestingCrewName: displayName,
            role: targetShift.role,
            date: targetShift.date,
            time: targetShift.time,
            location: targetShift.location,
            shiftId: targetShift.id,
            recipientSlug: rec.id
          });

          fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: rec.email,
              subject: `🚨 Shift Coverage Requested: ${targetShift.role} on ${targetShift.date}`,
              html: htmlContent
            })
          }).catch(err => console.error("Failed to send broadcast mail:", err));
        }

        const recipientNames = qualifiedRecipients.map(r => r.name).join(', ');
        showToast(
          `Shift broadcasted to all ${qualifiedRecipients.length} qualified coworkers: ${recipientNames || 'None available'}`,
          'success',
          '📢 Coverage Broadcast Sent'
        );
      }
    } catch (e) {
      console.error(e);
      showToast('Error requesting coverage: ' + e, 'error', 'Error');
    }
  };

  const handleAcceptCoverage = async (shiftId: string) => {
    try {
      const targetShift = crewSchedules.find(s => s.id === shiftId);
      if (!targetShift) return;

      if (!isQualifiedForRole(slug, targetShift.role)) {
        showToast('You do not possess the required certifications or training to accept this shift.', 'error', '🚫 Qualification Required');
        return;
      }

      const previousCrewId = targetShift.crewId;
      const previousCrewName = targetShift.crewName;

      const updated = crewSchedules.map(s => {
        if (s.id === shiftId) {
          return {
            ...s,
            crewId: slug,
            crewName: displayName,
            isCoverageRequested: false,
            approvalStatus: 'approved' as const
          };
        }
        return s;
      });
      setCrewSchedules(updated);
      localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      const res = await fetch('/api/crew/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (!res.ok) {
        throw new Error('Failed to sync accepted shift.');
      }

      // Send confirmation emails
      const requesterEmail = getCrewMemberEmail(previousCrewId);
      
      const requesterHtml = `
        <div style="font-family: sans-serif; background-color: #0c0d12; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2937;">
          <h2 style="color: #10b981; margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">✓ Coverage Request Accepted</h2>
          <p style="font-size: 14px; color: #e5e7eb; margin-bottom: 20px;">
            Good news! <strong>${displayName}</strong> has accepted coverage for your shift on <strong>${targetShift.date}</strong> at <strong>${targetShift.location}</strong>.
          </p>
          <p style="font-size: 14px; color: #9ca3af;">
            You are no longer scheduled or responsible for this shift.
          </p>
        </div>
      `;

      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: requesterEmail,
          subject: `✓ Coverage Request Accepted for ${targetShift.date}`,
          html: requesterHtml
        })
      }).catch(err => console.error("Failed to email requester:", err));

      const accepterHtml = `
        <div style="font-family: sans-serif; background-color: #0c0d12; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2937;">
          <h2 style="color: #10b981; margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">📅 Coverage Shift Confirmed</h2>
          <p style="font-size: 14px; color: #e5e7eb; margin-bottom: 20px;">
            You have successfully accepted the coverage shift for <strong>${previousCrewName}</strong>.
          </p>
          <div style="background-color: #111827; padding: 16px; border-radius: 8px; border: 1px solid #374151;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #9ca3af; padding: 4px 0; font-weight: bold; width: 80px;">DATE:</td>
                <td style="color: #ffffff; padding: 4px 0;">${targetShift.date}</td>
              </tr>
              <tr>
                <td style="color: #9ca3af; padding: 4px 0; font-weight: bold;">TIME:</td>
                <td style="color: #ffffff; padding: 4px 0;">${targetShift.time}</td>
              </tr>
              <tr>
                <td style="color: #9ca3af; padding: 4px 0; font-weight: bold;">VENUE:</td>
                <td style="color: #ffffff; padding: 4px 0;">${targetShift.location}</td>
              </tr>
              <tr>
                <td style="color: #9ca3af; padding: 4px 0; font-weight: bold;">ROLE:</td>
                <td style="color: #10b981; padding: 4px 0; font-weight: bold;">${targetShift.role}</td>
              </tr>
            </table>
          </div>
        </div>
      `;

      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `📅 Coverage Shift Confirmed: ${targetShift.date}`,
          html: accepterHtml
        })
      }).catch(err => console.error("Failed to email accepter:", err));

      showToast('Shift successfully claimed and added to your schedule!', 'success', '✓ Shift Claimed');
    } catch (e) {
      console.error(e);
      showToast('Error accepting coverage: ' + e, 'error', 'Error');
    }
  };

  const handleShiftResponse = async (shiftId: string, status: 'approved' | 'declined', reason?: string) => {
    try {
      const updated = crewSchedules.map(s => {
        if (s.id === shiftId) {
          return {
            ...s,
            approvalStatus: status,
            declineReason: status === 'approved' ? undefined : (reason || s.declineReason)
          };
        }
        return s;
      });
      setCrewSchedules(updated);
      localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      const res = await fetch('/api/crew/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (!res.ok) {
        throw new Error('Failed to sync response.');
      }
      
      showToast(status === 'approved' 
        ? '✓ Shift confirmed successfully! It has been added to your schedule.'
        : '✗ Shift declined.',
        status === 'approved' ? 'success' : 'info',
        status === 'approved' ? 'Confirmed' : 'Declined'
      );
    } catch (e) {
      console.error(e);
      showToast('Error updating shift: ' + e, 'error', 'Error');
    }
  };

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const saved = localStorage.getItem('7h_crew_schedules');
        if (saved) {
          setCrewSchedules(JSON.parse(saved));
        }
        
        const res = await fetch('/api/crew/calendar');
        if (res.ok) {
          const apiSchedules = await res.json();
          if (apiSchedules && Array.isArray(apiSchedules)) {
            setCrewSchedules(apiSchedules);
            localStorage.setItem('7h_crew_schedules', JSON.stringify(apiSchedules));
          }
        }
      } catch (err) {
        console.warn('Failed to load crew schedules:', err);
      }
    };
    const loadTourDates = async () => {
      try {
        const res = await fetch('/api/tour');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            setTourDates(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load tour dates:', err);
      }
    };
    loadSchedules();
    loadTourDates();
    window.addEventListener('storage', () => {
      try {
        const saved = localStorage.getItem('7h_crew_schedules');
        if (saved) {
          setCrewSchedules(JSON.parse(saved));
        }
      } catch {}
    });
  }, []);

  // Process email link actions (accept-coverage or decline-coverage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (crewSchedules.length === 0) return; // Wait until schedules are loaded
    
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const actionShiftId = params.get('shiftId');
    
    if (actionShiftId) {
      if (action === 'accept-coverage') {
        // Automatically trigger accepting coverage
        handleAcceptCoverage(actionShiftId);
        // Clean URL params so it doesn't run again on page refresh
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      } else if (action === 'decline-coverage') {
        // Show decline feedback toast
        showToast('You have declined the coverage request. The shift remains open for other crew members.', 'info', 'Shift Coverage Declined');
        // Clean URL params
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, [crewSchedules]);

  // Load Venue Database
  useEffect(() => {
    const loadVenues = () => {
      try {
        const savedVenues = localStorage.getItem('7h_venue_database');
        if (savedVenues) {
          setVenues(JSON.parse(savedVenues));
        } else {
          localStorage.setItem('7h_venue_database', JSON.stringify(MOCK_VENUES));
          setVenues(MOCK_VENUES);
        }
      } catch (err) {
        console.warn("Failed to load venues in crew dashboard:", err);
      }
    };

    loadVenues();

    const handleStorageChange = () => {
      loadVenues();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Build a stable, human-readable room slug that matches the fan page URL
  // If userId is a short slug (e.g. 'michael'), use it directly. If it's a UUID, derive from displayName.
  const memberSlug = (userId && userId.length < 36)
    ? userId.toLowerCase().replace(/\s+/g, '_')
    : (displayName || 'michael').split(' ')[0].toLowerCase().replace(/\s+/g, '_');
  const roomSlug = `live_${memberSlug}`;

  const slug = (defaultMemberId || memberSlug || 'michael').toLowerCase().trim();

  // Namespaced localStorage helper for synchronization
  const LS = useCallback((key: string) => `${key}_${slug}`, [slug]);

  useEffect(() => {
    const loadAvailabilityAndRequests = () => {
      try {
        const savedAvail = localStorage.getItem('7h_crew_availability');
        if (savedAvail) {
          const parsed = JSON.parse(savedAvail) as AvailabilityItem[];
          setMyAvailabilities(parsed.filter(a => a.crewId === slug));
        } else {
          setMyAvailabilities([]);
        }

        const savedReqs = localStorage.getItem('7h_time_off_requests');
        if (savedReqs) {
          const parsed = JSON.parse(savedReqs) as TimeOffRequest[];
          setMyTimeOffRequests(parsed.filter(r => r.crewId === slug));
        } else {
          setMyTimeOffRequests([]);
        }

        const savedLineups = localStorage.getItem('7h_set_lineups');
        if (savedLineups) {
          setSetLineups(JSON.parse(savedLineups));
        } else {
          setSetLineups({});
        }

        const savedComments = localStorage.getItem('7h_gig_comments');
        if (savedComments) {
          setGigComments(JSON.parse(savedComments));
        } else {
          setGigComments([]);
        }
      } catch (err) {
        console.warn("Failed to load availability/timeoff requests/lineups/comments:", err);
      }
    };

    loadAvailabilityAndRequests();

    const handleStorageChange = () => {
      loadAvailabilityAndRequests();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [slug]);

  const handleAddAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!availDate) return;

    const newItem: AvailabilityItem = {
      id: 'avail_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      crewId: slug,
      date: availDate,
      type: availType,
      note: availNote.trim() || undefined
    };

    try {
      const savedAvail = localStorage.getItem('7h_crew_availability');
      const currentList: AvailabilityItem[] = savedAvail ? JSON.parse(savedAvail) : [];
      // Remove any existing availability for same date and crewId to avoid duplicates
      const filtered = currentList.filter(item => !(item.crewId === slug && item.date === availDate));
      const nextList = [...filtered, newItem];
      
      localStorage.setItem('7h_crew_availability', JSON.stringify(nextList));
      window.dispatchEvent(new Event('storage'));
      
      setMyAvailabilities(nextList.filter(a => a.crewId === slug));
      setAvailDate('');
      setAvailNote('');
      showToast('Availability updated successfully!', 'success', '✓ Updated');
    } catch (err) {
      showToast('Failed to save availability: ' + err, 'error', 'Error');
    }
  };

  const handleRemoveAvailability = (id: string) => {
    try {
      const savedAvail = localStorage.getItem('7h_crew_availability');
      if (!savedAvail) return;
      const currentList: AvailabilityItem[] = JSON.parse(savedAvail);
      const nextList = currentList.filter(item => item.id !== id);
      
      localStorage.setItem('7h_crew_availability', JSON.stringify(nextList));
      window.dispatchEvent(new Event('storage'));
      
      setMyAvailabilities(nextList.filter(a => a.crewId === slug));
      showToast('Availability block removed.', 'info', 'Removed');
    } catch (err) {
      showToast('Failed to remove availability: ' + err, 'error', 'Error');
    }
  };

  const handleAddTimeOffRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeOffDate || !timeOffReason.trim()) return;

    const newReq: TimeOffRequest = {
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      crewId: slug,
      crewName: displayName || slug,
      date: timeOffDate,
      reason: timeOffReason.trim(),
      status: 'pending'
    };

    try {
      const savedReqs = localStorage.getItem('7h_time_off_requests');
      const currentList: TimeOffRequest[] = savedReqs ? JSON.parse(savedReqs) : [];
      const nextList = [...currentList, newReq];
      
      localStorage.setItem('7h_time_off_requests', JSON.stringify(nextList));
      window.dispatchEvent(new Event('storage'));
      
      setMyTimeOffRequests(nextList.filter(r => r.crewId === slug));
      setTimeOffDate('');
      setTimeOffReason('');
      showToast('Time-off request submitted for approval.', 'success', '✓ Submitted');
    } catch (err) {
      showToast('Failed to submit request: ' + err, 'error', 'Error');
    }
  };

  const handleRemoveTimeOffRequest = (id: string) => {
    try {
      const savedReqs = localStorage.getItem('7h_time_off_requests');
      if (!savedReqs) return;
      const currentList: TimeOffRequest[] = JSON.parse(savedReqs);
      const nextList = currentList.filter(item => item.id !== id);
      
      localStorage.setItem('7h_time_off_requests', JSON.stringify(nextList));
      window.dispatchEvent(new Event('storage'));
      
      setMyTimeOffRequests(nextList.filter(r => r.crewId === slug));
      showToast('Time-off request cancelled.', 'info', 'Cancelled');
    } catch (err) {
      showToast('Failed to cancel request: ' + err, 'error', 'Error');
    }
  };

  // --- Live Setlist State ---
  const [setlist, setSetlist] = useState<{ id: string; title: string; likes: number; isPlaying: boolean }[]>([
    { id: 's1', title: 'Sing', likes: 0, isPlaying: false },
    { id: 's2', title: 'This Is My Life', likes: 0, isPlaying: false },
    { id: 's3', title: 'Better This Way', likes: 0, isPlaying: false },
    { id: 's4', title: 'Gravity', likes: 0, isPlaying: false },
    { id: 's5', title: 'Beautiful Life', likes: 0, isPlaying: false },
    { id: 's6', title: 'Stop Shillin', likes: 0, isPlaying: false },
  ]);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [isBulkImport, setIsBulkImport] = useState(false);

  // --- Stream State ---
  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isSavingReplay, setIsSavingReplay] = useState(false);
  const [elapsed, setElapsed] = useState(0);



  // --- Live Feed Sales Stats ---
  const [liveSalesCount, setLiveSalesCount] = useState(0);
  const [liveSalesRevenue, setLiveSalesRevenue] = useState(0);

  // Poll Shopify orders or load simulated live purchases
  useEffect(() => {
    if (!isLive) {
      setLiveSalesCount(0);
      setLiveSalesRevenue(0);
      try {
        localStorage.removeItem(LS('sim_sales_count'));
        localStorage.removeItem(LS('sim_sales_revenue'));
        localStorage.removeItem(`live_chat_rate_${slug}`);
        localStorage.removeItem(`live_chat_total_${slug}`);
        localStorage.removeItem(`live_merch_sales_${slug}`);
        localStorage.removeItem(`live_merch_count_${slug}`);
        localStorage.removeItem(`live_viewer_count_${slug}`);
      } catch {}
      return;
    }

    const checkSales = async () => {
      try {
        const startStr = localStorage.getItem(LS('live_stream_start'));
        const startTime = startStr ? parseInt(startStr) : Date.now();

        const res = await fetch(`/api/shopify/orders?days=1`);
        if (res.ok) {
          const data = await res.json();
          if (data.mode === 'orders' && data.orders) {
            const liveOrders = data.orders.filter((o: any) => new Date(o.createdAt).getTime() > startTime);
            const total = liveOrders.reduce((sum: number, o: any) => sum + o.total, 0);
            setLiveSalesCount(liveOrders.length);
            setLiveSalesRevenue(total);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to query shopify orders API, using simulator');
      }

      // Fallback: Simulation check
      const savedCount = parseInt(localStorage.getItem(LS('sim_sales_count')) || '0');
      const savedRevenue = parseFloat(localStorage.getItem(LS('sim_sales_revenue')) || '0');
      setLiveSalesCount(savedCount);
      setLiveSalesRevenue(savedRevenue);
    };

    checkSales();
    const interval = setInterval(checkSales, 10000);
    return () => clearInterval(interval);
  }, [isLive, LS]);

  // Simulate active sales occurrences during live stream (if API is not connecting or mock demo mode)
  useEffect(() => {
    if (!isLive) return;

    const simulatePurchase = () => {
      if (Math.random() > 0.15) return;

      const randomPrice = [25.00, 45.00, 60.00, 15.00, 30.00][Math.floor(Math.random() * 5)];
      setLiveSalesCount(prev => {
        const nextCount = prev + 1;
        localStorage.setItem(LS('sim_sales_count'), nextCount.toString());
        return nextCount;
      });
      setLiveSalesRevenue(prev => {
        const nextRev = prev + randomPrice;
        localStorage.setItem(LS('sim_sales_revenue'), nextRev.toString());
        return nextRev;
      });

      const buyMsg: ChatMsg = {
        id: `sim-buy-${Date.now()}`,
        account: { id: 'system', name: 'Shopify Bot', displayName: '🛍️ STORE BOT', role: 'admin', color: '#10b981', avatar: '🛍️' },
        text: `🔥 A fan just purchased merch! Thank you for supporting the band! 🎸`,
        timestamp: Date.now()
      };
      setPosts(prev => [...prev, buyMsg].slice(-100));
    };

    const simInterval = setInterval(simulatePurchase, 25000);
    return () => clearInterval(simInterval);
  }, [isLive, LS]);

  // Sync live merch sales and viewer count metrics to localStorage for admin view
  useEffect(() => {
    if (!isLive) return;
    try {
      localStorage.setItem(`live_merch_sales_${slug}`, liveSalesRevenue.toString());
      localStorage.setItem(`live_merch_count_${slug}`, liveSalesCount.toString());
    } catch {}
  }, [liveSalesRevenue, liveSalesCount, isLive, slug]);

  useEffect(() => {
    if (!isLive) return;
    try {
      localStorage.setItem(`live_viewer_count_${slug}`, viewerCount.toString());
    } catch {}
  }, [viewerCount, isLive, slug]);
  
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };
  
  // --- Chat State ---
  const [posts, setPosts] = useState<ChatMsg[]>([]);
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [globalPinText, setGlobalPinText] = useState('');
  const [posting, setPosting] = useState(false);
  const chatChannelRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [activePinned, setActivePinned] = useState<{text: string; by: string} | null>(null);
  const [floating, setFloating] = useState<{id: string, emoji: string, x: number, createdAt: number}[]>([]);
  
  // --- Chat Settings / Moderation State ---
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [warnedUsers, setWarnedUsers] = useState<Set<string>>(new Set());
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());


  const handleWarn = async (username: string) => {
    if (!username || username === 'MIKE S' || username === 'Tony M' || username === 'Sammy D' || username === 'Ryan K') return;
    if (!confirm(`Are you sure you want to warn ${username}?`)) return;

    setWarnedUsers(prev => {
      const next = new Set(prev);
      next.add(username);
      return next;
    });

    try {
      await fetch('/api/moderation/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: username, room: slug, action: 'warn', reason: 'Moderator warning' })
      });

      const systemMsg = {
        id: `mod-warn-${Date.now()}`,
        account: null,
        text: `🛡️ ${username} has been warned by a moderator.`,
        timestamp: Date.now(),
        isSystem: true
      };
      bcRef.current?.postMessage({
        type: 'MOD_SYSTEM_MSG',
        payload: systemMsg
      });

      bcRef.current?.postMessage({
        type: 'MOD_WARN',
        payload: { username }
      });

      setPosts(prev => [...prev, systemMsg]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBan = async (username: string) => {
    if (!username || username === 'MIKE S' || username === 'Tony M' || username === 'Sammy D' || username === 'Ryan K') return;
    if (!confirm(`Are you sure you want to ban ${username}?`)) return;

    setBannedUsers(prev => {
      const next = new Set(prev);
      next.add(username);
      return next;
    });

    try {
      await fetch('/api/moderation/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: username, action: 'ban', room: slug })
      });

      await fetch('/api/chat/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: slug, banned_name: username, reason: 'Moderator action' })
      });

      const systemMsg = {
        id: `mod-ban-${Date.now()}`,
        account: null,
        text: `🚫 ${username} has been banned by a moderator.`,
        timestamp: Date.now(),
        isSystem: true
      };
      bcRef.current?.postMessage({
        type: 'MOD_SYSTEM_MSG',
        payload: systemMsg
      });

      bcRef.current?.postMessage({
        type: 'MOD_BAN',
        payload: { username }
      });

      setPosts(prev => [...prev, systemMsg]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMsg = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await supabase.from('chat_messages').delete().eq('id', msgId);
      setPosts(prev => prev.filter(p => p.id !== msgId));
      
      bcRef.current?.postMessage({
        type: 'DELETE_MSG',
        payload: { id: msgId }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleKick = async (username: string) => {
    if (!username || username === 'MIKE S' || username === 'Tony M' || username === 'Sammy D' || username === 'Ryan K') return;
    if (!confirm(`WARNING: This will permanently remove ${username} from the site, delete their account and profile, and email them a notification. Are you sure you want to do this?`)) return;

    try {
      const res = await fetch('/api/moderation/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: username, room: slug })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to kick user: ${err.error}`);
      } else {
        alert(`${username} has been successfully removed from the site.`);
      }
    } catch (e) {
      console.error(e);
      alert('Error kicking user');
    }
  };

  const [customWords, setCustomWords] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('7h_custom_flagged_words');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newCustomWord, setNewCustomWord] = useState('');

  // --- Global Orders & Pack Tracking State ---
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_orders_list');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        // Populates standard high-end mock entries
        const initialMock = [
          {
            id: 172088800001,
            customer: "Michael Scimeca",
            email: "mikeyscimeca@gmail.com",
            address: "123 Chicago Ave",
            city: "Chicago",
            zip: "60611",
            item: "7th Heaven Hoodie",
            price: "$45.00",
            size: "L",
            color: "Black",
            method: "shipping",
            source: "Flash Drop",
            status: "Pending",
            image: "/images/merch/hoodie.png",
            ts: Date.now() - 3600000 * 2
          },
          {
            id: 172088800002,
            customer: "Sarah Jenkins",
            email: "sarahj@example.com",
            address: "",
            city: "",
            zip: "",
            item: "7th Heaven Tour Tee 2026",
            price: "$35.00",
            size: "M",
            color: "White",
            method: "merch_table",
            source: "Store",
            status: "Ready for Pickup",
            image: "/images/merch/logo-tee.png",
            ts: Date.now() - 3600000 * 5
          }
        ];
        localStorage.setItem('admin_orders_list', JSON.stringify(initialMock));
        setOrders(initialMock);
      }
    } catch {}
  }, []);

  const handleUpdateOrderStatus = (orderId: number, nextStatus: string) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status: nextStatus };
          if (nextStatus === 'Shipped') {
            updatedOrder.trackingNumber = `USPS-7H-${Math.floor(10000000 + Math.random() * 90000000)}`;
          }
          return updatedOrder;
        }
        return o;
      });
      localStorage.setItem('admin_orders_list', JSON.stringify(updated));
      return updated;
    });
    showToast(`Order status updated to ${nextStatus}`, 'success', 'Fulfillment Updated');
  };

  // --- Raffle State ---
  const [raffleStatus, setRaffleStatus] = useState<'idle' | 'open' | 'drawing' | 'complete'>('idle');
  const [raffleEntrants, setRaffleEntrants] = useState<{name: string, id: string, email?: string}[]>([]);
  const [drawnWinners, setDrawnWinners] = useState<{name: string, id: string, email?: string}[]>([]);
  const [winnerPins, setWinnerPins] = useState<string[]>([]);
  
  // Array of upcoming/queued raffles
  const [raffleQueue, setRaffleQueue] = useState<{name: string, qty: number, min: number}[]>([
    { name: 'VIP Meet & Greet Pass', qty: 1, min: 1 },
    { name: 'Signed Tour Poster', qty: 5, min: 30 },
    { name: 'Free Merch Drop Code', qty: 1, min: 45 }
  ]);
  const isDrawingRef = useRef(false);
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);

  // Derived active config bindings
  const raffleMinEntrants = raffleQueue[activeQueueIndex]?.min || 15;
  const rafflePrizes = [{ name: raffleQueue[activeQueueIndex]?.name || '', qty: raffleQueue[activeQueueIndex]?.qty || 1 }];

  // --- Flash Drop State ---
  const [inventoryQty, setInventoryQty] = useState(15);
  const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    id: string;
    title: string;
    stock: number;
    shopifyPrice: string;
    flashPrice: string;
    imageUrl: string;
  }>>([]);
  const [dropDurationStr, setDropDurationStr] = useState('5m');
  const [globalDrop, setGlobalDrop] = useState(false);

  // --- Active Drop State ---
  const [activeDrop, setActiveDrop] = useState<{
    products: typeof selectedProducts;
    timeLeft: number;
    totalDuration: number;
  } | null>(null);

  // Load active drop from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('7h_flash_drop');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const elapsed = Math.floor((Date.now() - parsed.ts) / 1000);
        const remaining = parsed.duration - elapsed;
        if (remaining > 0) {
          setActiveDrop({
            products: parsed.products || [{
              id: parsed.id,
              title: parsed.name,
              stock: parsed.stock,
              shopifyPrice: parsed.price,
              flashPrice: parsed.price,
              imageUrl: parsed.image
            }],
            timeLeft: remaining,
            totalDuration: parsed.duration
          });
        } else {
          localStorage.removeItem('7h_flash_drop');
        }
      } catch {}
    }
  }, []);

  // Timer loop for active drop
  useEffect(() => {
    if (!activeDrop) return;
    const timer = setInterval(() => {
      setActiveDrop(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          localStorage.removeItem('7h_flash_drop');
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeDrop]);

  // --- Raffle Restart State ---
  const [raffleAutoRestartCountdown, setRaffleAutoRestartCountdown] = useState<number | null>(null);

  // --- Scroll to top on page load/mount ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- BroadcastChannel for cross-tab flash drop sync ---
  const bcRef = useRef<BroadcastChannel | null>(null);

  // --- Global Announcement Banner State ---
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerUpdating, setBannerUpdating] = useState(false);

  useEffect(() => {
    // Seed identity for demo member pages (e.g. /crew-sam)
    if (defaultMemberId && MEMBER_SEEDS[defaultMemberId]) {
      const seed = MEMBER_SEEDS[defaultMemberId];
      localStorage.setItem('7h_dev_bypass', 'true');
      localStorage.setItem('7h_member', JSON.stringify({
        ...seed, role: 'crew',
        joinDate: new Date().toISOString(),
        points: 0, tier: 'Bronze', showsAttended: 0,
        favoriteVenues: [], notificationsEnabled: false, notificationRadius: 25,
      }));
    }

    // Load Global Announcement Banner
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => {
        setBannerActive(data.isActive);
        setBannerText(data.text || '');
        setBannerLink(data.link || '');
      })
      .catch(() => {});

    getProducts().then(products => {
      setShopifyProducts(products);
      if (products.length > 0) {
        setSelectedProductId(products[0].id);
        setInventoryQty(products[0].quantityAvailable || 15);
        const initialPrice = products[0].variants?.edges?.[0]?.node?.price?.amount || '45.00';
        setSelectedProducts([
          {
            id: products[0].id,
            title: products[0].title,
            stock: products[0].quantityAvailable || 0,
            shopifyPrice: initialPrice,
            flashPrice: initialPrice,
            imageUrl: products[0].images?.edges?.[0]?.node?.url || '/images/mockups/merch-hoodie.png'
          }
        ]);
      }
    }).catch(console.error);

    const checkUser = async () => {
      // 1. PRIMARY: Check Supabase session (real auth)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.displayName || 'Crew';
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setDisplayName(name);
        setEmail(session.user.email || '');
        setRole(session.user.user_metadata?.role || 'crew');
        setIsLoading(false);
        return;
      }

      // 2. FALLBACK: Check localStorage-based login (from MemberContext)
      const storedMember = localStorage.getItem('7h_member');
      if (storedMember) {
        try {
          const parsed = JSON.parse(storedMember);
          if (parsed.role === 'crew' || parsed.role === 'admin') {
            setIsAuthenticated(true);
            setUserId(parsed.id || 'crew');
            setDisplayName(parsed.name || 'Crew');
            setEmail(parsed.email || '');
            setRole(parsed.role);
            setIsLoading(false);
            return;
          }
        } catch {}
      }

      // 3. DEV BYPASS: Only if no real session exists
      if (localStorage.getItem('7h_dev_bypass') === 'true') {
        const stored = localStorage.getItem('7h_member');
        const parsed = stored ? JSON.parse(stored) : null;
        
        setIsAuthenticated(true);
        setUserId(parsed?.id || 'michael');
        setDisplayName(parsed?.name || 'Michael Scimeca');
        setEmail(parsed?.email || 'michael@7thheaven.com');
        setRole('crew');
        if (!localStorage.getItem('7h_member')) {
          localStorage.setItem('7h_member', JSON.stringify({
            id: 'michael', name: 'Michael Scimeca', email: 'michael@7thheaven.com',
            role: 'crew', avatar: 'MS', joinDate: new Date().toISOString(),
            points: 0, tier: 'Bronze', showsAttended: 0, favoriteVenues: [],
            notificationsEnabled: false, notificationRadius: 25,
          }));
          window.location.reload();
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };
    checkUser();
  }, []);

  // Separate effect to load stream state once userId is stable
  useEffect(() => {
    if (!userId || isLoading) return;

    const loadStreamState = async () => {
      const slug = roomSlug; // uses display-name-based slug from component scope
      try {
        const { data, error } = await supabase
          .from('live_streams')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'live')
          .limit(1)
          .single();
        if (data && !error) {
          // Stream IS live — load chat
          setIsLive(true);
          setStreamTitle(data.title || '');
          localStorage.setItem(LS('is_live'), 'true');

          try {
            const { data: chatData } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('room', slug)
              .order('created_at', { ascending: true })
              .limit(100);
            if (chatData && chatData.length > 0) {
              const mapped = chatData.map((m: any) => ({
                id: m.id,
                account: {
                  id: m.sender_name,
                  name: m.sender_name,
                  displayName: m.sender_name,
                  role: m.sender_role || 'fan',
                  color: m.sender_role === 'crew' ? '#f97316' : '#8b5cf6',
                  avatar: m.sender_avatar || m.sender_name.slice(0, 2).toUpperCase(),
                },
                text: m.content,
                timestamp: new Date(m.created_at).getTime(),
              }));
              setPosts(mapped);
            }
          } catch {}
        } else {
          // Stream is NOT live — purge ALL stale data
          setIsLive(false);
          setPosts([]);
          setActivePinned(null);

          localStorage.setItem(LS('is_live'), 'false');
          localStorage.removeItem(`is_live_${slug.replace('live_', '')}`);
          localStorage.removeItem('is_live');
          localStorage.setItem(LS('live_chat_history'), '[]');
          localStorage.setItem('7h_global_chat_history', '[]');
          localStorage.removeItem(LS('live_pinned'));
          localStorage.setItem('7h_global_pinned', 'null');

          // Delete orphaned data from Supabase
          fetch('/api/live/clear-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: slug }) }).catch(() => {});
          fetch('/api/live-rooms/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName: slug }),
          }).catch(() => {});
        }
      } catch {
        setIsLive(false);
        setPosts([]);
        setActivePinned(null);
        localStorage.setItem(LS('is_live'), 'false');
      }
    };

    loadStreamState();

    try {
      const storedRaffle = localStorage.getItem(LS('live_raffle_sync'));
      if (storedRaffle) {
        const parsed = JSON.parse(storedRaffle);
        const safeStatus = (parsed.status === 'open' || parsed.status === 'drawing') ? 'idle' : parsed.status;
        setRaffleStatus(safeStatus);
        setRaffleEntrants(parsed.entrants || []);

        if (parsed.minEntrants && parsed.prizes) {
          setRaffleQueue(prev => {
            const next = [...prev];
            next[0] = { name: parsed.prizes[0]?.name || '', qty: parsed.prizes[0]?.qty || 1, min: parsed.minEntrants };
            return next;
          });
          setActiveQueueIndex(0);
        }
        if (parsed.winners) setDrawnWinners(parsed.winners);
        if (parsed.winnerPins) setWinnerPins(parsed.winnerPins);
      }
    } catch {}

    try {
      const storedSetlist = localStorage.getItem(LS('live_setlist_sync'));
      if (storedSetlist) {
        setSetlist(JSON.parse(storedSetlist));
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      // Admin kill switch: detect when is_live is set to 'false' from another tab
      if (e.key === LS('is_live') && e.newValue === 'false') {
        console.log('[Crew] Admin shutdown detected via storage event');
        setIsLive(false);
      }
      if (e.key === LS('live_chat_history') && e.newValue) {
        setPosts(JSON.parse(e.newValue));
      }
      // Fan chat sync from other tabs
      if (e.key === '7h_global_chat_history' && e.newValue) {
        try { setPosts(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === LS('live_pinned') && e.newValue) {
        setActivePinned(e.newValue === 'null' ? null : JSON.parse(e.newValue));
      }
      if (e.key === LS('live_reaction_sync') && e.newValue) {
        setFloating(prev => [...prev, JSON.parse(e.newValue!)]);
      }
      if (e.key === 'raffle_enter_sync' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          handleRegisterEntrantRef.current(data.fanName, data.email, data.id, data.crewId);
        } catch {}
      }
      if (e.key === 'song_like_sync' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          handleRegisterLikeRef.current(data.songId, data.crewId);
        } catch {}
      }
      if (e.key === LS('live_setlist_sync') && e.newValue) {
        try { setSetlist(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === '7h_custom_flagged_words' && e.newValue) {
        try { setCustomWords(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    const channel = supabase.channel('live_events')
      .on('broadcast', { event: 'custom_words_sync' }, (p: any) => {
        const pb = p.payload;
        if (pb && pb.words) {
          setCustomWords(pb.words);
        }
      })
      .on('broadcast', { event: 'reaction' }, (payload: any) => {
        const data = payload.payload;
        if (data.userId === userId || data.memberId === userId || data.userId === slug || data.memberId === slug) {
          setFloating(prev => [...prev, { ...data, createdAt: Date.now() }]);
        }
      })
      .on('broadcast', { event: 'raffle_enter' }, (payload: any) => {
        const data = payload.payload;
        if (data) {
          handleRegisterEntrantRef.current(data.fanName, data.email, data.fanId || data.id, data.crewId || data.memberId);
        }
      })
      .on('broadcast', { event: 'song_like' }, (payload: any) => {
        const data = payload.payload;
        if (data) {
          handleRegisterLikeRef.current(data.songId, data.crewId || data.memberId);
        }
      })
      .subscribe();

    // Supabase Realtime subscription for fan chat messages
    const chatChannel = supabase.channel('live_chat')
      .on('broadcast', { event: 'new_message' }, ({ payload }: { payload: any }) => {
        if (!payload?.id) return;
        setPosts(prev => {
          if (prev.find(m => m.id === payload.id)) return prev;
          const next = [...prev, payload as ChatMsg];
          return next.length > 100 ? next.slice(-100) : next;
        });
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room=eq.${slug}`,
        },
        (payload: any) => {
          const newMsg = payload.new;
          if (!newMsg?.id) return;
          
          const mapped: ChatMsg = {
            id: newMsg.id,
            account: {
              id: newMsg.sender_name || 'Guest',
              name: newMsg.sender_name || 'Guest',
              displayName: newMsg.sender_name || 'Anonymous',
              role: newMsg.sender_role || 'fan',
              avatar: newMsg.sender_avatar || 'G',
              color: getAvatarColor(newMsg.sender_name || 'Guest')
            },
            text: newMsg.content,
            timestamp: new Date(newMsg.created_at).getTime(),
            isSystem: newMsg.sender_role === 'system'
          };

          setPosts(prev => {
            if (prev.find(m => m.id === mapped.id)) return prev;
            const next = [...prev, mapped];
            return next.length > 100 ? next.slice(-100) : next;
          });

          // Broadcast to FakeLiveStream via BroadcastChannel so it syncs to the fan page!
          bcRef.current?.postMessage({ type: 'CHAT_MSG', payload: mapped });
        }
      )
      .subscribe();



    const viewerInterval = setInterval(() => {
      const live = localStorage.getItem(LS('viewer_count'));
      if (live) setViewerCount(parseInt(live));
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(channel);
      supabase.removeChannel(chatChannel);
      clearInterval(viewerInterval);
      // NOTE: Do NOT close bcRef here — it is managed by its own dedicated useEffect below
    };
  }, [userId, slug, LS]);

  // Open BroadcastChannel once we know the userId (keyed to the member slug, NOT raw userId)
  // FakeLiveStream uses `7h_live_${memberId}` so we must match that key exactly.
  const seenBcMsgIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!userId) return;
    const bcSlug = defaultMemberId || memberSlug;
    const channelKey = `7h_live_${bcSlug}`;
    const bc = new BroadcastChannel(channelKey);
    bcRef.current = bc;

    // Listen for incoming messages from FakeLiveStream (demo chat, etc.)
    bc.onmessage = (evt) => {
      const { type, payload } = evt.data ?? {};
      if (!type) return;

      if (type === 'CUSTOM_WORDS_SYNC') {
        setCustomWords(payload);
      }

      if (type === 'CHAT_MSG' && payload) {
        // Receive chat messages from the fan page demo
        if (seenBcMsgIds.current.has(payload.id)) return;
        seenBcMsgIds.current.add(payload.id);
        setPosts(prev => {
          if (prev.find(m => m.id === payload.id)) return prev;
          const next = [...prev, payload as ChatMsg];
          return next.length > 100 ? next.slice(-100) : next;
        });
      }

      if (type === 'MOD_WARN' && payload) {
        setWarnedUsers(s => new Set(s).add(payload.username));
      }

      if (type === 'MOD_BAN' && payload) {
        setBannedUsers(s => new Set(s).add(payload.username));
      }

      if (type === 'DELETE_MSG' && payload) {
        setPosts(prev => prev.filter(p => p.id !== payload.id));
      }

      if (type === 'MOD_SYSTEM_MSG' && payload) {
        if (seenBcMsgIds.current.has(payload.id)) return;
        seenBcMsgIds.current.add(payload.id);
        setPosts(prev => {
          if (prev.find(m => m.id === payload.id)) return prev;
          const next = [...prev, payload as ChatMsg];
          return next.length > 100 ? next.slice(-100) : next;
        });
      }

      if (type === 'VIEWER_COUNT') {
        setViewerCount(payload);
      }

      if (type === 'ORDER_CREATED' && payload) {
        setOrders(prev => {
          if (prev.find(o => o.id === payload.id)) return prev;
          const updated = [payload, ...prev];
          localStorage.setItem('admin_orders_list', JSON.stringify(updated));
          return updated;
        });
        showToast(
          `${payload.customer} purchased ${payload.item}${payload.size ? ` (${payload.size})` : ''} via ${payload.source}!`, 
          'success', 
          '🛍️ New Order Received'
        );
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav");
          audio.volume = 0.4;
          audio.play();
        } catch {}
      }
    };

    return () => { bc.close(); bcRef.current = null; };
  }, [userId, defaultMemberId, memberSlug]);



  // Sync real-time chat engagement metrics to localStorage for admin view
  useEffect(() => {
    if (!isLive) return;
    const chatRate = posts.filter(p => Date.now() - p.timestamp < 60000).length;
    localStorage.setItem(`live_chat_rate_${slug}`, chatRate.toString());
    localStorage.setItem(`live_chat_total_${slug}`, posts.length.toString());
  }, [posts, isLive, slug]);

  useEffect(() => {
    let t: any;
    if (isLive) {
      t = setInterval(() => {
        const start = localStorage.getItem(LS('live_stream_start'));
        if (start) {
          setElapsed(Math.floor((Date.now() - parseInt(start)) / 1000));
        } else {
          setElapsed(0);
        }
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(t);
  }, [isLive]);

  // Simulate viewer count locally so it doesn't drop to 0 if the fan tab is backgrounded/throttled
  useEffect(() => {
    let t: any;
    if (isLive) {
      t = setInterval(() => {
        setViewerCount(prev => {
          if (prev === 0) return 847;
          const delta = Math.floor(Math.random() * 7) - 2;
          return Math.max(800, Math.min(1400, prev + delta));
        });
      }, 3500);
    }
    return () => clearInterval(t);
  }, [isLive]);

  useEffect(() => {
    if (floating.length > 0) {
      const t = setTimeout(() => setFloating((prev) => prev.filter((f) => Date.now() - f.createdAt < 3000)), 3000);
      return () => clearTimeout(t);
    }
  }, [floating]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [posts]);

  const attemptEndStream = () => {
    if (isLive) setShowEndModal(true);
    else toggleLive();
  };

  const confirmEndAndSave = async () => {
    setIsSavingReplay(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsSavingReplay(false);
    
    try {
      const customFeeds = JSON.parse(localStorage.getItem('7h_custom_live_feeds') || '[]');
      customFeeds.unshift({
        id: 'LWeA2cE8YlI',
        title: streamTitle || `${userId || 'Crew'} Broadcast Demo`,
        year: new Date().getFullYear(),
        duration: formatTime(elapsed),
        description: `7th heaven Live Crew Broadcast Archive (Test Run)`,
        viewCount: '1'
      });
      localStorage.setItem('7h_custom_live_feeds', JSON.stringify(customFeeds));
    } catch(e) {}
    
    setShowEndModal(false);
    toggleLive();
    alert("Live Stream successfully transcoded and published to the Past Shows Video Gallery!");
  };

  const confirmEndDiscard = () => {
    setShowEndModal(false);
    toggleLive();
  };

  const activeStreamId = useRef<string | null>(null);

  const toggleLive = async () => {
    if (toggling) return;
    setToggling(true);
    const nextState = !isLive;

    // ═══════════════════════════════════════════════════════════════════
    // CRITICAL: Set localStorage flags + BroadcastChannel FIRST, before
    // any async calls that might fail. This ensures the fan page is
    // always notified, even if Supabase or API calls error out.
    // ═══════════════════════════════════════════════════════════════════
    setIsLive(nextState);

    if (nextState) {
      localStorage.setItem(`is_live_${roomSlug.replace('live_', '')}`, 'true');
      localStorage.setItem('is_live', 'true');
    } else {
      localStorage.removeItem(`is_live_${roomSlug.replace('live_', '')}`);
      localStorage.removeItem('is_live');
      localStorage.removeItem(LS('crew_is_live'));
    }
    localStorage.setItem(LS('is_live'), nextState.toString());
    localStorage.setItem(LS('stream_title'), streamTitle);

    // BroadcastChannel: sync stream state to the fan page tab (FakeLiveStream)
    if (bcRef.current) {
      bcRef.current.postMessage({ type: 'STREAM_STATE', payload: { isLive: nextState, title: streamTitle, userId } });
    }

    // Supabase Realtime broadcast (best-effort, non-blocking)
    supabase.channel('live_events').send({
      type: 'broadcast',
      event: 'stream_state',
      payload: { isLive: nextState, title: streamTitle, userId }
    }).catch(() => {});

    // ═══════════════════════════════════════════════════════════════════
    // SECONDARY: Async operations below are best-effort and won't block
    // the fan page from receiving the live state change.
    // ═══════════════════════════════════════════════════════════════════
    try {
      if (nextState) {
        // --- Fresh start: clear all previous chat & pinned data ---
        setPosts([]);
        setActivePinned(null);
        localStorage.setItem('7h_global_chat_history', '[]');
        localStorage.setItem(LS('live_chat_history'), '[]');
        localStorage.removeItem(LS('live_pinned'));
        localStorage.setItem('7h_global_pinned', 'null');
        await fetch('/api/live/clear-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: roomSlug }) }).catch(() => {});

        localStorage.setItem(LS('live_stream_start'), Date.now().toString());
        localStorage.setItem(LS('viewer_count'), '0');
        localStorage.setItem(LS('presence'), '{}');
        setViewerCount(0);
        setElapsed(0);
        cancelRaffle();
        setActiveQueueIndex(0);

        const { data: newStream, error: insertErr } = await supabase
          .from('live_streams')
          .insert({
            user_id: userId,
            title: `${displayName} — ${streamTitle || 'Crew Broadcast'}`,
            status: 'live',
            viewer_count: 0,
          })
          .select('id')
          .single();
        if (insertErr) console.error('❌ live_streams insert failed:', insertErr);
        if (newStream) {
          activeStreamId.current = newStream.id;

          // 📲 Notify opted-in fans via SMS that a live stream just started
          fetch('/api/sms/live-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostName: displayName || 'The Crew' }),
          }).catch(err => console.error('Live SMS alert failed:', err));
        }
      } else {
        localStorage.removeItem(LS('live_stream_start'));
        localStorage.setItem(LS('live_chat_history'), '[]');
        localStorage.setItem('7h_global_chat_history', '[]');
        setPosts([]);
        
        // Clear pinned message
        setActivePinned(null);
        localStorage.removeItem(LS('live_pinned'));
        localStorage.setItem('7h_global_pinned', 'null');
        
        localStorage.setItem(LS('viewer_count'), '0');
        localStorage.setItem(LS('presence'), '{}');
        setViewerCount(0);
        setElapsed(0);
        setActiveQueueIndex(0);

        // Delete chat messages from Supabase for this room (via service role API)
        await fetch('/api/live/clear-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room: roomSlug }),
        }).catch(() => {});

        if (activeStreamId.current) {
          await supabase
            .from('live_streams')
            .update({ status: 'ended' })
            .eq('id', activeStreamId.current);
          activeStreamId.current = null;
        }

        cancelRaffle();
        
        // Delete the LiveKit room to kick all participants
        await fetch('/api/live-rooms/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: roomSlug })
        }).catch(() => {});

        await supabase
          .from('live_streams')
          .update({ status: 'ended' })
          .eq('user_id', userId)
          .eq('status', 'live');
      }
    } catch (e) {
      console.error("toggleLive secondary ops failed:", e);
    } finally {
      setToggling(false);
    }
  };

  const syncStreamTitle = () => {
    localStorage.setItem(LS('stream_title'), streamTitle);
    if (isLive) {
      supabase.channel('live_events').send({ 
        type: 'broadcast', 
        event: 'stream_state', 
        payload: { isLive, title: streamTitle, userId } 
      });
    }
  };

  const syncSetlist = useCallback((nextSetlist: typeof setlist) => {
    localStorage.setItem(LS('live_setlist_sync'), JSON.stringify(nextSetlist));
    try {
      supabase.channel('live_events').send({
        type: 'broadcast',
        event: 'setlist_sync',
        payload: { setlist: nextSetlist, userId: slug },
      });
    } catch {}
  }, [LS, slug]);

  const toggleSongPlaying = (songId: string) => {
    setSetlist(prev => {
      const next = prev.map(s => {
        if (s.id === songId) {
          return { ...s, isPlaying: !s.isPlaying };
        }
        return { ...s, isPlaying: false };
      });
      syncSetlist(next);
      return next;
    });
  };

  const addSongToSetlist = (title: string) => {
    if (!title.trim()) return;
    
    // Split by newlines, commas, or semicolons to support bulk adding
    let rawTitles = [title];
    if (title.includes('\n') || title.includes('\r') || title.includes(',') || title.includes(';')) {
      rawTitles = title.split(/[\n\r,;]+/);
    }

    const cleanTitles = rawTitles
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (cleanTitles.length === 0) return;

    setSetlist(prev => {
      const newSongs = cleanTitles.map((t, idx) => ({
        id: `s-${Date.now()}-${idx}`,
        title: t,
        likes: 0,
        isPlaying: false
      }));
      const next = [...prev, ...newSongs];
      syncSetlist(next);
      return next;
    });
    setNewSongTitle('');
    setIsBulkImport(false);
  };

  const deleteSongFromSetlist = (songId: string) => {
    setSetlist(prev => {
      const next = prev.filter(s => s.id !== songId);
      syncSetlist(next);
      return next;
    });
  };

  const resetSetlistLikes = () => {
    setSetlist(prev => {
      const next = prev.map(s => ({ ...s, likes: 0 }));
      syncSetlist(next);
      return next;
    });
  };

  const [activeRaffleId, setActiveRaffleId] = useState<string | null>(null);

  const syncRaffle = async (status: any, entrants: any, min: number, prizes: any, winners: any, winnerPins?: string[]) => {
    const state = { 
      status, 
      entrants, 
      minEntrants: min, 
      prizes, 
      winners, 
      winnerPins, 
      ts: Date.now(), 
      timestamp: Date.now(),
      userId: slug
    };
    // Keep localStorage for cross-tab sync
    localStorage.setItem(LS('live_raffle_sync'), JSON.stringify(state));
    supabase.channel('live_events').send({ type: 'broadcast', event: 'raffle_sync', payload: state });

    // Persist to Supabase
    try {
      const raffleData = {
        crew_id: userId,
        stream_id: `live_${userId.toString().toLowerCase().replace(/\s+/g, '_')}`,
        status,
        prize_name: prizes?.[0]?.name || '',
        prize_qty: prizes?.[0]?.qty || 1,
        min_entrants: min,
        entrants: JSON.stringify(entrants || []),
        winners: JSON.stringify(winners || []),
        winner_pins: JSON.stringify(winnerPins || []),
        ...(status === 'complete' ? { completed_at: new Date().toISOString() } : {}),
      };

      if (activeRaffleId) {
        await supabase.from('raffles').update(raffleData).eq('id', activeRaffleId);
      } else if (status === 'open') {
        const { data } = await supabase.from('raffles').insert(raffleData).select('id').single();
        if (data) setActiveRaffleId(data.id);
      }

      if (status === 'idle' || status === 'complete') {
        setActiveRaffleId(null);
      }
    } catch (e) {
      console.error('[Raffle] Supabase sync failed, localStorage is still active:', e);
    }
  };

  const handlePin = () => {
    if (!content.trim() || posting) return;
    const pinData = { text: content.trim(), by: displayName };
    localStorage.setItem(LS('live_pinned'), JSON.stringify(pinData));
    setActivePinned(pinData);

    // BroadcastChannel: sync pin to fan page
    bcRef.current?.postMessage({ type: 'PIN_MSG', payload: pinData });

    setContent('');
  };

  const cancelRaffle = () => {
    isDrawingRef.current = false;
    setRaffleStatus('idle');
    syncRaffle('idle', [], raffleMinEntrants, rafflePrizes, []);
  };

  const startSpecificRaffle = (idx: number) => {
    if (raffleStatus !== 'idle' && raffleStatus !== 'complete') return;
    setActiveQueueIndex(idx);
    const targetRaffle = raffleQueue[idx];
    
    window.dispatchEvent(new CustomEvent('testingSimulateFanRaffleJoin'));
    setRaffleStatus('open');
    setRaffleEntrants([]);
    setDrawnWinners([]);
    setWinnerPins([]);
    syncRaffle('open', [], targetRaffle.min, [{ name: targetRaffle.name, qty: targetRaffle.qty }], [], []);
  };

  const syncCustomWords = (words: string[]) => {
    bcRef.current?.postMessage({ type: 'CUSTOM_WORDS_SYNC', payload: words });
    try {
      supabase.channel('live_events').send({
        type: 'broadcast',
        event: 'custom_words_sync',
        payload: { words, crewId: userId }
      });
    } catch {}
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newCustomWord.trim().toLowerCase();
    if (!word) return;
    if (!customWords.includes(word)) {
      const next = [...customWords, word];
      setCustomWords(next);
      localStorage.setItem('7h_custom_flagged_words', JSON.stringify(next));
      syncCustomWords(next);
    }
    setNewCustomWord('');
  };

  const handleRemoveCustomWord = (wordToRemove: string) => {
    const next = customWords.filter(w => w !== wordToRemove);
    setCustomWords(next);
    localStorage.setItem('7h_custom_flagged_words', JSON.stringify(next));
    syncCustomWords(next);
  };

  const drawWinner = () => {
    if (isDrawingRef.current || raffleStatus !== 'open' || raffleEntrants.length === 0) return;
    isDrawingRef.current = true;
    setRaffleStatus('drawing');
    syncRaffle('drawing', raffleEntrants, raffleMinEntrants, rafflePrizes, []);
    
    setTimeout(() => {
      isDrawingRef.current = false;
      const uniqueEntrants = Array.from(new Map(raffleEntrants.map(e => [e.name, e])).values());
      const shuffled = uniqueEntrants.sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, rafflePrizes[0]?.qty || 1);
      const pins = winners.map(() => Math.floor(1000 + Math.random() * 9000).toString());
      setDrawnWinners(winners);
      setWinnerPins(pins);
      setRaffleStatus('complete');
      syncRaffle('complete', raffleEntrants, raffleMinEntrants, rafflePrizes, winners, pins);

      const prizeName = rafflePrizes[0]?.name || 'the raffle';
      
      winners.forEach((w, idx) => {
        const msg: ChatMsg = {
          id: `raffle-win-${Date.now()}-${idx}`,
          account: { id: 'system', name: '7th Heaven', displayName: 'RAFFLE BOT', role: 'admin', color: '#fbbf24', avatar: '🏆' },
          text: `🎉 CONGRATULATIONS to ${w.name} for winning ${prizeName}! Check your Fan Dashboard to claim your prize! 🏆`,
          timestamp: Date.now(),
        };
        const stored = JSON.parse(localStorage.getItem(LS('live_chat_history')) || '[]');
        const nextChat = [...stored, msg].slice(-100);
        localStorage.setItem(LS('live_chat_history'), JSON.stringify(nextChat));
        setPosts(nextChat);
      });

      try {
        const inbox = JSON.parse(localStorage.getItem('vip_inbox_messages') || '[]');
        winners.forEach((w, idx) => {
          inbox.unshift({
            id: Date.now() + idx,
            icon: '🎰',
            title: 'Raffle Winner Drawn!',
            desc: `${w.name} won ${prizeName}. PIN: ${pins[idx]}.`,
            time: 'Just now',
            isNew: true,
            color: 'yellow',
            pin: pins[idx],
            isClaimed: false
          });

          // Persist notification to Supabase so it survives refresh
          Promise.resolve(supabase.from('notifications').insert({
            user_email: w.email || w.name.toLowerCase().replace(/\s+/g, '') + '@fan.7thheaven.com',
            type: 'raffle_win',
            title: `🏆 You won ${prizeName}!`,
            body: `Congratulations! Show this PIN at the merch table to claim your prize.`,
            pin: pins[idx],
            prize: prizeName,
          })).catch(() => {});
        });
        localStorage.setItem('vip_inbox_messages', JSON.stringify(inbox.slice(0, 50)));
      } catch {}
    }, 4000); // Wait 4s for simulated spin effect on fan page
  };

  const handleRegisterEntrant = useCallback((name: string, email?: string, id?: string, targetCrewId?: string) => {
    if (targetCrewId && targetCrewId !== slug) return;
    setRaffleEntrants(prev => {
      if (prev.some(e => e.name === name)) return prev;
      const next = [...prev, { name, id: id || Math.random().toString(), email }];
      syncRaffle(raffleStatus, next, raffleMinEntrants, rafflePrizes, drawnWinners, winnerPins);
      return next;
    });
  }, [raffleStatus, raffleMinEntrants, rafflePrizes, drawnWinners, winnerPins, slug]);

  const handleRegisterEntrantRef = useRef(handleRegisterEntrant);
  useEffect(() => {
    handleRegisterEntrantRef.current = handleRegisterEntrant;
  }, [handleRegisterEntrant]);

  const handleRegisterLike = useCallback((songId: string, targetCrewId?: string) => {
    if (targetCrewId && targetCrewId !== slug && targetCrewId !== userId) return;
    setSetlist(prev => {
      const next = prev.map(s => {
        if (s.id === songId) {
          return { ...s, likes: s.likes + 1 };
        }
        return s;
      });
      localStorage.setItem(LS('live_setlist_sync'), JSON.stringify(next));
      try {
        supabase.channel('live_events').send({
          type: 'broadcast',
          event: 'setlist_sync',
          payload: { setlist: next, userId: slug },
        });
      } catch {}
      return next;
    });
  }, [LS, slug, userId]);

  const handleRegisterLikeRef = useRef(handleRegisterLike);
  useEffect(() => {
    handleRegisterLikeRef.current = handleRegisterLike;
  }, [handleRegisterLike]);

  const rigWinForMe = () => {
    if (raffleStatus !== 'open') {
       alert("Please START a raffle first, then click Rig to guarantee your win!");
       return;
    }
    const me = { name: displayName, id: userId || 'crew', email: email, joinedAt: Date.now() };
    // Force me as the only entrant for a guaranteed win
    setRaffleEntrants([me]);
    setTimeout(() => drawWinner(), 500);
  };

  // Auto-draw when entries reach minimum
  useEffect(() => {
    if (raffleStatus === 'open' && raffleEntrants.length >= raffleMinEntrants) {
      drawWinner();
    }
  }, [raffleStatus, raffleEntrants.length, raffleMinEntrants]);

  // Handle countdown and auto-restart action
  useEffect(() => {
    if (raffleStatus === 'complete') {
      setRaffleAutoRestartCountdown(120); // 2 minutes
    } else {
      setRaffleAutoRestartCountdown(null);
    }
  }, [raffleStatus]);

  // Auto-restart logic removed to prevent raffles from starting without explicit user action.
  /*
  useEffect(() => {
    if (raffleAutoRestartCountdown !== null && raffleAutoRestartCountdown > 0) {
      const t = setInterval(() => setRaffleAutoRestartCountdown(c => (c ? c - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
    if (raffleAutoRestartCountdown === 0 && raffleStatus === 'complete') {
      const nextIndex = (activeQueueIndex + 1) % raffleQueue.length;
      setActiveQueueIndex(nextIndex);
      const nextRaffle = raffleQueue[nextIndex];

      setRaffleStatus('open');
      setRaffleEntrants([]);
      setDrawnWinners([]);
      setWinnerPins([]);
      setRaffleAutoRestartCountdown(null);
      syncRaffle('open', [], nextRaffle.min, [{ name: nextRaffle.name, qty: nextRaffle.qty }], [], []);
    }
  }, [raffleAutoRestartCountdown, raffleStatus]);
  */

  const updateQueueItem = (idx: number, field: string, value: any) => {
    const next = [...raffleQueue];
    next[idx] = { ...next[idx], [field]: value };
    setRaffleQueue(next);

    if (idx === activeQueueIndex && raffleStatus !== 'idle') {
       const activeRaffle = next[idx];
       syncRaffle(raffleStatus, raffleEntrants, activeRaffle.min, [{ name: activeRaffle.name, qty: activeRaffle.qty }], drawnWinners, winnerPins);
    }
  };

  const addQueueItem = () => {
    setRaffleQueue([...raffleQueue, { name: '', qty: 1, min: 10 }]);
  };

  const removeQueueItem = (idx: number) => {
    if (raffleQueue.length <= 1) return;
    const next = raffleQueue.filter((_, i) => i !== idx);
    setRaffleQueue(next);
    if (activeQueueIndex >= next.length) setActiveQueueIndex(0);
  };

  const addFakeEntry = () => {
    if (raffleStatus !== 'open') return;
    const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley'];
    const newEntrant = { name: names[Math.floor(Math.random() * names.length)], id: Math.random().toString() };
    const nextEntrants = [...raffleEntrants, newEntrant];
    setRaffleEntrants(nextEntrants);
    syncRaffle(raffleStatus, nextEntrants, raffleMinEntrants, rafflePrizes, drawnWinners, winnerPins);
  };
  
  const addLotsOfFakeEntries = () => {
     let current = [...raffleEntrants];
     for (let i = 0; i < 5; i++) {
        current.push({ name: 'SimulatedFan' + Math.floor(Math.random()*1000), id: Math.random().toString() });
     }
     setRaffleEntrants(current);
     syncRaffle(raffleStatus, current, raffleMinEntrants, rafflePrizes, drawnWinners, winnerPins);
  };

  const handlePost = () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    const msg: ChatMsg = {
      id: `crew-${Date.now()}`,
      account: {
        id: userId || 'crew',
        name: displayName,
        displayName: displayName,
        role: 'crew',
        color: '#f97316',
        avatar: displayName.slice(0, 2).toUpperCase(),
      },
      text: content.trim(),
      timestamp: Date.now(),
    };
    // Sync to persistence history
    const stored = JSON.parse(localStorage.getItem('7h_global_chat_history') || '[]');
    const nextPosts = [...stored, msg];
    const limited = nextPosts.length > 100 ? nextPosts.slice(-100) : nextPosts;
    
    setPosts(limited);
    localStorage.setItem('7h_global_chat_history', JSON.stringify(limited));

    // Also write the individual message to live_chat_sync for cross-tab fan page pickup
    localStorage.setItem(LS('live_chat_sync'), JSON.stringify(msg));

    // Persist to Supabase chat_messages table
    // Use display-name-based roomSlug (same as what the fan page expects)
    Promise.resolve(supabase.from('chat_messages').insert({
      room: roomSlug,
      sender_name: displayName,
      sender_role: 'crew',
      sender_avatar: displayName.slice(0, 2).toUpperCase(),
      content: content.trim(),
    })).catch(() => {});

    // BroadcastChannel: sync crew chat message to the fan page tab (FakeLiveStream)
    bcRef.current?.postMessage({ type: 'CHAT_MSG', payload: msg });

    // Broadcast via Supabase Realtime for cross-browser sync
    supabase.channel('live_chat').send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg,
    }).catch(() => {});
    
    setContent('');
    setPosting(false);
  };

  const handleGlobalPinBox = () => {
    if (!globalPinText.trim()) return;
    const pinData = { text: globalPinText.trim(), by: displayName };
    localStorage.setItem(LS('live_pinned'), JSON.stringify(pinData));
    setActivePinned(pinData);

    // BroadcastChannel: sync pin to fan page
    bcRef.current?.postMessage({ type: 'PIN_MSG', payload: pinData });

    setGlobalPinText('');
  };

  const addProductToDrop = (prodId: string) => {
    if (!prodId) return;
    const prod = shopifyProducts.find(p => p.id === prodId);
    if (!prod) return;
    if (selectedProducts.some(p => p.id === prodId)) return;
    const price = prod.variants?.edges?.[0]?.node?.price?.amount || '45.00';
    const stock = prod.quantityAvailable || 0;
    const image = prod.images?.edges?.[0]?.node?.url || '/images/mockups/merch-hoodie.png';
    setSelectedProducts(prev => [
      ...prev,
      {
        id: prodId,
        title: prod.title,
        stock: stock,
        shopifyPrice: price,
        flashPrice: price,
        imageUrl: image
      }
    ]);
  };

  const removeProductFromDrop = (prodId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== prodId));
  };

  const updateProductFlashPrice = (prodId: string, price: string) => {
    setSelectedProducts(prev => prev.map(p => p.id === prodId ? { ...p, flashPrice: price } : p));
  };

  const launchFlashDrop = () => {
     let seconds = 300;
     const dur = dropDurationStr.trim().toLowerCase();
     
     if (dur.includes('m') && dur.includes('s')) {
         const m = parseInt(dur.split('m')[0]) || 0;
         const sString = dur.split('m')[1].replace('s', '').trim();
         const s = parseInt(sString) || 0;
         seconds = m * 60 + s;
     } else if (dur.endsWith('m')) {
       seconds = (parseInt(dur) || 0) * 60;
     } else if (dur.endsWith('s')) {
       seconds = parseInt(dur) || 0;
     } else {
       seconds = (parseInt(dur) || 0) * 60; // default to minutes
     }
     
     if (isNaN(seconds) || seconds <= 0) seconds = 300;

     if (selectedProducts.length === 0) {
       alert("Please add at least one product to the flash drop!");
       return;
     }

     const firstProduct = selectedProducts[0];
     const firstShopifyProd = shopifyProducts.find(sp => sp.id === firstProduct.id);
     const firstVariantId = firstShopifyProd?.variants?.edges?.[0]?.node?.id || firstProduct.id;
     const firstDescription = firstShopifyProd?.description || "";
     const firstVariants = firstShopifyProd?.variants?.edges?.map((v: any) => ({
        id: v.node.id,
        title: v.node.title,
        price: v.node.price?.amount || firstProduct.flashPrice,
        quantityAvailable: v.node.quantityAvailable || 0
     })) || [];

     const payload = {
         id: firstProduct.id,
         variantId: firstVariantId,
         name: firstProduct.title,
         price: firstProduct.flashPrice,
         stock: firstProduct.stock,
         image: firstProduct.imageUrl,
         description: firstDescription,
         variants: firstVariants,
         products: selectedProducts.map(p => {
            const shopifyProd = shopifyProducts.find(sp => sp.id === p.id);
            const variantId = shopifyProd?.variants?.edges?.[0]?.node?.id || p.id;
            const prodVariants = shopifyProd?.variants?.edges?.map((v: any) => ({
               id: v.node.id,
               title: v.node.title,
               price: v.node.price?.amount || p.flashPrice,
               quantityAvailable: v.node.quantityAvailable || 0
            })) || [];
            return {
               id: p.id,
               variantId: variantId,
               name: p.title,
               price: p.flashPrice,
               stock: p.stock,
               image: p.imageUrl,
               description: shopifyProd?.description || "",
               variants: prodVariants
            };
         }),
         duration: seconds
      };

     // Sync drop via local storage directly across tabs (immediate sync for testing)
     localStorage.setItem('7h_flash_drop', JSON.stringify({ ...payload, ts: Date.now() }));

     // BroadcastChannel: fires instantly on the fan page tab
     bcRef.current?.postMessage({ type: 'FLASH_DROP', payload });
     
     // Global broadcast if checked
     if (globalDrop) {
       const globalBc = new BroadcastChannel('7h_live_global');
       globalBc.postMessage({ type: 'FLASH_DROP', payload });
       setTimeout(() => globalBc.close(), 100);
     }
     
     // Also fire the canonical websocket broadcast for cross-device connections
     try {
       supabase.channel('live_events').send({
         type: 'broadcast',
         event: 'flash_drop',
         payload
       });
     } catch (e) {
       console.error("Supabase Flash Drop Broadcast Error:", e);
     }

     setActiveDrop({
       products: [...selectedProducts],
       timeLeft: seconds,
       totalDuration: seconds
     });
  };

  const cancelFlashDrop = () => {
    localStorage.removeItem('7h_flash_drop');
    setActiveDrop(null);
    bcRef.current?.postMessage({ type: 'CANCEL_FLASH_DROP' });
    if (globalDrop) {
      const globalBc = new BroadcastChannel('7h_live_global');
      globalBc.postMessage({ type: 'CANCEL_FLASH_DROP' });
      setTimeout(() => globalBc.close(), 100);
    }
    try {
      supabase.channel('live_events').send({
        type: 'broadcast',
        event: 'cancel_flash_drop'
      });
    } catch (e) {
      console.error("Supabase Cancel Broadcast Error:", e);
    }
  };

  const updateGlobalBanner = async () => {
    setBannerUpdating(true);
    try {
      await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: bannerActive, text: bannerText, link: bannerLink })
      });
      alert('Global Announcement Banner Updated!');
    } catch (e) {
      alert('Failed to update banner.');
    }
    setBannerUpdating(false);
  };

  if (isLoading) return <div className="min-h-screen bg-[#050508]" />;

  const activeProduct = shopifyProducts.find(p => p.id === selectedProductId) || shopifyProducts[0];
  const pName = activeProduct?.title || '7TH HEAVEN HOODIE 2026';
  const pPrice = activeProduct ? activeProduct.variants.edges[0].node.price.amount : '45.00';
  const pStock = activeProduct ? (activeProduct.quantityAvailable || 0) : inventoryQty;
  const pImageUrl = activeProduct?.images?.edges?.[0]?.node?.url || '/images/mockups/merch-hoodie.png';

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-[#ec4899]/30 pt-20">
      
      {/* ─── EXACT HEADER LAYOUT ─── */}
      <header className="border-b border-white/[0.04] bg-[#050508]/50">
        <div className="site-container py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center text-xl font-bold border border-purple-500 relative">
              {displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'MS'}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold italic tracking-tight">{displayName}</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-black uppercase tracking-widest rounded flex items-center gap-1">🇮🇹 Crew</span>
              </div>
              <span className="text-xs text-white/40">{email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="site-container py-8 space-y-6">

        {/* ─── LIVE BROADCAST & FEED CENTER (COLLAPSIBLE BOX) ─── */}
        <div className="bg-[#111116]/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
           {/* Accordion Toggle Header */}
           <div 
             onClick={() => setIsBroadcastPanelCollapsed(!isBroadcastPanelCollapsed)}
             className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-[#181820] cursor-pointer select-none hover:bg-[#1f1f2a] transition-all group"
           >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl transition-transform group-hover:scale-105">🎥</div>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div>
                       <h3 className="text-sm font-black italic tracking-wide text-white">
                          Live Broadcast & Feed Center
                       </h3>
                       <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-0.5">
                          Stream Feed, Chat, Moderation, Merch Drops & Dashboard Controls
                       </p>
                    </div>
                    
                    {/* Live/Offline status pill button in the feed container */}
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 border text-xs font-bold uppercase tracking-widest ${isLive ? 'bg-red-900/30 border-red-500/30 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-white/40'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
                      <span>{isLive ? `LIVE - ${viewerCount} VIEWERS` : 'OFFLINE'}</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-xs font-bold text-white/40 uppercase tracking-wider hidden sm:inline">
                   {isBroadcastPanelCollapsed ? 'Expand Feed Box' : 'Collapse Feed Box'}
                 </span>
                 <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 transition-transform duration-300 ${isBroadcastPanelCollapsed ? 'rotate-180' : ''}`}>
                    ▼
                 </div>
              </div>
           </div>

           {/* Collapsible Content */}
           {!isBroadcastPanelCollapsed && (
              <div className="p-6 space-y-6 bg-black/40">
                {/* Switch Feed and Fan page links moved from header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#14141c]/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/50 uppercase font-black tracking-wider font-sans">Switch Dashboard Feed:</span>
                    <select 
                      className="bg-[#1c1c24] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500 hover:bg-white/5 transition-colors cursor-pointer"
                      onChange={(e) => { if (e.target.value) window.location.href = e.target.value; }}
                      value={`/crew-${defaultMemberId || memberSlug}`}
                    >
                      {Object.values(MEMBER_SEEDS).map(member => (
                        <option key={member.id} value={`/crew-${member.id}`}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Link
                    href={`/live/${defaultMemberId || memberSlug}`}
                    target="_blank"
                    className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
                  >
                    <span>See Fan Feed Page</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-white/50 text-sm uppercase tracking-widest font-black">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  Crew Broadcast <span className="text-white/20 px-2">·</span> <span className="text-xs">{viewerCount} viewers</span>
                </div>

        {/* Callout Link - Only visible when stream is LIVE */}
        {isLive && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-transparent border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
              <p className="text-xs flex flex-col sm:flex-row items-center gap-1.5 font-black text-emerald-400 uppercase tracking-[0.2em] mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                Fan Watch Link — Share with your audience
              </p>
              <p className="text-sm font-mono text-emerald-300/90 select-all relative z-10 block break-all">
                {`http://localhost:3000/live/${defaultMemberId || memberSlug}`}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href={`/live/${defaultMemberId || memberSlug}`} target="_blank" className="flex-1 sm:flex-none text-center px-4 py-2 sm:py-1.5 bg-white/5 hover:bg-white/15 text-emerald-300 hover:text-white text-xs font-bold uppercase tracking-widest rounded border border-emerald-500/20 hover:border-emerald-500/50 transition-colors">
                Open <span className="ml-0.5">→</span>
              </Link>
              <button onClick={() => navigator.clipboard.writeText(`http://localhost:3000/live/${defaultMemberId || memberSlug}`)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#05110d] text-xs font-black uppercase tracking-widest rounded shadow-[0_0_10px_rgba(16,185,129,0.4)] hover:shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all cursor-pointer">
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* ─── VIDEO + CHAT GRID (Exactly like the old one) ─── */}
        <div className="flex bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl h-[600px]">
          
          {/* VIDEO PLAYER (Left side) */}
          <div className="flex-1 relative bg-black group min-w-0">
            {(userId && isLive) ? (
              <LiveKitStream 
                room={`live_${userId.toString().toLowerCase().replace(/\s+/g, '_')}`} 
                username={displayName} 
                isPublisher={true} 
                onDisconnected={() => {
                  console.log("Remote termination detected");
                  setIsLive(false);
                  localStorage.setItem(LS('is_live'), 'false');
                }}
                className="absolute inset-0 z-0" 
              />
            ) : (
              <div className="absolute inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center border border-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
                    <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="rgba(255,255,255,0.2)"/>
                  </svg>
                </div>
                <h3 className="text-white/40 font-bold tracking-widest uppercase text-sm mb-1">Camera Standby</h3>
                <p className="text-white/20 text-xs text-center max-w-[200px]">Click GO LIVE above to start your camera and begin broadcasting.</p>
              </div>
            )}
            
            {/* Floating Emojis overlay synced from fans */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[15]">
              {floating.map(item => (
                <span
                  key={item.id}
                  className="absolute text-4xl animate-float-up drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  style={{
                    left: `${item.x}%`,
                    bottom: '8%',
                    animationDuration: '2800ms',
                  }}
                >
                  {item.emoji}
                </span>
              ))}
            </div>

            {/* Live Indicator overlay — only visible when actually broadcasting */}
            {isLive && (
            <div className="absolute top-4 left-4 flex gap-2 z-20">
               <div className="px-3 py-1 bg-red-600 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Live</span>
               </div>
               <div className="px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full flex items-center gap-1.5 text-white/90">
                  <span className="text-xs font-medium">👁 {viewerCount}</span>
               </div>
               <div className="px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full flex items-center gap-1.5 text-white/90">
                  <span className="text-xs font-medium">⏱ {formatTime(elapsed)}</span>
               </div>
            </div>
            )}

            {/* Video Controls overlay — only when live */}
            {isLive && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-20 flex items-center justify-end gap-4 pointer-events-none">
              <button 
                onClick={attemptEndStream}
                disabled={toggling}
                className="shrink-0 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 bg-red-900/80 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white pointer-events-auto"
              >
                {toggling ? '...' : '● End Stream'}
              </button>
            </div>
            )}

            {/* Go Live CTA — bottom of video, above A/V controls */}
            {!isLive && (
            <div className="absolute inset-x-0 bottom-16 z-20 flex items-center justify-center">
              <button 
                onClick={attemptEndStream}
                disabled={toggling}
                className="px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all disabled:opacity-50 bg-[#ec4899] text-white hover:brightness-110 hover:scale-105 hover:shadow-[0_0_50px_rgba(236,72,153,0.7)] flex items-center gap-3"
              >
                <span className="w-3 h-3 bg-white rounded-full drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                {toggling ? 'Starting...' : 'Go Live'}
              </button>
            </div>
            )}
          </div>

          {/* CHAT PANEL (Right side) */}
          <div className="w-[400px] bg-[#0c0c11] border-l border-white/[0.05] flex flex-col shrink-0">
             <div className="p-4 border-b border-white/[0.05] flex items-center justify-between shrink-0">
                 <span className="text-xs font-black uppercase tracking-widest text-white/80">💭 Live Chat</span>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/40">
                   <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" /> {viewerCount} online
                   </div>
                   <span>·</span>
                   <span>{posts.length} msgs</span>
                </div>
             </div>

             {/* 📌 Pinned Message Alert */}
             {activePinned && (
               <div className="px-4 py-3 border-b border-white/[0.06] bg-gradient-to-r from-emerald-500/10 to-transparent shrink-0 relative group">
                 <div className="flex items-start gap-2.5 pr-6">
                   <span className="text-sm shrink-0 mt-0.5">📌</span>
                   <div className="min-w-0 flex-1">
                     <p className="text-white/90 text-sm leading-snug font-medium">
                       {activePinned.text}
                     </p>
                     <p className="text-emerald-400/80 text-xs mt-1 font-bold uppercase tracking-widest">
                       PINNED BY {activePinned.by}
                     </p>
                   </div>
                 </div>
                 <button 
                  onClick={() => { setActivePinned(null); localStorage.setItem('7h_global_pinned', 'null'); }} 
                  className="absolute top-3 right-3 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Unpin Message"
                 >
                    ×
                 </button>
               </div>
             )}

             <div ref={chatScrollRef} data-lenis-prevent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col min-h-0">
                {posts.map(p => {
                  const isSystem = !p.account || p.isSystem;
                  if (isSystem) {
                    const isWarning = p.text.includes('warned') || p.text.includes('Warning');
                    const isBan = p.text.includes('banned');
                    const bg = isWarning 
                      ? 'rgba(245,158,11,0.1)' 
                      : isBan 
                      ? 'rgba(239,68,68,0.1)' 
                      : 'rgba(255,255,255,0.05)';
                    const color = isWarning 
                      ? '#fbbf24' 
                      : isBan 
                      ? '#f87171' 
                      : 'rgba(255,255,255,0.35)';
                    const border = isWarning 
                      ? '1px solid rgba(245,158,11,0.2)' 
                      : isBan 
                      ? '1px solid rgba(239,68,68,0.2)' 
                      : '1px solid transparent';
                    return (
                      <div key={p.id} className="flex items-center justify-center py-1">
                        <span
                          className="px-3 py-1 rounded-full text-2xs uppercase tracking-wider font-bold"
                          style={{
                            background: bg,
                            color: color,
                            border: border,
                            fontSize: 10,
                          }}
                        >
                          {p.text}
                        </span>
                      </div>
                    );
                  }

                  const username = p.account?.displayName || p.account?.name || 'Anonymous';
                  const isUserBanned = bannedUsers.has(username);
                  const isUserWarned = warnedUsers.has(username);

                  return (
                    <div key={p.id} className="flex gap-3 relative group">
                       <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0 shadow-lg" style={{ backgroundColor: p.account?.color || getAvatarColor(username) }}>
                          {p.account?.avatar || 'C'}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                             <p className="text-sm font-bold uppercase tracking-tight" style={{ color: p.account?.color || getAvatarColor(username) }}>{username}</p>
                             {(p.account?.role === 'crew' || p.account?.role === 'admin') && (
                                <span className="px-1 py-0.5 bg-[#8a1cfc]/20 border border-[#8a1cfc]/40 rounded text-2xs font-black uppercase tracking-wider text-[#c084fc]">
                                  CREW
                                </span>
                             )}
                             {isUserWarned && (
                                <span className="px-1 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-2xs font-black uppercase tracking-wider text-amber-400">
                                  WARNED
                                </span>
                             )}
                             {isUserBanned && (
                                <span className="px-1 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-2xs font-black uppercase tracking-wider text-red-400">
                                  BANNED
                                </span>
                             )}
                          </div>
                          <p className="text-sm text-white/90 leading-snug break-words" style={{ textDecoration: isUserBanned ? 'line-through' : 'none', opacity: isUserBanned ? 0.5 : 1 }}>{p.text}</p>
                       </div>

                       {/* Moderation Actions */}
                       {p.account?.role !== 'crew' && p.account?.role !== 'admin' && (
                         <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[#111116]/95 border border-white/10 rounded-lg p-1 shadow-lg z-20">
                           <button
                             onClick={() => handleWarn(username)}
                             title={isUserWarned ? "Unwarn User" : "Warn User"}
                             className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-amber-500/15 text-amber-500 hover:scale-105 transition-all cursor-pointer"
                           >
                             ⚠️
                           </button>
                           <button
                             onClick={() => handleBan(username)}
                             title={isUserBanned ? "Unban User" : "Ban User"}
                             className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-red-500/15 text-red-500 hover:scale-105 transition-all cursor-pointer"
                           >
                             🚫
                           </button>
                           <button
                             onClick={() => handleDeleteMsg(p.id)}
                             title="Delete Message"
                             className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-white/10 text-white/40 hover:scale-105 transition-all cursor-pointer"
                           >
                             🗑
                           </button>
                            <button
                              onClick={() => handleKick(username)}
                              title="Remove Fan Completely"
                              className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-red-500/20 text-red-500 hover:scale-105 transition-all cursor-pointer"
                            >
                              🚪
                            </button>
                         </div>
                       )}
                    </div>
                  );
                })}
             </div>

             <div className="p-4 bg-[#111116] border-t border-white/[0.05] space-y-3 shrink-0">
                {/* Pin message input */}
                <div className="relative">
                   <input 
                     value={globalPinText}
                     onChange={e => setGlobalPinText(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleGlobalPinBox()}
                     placeholder="Pin a message to all fans..."
                     className="w-full bg-emerald-500/[0.06] border border-emerald-500/20 rounded-full px-5 py-2.5 pr-28 text-sm text-white placeholder:text-emerald-400/40 outline-none focus:border-emerald-500/50 transition-colors"
                   />
                   <div className="absolute right-2 top-1.5 bottom-1.5 flex items-center z-10">
                      <button 
                        onClick={handleGlobalPinBox} 
                        disabled={!globalPinText.trim()} 
                        className="h-full px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs rounded-full transition-colors disabled:opacity-30 disabled:bg-white/10 disabled:text-white/30"
                      >
                        📌 PIN
                      </button>
                   </div>
                </div>
                {/* Chat message input */}
                <div className="relative">
                   {showEmojiPicker && (
                     <div className="absolute bottom-full right-0 mb-2 p-2 bg-[#1c1c24] border border-white/10 rounded-xl shadow-2xl flex flex-wrap gap-1 w-64 z-50">
                       {COMMON_EMOJIS.map(em => (
                         <button
                           key={em}
                           onClick={() => { setContent(prev => prev + em); setShowEmojiPicker(false); }}
                           className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-lg transition-colors"
                         >
                           {em}
                         </button>
                       ))}
                     </div>
                   )}
                   <input 
                     value={content}
                     onChange={e => setContent(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handlePost()}
                     placeholder="Type a message..."
                     className="w-full bg-[#1c1c24] border border-white/5 rounded-full px-5 py-2.5 pr-24 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#ec4899]/50 transition-colors"
                   />
                   <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                      <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white/50 hover:text-white"
                        title="Add Emoji"
                      >
                         😊
                      </button>
                      <button onClick={handlePost} disabled={!content.trim() || posting} className="w-9 h-9 bg-[#2a2a35] hover:bg-[#ec4899] text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50" title="Send Chat">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      </button>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* ─── BOTTOM RIGHT CARDS (Merch & Raffle) ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 w-full gap-6 mt-6">
           
           {/* FLASH MERCH DROP */}
           <div className="flex-1 bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/[0.05] flex items-center gap-3 bg-[#181820]">
                 <div className="w-10 h-10 rounded-xl bg-[#ec4899]/20 border border-[#ec4899]/30 flex items-center justify-center text-xl">🛍️</div>
                 <div>
                    <h3 className="text-sm font-black italic tracking-wide text-white">Flash Merch Drop</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Limited time, limited stock</p>
                 </div>
              </div>
              <div className="p-4">
                 {activeDrop ? (
                    <div className="space-y-4">
                       {/* Submitted Status Header */}
                       <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Flash Sale Active</span>
                          </div>
                          <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Submitted Successfully</span>
                       </div>

                       {/* Countdown timer */}
                       <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-center">
                          <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-1">Time Remaining</p>
                          <p className="text-3xl font-black font-mono text-[#ec4899] tracking-wider animate-pulse">
                             {Math.floor(activeDrop.timeLeft / 60)}m {activeDrop.timeLeft % 60}s
                          </p>
                          <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                             <div 
                                className="h-full bg-gradient-to-r from-[#ec4899] to-pink-500 transition-all duration-1000"
                                style={{ width: `${(activeDrop.timeLeft / activeDrop.totalDuration) * 100}%` }}
                             />
                          </div>
                       </div>

                       {/* Product List */}
                       <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          <p className="text-xs font-black tracking-widest uppercase text-white/30">Active Products</p>
                          {activeDrop.products.map(p => (
                             <div key={p.id} className="flex gap-3 p-2.5 bg-[#1c1c24] rounded-xl border border-white/5 items-center justify-between">
                                <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded bg-black object-cover shrink-0" onError={(e) => { e.currentTarget.src = '/images/mockups/merch-hoodie.png'; }} />
                                <div className="flex-1 min-w-0">
                                   <p className="text-xs font-bold truncate text-white" title={p.title}>{p.title}</p>
                                   <p className="text-[10px] text-white/40 mt-0.5">Shopify: {p.stock} left · Orig: ${p.shopifyPrice}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                   <p className="text-xs font-black text-[#ec4899] font-mono">${p.flashPrice}</p>
                                </div>
                             </div>
                          ))}
                       </div>

                       {/* Actions */}
                       <div className="pt-2">
                          <button 
                             type="button"
                             onClick={cancelFlashDrop}
                             className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 hover:text-red-400 text-xs font-black tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                             🚫 Cancel Flash Drop
                          </button>
                       </div>
                    </div>
                 ) : (
                    <>
                       <div className="flex items-center justify-between mb-3 text-xs font-black uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                             <span className="text-[#ec4899]">■ LIVE SHOPIFY INVENTORY</span>
                             <a 
                                href={`https://admin.shopify.com/store/${(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '7th-heaven-7012.myshopify.com').replace(/"/g, '').split('.')[0]}/products`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-white/40 hover:text-[#ec4899] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-white/10 hover:border-[#ec4899]/30 bg-white/[0.02] hover:bg-[#ec4899]/5 px-2 py-0.5 rounded"
                                title="Go to Shopify Products Admin"
                             >
                                Shopify Admin ↗
                             </a>
                          </div>
                          <button onClick={() => window.location.reload()} className="text-white/30 hover:text-white flex items-center gap-1">↻ Refresh</button>
                       </div>
                       
                       <div className="mb-4">
                          <select 
                             value=""
                             onChange={e => {
                                if (e.target.value) {
                                   addProductToDrop(e.target.value);
                                   e.target.value = "";
                                }
                             }}
                             className="w-full bg-black border border-[#ec4899]/30 rounded-xl p-3 text-white font-bold text-sm outline-none focus:border-[#ec4899] cursor-pointer appearance-none"
                             style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ec4899%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                          >
                             <option value="" className="text-white/40">✚ Select product to add to Flash Drop...</option>
                             {shopifyProducts.map(p => (
                                <option key={p.id} value={p.id} disabled={selectedProducts.some(sp => sp.id === p.id)}>
                                   {p.title} — ${p.variants?.edges?.[0]?.node?.price?.amount} ({(p.quantityAvailable || 0)} in stock)
                                </option>
                             ))}
                          </select>
                       </div>
                       
                       <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                          <p className="text-xs font-black tracking-widest uppercase text-white/30 mb-2">Selected Products & Flash Sale Prices</p>
                          {selectedProducts.length === 0 ? (
                             <div className="text-center py-6 bg-[#1c1c24]/50 border border-white/5 rounded-xl text-white/30 italic text-xs">
                               No products selected yet. Select a product above.
                             </div>
                          ) : (
                             selectedProducts.map(p => (
                                <div key={p.id} className="flex gap-4 p-3 bg-[#1c1c24] rounded-xl border border-white/5 items-center justify-between">
                                   <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded bg-black object-cover shrink-0" onError={(e) => { e.currentTarget.src = '/images/mockups/merch-hoodie.png'; }} />
                                   <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold truncate pr-2 text-white" title={p.title}>{p.title}</p>
                                      <p className="text-[10px] text-white/40 mt-0.5">Shopify: {p.stock} left · Orig: ${p.shopifyPrice}</p>
                                   </div>
                                   <div className="flex items-center gap-2 shrink-0">
                                      <div className="flex items-center bg-black/60 border border-white/10 rounded-lg px-2 py-1 max-w-[90px]">
                                         <span className="text-white/40 text-[10px] mr-1">$</span>
                                         <input 
                                            type="text" 
                                            value={p.flashPrice} 
                                            onChange={e => updateProductFlashPrice(p.id, e.target.value)} 
                                            className="bg-transparent text-white font-mono font-black text-xs outline-none w-full text-right" 
                                            placeholder="Price"
                                         />
                                      </div>
                                      <button 
                                         onClick={() => removeProductFromDrop(p.id)}
                                         className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer border-none"
                                         title="Remove from drop"
                                      >
                                         ✕
                                      </button>
                                   </div>
                                </div>
                             ))
                          )}
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                           <p className="text-xs font-black tracking-widest uppercase text-white/30 mb-2">Total Products</p>
                           <div className="w-full bg-[#1c1c24] border border-white/10 rounded-lg p-2.5 text-center text-xs font-bold font-mono">{selectedProducts.length}</div>
                         </div>
                         <div>
                            <p className="text-xs font-black tracking-widest uppercase text-white/30 mb-2">Duration</p>
                            <div className="grid grid-cols-4 gap-1">
                              {['2m', '5m', '10m', '15m'].map((d) => (
                                <button 
                                  key={d}
                                  type="button"
                                  onClick={() => setDropDurationStr(d)}
                                  className={`text-center py-2 rounded border text-[10px] font-bold ${dropDurationStr === d ? 'bg-[#ec4899]/20 border-[#ec4899] text-[#ec4899]' : 'bg-[#1c1c24] border-white/10 text-white/40 hover:bg-white/5'}`}
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          </div>
                       </div>

                       <label className="flex items-center gap-2 mb-4 cursor-pointer group">
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${globalDrop ? 'bg-[#ec4899] border-[#ec4899]' : 'border-white/20 group-hover:border-white/40 bg-black'}`}>
                           {globalDrop && <span className="text-white text-[10px] font-bold">✓</span>}
                         </div>
                         <input type="checkbox" className="hidden" checked={globalDrop} onChange={e => setGlobalDrop(e.target.checked)} />
                         <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">Drop on ALL live streams (Global)</span>
                       </label>

                       <button 
                         type="button"
                         onClick={launchFlashDrop}
                         className="w-full py-4 bg-gradient-to-r from-[#ec4899] to-pink-600 hover:brightness-110 text-white text-sm font-black italic tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all"
                       >
                          🔥 Launch Flash Drop
                       </button>

                       <button 
                         type="button"
                         onClick={() => {
                           const testPayload = { name: '7TH HEAVEN HOODIE 2026', price: '45.00', stock: 0, image: '/images/mockups/merch_hoodie.png', duration: 300 };
                           localStorage.setItem('7h_flash_drop', JSON.stringify({ ...testPayload, ts: Date.now() }));
                           try { supabase.channel('live_events').send({ type: 'broadcast', event: 'flash_drop', payload: testPayload }) } catch {}
                         }}
                         className="w-full mt-2 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 text-xs font-black tracking-widest uppercase rounded-xl transition-all"
                       >
                          [TESTING] Simulate Sold Out Merch Drop
                       </button>
                    </>
                 )}
              </div>
           </div>

           {/* LIVE RAFFLE (Rebuilt as requested) */}
           <div className="flex-1 bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 border-b border-white/[0.05] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#181820]">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">🎟️</div>
                     <div>
                        <h3 className="text-sm font-black italic tracking-wide text-white">Live Event Raffle</h3>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{raffleStatus === 'idle' ? 'Standby' : raffleStatus === 'open' ? 'Accepting Entries' : raffleStatus === 'drawing' ? 'Drawing Winner...' : 'Complete'}</p>
                     </div>
                  </div>
                  {raffleStatus !== 'idle' && (
                    <button 
                       type="button"
                       onClick={cancelRaffle} 
                       className="px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-colors border bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                    >
                       {raffleStatus === 'complete' ? 'Clear Results' : 'Cancel Raffle'}
                    </button>
                  )}
               </div>
              
              <div className="p-4 flex-1 flex flex-col gap-5">
                 
                 {/* Multi-Raffle Queue Configuration */}
                 <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                   <div className="space-y-3 min-w-0">
                      {raffleQueue.map((item, idx) => (
                        <div key={idx} className={`flex flex-col gap-1.5 relative ${idx !== activeQueueIndex && (raffleStatus !== 'idle' && raffleStatus !== 'complete') ? 'opacity-30 pointer-events-none' : ''}`}>
                           {/* Show indicator if it's the currently active raffle */}
                           {idx === activeQueueIndex && raffleStatus !== 'idle' && (
                             <div className="absolute -left-5 top-7 text-amber-500 animate-pulse text-xs">▶</div>
                           )}

                           <div className="flex gap-2 items-end">
                            {/* Input 1: Prize Name */}
                            <div className="flex-1 flex flex-col gap-1.5">
                               {idx === 0 && <label className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa]">1. Prize Name</label>}
                               <input 
                                 type="text" 
                                 disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                                 value={item.name}
                                 onChange={(e) => updateQueueItem(idx, 'name', e.target.value)}
                                 placeholder="e.g. VIP Meet & Greet Pass"
                                 className={`w-full bg-[#1c1c24] border rounded-md px-3 py-2 text-xs text-white outline-none transition-colors ${idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing') ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-white/10 focus:border-[#a78bfa]'}`}
                               />
                            </div>

                            {/* Input 2: Entries Needed */}
                            <div className="w-20 flex flex-col gap-1.5 relative">
                               {idx === 0 && <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 truncate">2. Entries</label>}
                               <input 
                                 type="number" 
                                 min="1"
                                 disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                                 value={item.min || ''}
                                 onChange={(e) => updateQueueItem(idx, 'min', parseInt(e.target.value) || 1)}
                                 className={`w-full bg-[#1c1c24] border rounded-md px-3 py-2 text-xs text-amber-400 font-bold outline-none transition-colors text-center ${idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing') ? 'border-amber-500/50' : 'border-white/10 focus:border-amber-500'}`}
                               />
                               {/* Floating counter during active raffle */}
                               {idx === activeQueueIndex && raffleStatus !== 'idle' && (
                                 <div className="absolute -top-5 right-0 text-[10px] text-amber-500 font-black uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 whitespace-nowrap overflow-visible z-10 w-auto text-right">
                                   {raffleEntrants.length} / {item.min} Entries
                                 </div>
                               )}
                            </div>

                            {/* Input 3: Prize Qty */}
                            <div className="w-14 flex flex-col gap-1.5">
                               {idx === 0 && <label className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa] truncate">3. Qty</label>}
                               <input 
                                 type="number" 
                                 min="1"
                                 disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                                 value={item.qty || ''}
                                 onChange={(e) => updateQueueItem(idx, 'qty', parseInt(e.target.value) || 1)}
                                 className={`w-full bg-[#1c1c24] border rounded-md px-3 py-2 text-xs text-white outline-none transition-colors text-center ${idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing') ? 'border-amber-500/50' : 'border-white/10 focus:border-[#a78bfa]'}`}
                               />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5">
                              <button 
                                type="button"
                                onClick={() => startSpecificRaffle(idx)}
                                disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                                className={`h-[34px] px-4 shrink-0 flex items-center justify-center border text-2xs font-black uppercase tracking-wider rounded-md transition-all ${
                                  (raffleStatus === 'idle' || raffleStatus === 'complete')
                                  ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' 
                                  : idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing')
                                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-500' 
                                    : 'border-white/10 text-white/30 opacity-30 shadow-none' 
                                }`}
                              >
                                {idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing') ? 'Running' : 'Start'}
                              </button>

                              <button 
                                type="button"
                                onClick={() => removeQueueItem(idx)}
                                disabled={raffleStatus !== 'idle' || raffleQueue.length === 1}
                                className="h-[34px] w-[34px] shrink-0 flex items-center justify-center border border-red-500/10 hover:border-red-500/40 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-0 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                           </div>
                        </div>
                      ))}
                      
                      <button 
                         type="button"
                         onClick={addQueueItem}
                         disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                         className="w-full py-2 border border-dashed border-white/20 text-white/40 text-xs font-bold uppercase tracking-widest rounded-md hover:border-white/40 hover:text-white/80 transition-colors disabled:opacity-30"
                       >
                         + Add Another Raffle To Queue
                       </button>
                   </div>
                   </div>

                   {raffleStatus === 'open' && (
                      <div className="mt-2 text-center p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl">
                         <p className="text-lg font-black text-white italic mb-1">{raffleEntrants.length} <span className="text-xs text-white/50">/ {raffleMinEntrants}</span></p>
                         <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-0.5">Fan entries collected</p>
                         <div className="flex flex-col gap-2 mt-4 px-2">
                          <div className="flex gap-2">
                             <button type="button" onClick={addFakeEntry} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-widest transition-colors">+ Fake Entry</button>
                             <button type="button" onClick={addLotsOfFakeEntries} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-widest transition-colors">+ Multi Fake</button>
                          </div>
                          <button 
                            type="button"
                            onClick={rigWinForMe} 
                            className="w-full py-2 bg-emerald-500/10 hover:bg-[#10b981]/25 border border-[#10b981]/30 rounded-lg text-xs font-black text-emerald-400 uppercase tracking-[0.2em] transition-all"
                          >
                            🧪 TEST: Rig Win for Me
                          </button>
                       </div>
                      </div>
                   )}

                   {/* Draw Action */}
                   <div className="mt-auto">
                      {raffleStatus !== 'complete' ? (
                         <button 
                           type="button"
                           onClick={drawWinner}
                           disabled={raffleStatus !== 'open' || raffleEntrants.length < raffleMinEntrants}
                           className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-black text-sm font-black italic tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-30 disabled:grayscale"
                         >
                           {raffleStatus === 'drawing' ? '🎰 Rolling the dice...' : '🎰 Draw Winner'}
                         </button>
                      ) : (
                         <div className="bg-[#1c1c24] border border-amber-500/30 rounded-xl p-4 text-center">
                           <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 shadow-[0_0_15px_rgba(245,158,11,0.5)]">🎉</div>
                           <h4 className="text-lg font-black text-white italic">Winner Selected</h4>
                           <div className="flex flex-col gap-2 justify-center mt-3">
                             {drawnWinners.map((w, i) => (
                                <div key={w.id} className="flex items-center justify-between px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30">
                                  <span className="text-sm font-black">{w.name}</span>
                                  <span className="text-xs font-mono font-bold tracking-widest text-amber-300 font-sans">PIN: {winnerPins[i] || '0000'}</span>
                                </div>
                             ))}
                           </div>
                           {raffleAutoRestartCountdown !== null && (
                              <p className="text-xs font-bold text-white/40 mt-3 pt-3 border-t border-white/10">
                                Next raffle auto-starts in <span className="text-amber-500 font-mono text-xs">{Math.floor(raffleAutoRestartCountdown / 60)}:{(raffleAutoRestartCountdown % 60).toString().padStart(2, '0')}</span>
                              </p>
                           )}
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>

        {/* ─── CHAT MODERATION PANEL (Under Video & Chat Box) ─── */}
        <div className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
           <div className="p-4 border-b border-white/[0.05] flex items-center gap-3 bg-[#181820]">
              <div className="w-10 h-10 rounded-xl bg-[#ec4899]/20 border border-[#ec4899]/30 flex items-center justify-center text-xl">🛡️</div>
               <div>
                  <h3 className="text-sm font-black italic tracking-wide text-white">Chat Moderation & Policies</h3>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Custom Flagged Keywords & Filters</p>
               </div>
            </div>
            
            <div className="p-4 space-y-4">
               <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="flex-1 min-w-0 w-full space-y-2">
                     <h4 className="text-xs font-black uppercase tracking-widest text-[#ec4899]">🔍 Custom Flagged Keywords</h4>
                     <p className="text-white/40 text-xs leading-relaxed font-sans font-semibold">
                        Add specific keywords, slurs, or phrases. Any message containing these (case-insensitive substring match) will be automatically flagged on all live feeds.
                     </p>

                     <form onSubmit={handleAddCustomWord} className="flex gap-2 max-w-md mt-2">
                        <input
                          type="text"
                          value={newCustomWord}
                          onChange={e => setNewCustomWord(e.target.value)}
                          placeholder="e.g. ticket-scalper"
                          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#ec4899]/50 font-bold"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#ec4899] hover:bg-[#d83f87] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                          Add Keyword
                        </button>
                     </form>
                  </div>

                  <div className="w-full lg:w-[450px] shrink-0 space-y-2">
                     <p className="text-xs font-black uppercase tracking-widest text-white/40">Active Custom Filters</p>
                     {customWords.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                           <p className="text-white/20 text-xs italic">No custom keywords configured.</p>
                        </div>
                     ) : (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                           {customWords.map(word => (
                              <span
                                key={word}
                                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/80"
                              >
                                 <span>{word}</span>
                                 <button
                                   type="button"
                                   onClick={() => handleRemoveCustomWord(word)}
                                   className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                 >
                                    &times;
                                 </button>
                              </span>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

        {/* ─── LIVE STREAM PERFORMANCE & ANALYTICS CARD ─── */}
        <div className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
           <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#181820]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xl">📊</div>
                 <div>
                    <h3 className="text-sm font-black italic tracking-wide text-white">Live Stream Performance & Chat Analytics</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Real-time Sales and Engagement Metrics</p>
                 </div>
              </div>
              {isLive && (
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                    ● Live Tracking
                 </span>
              )}
           </div>

           <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 
                 {/* store sales card */}
                 <div className="p-4 bg-gradient-to-br from-[#291e34] to-[#0c0c11] border border-purple-500/20 rounded-xl shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                    <p className="text-2xs font-black uppercase tracking-widest text-purple-400">🛍️ Store Sales Revenue</p>
                    <p className="text-2xl font-black mt-2 text-white font-mono">
                      ${orders.filter(o => o.source === 'Store').reduce((sum, o) => sum + parseFloat(o.price.replace(/[$,]/g, '') || '0'), 0).toFixed(2)}
                    </p>
                    <p className="text-3xs font-bold text-white/30 uppercase tracking-wider mt-1.5">
                      {orders.filter(o => o.source === 'Store').length} purchases
                    </p>
                 </div>

                 {/* flash drop sales card */}
                 <div className="p-4 bg-gradient-to-br from-[#341e29] to-[#0c0c11] border border-pink-500/20 rounded-xl shadow-lg relative overflow-hidden group hover:border-pink-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
                    <p className="text-2xs font-black uppercase tracking-widest text-pink-400">⚡ Flash Drop Sales</p>
                    <p className="text-2xl font-black mt-2 text-white font-mono">
                      ${orders.filter(o => o.source === 'Flash Drop').reduce((sum, o) => sum + parseFloat(o.price.replace(/[$,]/g, '') || '0'), 0).toFixed(2)}
                    </p>
                    <p className="text-3xs font-bold text-white/30 uppercase tracking-wider mt-1.5">
                      {orders.filter(o => o.source === 'Flash Drop').length} purchases during live drops
                    </p>
                 </div>

                 {/* raffle claims card */}
                 <div className="p-4 bg-gradient-to-br from-[#292212] to-[#0c0c11] border border-amber-500/20 rounded-xl shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                    <p className="text-2xs font-black uppercase tracking-widest text-amber-500">🏆 Raffle Claims</p>
                    <p className="text-2xl font-black mt-2 text-white font-mono">
                      {orders.filter(o => o.source === 'Raffle').length}
                    </p>
                    <p className="text-3xs font-bold text-white/30 uppercase tracking-wider mt-1.5">prizes claimed by fans</p>
                 </div>

                 {/* viewers card */}
                 <div className="p-4 bg-gradient-to-br from-[#12211e] to-[#0c0c11] border border-emerald-500/20 rounded-xl shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                    <p className="text-2xs font-black uppercase tracking-widest text-emerald-400">👁️ Live Viewers</p>
                    <p className="text-2xl font-black mt-2 text-white font-mono">{viewerCount}</p>
                    <p className="text-3xs font-bold text-white/30 uppercase tracking-wider mt-1.5">{isLive ? "Watching live right now" : "Offline"}</p>
                 </div>

              </div>
           </div>
        </div>

        </div>
      )}
    </div>
      
        {/* ─── YOUR WORK SCHEDULE CARD ─── */}
          {(() => {
            const myShifts = crewSchedules.filter(s => s.crewId === slug);
            const pendingShifts = myShifts.filter(s => s.approvalStatus === 'pending');
            const activeShifts = myShifts;
            const coverageShifts = crewSchedules.filter(s => 
              s.isCoverageRequested === true &&
              s.crewId !== slug &&
              isQualifiedForRole(slug, s.role)
            );

            return (
              <>
                <div className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
                   <div 
                     onClick={() => setIsScheduleCollapsed(!isScheduleCollapsed)}
                     className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#181820] cursor-pointer select-none hover:bg-white/[0.02] transition-colors group"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl transition-transform group-hover:scale-105">📅</div>
                         <div>
                            <h3 className="text-sm font-black italic tracking-wide text-white">Your Work Schedule</h3>
                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-0.5">Assigned shifts, locations & responsibilities</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmailSubject('General Scheduling Inquiry');
                            setEmailMessage(`Hi Admin,\n\n[Your message here]`);
                            setIsEmailModalOpen(true);
                          }}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-xs font-black uppercase tracking-widest cursor-pointer border-none transition-colors flex items-center gap-1"
                        >
                          📧 Contact Admins
                        </button>
                        {pendingShifts.length > 0 && (
                          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                            {pendingShifts.length} Pending
                          </span>
                        )}
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-black uppercase tracking-widest">
                          {activeShifts.length} Shifts
                        </span>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 transition-transform duration-300 ${isScheduleCollapsed ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                   </div>
                   {!isScheduleCollapsed && (
                      <div className="p-6">
                     {/* Calendar Feed Subscription Utility */}
                     <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between gap-4 flex-col sm:flex-row">
                       <div className="flex items-start gap-3">
                         <span className="text-lg mt-0.5">🗓️</span>
                         <div>
                           <p className="text-xs font-bold text-purple-300">Sync with Google & Apple Calendar</p>
                           <p className="text-[10px] text-white/50 mt-0.5">Subscribe to your personal live shift calendar feed to view updates on your phone.</p>
                         </div>
                       </div>
                       <button
                         onClick={() => {
                           const icsUrl = `${window.location.origin}/api/crew/calendar.ics?crewId=${slug}`;
                           navigator.clipboard.writeText(icsUrl);
                           alert("📅 Calendar subscription link copied to clipboard!\n\nPaste this URL into Google Calendar (Add by URL) or Apple Calendar (Calendar Subscription) to sync your shifts.");
                         }}
                         className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-black text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1.5 shrink-0"
                       >
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                         Copy Feed URL
                       </button>
                     </div>
  
                      {/* 🔄 Tab Switcher: My Schedule vs. Band Tour Events */}
                      <div className="grid grid-cols-2 gap-2 bg-black/25 p-1 border border-white/5 rounded-xl mb-6 shrink-0 font-sans">
                        <button
                          type="button"
                          onClick={() => setActiveScheduleTab('my_schedule')}
                          className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                            activeScheduleTab === 'my_schedule'
                              ? 'bg-amber-500 text-black shadow-sm font-bold'
                              : 'bg-transparent text-white/50 hover:text-white'
                          }`}
                        >
                          📅 My Shift Schedule ({activeShifts.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveScheduleTab('tour_events')}
                          className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                            activeScheduleTab === 'tour_events'
                              ? 'bg-amber-500 text-black shadow-sm font-bold'
                              : 'bg-transparent text-white/50 hover:text-white'
                          }`}
                        >
                          🎸 Band Tour Events ({tourDates.length})
                        </button>
                      </div>

                      {activeScheduleTab === 'my_schedule' ? (
                        activeShifts.length === 0 ? (
                          <div className="text-center py-8 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                             <p className="text-white/30 text-xs italic">You have no upcoming work shifts scheduled.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 font-sans">
                            {activeShifts.map((shift) => {
                              const dateObj = new Date(shift.date + 'T00:00:00');
                              const month = isNaN(dateObj.getTime()) ? 'JAN' : dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                              const dayNum = isNaN(dateObj.getTime()) ? '00' : dateObj.getDate();
                              const weekday = isNaN(dateObj.getTime()) ? 'Day' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
     
                              return (
                                <div 
                                  key={shift.id} 
                                  className={`p-4 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    shift.approvalStatus === 'pending'
                                      ? 'bg-gradient-to-r from-yellow-500/[0.03] to-black/50 border border-yellow-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:border-yellow-500/60'
                                      : 'bg-black/40 border border-white/10 hover:border-white/20'
                                  }`}
                                >
                                  {/* Date & Time Column */}
                                  <div className="flex items-center gap-3 shrink-0 min-w-[180px]">
                                    <div className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center text-center shrink-0 ${
                                      shift.approvalStatus === 'pending'
                                        ? 'bg-yellow-500/10 border-yellow-500/30'
                                        : 'bg-amber-500/10 border-amber-500/20'
                                    }`}>
                                      <span className={`text-[8px] font-black uppercase tracking-wider ${shift.approvalStatus === 'pending' ? 'text-yellow-400' : 'text-amber-400'}`}>{month}</span>
                                      <span className="text-base font-black text-white leading-none mt-0.5">{dayNum}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{weekday}</span>
                                      <span className="text-xs font-black text-amber-400 mt-0.5">Call Time: {shift.time}</span>
                                    </div>
                                  </div>
     
                                  {/* Role & Location Column */}
                                  <div className="flex-1 min-w-[180px]">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[8px] font-black uppercase tracking-wider rounded">
                                        {shift.role}
                                      </span>
                                      {(() => {
                                         const matchingVenue = venues.find(v => v.name.toLowerCase() === shift.location.toLowerCase());
                                         if (matchingVenue) {
                                           return (
                                             <button
                                               type="button"
                                               onClick={() => setSelectedVenuePopup(matchingVenue)}
                                               className="text-[11px] font-black text-cyan-400 hover:text-cyan-300 transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-0.5 hover:underline"
                                               title="Click to view venue load-in, parking & WiFi details"
                                             >
                                               📍 {shift.location} <span className="text-[8px] text-cyan-500/80">ℹ️</span>
                                             </button>
                                           );
                                         }
                                         return (
                                           <span className="text-[11px] font-black text-white/80">
                                             📍 {shift.location}
                                           </span>
                                         );
                                      })()}
                                      <button
                                        type="button"
                                        onClick={() => setActiveDiscussionDate(shift.date)}
                                        className="px-1.5 py-0.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer select-none"
                                        title="View show lineup acts and discuss details with crew"
                                      >
                                        💬 Lineup & Discuss
                                      </button>
                                    </div>
                                  </div>
     
                                  {/* Status Badge & Action Column */}
                                  <div className="shrink-0 min-w-[140px] text-left md:text-right flex items-center md:justify-end">
                                    {shift.approvalStatus === 'approved' || !shift.approvalStatus ? (
                                      <div className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider shrink-0 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                                          ✓ Confirmed
                                        </span>
                                        {shift.isCoverageRequested ? (
                                          <span className="px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider shrink-0 bg-purple-500/10 border-purple-500/30 text-purple-300 animate-pulse">
                                            ⏳ Coverage Requested
                                          </span>
                                        ) : (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEmailSubject(`Shift Inquiry: ${shift.date} at ${shift.location}`);
                                                setEmailMessage(`Hi Admin,\n\nI wanted to follow up regarding my shift on ${shift.date} (${shift.time}) at ${shift.location} where I am scheduled as ${shift.role}.\n\n[Your message here]`);
                                                setIsEmailModalOpen(true);
                                              }}
                                              className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white text-[8px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none"
                                            >
                                              ✉️ Email Admin
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setRequestingCoverageShift(shift)}
                                              className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white text-[8px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none font-bold"
                                            >
                                              🙋 Request Swap
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    ) : shift.approvalStatus === 'declined' ? (
                                      <div className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider shrink-0 bg-rose-500/10 border-rose-500/30 text-rose-400">
                                          ✗ Declined
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleShiftResponse(shift.id, 'approved')}
                                          className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[8px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none font-bold"
                                        >
                                          Confirm Shift
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEmailSubject(`Declined Shift Inquiry: ${shift.date} at ${shift.location}`);
                                            setEmailMessage(`Hi Admin,\n\nI wanted to follow up regarding my declined shift on ${shift.date} (${shift.time}) at ${shift.location} where I was scheduled as ${shift.role}.\n\nReason for decline: ${shift.declineReason || ''}\n\n[Your message here]`);
                                            setIsEmailModalOpen(true);
                                          }}
                                          className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black text-[8px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none"
                                        >
                                          ✉️ Email Admin
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col md:items-end gap-1.5">
                                        <span className="text-[7.5px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 leading-none">
                                          ⚠️ Action Required
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleShiftResponse(shift.id, 'approved')}
                                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[8px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none font-bold shadow-sm"
                                          >
                                            Confirm Shift
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setDecliningShiftId(shift.id);
                                              setIsDeclineModalOpen(true);
                                            }}
                                            className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-200 hover:text-white text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer font-bold"
                                          >
                                            Decline Shift
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEmailSubject(`Pending Shift Inquiry: ${shift.date} at ${shift.location}`);
                                              setEmailMessage(`Hi Admin,\n\nI wanted to follow up regarding my pending shift on ${shift.date} (${shift.time}) at ${shift.location} where I am scheduled as ${shift.role}.\n\n[Your message here]`);
                                              setIsEmailModalOpen(true);
                                            }}
                                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[8px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none"
                                          >
                                            ✉️ Email Admin
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
     
                                  {/* Instructions/Notes Column */}
                                  {shift.notes || shift.declineReason ? (
                                    <div className="flex-1 md:max-w-[45%] bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg space-y-1">
                                      {shift.notes && (
                                        <>
                                          <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Instructions:</p>
                                          <p className="text-xs text-white/60 leading-relaxed mt-0.5 italic">“{shift.notes}”</p>
                                        </>
                                      )}
                                      {shift.declineReason && (
                                        <>
                                          <p className="text-[9px] text-rose-400/60 font-bold uppercase tracking-wider">Decline Reason:</p>
                                          <p className="text-xs text-rose-300/80 leading-relaxed mt-0.5 italic">“{shift.declineReason}”</p>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="hidden md:block flex-1 md:max-w-[45%] text-right">
                                      <span className="text-[10px] text-white/20 italic">No special instructions</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )
                      ) : (
                        tourDates.length === 0 ? (
                          <div className="text-center py-8 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                             <p className="text-white/30 text-xs italic">No band tour events or shows loaded.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 font-sans">
                            {tourDates.map((show) => {
                              const dateObj = new Date(show.date + 'T00:00:00');
                              const month = isNaN(dateObj.getTime()) ? 'JAN' : dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                              const dayNum = isNaN(dateObj.getTime()) ? '00' : dateObj.getDate();
                              const weekday = isNaN(dateObj.getTime()) ? 'Day' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                              
                              // Check if member is scheduled on this day
                              const userShift = crewSchedules.find(s => s.date === show.date && s.crewId === slug);
                              // Check if availability block exists for this day
                              const userAvail = myAvailabilities.find(a => a.date === show.date);
                              // Matching venue specs popup lookup
                              const matchingVenue = venues.find(v => v.name.toLowerCase() === show.venue.toLowerCase());

                              return (
                                <div 
                                  key={show.date + '_' + show.venue} 
                                  className={`p-4 border rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    userShift 
                                      ? 'bg-gradient-to-r from-amber-500/[0.03] to-black/40 border-amber-500/25 hover:border-amber-500/40 animate-[fadeIn_0.2s_ease-out]' 
                                      : 'bg-black/40 border border-white/10 hover:border-white/20'
                                  }`}
                                >
                                  {/* Date Column */}
                                  <div className="flex items-center gap-3 shrink-0 min-w-[180px]">
                                    <div className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center text-center shrink-0 ${
                                      userShift 
                                        ? 'bg-amber-500/10 border-amber-500/30' 
                                        : 'bg-white/5 border-white/10'
                                    }`}>
                                      <span className={`text-[8px] font-black uppercase tracking-wider ${userShift ? 'text-amber-400' : 'text-white/40'}`}>{month}</span>
                                      <span className="text-base font-black text-white leading-none mt-0.5">{dayNum}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{weekday}</span>
                                      {show.playTime ? (
                                        <>
                                          <span className="text-xs font-black text-rose-400 mt-0.5" title="Band Play Time">🎸 {show.playTime}</span>
                                          {show.time && (
                                            <span className="text-[9px] text-white/40 leading-none mt-0.5" title="Event Show Time">Event: {show.time}</span>
                                          )}
                                        </>
                                      ) : (
                                        <span className="text-xs font-black text-amber-400 mt-0.5">{show.time || 'TBA'}</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Show Venue & Details */}
                                  <div className="flex-1 min-w-[180px]">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {matchingVenue ? (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedVenuePopup(matchingVenue)}
                                          className="text-[11px] font-black text-cyan-400 hover:text-cyan-300 transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-0.5 hover:underline"
                                          title="Click to view venue specs"
                                        >
                                          📍 {show.venue} <span className="text-[8px] text-cyan-500/80">ℹ️</span>
                                        </button>
                                      ) : (
                                        <span className="text-[11px] font-black text-white/80">
                                          📍 {show.venue}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-white/50">
                                        ({show.city || 'TBD'}{show.state ? `, ${show.state}` : ''})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setActiveDiscussionDate(show.date)}
                                        className="px-1.5 py-0.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer select-none"
                                      >
                                        💬 Lineup & Discuss
                                      </button>
                                    </div>
                                    {show.notes && (
                                      <p className="text-[10px] text-white/40 italic mt-1 max-w-md truncate">“{show.notes}”</p>
                                    )}
                                  </div>

                                  {/* Staffing Status Column */}
                                  <div className="shrink-0 text-left md:text-right flex items-center md:justify-end gap-3 flex-wrap">
                                    {userShift ? (
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[8px] font-black uppercase tracking-wider rounded leading-none">
                                          🛡️ Assigned: {userShift.role}
                                        </span>
                                        {userShift.approvalStatus === 'approved' ? (
                                          <span className="px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider shrink-0 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                                            ✓ Confirmed
                                          </span>
                                        ) : userShift.approvalStatus === 'declined' ? (
                                          <span className="px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider shrink-0 bg-rose-500/10 border-rose-500/30 text-rose-400">
                                            ✗ Declined
                                          </span>
                                        ) : (
                                          <span className="px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider shrink-0 bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse">
                                            ⏳ Pending Confirm
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        {userAvail ? (
                                          <div className="flex items-center gap-1.5">
                                            {userAvail.type === 'available' ? (
                                              <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider leading-none">
                                                🟢 Available
                                              </span>
                                            ) : (
                                              <span className="px-2 py-1 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-wider leading-none">
                                                🔴 Unavailable
                                              </span>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveAvailability(userAvail.id)}
                                              className="p-1 rounded bg-white/5 hover:bg-rose-500 hover:text-black text-white/50 text-[10px] transition-colors border-none cursor-pointer leading-none"
                                              title="Clear Availability"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newItem: AvailabilityItem = {
                                                  id: 'avail_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                                                  crewId: slug,
                                                  date: show.date,
                                                  type: 'available'
                                                };
                                                try {
                                                  const savedAvail = localStorage.getItem('7h_crew_availability');
                                                  const currentList: AvailabilityItem[] = savedAvail ? JSON.parse(savedAvail) : [];
                                                  const filtered = currentList.filter(item => !(item.crewId === slug && item.date === show.date));
                                                  const nextList = [...filtered, newItem];
                                                  localStorage.setItem('7h_crew_availability', JSON.stringify(nextList));
                                                  window.dispatchEvent(new Event('storage'));
                                                  setMyAvailabilities(nextList.filter(a => a.crewId === slug));
                                                  showToast('Logged as Available!', 'success', 'Logged Available');
                                                } catch (err) {
                                                  showToast('Failed to save availability', 'error', 'Error');
                                                }
                                              }}
                                              className="px-2 py-1 bg-white/5 hover:bg-emerald-500 hover:text-black text-white/60 text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer border border-white/10 hover:border-emerald-500/40"
                                            >
                                              🟢 Available
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newItem: AvailabilityItem = {
                                                  id: 'avail_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                                                  crewId: slug,
                                                  date: show.date,
                                                  type: 'unavailable'
                                                };
                                                try {
                                                  const savedAvail = localStorage.getItem('7h_crew_availability');
                                                  const currentList: AvailabilityItem[] = savedAvail ? JSON.parse(savedAvail) : [];
                                                  const filtered = currentList.filter(item => !(item.crewId === slug && item.date === show.date));
                                                  const nextList = [...filtered, newItem];
                                                  localStorage.setItem('7h_crew_availability', JSON.stringify(nextList));
                                                  window.dispatchEvent(new Event('storage'));
                                                  setMyAvailabilities(nextList.filter(a => a.crewId === slug));
                                                  showToast('Logged as Unavailable!', 'info', 'Logged Unavailable');
                                                } catch (err) {
                                                  showToast('Failed to save availability', 'error', 'Error');
                                                }
                                              }}
                                              className="px-2 py-1 bg-white/5 hover:bg-rose-500 hover:text-white text-white/60 text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer border border-white/10 hover:border-rose-500/40"
                                            >
                                              🔴 Unavailable
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                       </div>
                      ))}
                   </div>
                  )}
                </div>
  
                {/* Available Shift Coverage Requests */}
                {coverageShifts.length > 0 && (
                  <div className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
                    <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#181820]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">🚨</div>
                        <div>
                          <h3 className="text-sm font-black italic tracking-wide text-white">Available Shift Coverage Requests</h3>
                          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">First qualified crew member to claim gets it</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                        {coverageShifts.length} Available
                      </span>
                    </div>
                    <div className="p-6 flex flex-col gap-3">
                      {coverageShifts.map((shift) => {
                        const dateObj = new Date(shift.date + 'T00:00:00');
                        const month = isNaN(dateObj.getTime()) ? 'JAN' : dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                        const dayNum = isNaN(dateObj.getTime()) ? '00' : dateObj.getDate();
                        const weekday = isNaN(dateObj.getTime()) ? 'Day' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  
                        return (
                          <div 
                            key={shift.id} 
                            className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            {/* Date & Time */}
                            <div className="flex items-center gap-3 shrink-0 min-w-[180px]">
                              <div className="w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center text-center shrink-0">
                                <span className="text-[8px] text-purple-400 font-black uppercase tracking-wider">{month}</span>
                                <span className="text-base font-black text-white leading-none mt-0.5">{dayNum}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{weekday}</span>
                                <span className="text-xs font-black text-purple-400 mt-0.5">{shift.time}</span>
                              </div>
                            </div>
  
                            {/* Role & Location */}
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase tracking-wider rounded">
                                  {shift.role}
                                </span>
                                {(() => {
                                  const matchingVenue = venues.find(v => v.name.toLowerCase() === shift.location.toLowerCase());
                                  if (matchingVenue) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedVenuePopup(matchingVenue)}
                                        className="text-xs font-black text-cyan-400 hover:text-cyan-300 transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-0.5 hover:underline"
                                        title="Click to view venue load-in, parking & WiFi details"
                                      >
                                        📍 {shift.location} <span className="text-[8px] text-cyan-500/80">ℹ️</span>
                                      </button>
                                    );
                                  }
                                  return (
                                    <span className="text-xs font-black text-white/80">
                                      📍 {shift.location}
                                    </span>
                                  );
                                })()}
                                <button
                                  type="button"
                                  onClick={() => setActiveDiscussionDate(shift.date)}
                                  className="px-1.5 py-0.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-wider rounded transition-all cursor-pointer select-none"
                                  title="View show lineup acts and discuss details with crew"
                                >
                                  💬 Lineup & Discuss
                                </button>
                                <span className="text-[10px] text-purple-300/80 italic ml-1">
                                  (For: {shift.crewName})
                                </span>
                              </div>
                            </div>
  
                            {/* Action Column */}
                            <div className="shrink-0 min-w-[120px] text-left md:text-right flex items-center md:justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleAcceptCoverage(shift.id)}
                                className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1"
                              >
                                🙋 Accept Shift
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

                {/* ─── AVAILABILITY & BLACKOUTS CARD ─── */}
                <div className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
                  <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#181820]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xl">🗓️</div>
                      <div>
                        <h3 className="text-sm font-black italic tracking-wide text-white">Your Availability & Blackouts</h3>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-0.5">Let admins know when you are available or unavailable</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleAddAvailability} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-black/20 p-4 border border-white/5 rounded-xl mb-6">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1.5">Date</label>
                        <input
                          type="date"
                          required
                          value={availDate}
                          onChange={e => setAvailDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0c0d12] border border-white/10 text-xs text-white rounded-lg outline-none focus:border-cyan-500/50 transition-colors font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1.5">Status</label>
                        <select
                          value={availType}
                          onChange={e => setAvailType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#0c0d12] border border-white/10 text-xs text-white rounded-lg outline-none focus:border-cyan-500/50 transition-colors font-bold cursor-pointer"
                        >
                          <option value="unavailable">🚫 Unavailable / Blackout</option>
                          <option value="available">✓ Available</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1.5">Comment / Note (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Out of town, family event"
                            value={availNote}
                            onChange={e => setAvailNote(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0c0d12] border border-white/10 text-xs text-white rounded-lg outline-none focus:border-cyan-500/50 transition-colors font-medium"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 h-[36px] bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider text-xs rounded-lg transition-colors cursor-pointer border-none flex items-center justify-center shrink-0"
                        >
                          Save
                        </button>
                      </div>
                    </form>

                    {myAvailabilities.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                        <p className="text-white/30 text-xs italic">No availability blocks configured yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {myAvailabilities
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .map((item) => (
                            <div key={item.id} className="p-3 bg-[#0c0d12] border border-white/5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
                              <div className="min-w-0">
                                <span className="text-[11px] font-black text-white block">
                                  {new Date(item.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {item.type === 'available' ? (
                                    <span className="text-[8.5px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                                      ✓ Available
                                    </span>
                                  ) : (
                                    <span className="text-[8.5px] bg-red-500/10 border border-red-500/25 text-red-400 font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                                      🚫 Unavailable
                                    </span>
                                  )}
                                  {item.note && (
                                    <span className="text-[9.5px] text-white/50 truncate max-w-[120px]" title={item.note}>
                                      • {item.note}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAvailability(item.id)}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-red-500 hover:text-white text-white/40 flex items-center justify-center cursor-pointer transition-colors border-none text-xs"
                                title="Remove Block"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── TIME OFF REQUESTS CARD ─── */}
                <div className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">
                  <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#181820]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl">⏳</div>
                      <div>
                        <h3 className="text-sm font-black italic tracking-wide text-white">Time-Off Requests</h3>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-0.5">Submit time-off requests for administrator approval</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleAddTimeOffRequest} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-black/20 p-4 border border-white/5 rounded-xl mb-6">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1.5">Request Date</label>
                        <input
                          type="date"
                          required
                          value={timeOffDate}
                          onChange={e => setTimeOffDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0c0d12] border border-white/10 text-xs text-white rounded-lg outline-none focus:border-rose-500/50 transition-colors font-bold"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1.5">Reason for Time-off</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Family vacation, medical appointment"
                            value={timeOffReason}
                            onChange={e => setTimeOffReason(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0c0d12] border border-white/10 text-xs text-white rounded-lg outline-none focus:border-rose-500/50 transition-colors font-medium"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 h-[36px] bg-rose-500 hover:bg-rose-400 text-black font-black uppercase tracking-wider text-xs rounded-lg transition-colors cursor-pointer border-none flex items-center justify-center shrink-0"
                        >
                          Submit Request
                        </button>
                      </div>
                    </form>

                    {myTimeOffRequests.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                        <p className="text-white/30 text-xs italic">No time-off requests submitted yet.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {myTimeOffRequests
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map((req) => (
                            <div key={req.id} className="p-4 bg-[#0c0d12] border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center text-center shrink-0">
                                  <span className="text-[7.5px] text-rose-400 font-black uppercase tracking-wider">
                                    {new Date(req.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                  </span>
                                  <span className="text-sm font-black text-white leading-none mt-0.5">
                                    {new Date(req.date + 'T12:00:00').getDate()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-black text-white">
                                    {new Date(req.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                  <span className="text-xs text-white/50 block mt-0.5">
                                    Reason: <span className="text-white/80 font-medium italic">“{req.reason}”</span>
                                  </span>
                                  {req.declineReason && (
                                    <span className="text-[10px] text-rose-400/80 block mt-1">
                                      Denial Feedback: <span className="italic font-bold">“{req.declineReason}”</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                                {req.status === 'pending' ? (
                                  <>
                                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded text-[9px] font-black uppercase tracking-wider animate-pulse">
                                      ⏳ Pending Approval
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTimeOffRequest(req.id)}
                                      className="px-2 py-0.5 bg-white/5 hover:bg-red-500 text-white/50 hover:text-white text-[9px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer border-none"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : req.status === 'approved' ? (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[9px] font-black uppercase tracking-wider">
                                    ✓ Approved
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-[9px] font-black uppercase tracking-wider">
                                    ✗ Denied
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>



{/* LIVE SETLIST & FAN LIKES */}
           <div className={`xl:col-span-2 bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${isSetlistCollapsed ? '' : 'min-h-[500px]'}`}>
              <div 
                onClick={() => setIsSetlistCollapsed(!isSetlistCollapsed)}
                className="p-4 border-b border-white/[0.05] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#181820] cursor-pointer select-none hover:bg-white/[0.02] transition-colors group"
              >
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl transition-transform group-hover:scale-105">🎵</div>
                    <div>
                       <h3 className="text-sm font-black italic tracking-wide text-white">Live Setlist & Fan Likes</h3>
                       <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-0.5">
                         Now Playing: {setlist.find(s => s.isPlaying)?.title || 'None'}
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 self-end md:self-auto">
                    <button 
                       onClick={(e) => { e.stopPropagation(); resetSetlistLikes(); }} 
                       className="px-4 py-2 text-2xs font-black uppercase tracking-widest rounded-lg transition-colors border bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white font-sans font-bold"
                    >
                       Reset Likes
                    </button>
                    <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 transition-transform duration-300 ${isSetlistCollapsed ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                 </div>
              </div>
              
              {!isSetlistCollapsed && (
                 <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                 
                 {/* Song rows */}
                 <div data-lenis-prevent className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {setlist.map((song) => (
                      <div 
                        key={song.id} 
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                          song.isPlaying 
                            ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.12)]' 
                            : 'bg-black/20 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-xs ${song.isPlaying ? 'animate-bounce text-purple-400' : 'text-white/40'}`}>
                            {song.isPlaying ? '🔊' : '🎵'}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${song.isPlaying ? 'text-purple-300' : 'text-white'}`}>
                              {song.title}
                            </p>
                            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                              ❤️ {song.likes} likes
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleSongPlaying(song.id)}
                            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                              song.isPlaying
                                ? 'bg-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                                : 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10'
                            }`}
                          >
                            {song.isPlaying ? 'Playing' : 'Set Active'}
                          </button>
                          
                          <button
                            onClick={() => deleteSongFromSetlist(song.id)}
                            className="w-6 h-6 flex items-center justify-center rounded border border-red-500/10 hover:border-red-500/30 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-colors text-3xs"
                            title="Delete Song"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {/* Add Song form */}
                  <div className="pt-3 border-t border-white/5">
                    {isBulkImport ? (
                      <div className="space-y-2 animate-in fade-in duration-250">
                        <textarea
                          placeholder="Paste a list of songs (one per line, or separated by commas)..."
                          value={newSongTitle}
                          onChange={e => setNewSongTitle(e.target.value)}
                          rows={4}
                          className="w-full bg-[#1c1c24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500 transition-colors resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => { setIsBulkImport(false); setNewSongTitle(''); }}
                            className="text-3xs uppercase font-black tracking-widest text-white/40 hover:text-white/60 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => addSongToSetlist(newSongTitle)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-2xs font-black uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                          >
                            Import Playlist
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add song (e.g. Stop Shillin)"
                            value={newSongTitle}
                            onChange={e => setNewSongTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addSongToSetlist(newSongTitle)}
                            className="flex-1 bg-[#1c1c24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500 transition-colors"
                          />
                          <button
                            onClick={() => addSongToSetlist(newSongTitle)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-2xs font-black uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => { setIsBulkImport(true); setNewSongTitle(''); }}
                            className="text-3xs uppercase font-black tracking-widest text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5"
                          >
                            📋 Bulk Import / Paste List
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                 
              </div>
           )}
        </div>
      </div>
      
      {/* End Stream Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0a0a0f] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
             {isSavingReplay && (
                <div className="absolute inset-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Processing & Saving...</h3>
                  <p className="text-white/40 text-xs mt-2">Compressing VOD to Gallery</p>
                </div>
             )}
             
             <div className="text-center mb-8 relative z-10">
               <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>
               </div>
               <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-white">End Broadcast?</h2>
               <p className="text-sm text-white/60 leading-relaxed">
                 You are about to terminate the live broadcast to all fans. Are you sure you want to terminate the stream?
               </p>
             </div>
             
             <div className="flex flex-col gap-3 relative z-10">
               <button 
                 onClick={confirmEndDiscard}
                 className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-[0.2em] text-xs transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] rounded-lg"
               >
                 End Broadcast
               </button>
               <button 
                 onClick={() => setShowEndModal(false)}
                 className="w-full py-2 text-white/40 hover:text-white uppercase tracking-widest text-xs font-bold mt-2 transition-colors"
               >
                 Cancel, Keep Streaming
               </button>
             </div>
          </div>
        </div>
      )}

      {/* ─── DECLINE REASON MODAL ─── */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#181820] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black italic tracking-wide text-white uppercase flex items-center gap-2">
              <span className="text-rose-500">✗</span> Decline Work Shift
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Please provide a reason for declining this shift. This will be saved to your shift history and shared with the planner/administrator to assist with scheduling.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., Conflict with another gig, Out of town, Personal reasons..."
              className="w-full min-h-[100px] bg-black/40 border border-white/10 text-white placeholder-white/30 rounded-xl p-3 text-sm focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 outline-none transition-all resize-none"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeclineModalOpen(false);
                  setDecliningShiftId(null);
                  setDeclineReason('');
                }}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white/70 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!declineReason.trim()}
                onClick={() => {
                  if (decliningShiftId) {
                    handleShiftResponse(decliningShiftId, 'declined', declineReason);
                  }
                  setIsDeclineModalOpen(false);
                  setDecliningShiftId(null);
                  setDeclineReason('');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/30 disabled:text-white/30 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer disabled:cursor-not-allowed"
              >
                Submit Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EMAIL ADMIN MODAL ─── */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#181820] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black italic tracking-wide text-white uppercase flex items-center gap-2">
              <span className="text-amber-500">📧</span> Email Administrators
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-1">From</label>
                <div className="bg-black/35 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white/70">
                  {displayName} <span className="text-white/35">({email})</span>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject of your message..."
                  className="w-full bg-black/40 border border-white/10 text-white placeholder-white/30 rounded-xl px-3.5 py-2 text-xs focus:border-amber-500/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-1">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Type your message to the administrators here..."
                  className="w-full min-h-[120px] bg-black/40 border border-white/10 text-white placeholder-white/30 rounded-xl p-3 text-xs focus:border-amber-500/50 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setEmailSubject('');
                  setEmailMessage('');
                }}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white/70 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingEmail || !emailSubject.trim() || !emailMessage.trim()}
                onClick={handleSendEmailToAdmins}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/30 disabled:text-white/30 text-black font-black rounded-lg text-xs uppercase tracking-wider transition-all border-none cursor-pointer disabled:cursor-not-allowed"
              >
                {isSendingEmail ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 Premium Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-[10000] max-w-sm w-full bg-[#111118]/95 border border-white/10 p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)] flex gap-3 text-white">
          <div className="flex-1 text-left font-sans">
            {toast.title && (
              <h4 className={`text-xs uppercase tracking-widest font-black mb-1 ${
                toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-rose-400' : 'text-purple-400'
              }`}>
                {toast.title}
              </h4>
            )}
            <p className="text-xs text-white/70 leading-relaxed font-semibold">
              {toast.message}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
            className="text-white/40 hover:text-white text-xs cursor-pointer border-none bg-transparent self-start font-sans"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── VENUE DETAILS POPUP MODAL ─── */}
      {selectedVenuePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] no-print">
          <div className="bg-[#15151b] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl text-white font-sans flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏛️</span>
                <div>
                  <h3 className="text-sm font-black italic tracking-wide text-white uppercase leading-none">
                    {selectedVenuePopup.name}
                  </h3>
                  <p className="text-[9px] text-cyan-400 font-mono tracking-wider mt-1.5 uppercase leading-none">
                    Venue Specifications
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVenuePopup(null)}
                className="text-white/45 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Address */}
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/45 font-bold block mb-1">📍 Address</span>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedVenuePopup.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline inline-block font-medium"
                >
                  {selectedVenuePopup.address}
                </a>
              </div>

              {/* Wifi Password */}
              {selectedVenuePopup.wifiPassword && (
                <div className="p-3 bg-cyan-950/15 border border-cyan-500/20 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-cyan-400/70 font-bold block mb-0.5">📶 Backstage Wi-Fi</span>
                    <span className="text-xs font-mono font-bold text-white select-all">{selectedVenuePopup.wifiPassword}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedVenuePopup.wifiPassword || '');
                      showToast('Wi-Fi password copied to clipboard!', 'success', 'COPIED');
                    }}
                    className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none"
                  >
                    Copy
                  </button>
                </div>
              )}

              {/* Two columns: Capacity and Contact */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-white/45 font-bold block mb-1">👥 Capacity</span>
                  <span className="text-xs font-bold text-white font-mono">{selectedVenuePopup.capacity.toLocaleString()}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-white/45 font-bold block mb-1">👤 Contact</span>
                  <span className="text-xs font-bold text-white block truncate" title={selectedVenuePopup.contactPerson}>
                    {selectedVenuePopup.contactPerson.split(' (')[0]}
                  </span>
                  {selectedVenuePopup.contactPhone && (
                    <a 
                      href={`tel:${selectedVenuePopup.contactPhone.replace(/[^0-9]/g, '')}`} 
                      className="text-[9px] font-mono text-cyan-400 hover:underline block mt-0.5"
                    >
                      {selectedVenuePopup.contactPhone}
                    </a>
                  )}
                </div>
              </div>

              {/* Stage Specs */}
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="text-[9px] uppercase tracking-wider text-white/45 font-bold block mb-1">🎸 Stage & Power Specs</span>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  {selectedVenuePopup.stageSpecs}
                </p>
              </div>

              {/* Parking & Load-In Notes */}
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="text-[9px] uppercase tracking-wider text-white/45 font-bold block mb-1">🚛 Parking & Load-In Notes</span>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  {selectedVenuePopup.parkingNotes}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVenuePopup(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10 cursor-pointer"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── GIG DISCUSS & LINEUP MODAL FOR CREW ─── */}
      {activeDiscussionDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] no-print">
          <div className="bg-[#15151b] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl text-white font-sans flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🎸</span>
                <div>
                  <h3 className="text-sm font-black italic tracking-wide text-white uppercase leading-none">
                    Show Lineup & Gig Discuss
                  </h3>
                  <p className="text-[9px] text-cyan-400 font-mono tracking-wider mt-1.5 uppercase leading-none">
                    {new Date(activeDiscussionDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDiscussionDate(null)}
                className="text-white/45 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1" data-lenis-prevent="true">
              {/* Lineup */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-white/45 tracking-widest block border-b border-white/5 pb-1">Set Schedule Lineup</h4>
                {(() => {
                  const lineup = setLineups[activeDiscussionDate] || [];
                  if (lineup.length === 0) {
                    return <p className="text-2xs text-white/35 italic">No lineup configured for this show date yet.</p>;
                  }
                  return lineup
                    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime))
                    .map((act, index, arr) => {
                      const nextAct = arr[index + 1];
                      const changeover = nextAct ? getChangeoverLabel(act.endTime, nextAct.startTime) : '';
                      return (
                        <div key={act.id} className="space-y-1.5">
                          <div className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{act.actName}</span>
                            <span className="text-[10px] text-amber-400 font-mono font-bold">⏱️ {act.startTime} - {act.endTime}</span>
                          </div>
                          {changeover && (
                            <div className="text-center">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[8.5px] font-black uppercase tracking-wider text-amber-400 font-mono">
                                🔄 {changeover}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    });
                })()}
              </div>

              {/* Discussion Thread */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-white/45 tracking-widest block border-b border-white/5 pb-1">Discussion Board</h4>
                {(() => {
                  const comments = gigComments.filter(c => c.date === activeDiscussionDate);
                  const rootComments = comments.filter(c => !c.parentId);
                  const repliesByParent = comments.reduce((acc: Record<string, typeof comments>, c) => {
                    if (c.parentId) {
                      if (!acc[c.parentId]) acc[c.parentId] = [];
                      acc[c.parentId].push(c);
                    }
                    return acc;
                  }, {});

                  return (
                    <div className="space-y-4 font-sans">
                      {/* List */}
                      <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                        {rootComments.map(c => {
                          const replies = repliesByParent[c.id] || [];
                          return (
                            <div key={c.id} className="space-y-2 border-b border-white/5 pb-2.5 last:border-none">
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[8px] uppercase shrink-0 text-white mt-0.5">
                                  {c.authorName[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-bold text-white/80">{c.authorName}</span>
                                    <span className="text-[7.5px] text-white/30 font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-[11px] text-white/60 leading-normal">{c.text}</p>
                                  <button
                                    type="button"
                                    onClick={() => setReplyingToCommentId(replyingToCommentId === c.id ? null : c.id)}
                                    className="text-[8px] font-black text-cyan-400 hover:text-white mt-1 border-none bg-transparent cursor-pointer"
                                  >
                                    {replyingToCommentId === c.id ? 'Cancel Reply' : 'Reply'}
                                  </button>
                                </div>
                              </div>

                              {/* Reply form */}
                              {replyingToCommentId === c.id && (
                                <div className="flex gap-1.5 pl-7 mt-1.5">
                                  <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="flex-1 px-2 py-1 bg-black border border-white/10 text-[10px] text-white rounded outline-none focus:border-cyan-500/50"
                                  />
                                  <button
                                    type="button"
                                    disabled={!replyText.trim()}
                                    onClick={() => {
                                      setGigComments(current => {
                                        const newComment = {
                                          id: 'comment_' + Date.now(),
                                          date: activeDiscussionDate,
                                          authorId: slug,
                                          authorName: displayName || slug,
                                          text: replyText.trim(),
                                          createdAt: new Date().toISOString(),
                                          parentId: c.id
                                        };
                                        const updated = [...current, newComment];
                                        localStorage.setItem('7h_gig_comments', JSON.stringify(updated));
                                        window.dispatchEvent(new Event('storage'));
                                        return updated;
                                      });
                                      setReplyText('');
                                      setReplyingToCommentId(null);
                                    }}
                                    className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-black uppercase tracking-wider rounded border-none cursor-pointer disabled:opacity-30"
                                  >
                                    Send
                                  </button>
                                </div>
                              )}

                              {/* Replies */}
                              {replies.map(r => (
                                <div key={r.id} className="flex items-start gap-2 pl-7 mt-2 border-l border-white/5">
                                  <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center font-bold text-[7px] uppercase shrink-0 text-white/50 mt-0.5">
                                    {r.authorName[0]}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-[9.5px] font-bold text-white/70">{r.authorName}</span>
                                      <span className="text-[7px] text-white/20 font-mono">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-[10px] text-white/50 leading-normal">{r.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {comments.length === 0 && (
                          <p className="text-2xs text-white/20 italic text-center py-6">No discussions yet. Start the conversation!</p>
                        )}
                      </div>

                      {/* Main input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Post a gig note..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="flex-1 px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-cyan-500/50"
                        />
                        <button
                          type="button"
                          disabled={!newCommentText.trim()}
                          onClick={() => {
                            setGigComments(current => {
                              const newComment = {
                                        id: 'comment_' + Date.now(),
                                        date: activeDiscussionDate,
                                        authorId: slug,
                                        authorName: displayName || slug,
                                        text: newCommentText.trim(),
                                        createdAt: new Date().toISOString()
                              };
                              const updated = [...current, newComment];
                              localStorage.setItem('7h_gig_comments', JSON.stringify(updated));
                              window.dispatchEvent(new Event('storage'));
                              return updated;
                            });
                            setNewCommentText('');
                          }}
                          className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:pointer-events-none text-black font-black uppercase tracking-wider text-xs rounded-lg border-none cursor-pointer"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveDiscussionDate(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10 cursor-pointer"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REQUEST COVERAGE / SWAP MODAL FOR CREW ─── */}
      {requestingCoverageShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] no-print">
          <div className="bg-[#15151b] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl text-white font-sans flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔄</span>
                <div>
                  <h3 className="text-sm font-black italic tracking-wide text-white uppercase leading-none">
                    Request Coverage or Swap
                  </h3>
                  <p className="text-[9px] text-purple-400 font-mono tracking-wider mt-1.5 uppercase leading-none">
                    Shift: {requestingCoverageShift.role} at {requestingCoverageShift.location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRequestingCoverageShift(null);
                  setSwapTargetColleagueId('');
                }}
                className="text-white/45 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4 font-sans">
              <p className="text-xs text-white/60 leading-relaxed">
                Choose whether you want to post this to the general pool for any qualified colleague to claim, or propose a direct swap with a specific colleague.
              </p>

              {/* Selection Tabs / Modes */}
              <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 border border-white/5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSwapTargetColleagueId('')}
                  className={`py-2 text-[10px] font-black uppercase tracking-wider rounded transition-all cursor-pointer border-none ${
                    !swapTargetColleagueId
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-transparent text-white/50 hover:text-white'
                  }`}
                >
                  General Coverage
                </button>
                <button
                  type="button"
                  onClick={() => setSwapTargetColleagueId('openshifts')} // default target to enable dropdown
                  className={`py-2 text-[10px] font-black uppercase tracking-wider rounded transition-all cursor-pointer border-none ${
                    swapTargetColleagueId
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-transparent text-white/50 hover:text-white'
                  }`}
                >
                  Propose Direct Swap
                </button>
              </div>

              {/* Direct Swap Colleague Selection */}
              {swapTargetColleagueId !== '' && (
                <div className="space-y-2 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl animate-[fadeIn_0.2s_ease-out]">
                  <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Select Colleague to Swap With</label>
                  <select
                    value={swapTargetColleagueId === 'openshifts' ? '' : swapTargetColleagueId}
                    onChange={(e) => setSwapTargetColleagueId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0c0d12] border border-white/10 text-xs text-white rounded-lg outline-none focus:border-purple-500/50 transition-colors font-bold cursor-pointer"
                  >
                    <option value="" disabled>— Select Colleague —</option>
                    {[
                      { id: 'abbie', name: 'Abbie Janssen' },
                      { id: 'al', name: 'Al Hollie' },
                      { id: 'andrea', name: 'Andrea Kinzinger' },
                      { id: 'arjun', name: 'Arjun Patel' },
                      { id: 'chris', name: 'Chris Loxely' },
                      { id: 'daniel', name: 'Daniel Kim' },
                      { id: 'dave_croke', name: 'Dave Croke' },
                      { id: 'dave_maas', name: 'Dave Maas' },
                      { id: 'david_xu', name: 'David Xu' },
                      { id: 'emily', name: 'Emily Hafften' },
                      { id: 'emma', name: 'Emma Smid' },
                      { id: 'erin', name: 'Erin Eagan' },
                      { id: 'francesca', name: 'Francesca Troast' },
                      { id: 'michael', name: 'Michael Scimeca' },
                      { id: 'sammy', name: 'Sammy D' },
                      { id: 'ryan', name: 'Ryan K' },
                      { id: 'tony', name: 'Tony M' }
                    ]
                      .filter(m => m.id !== slug)
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setRequestingCoverageShift(null);
                  setSwapTargetColleagueId('');
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetColleague = swapTargetColleagueId === 'openshifts' ? null : swapTargetColleagueId;
                  handleRequestCoverage(requestingCoverageShift.id, targetColleague);
                  setRequestingCoverageShift(null);
                  setSwapTargetColleagueId('');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-none"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getChangeoverLabel(endStr: string, startStr: string): string {
  const endMin = parseTimeToMinutes(endStr);
  const startMin = parseTimeToMinutes(startStr);
  if (startMin <= endMin) return '';
  const diff = startMin - endMin;
  if (diff >= 60) {
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''} changeover`;
  }
  return `${diff}m changeover`;
}
