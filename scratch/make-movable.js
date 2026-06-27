const fs = require('fs');
const path = require('path');

const pagePath = path.resolve(__dirname, '../src/app/admin/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Check if already refactored
if (content.includes('sectionOrder.map')) {
  console.log("Already refactored!");
  process.exit(0);
}

// 2. Define markers for sections
const sectionDefinitions = [
  { key: 'shopify', marker: "toggleSection('shopify')" },
  { key: 'toursync', marker: "toggleSection('toursync')" },
  { key: 'bookings', marker: "toggleSection('bookings')" },
  { key: 'planners', marker: "toggleSection('planners')" },
  { key: 'photomod', marker: "toggleSection('photomod')" },
  { key: 'memorymod', marker: "toggleSection('memorymod')" },
  { key: 'referral', marker: "<ReferralProgramPanel />" },
  { key: 'livealerts', marker: "toggleSection('livealerts')" },
  { key: 'smsblast', marker: "toggleSection('smsblast')" },
  { key: 'crewsms', marker: "toggleSection('crewsms')" },
  { key: 'newsletter', marker: "toggleSection('newsletter')" },
  { key: 'registry', marker: "toggleSection('registry')" },
  { key: 'crewcreation', marker: "Create Crew Account" }
];

// 3. Find boundaries and extract contents from original file
const sectionContents = {};
let blockStartIndex = -1;
let blockEndIndex = -1;

for (let i = 0; i < sectionDefinitions.length; i++) {
  const def = sectionDefinitions[i];
  
  const markerIndex = content.indexOf(def.marker);
  if (markerIndex === -1) {
    console.error(`Could not find marker for ${def.key}: "${def.marker}"`);
    process.exit(1);
  }
  
  const startIndex = content.lastIndexOf('<section', markerIndex);
  if (startIndex === -1) {
    console.error(`Could not find starting <section tag for ${def.key}`);
    process.exit(1);
  }
  
  const endIndex = content.indexOf('</section>', markerIndex) + '</section>'.length;
  if (endIndex === -1 || endIndex < markerIndex) {
    console.error(`Could not find closing </section> tag for ${def.key}`);
    process.exit(1);
  }
  
  if (i === 0) {
    blockStartIndex = startIndex;
  }
  if (i === sectionDefinitions.length - 1) {
    blockEndIndex = endIndex;
  }
  
  sectionContents[def.key] = content.substring(startIndex, endIndex).trim();
}

console.log("Successfully extracted all 13 sections dynamically!");

// 4. Transform Referral and Crew Creation sections to standard collapsible formats
sectionContents['referral'] = `
            {/* ── Referral Program ── */}
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div onClick={() => toggleSection('referral')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('referral')} className="text-lg font-bold tracking-tight flex items-center gap-2 cursor-pointer">
                    <span className="text-lg">🤝</span>
                    Referral Program
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('referral') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('referral') ? undefined : 'none' }} className="p-6">
                <ReferralProgramPanel />
              </div>
            </section>
`.trim();

const crewcreationOriginal = sectionContents['crewcreation'];
const crewcreationInnerStart = crewcreationOriginal.indexOf('<div className="p-6">');
const crewcreationInner = crewcreationOriginal.substring(crewcreationInnerStart);
sectionContents['crewcreation'] = `
            {/* ── Crew Account Creation (full-width below grid) ── */}
            <section className="bg-gradient-to-br from-[#0f0f13] to-[#12101a] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div onClick={() => toggleSection('crewcreation')} className="p-6 border-b border-emerald-500/10 bg-emerald-500/[0.03] cursor-pointer select-none flex items-center justify-between">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    </div>
                    <div>
                      <h3 onClick={() => toggleSection('crewcreation')} className="text-lg font-bold tracking-tight text-white cursor-pointer">Create Crew Account</h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/60 font-bold mt-0.5">Admin Only · Set credentials manually</p>
                    </div>
                  </div>
                </div>
                <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('crewcreation') ? 'rotate-0' : '-rotate-90')}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                </div>
              </div>
              <div style={{ display: isSectionOpen('crewcreation') ? undefined : 'none' }} className="p-0">
                ${crewcreationInner.substring('<div className="p-6">'.length, crewcreationInner.length - '</section>'.length).trim()}
              </div>
            </section>
`.trim();

// 5. Insert grab handles into the remaining 11 collapsible sections
const keysToHandle = ['shopify', 'toursync', 'bookings', 'planners', 'photomod', 'memorymod', 'livealerts', 'smsblast', 'crewsms', 'newsletter', 'registry'];
for (const key of keysToHandle) {
  let sectStr = sectionContents[key];
  
  const h3Index = sectStr.indexOf('<h3');
  if (h3Index === -1) {
    console.error(`Could not find <h3 in ${key}`);
    continue;
  }
  
  const h3CloseIndex = sectStr.indexOf('</h3>', h3Index);
  const h3Block = sectStr.substring(h3Index, h3CloseIndex + 5);
  
  const modifiedH3Block = `
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  ${h3Block.replace('<h3', `<h3 onClick={() => toggleSection('${key}')} className="cursor-pointer`)}
                </div>
  `.trim();
  
  sectionContents[key] = sectStr.substring(0, h3Index) + modifiedH3Block + sectStr.substring(h3CloseIndex + 5);
}

console.log("Successfully added drag handles to all section headers.");

// 6. First, replace the static layout block with the mapped loop
const mappedLoop = `
            {sectionOrder.map((key, index) => {
              const dragProps = {
                draggable: true,
                onDragStart: (e) => {
                  if (!(e.target as HTMLElement).closest('.drag-handle')) {
                    e.preventDefault();
                    return;
                  }
                  handleDragStart(index);
                },
                onDragOver: (e) => handleDragOver(e, index),
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
              }

              return (
                <div key={key} {...dragProps}>
                  {component}
                </div>
              );
            })}
`.trim();

// Perform the replacement in our content string
let updatedContent = content.substring(0, blockStartIndex) + mappedLoop + content.substring(blockEndIndex);

// 7. Inject states and drag handlers
const statesAndHandlers = `
  // ── Drag & Drop Sortable Sections State & Handlers ──
  const DEFAULT_SECTION_ORDER = [
    'shopify',
    'toursync',
    'bookings',
    'planners',
    'photomod',
    'memorymod',
    'referral',
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
`;

// Insert states and handlers right after isSectionOpen helper
const isSectionOpenStr = 'const isSectionOpen = (key: string) => !collapsedSections[key];';

// Let's modify toggleSection in the updatedContent to add saving trigger:
const originalToggleSection = `  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem('7h_admin_collapsed', JSON.stringify(next)); } catch {}
      return next;
    });
  };`;

const modifiedToggleSection = `  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { 
        localStorage.setItem('7h_admin_collapsed', JSON.stringify(next));
        saveLayoutToSupabase(sectionOrder, next);
      } catch {}
      return next;
    });
  };`;

updatedContent = updatedContent.replace(originalToggleSection, modifiedToggleSection);

const isSectionOpenIndex = updatedContent.indexOf(isSectionOpenStr);
if (isSectionOpenIndex === -1) {
  console.error("Could not find isSectionOpen index in updatedContent");
  process.exit(1);
}
const insertStatePos = isSectionOpenIndex + isSectionOpenStr.length;
updatedContent = updatedContent.substring(0, insertStatePos) + statesAndHandlers + updatedContent.substring(insertStatePos);

// 8. Prepend the helper functions right before the main "return (" of AdminDashboard
const mainReturnStr = 'return (\n    <div className="min-h-screen bg-[#050508]';
const mainReturnIndex = updatedContent.indexOf(mainReturnStr);
if (mainReturnIndex === -1) {
  console.error("Could not find main return statement in updatedContent");
  process.exit(1);
}

const renderHelpers = `
  // ── Section Helper Render Functions for Movable Layout ──
  const renderShopify = () => (
    ${sectionContents['shopify']}
  );

  const renderTourSync = () => (
    ${sectionContents['toursync']}
  );

  const renderBookings = () => (
    ${sectionContents['bookings']}
  );

  const renderPlanners = () => (
    ${sectionContents['planners']}
  );

  const renderPhotoMod = () => (
    ${sectionContents['photomod']}
  );

  const renderMemoryMod = () => (
    ${sectionContents['memorymod']}
  );

  const renderReferral = () => (
    ${sectionContents['referral']}
  );

  const renderLiveAlerts = () => (
    ${sectionContents['livealerts']}
  );

  const renderSmsBlast = () => (
    ${sectionContents['smsblast']}
  );

  const renderCrewSms = () => (
    ${sectionContents['crewsms']}
  );

  const renderNewsletter = () => (
    ${sectionContents['newsletter']}
  );

  const renderRegistry = () => (
    ${sectionContents['registry']}
  );

  const renderCrewCreation = () => (
    ${sectionContents['crewcreation']}
  );
`;

updatedContent = updatedContent.substring(0, mainReturnIndex) + renderHelpers + updatedContent.substring(mainReturnIndex);

// 9. Write the file back
fs.writeFileSync(pagePath, updatedContent, 'utf8');
console.log("Refactoring complete! File saved successfully.");
