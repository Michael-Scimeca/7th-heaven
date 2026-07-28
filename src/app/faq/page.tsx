"use client";

import React, { useState, useMemo } from "react";

interface FAQItem {
  id: string;
  category: "booking" | "merch" | "cruise" | "fan";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  // Experience & Booking
  {
    id: "arrive-time",
    category: "booking",
    question: "What time should I arrive?",
    answer: "Please be sure to arrive promptly at the time booked on your ticket to be sure to get the most out of your experience and screening."
  },
  {
    id: "light-sensitivity",
    category: "booking",
    question: "Is this experience suitable for people with light sensitivity?",
    answer: "This film and installation includes flashing lights and strobe effects that may not be suitable for photosensitive individuals."
  },
  {
    id: "how-to-book",
    category: "booking",
    question: "How do I book tickets or hire the band for an event?",
    answer: "Navigate to our Book Us page, fill out the booking request form with your event details (date, venue, and time), and submit it. Our system will immediately trigger an admin alert, and you will receive a status confirmation email once our team reviews the event details."
  },
  {
    id: "booking-status-changes",
    category: "booking",
    question: "How will I track updates on my booking?",
    answer: "Whenever our event planner changes the status of your booking (e.g., from pending to confirmed), you will automatically receive a detailed status update email outlining all schedule details, venue name, and event setup."
  },
  
  // Merch & Store
  {
    id: "delivery-methods",
    category: "merch",
    question: "What delivery options are available for merchandise?",
    answer: "We support two options during checkout: standard home delivery via our Shopify Storefront API, and Merch Table Pickup. Pickups allow you to collect your items directly at the merch table of our next live concert, saving you shipping costs!"
  },
  {
    id: "pickup-verification",
    category: "merch",
    question: "How do I verify and collect my pickup orders?",
    answer: "Once you place a pickup order, our system generates a unique QR code and sends it to you via email. Simply present this QR code on your mobile device at the show's merch table, where our crew will scan it to verify and release your items."
  },
  {
    id: "shipping-timeframes",
    category: "merch",
    question: "How long does home shipping take?",
    answer: "Standard shipping orders processed via our Shopify API typically ship within 2 to 3 business days, and home delivery takes about 5 to 7 business days depending on your location."
  },

  // Cruise
  {
    id: "cruise-signup",
    category: "cruise",
    question: "How do I join the 7th Heaven Cruise community?",
    answer: "Head over to the Cruise page, select the guest count you are planning to bring, fill out your guest contact list, and check the option to join our newsletter. You will receive an immediate welcome invitation email to our cruise hub."
  },
  {
    id: "cruise-cancel",
    category: "cruise",
    question: "What if I need to cancel my cruise signup?",
    answer: "Your Cruise Confirmation email contains a secure cancellation link. Clicking it allows you to cancel your signup instantly without needing to contact support, updating the admin roster in real-time."
  },
  {
    id: "cruise-blasts",
    category: "cruise",
    question: "What is the Cruise Community Blast?",
    answer: "It's our dedicated news broadcast sent to all signed-up cruisers. These emails keep you up to date on cabin pricing previews, medley setlist votes, shore excursions, and cabin booking timelines."
  },

  // Fan Club & Portal
  {
    id: "fan-perks",
    category: "fan",
    question: "What perks do Fan Members get?",
    answer: "Fan members enjoy exclusive perks including a custom Fan Dashboard, VIP rewards, early access to cruise announcements, proximity notifications for nearby concerts, entries into our live-show merch table raffles, and the ability to upload media to our Fan Photo/Video Wall."
  },
  {
    id: "upload-moderation",
    category: "fan",
    question: "What happens when I upload photos to the Fan Wall?",
    answer: "To ensure content suitability, all uploaded photos and videos are placed in a moderation queue. Once our crew reviews your media, you will receive an automatic email notifying you if it was approved or rejected (with the specific rejection reason included in the alert)."
  },
  {
    id: "pin-number-purpose",
    category: "fan",
    question: "What is the security PIN email for?",
    answer: "To keep account creation simple and password-less, we send a secure 6-digit verification PIN to your email address during signup, password reset, or when verifying a new device. This applies to all system roles, including Fans, Planners, Crew, and Admins."
  }
];

// Custom Inline SVG Icons to prevent external package dependencies
const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
);

const StoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

const ShipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21h20"/><path d="M19.3 14.8C21.1 13.5 22 11.7 22 9.5a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 9.5c0 2.2.9 4 2.7 5.3L12 21Z"/><path d="M12 8V2l4 2-4 2"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
);

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpIcon, color: "text-[#8a1cfc]" },
  { id: "booking", label: "Booking & Shows", icon: TicketIcon, color: "text-emerald-400" },
  { id: "merch", label: "Store & Merch", icon: StoreIcon, color: "text-amber-400" },
  { id: "cruise", label: "Cruise Community", icon: ShipIcon, color: "text-sky-400" },
  { id: "fan", label: "Fan Portal & Club", icon: UsersIcon, color: "text-rose-400" }
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      const matchesCategory = activeTab === "all" || faq.category === activeTab;
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] pt-[112px] pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-[var(--color-accent)]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--color-accent)]/10 border border-[#8a1cfc]/20 rounded-full px-4 py-1.5 mb-4 text-[var(--color-accent-soft)] text-xs font-bold uppercase tracking-wider">
            <SparklesIcon />
            Support Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase mb-4">
            Frequently Asked <span className="text-[#8a1cfc]">Questions</span>
          </h1>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Got questions about tickets, shipping, our cruise community, or the fan portal? We have answers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8a1cfc] to-emerald-500 rounded-2xl opacity-10 group-focus-within:opacity-20 blur-lg transition duration-300" />
          <div className="relative bg-[var(--color-bg-surface)] border border-white/5 group-focus-within:border-[#8a1cfc]/40 rounded-2xl p-1.5 flex items-center transition duration-200">
            <div className="pl-4 pr-2 text-white/40">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search questions, keywords, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-white placeholder-white/35 py-3 text-sm focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-white/40 hover:text-white px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition duration-200 border ${
                  isActive 
                    ? "bg-[var(--color-accent)] border-[#8a1cfc] text-white shadow-lg shadow-[#8a1cfc]/20" 
                    : "bg-[var(--color-bg-surface)] border-white/5 text-white/60 hover:text-white hover:border-white/10"
                }`}
              >
                <span className={isActive ? "text-white" : cat.color}>
                  <Icon />
                </span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => {
              const isExpanded = !!expandedItems[faq.id];
              return (
                <div 
                  key={faq.id}
                  className={`bg-[var(--color-bg-surface)] border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded 
                      ? "border-[#8a1cfc]/30 shadow-md shadow-[#8a1cfc]/5" 
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-extrabold text-sm sm:text-base text-white/90 group-hover:text-white transition duration-200">
                      {faq.question}
                    </span>
                    <div className={`p-1.5 rounded-lg bg-white/5 text-white/40 transform transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-[#8a1cfc]" : ""
                    }`}>
                      <ChevronDownIcon />
                    </div>
                  </button>
                  
                  {/* Expanded Answer with height transition */}
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? "max-h-[300px] border-t border-white/5 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    } overflow-hidden`}
                  >
                    <div className="p-5 sm:p-6 text-sm text-white/60 leading-relaxed bg-[var(--color-bg-surface)]/40">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-[var(--color-bg-surface)] border border-white/5 rounded-3xl p-8">
              <span className="text-white/20 inline-block mb-4 scale-150">
                <HelpIcon />
              </span>
              <h3 className="text-white font-extrabold text-lg mb-1">No matches found</h3>
              <p className="text-white/40 text-sm max-w-xs mx-auto">
                We couldn't find any FAQs matching "{searchQuery}". Try using different terms or browse standard categories.
              </p>
            </div>
          )}
        </div>

        {/* Live Support Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#8a1cfc]/10 to-emerald-500/10 border border-[#8a1cfc]/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-white font-extrabold text-lg mb-1">Still need help?</h4>
            <p className="text-white/60 text-sm">
              Can't find the answer you are looking for? Reach out to our direct support.
            </p>
          </div>
          <a
            href="/contact"
            className="px-6 py-3 rounded-full bg-[var(--color-accent)] hover:bg-[#9d47ff] text-white font-bold text-sm transition duration-200 whitespace-nowrap shadow-lg shadow-[#8a1cfc]/20"
          >
            Contact Us
          </a>
        </div>

      </div>
    </div>
  );
}
