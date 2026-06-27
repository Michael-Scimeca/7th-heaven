const fs = require('fs');
const path = require('path');

const pagePath = path.resolve(__dirname, '../src/app/admin/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Read all transformed sections
const keys = [
  'shopify',
  'toursync',
  'bookings',
  'planners',
  'photomod',
  'memorymod',
  'referral',
  'invitechallenge',
  'livealerts',
  'smsblast',
  'crewsms',
  'newsletter',
  'registry',
  'crewcreation'
];

const sections = {};
for (const key of keys) {
  const file = path.resolve(__dirname, `section-${key}.txt`);
  let fileContent = fs.readFileSync(file, 'utf8').trim();
  // Strip leading comment to prevent JSX block syntax error
  if (fileContent.startsWith('{/*')) {
    fileContent = fileContent.substring(fileContent.indexOf('*/}') + 3).trim();
  }
  sections[key] = fileContent;
}

console.log("Read all 14 section files successfully.");

// Inject imports
const importStr = 'import ReferralProgramPanel from "@/components/admin/ReferralProgramPanel";\n';
if (!content.includes('import ReferralProgramPanel')) {
  const insertImportPos = content.indexOf("export default function AdminDashboard");
  content = content.substring(0, insertImportPos) + importStr + content.substring(insertImportPos);
}

// Inject states and handlers
const statesAndHandlers = `
  // ── Collapsible Sections (persisted via localStorage & Supabase) ──
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('7h_admin_collapsed');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { 
        localStorage.setItem('7h_admin_collapsed', JSON.stringify(next));
        saveLayoutToSupabase(sectionOrder, next);
      } catch {}
      return next;
    });
  };

  const isSectionOpen = (key: string) => !collapsedSections[key];

  // ── Drag & Drop Sortable Sections State & Handlers ──
  const DEFAULT_SECTION_ORDER = [
    'shopify',
    'toursync',
    'bookings',
    'planners',
    'photomod',
    'memorymod',
    'referral',
    'invitechallenge',
    'livealerts',
    'smsblast',
    'crewsms',
    'newsletter',
    'registry',
    'crewcreation'
  ];

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SECTION_ORDER;
    try {
      const saved = localStorage.getItem('7h_admin_section_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        const uniqueList = Array.from(new Set([...parsed, ...DEFAULT_SECTION_ORDER]));
        return uniqueList.filter(item => DEFAULT_SECTION_ORDER.includes(item));
      }
      return DEFAULT_SECTION_ORDER;
    } catch {
      return DEFAULT_SECTION_ORDER;
    }
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Helper to save layout to Supabase User Metadata
  const saveLayoutToSupabase = async (order: string[], collapsed: Record<string, boolean>) => {
    if (!isLoggedIn) return;
    try {
      const { createClient: createSupabaseClient } = await import("@/utils/supabase/client");
      const client = createSupabaseClient();
      await client.auth.updateUser({
        data: {
          admin_section_order: order,
          admin_collapsed_sections: collapsed
        }
      });
      console.log("Admin layout saved to Supabase user metadata.");
    } catch (err) {
      console.error("Failed to save layout to Supabase:", err);
    }
  };

  // Load layout from Supabase User Metadata on mount/login
  useEffect(() => {
    if (!isLoggedIn || !member) return;
    const loadSavedLayout = async () => {
      try {
        const { createClient: createSupabaseClient } = await import("@/utils/supabase/client");
        const client = createSupabaseClient();
        const { data: { user } } = await client.auth.getUser();
        
        if (user?.user_metadata) {
          const savedOrder = user.user_metadata.admin_section_order;
          const savedCollapsed = user.user_metadata.admin_collapsed_sections;
          
          if (savedOrder && Array.isArray(savedOrder)) {
            const uniqueList = Array.from(new Set([...savedOrder, ...DEFAULT_SECTION_ORDER]));
            const filtered = uniqueList.filter(item => DEFAULT_SECTION_ORDER.includes(item));
            setSectionOrder(filtered);
            localStorage.setItem('7h_admin_section_order', JSON.stringify(filtered));
          }
          
          if (savedCollapsed) {
            setCollapsedSections(savedCollapsed);
            localStorage.setItem('7h_admin_collapsed', JSON.stringify(savedCollapsed));
          }
        }
      } catch (err) {
        console.error("Failed to load layout from Supabase:", err);
      }
    };
    loadSavedLayout();
  }, [isLoggedIn, member]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...sectionOrder];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, item);
    setDraggedIndex(index);
    setSectionOrder(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    try {
      localStorage.setItem('7h_admin_section_order', JSON.stringify(sectionOrder));
      saveLayoutToSupabase(sectionOrder, collapsedSections);
    } catch {}
  };

  // ── Tour Dates Sync State & Handlers ──
  const [tourDates, setTourDates] = useState<any[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSyncTourDates = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-shows", { method: "POST" });
      const data = await res.json();
      setSyncResult(data);

      if (data.success) {
        const tourRes = await fetch("/api/tour");
        if (tourRes.ok) {
          setTourDates(await tourRes.json());
        }
        setAuditLog(prev => [{
          id: crypto.randomUUID(),
          text: "🔄 Synced tour dates: Scraped " + data.scraped + " shows from official site.",
          time: "Just now",
          color: "bg-emerald-500"
        }, ...prev]);
      } else {
        setAuditLog(prev => [{
          id: crypto.randomUUID(),
          text: "❌ Tour sync failed: " + (data.error || "Unknown error"),
          time: "Just now",
          color: "bg-rose-500"
        }, ...prev]);
      }
    } catch (err: any) {
      setSyncResult({ success: false, error: err.message || "Network error" });
    } finally {
      setSyncLoading(false);
    }
  };

  // ── Memory Moderation Queue State & Handlers ──
  const [memoryQueue, setMemoryQueue] = useState<any[]>([]);

  const moderateMemory = async (id: string, action: 'approve' | 'reject') => {
    setMemoryQueue(current => current.filter(m => m.id !== id));
    try {
      await fetch('/api/fans/memories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
    } catch (err) {
      console.error(err);
    }
  };
`;

const insertStatePos = content.indexOf("const supabase = createClient();") + "const supabase = createClient();".length;
content = content.substring(0, insertStatePos) + statesAndHandlers + content.substring(insertStatePos);

// Inject fetches in useEffect
const mountFetchTarget = "const photoRes = await fetch('/api/fans?all=true');";
const mountFetchStart = content.indexOf(mountFetchTarget);
const insertFetchPos = content.lastIndexOf("try {", mountFetchStart);

const extraFetches = `
      try {
        const tourRes = await fetch('/api/tour');
        if (tourRes.ok) setTourDates(await tourRes.json());
      } catch (err) {}

      try {
        const memRes = await fetch('/api/fans/memories?all=true');
        if (memRes.ok) {
          const allMems = await memRes.json();
          setMemoryQueue(allMems.filter((m: any) => !m.approved));
        }
      } catch (err) {}
`;

content = content.substring(0, insertFetchPos) + extraFetches + content.substring(insertFetchPos);

// Inject helper functions before main return
const renderHelpers = `
  // ── Section Helper Render Functions for Movable Layout ──
  const renderShopify = () => (
    ${sections['shopify']}
  );

  const renderTourSync = () => (
    ${sections['toursync']}
  );

  const renderBookings = () => (
    ${sections['bookings']}
  );

  const renderPlanners = () => (
    ${sections['planners']}
  );

  const renderPhotoMod = () => (
    ${sections['photomod']}
  );

  const renderMemoryMod = () => (
    ${sections['memorymod']}
  );

  const renderReferral = () => (
    ${sections['referral']}
  );

  const renderLiveAlerts = () => (
    ${sections['livealerts']}
  );

  const renderSmsBlast = () => (
    ${sections['smsblast']}
  );

  const renderCrewSms = () => (
    ${sections['crewsms']}
  );

  const renderNewsletter = () => (
    ${sections['newsletter']}
  );

  const renderRegistry = () => (
    ${sections['registry']}
  );

  const renderCrewCreation = () => (
    ${sections['crewcreation']}
  );

  const renderInviteChallenge = () => (
    ${sections['invitechallenge']}
  );
`;

const mainReturnPos = content.indexOf("return (\n    <div className=\"min-h-screen bg-[#050508]");
content = content.substring(0, mainReturnPos) + renderHelpers + content.substring(mainReturnPos);

// Replace static layout inside xl:col-span-2 (left column)
const colSpan2Start = content.indexOf('<div className="xl:col-span-2 flex flex-col gap-8">');
const realShopifyStartIdx = content.indexOf('{/* ── Shopify Sales Dashboard ── */}', colSpan2Start);
const crewCreationMatch = content.indexOf('Create Crew Account', realShopifyStartIdx);
const realCrewCreationEndIdx = content.indexOf('</section>', crewCreationMatch) + '</section>'.length;

const mappedLoop = `
            {sectionOrder.map((key, index) => {
              const dragProps = {
                draggable: true,
                onDragStart: (e: any) => {
                  if (!e.target.closest('.drag-handle')) {
                    e.preventDefault();
                    return;
                  }
                  handleDragStart(index);
                },
                onDragOver: (e: any) => handleDragOver(e, index),
                onDragEnd: handleDragEnd,
                className: "transition-all duration-300 " + (draggedIndex === index ? 'opacity-40 scale-[0.98]' : '')
              };

              let component = null;
              switch (key) {
                case 'shopify': component = renderShopify(); break;
                case 'toursync': component = renderTourSync(); break;
                case 'bookings': component = renderBookings(); break;
                case 'planners': component = renderPlanners(); break;
                case 'photomod': component = renderPhotoMod(); break;
                case 'memorymod': component = renderMemoryMod(); break;
                case 'referral': component = renderReferral(); break;
                case 'livealerts': component = renderLiveAlerts(); break;
                case 'smsblast': component = renderSmsBlast(); break;
                case 'crewsms': component = renderCrewSms(); break;
                case 'newsletter': component = renderNewsletter(); break;
                case 'registry': component = renderRegistry(); break;
                case 'crewcreation': component = renderCrewCreation(); break;
                case 'invitechallenge': component = renderInviteChallenge(); break;
              }

              return (
                <div key={key} {...dragProps}>
                  {component}
                </div>
              );
            })}
`;

content = content.substring(0, realShopifyStartIdx) + mappedLoop.trim() + "\n" + content.substring(realCrewCreationEndIdx);

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Successfully assembled page.tsx!");
