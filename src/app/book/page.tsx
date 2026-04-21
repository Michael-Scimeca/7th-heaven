"use client";

import { useState } from "react";

const eventTypes = [
  { id: "bar", label: "Bar / Club", icon: "🍺", desc: "Full band, high energy rock show" },
  { id: "festival", label: "Festival", icon: "🎪", desc: "Outdoor stage, large crowd performances" },
  { id: "private", label: "Private Event", icon: "🎉", desc: "Birthdays, anniversaries, house parties" },
  { id: "corporate", label: "Corporate", icon: "🏢", desc: "Company events, galas, holiday parties" },
  { id: "unplugged", label: "Unplugged", icon: "🎸", desc: "Acoustic set, intimate venue" },
  { id: "wedding", label: "Wedding", icon: "💍", desc: "Ceremonies, receptions, cocktail hours" },
];

const budgetRanges = [
  "Under $2,000",
  "$2,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000 – $20,000",
  "$20,000+",
  "Prefer not to say",
];

const faqs = [
  {
    q: "How far in advance should I book?",
    a: "We recommend booking at least 4-8 weeks in advance for bar/club shows and 3-6 months for festivals, weddings, and corporate events. Popular dates (holidays, summer weekends) fill up fast.",
  },
  {
    q: "Is a deposit required?",
    a: "Yes, a 50% non-refundable deposit is required to secure your date. The remaining balance is due 7 days before the event.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancellations made 30+ days before the event receive a 50% credit toward a future date. Cancellations within 30 days forfeit the deposit. Weather-related cancellations for outdoor events are handled on a case-by-case basis.",
  },
  {
    q: "Do you travel outside the Chicago area?",
    a: "Absolutely. We perform nationwide and internationally. Travel fees may apply for events beyond 100 miles from Chicago and will be discussed during the booking process.",
  },
  {
    q: "What equipment do you bring?",
    a: "We bring all of our own instruments, microphones, and monitoring. For venues without a PA system, we can provide full sound reinforcement for an additional fee. Let us know your venue's setup in the form.",
  },
  {
    q: "Can you customize the setlist?",
    a: "Yes! We can tailor the setlist to your event — whether you want all originals, covers, a mix, or specific songs for special moments like a first dance.",
  },
  {
    q: "What's the difference between a full show and unplugged?",
    a: "A full show is the complete 5-piece band with full backline and PA at concert volume. An unplugged set is a stripped-down acoustic performance, perfect for intimate venues, restaurants, and cocktail hours.",
  },
];

export default function BookPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    eventDate: "",
    altDate: "",
    eventTime: "",
    venueName: "",
    venueCity: "",
    venueState: "",
    indoorOutdoor: "",
    expectedAttendance: "",
    budget: "",
    setLength: "Full Show (3-4 hours)",
    soundSystem: "",
    stageAvailable: "",
    backlineProvided: "",
    ageRestriction: "",
    loadInTime: "",
    details: "",
    hearAbout: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventType: selectedType }),
      });
      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">{label}{required && " *"}</label>
      <input {...props} required={required}
        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[0.85rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
      />
    </div>
  );

  const SelectField = ({ label, options, required, ...props }: { label: string; options: string[]; required?: boolean } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div>
      <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">{label}{required && " *"}</label>
      <select {...props} required={required}
        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[0.85rem] text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors appearance-none cursor-pointer"
      >
        <option value="" className="bg-[#0a0a0f]">Select</option>
        {options.map(o => <option key={o} value={o} className="bg-[#0a0a0f]">{o}</option>)}
      </select>
    </div>
  );

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-6">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 mx-auto mb-8 bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4">Request Received</h1>
          <p className="text-white/50 text-[0.95rem] leading-relaxed mb-8">
            Thank you for your interest in booking 7th Heaven! We&apos;ll review your request and get back to you within 24-48 hours.
          </p>
          <a href="/" className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.8rem] py-3 px-8 transition-all">
            Back to Home
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-[var(--color-bg-primary)] min-h-screen" id="book-event">
      <div className="site-container max-w-[900px]">

        {/* Header */}
        <div className="mb-16 text-center">
          <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">
            Book 7th Heaven
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight text-white">
            Request a <span className="gradient-text">Date</span>
          </h1>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-[0.95rem]">
            Fill out the form below and we&apos;ll get back to you within 24-48 hours to discuss your event.
          </p>
        </div>

        {/* Testimonial */}
        <div className="mb-16 border border-white/10 bg-white/[0.02] p-8 relative">
          <div className="absolute top-4 left-6 text-4xl text-[var(--color-accent)]/30 leading-none">&ldquo;</div>
          <p className="text-white/60 text-[0.9rem] leading-relaxed italic pl-8 pr-4 mb-4">
            7th Heaven absolutely crushed it. Our guests couldn&apos;t stop talking about the band for weeks. From the first call to the last song, everything was professional and seamless. Already booked them again for next year.
          </p>
          <div className="pl-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.65rem] font-bold text-[var(--color-accent)]">JM</div>
            <div>
              <span className="text-[0.75rem] font-bold text-white block">Jake M.</span>
              <span className="text-[0.6rem] text-white/30">Corporate Event Manager — Chicago, IL</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Step 1: Event Type */}
          <div className="mb-14">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              1 — What type of event?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {eventTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`text-left p-5 border transition-all cursor-pointer group ${
                    selectedType === type.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-2xl block mb-2">{type.icon}</span>
                  <span className={`text-[0.8rem] font-bold block mb-1 ${
                    selectedType === type.id ? "text-[var(--color-accent)]" : "text-white"
                  }`}>{type.label}</span>
                  <span className="text-[0.65rem] text-white/30 block leading-relaxed">{type.desc}</span>
                </button>
              ))}
            </div>

            {/* Pricing hint per type */}
            {selectedType && (
              <div className="mt-4 px-5 py-3 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 text-[0.75rem] text-white/50">
                <span className="text-[var(--color-accent)] font-bold">Pricing:</span>{" "}
                {selectedType === "bar" && "Bar & club shows typically start at $1,500 – $3,000 depending on set length and location."}
                {selectedType === "festival" && "Festival performances start at $5,000+. Pricing varies based on set time, travel, and production needs."}
                {selectedType === "private" && "Private events start at $3,000 – $8,000. Includes custom setlist and dedicated coordination."}
                {selectedType === "corporate" && "Corporate events start at $5,000 – $15,000. Includes full production, custom setlist, and professional coordination."}
                {selectedType === "unplugged" && "Unplugged acoustic sets start at $1,000 – $2,500. Perfect for intimate settings."}
                {selectedType === "wedding" && "Wedding packages start at $4,000 – $10,000. Includes ceremony, cocktail hour, and/or reception sets."}
              </div>
            )}
          </div>

          {/* Step 2: Contact Information */}
          <div className="mb-14">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              2 — Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Smith" />
              <InputField label="Organization" name="organization" value={formData.organization} onChange={handleChange} placeholder="Venue or company name" />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@email.com" />
              <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" />
            </div>
          </div>

          {/* Step 3: Event Details */}
          <div className="mb-14">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              3 — Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">Event Date *</label>
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[0.85rem] text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">Alternate Date</label>
                <input type="date" name="altDate" value={formData.altDate} onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[0.85rem] text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">Preferred Start Time</label>
                <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[0.85rem] text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
              <InputField label="Load-in / Setup Time" name="loadInTime" value={formData.loadInTime} onChange={handleChange} placeholder="e.g. 3:00 PM, 2 hours before" />
              <InputField label="Venue Name" name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Venue name" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="City" name="venueCity" value={formData.venueCity} onChange={handleChange} required placeholder="Chicago" />
                <InputField label="State" name="venueState" value={formData.venueState} onChange={handleChange} required placeholder="IL" />
              </div>
            </div>
          </div>

          {/* Step 4: Venue & Technical */}
          <div className="mb-14">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              4 — Venue & Technical
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Indoor / Outdoor" name="indoorOutdoor" value={formData.indoorOutdoor} onChange={handleChange} options={["Indoor", "Outdoor", "Both / Hybrid", "TBD"]} />
              <SelectField label="Sound System Available?" name="soundSystem" value={formData.soundSystem} onChange={handleChange} options={["Yes — full PA system", "Partial — need supplemental", "No — band needs to provide", "Not sure"]} />
              <SelectField label="Stage Available?" name="stageAvailable" value={formData.stageAvailable} onChange={handleChange} options={["Yes", "No — performing at floor level", "Portable / riser can be arranged", "Not sure"]} />
              <SelectField label="Backline Provided?" name="backlineProvided" value={formData.backlineProvided} onChange={handleChange} options={["Yes — amps, drums, etc.", "Partial", "No — band brings everything", "Not sure"]} />
              <SelectField label="Age Restriction" name="ageRestriction" value={formData.ageRestriction} onChange={handleChange} options={["21+", "18+", "All Ages", "N/A"]} />
              <InputField label="Expected Attendance" name="expectedAttendance" value={formData.expectedAttendance} onChange={handleChange} placeholder="~200 people" />
              <SelectField label="Budget Range" name="budget" value={formData.budget} onChange={handleChange} options={budgetRanges} />
              <SelectField label="Set Length" name="setLength" value={formData.setLength} onChange={handleChange} options={["1 Set (45 min – 1 hour)", "2 Sets (2 hours)", "Full Show (3-4 hours)", "Custom"]} />
            </div>
          </div>

          {/* Step 5: Additional Info */}
          <div className="mb-14">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              5 — Additional Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SelectField label="How did you hear about us?" name="hearAbout" value={formData.hearAbout} onChange={handleChange}
                options={["Saw a live show", "Social media", "Word of mouth", "Google search", "Referral", "Other"]}
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">Additional Details</label>
              <textarea name="details" value={formData.details} onChange={handleChange} rows={4}
                className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[0.85rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors resize-none"
                placeholder="Tell us more — theme, special requests, song requests, equipment needs, stage plot details, etc."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center gap-4 mb-20">
            <button
              type="submit"
              disabled={!selectedType || submitting}
              className={`inline-flex items-center gap-3 text-white font-bold text-[0.85rem] uppercase tracking-[0.1em] py-4 px-12 transition-all ${
                selectedType
                  ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 cursor-pointer"
                  : "bg-white/10 cursor-not-allowed text-white/30"
              }`}
            >
              {submitting ? "Sending..." : "Submit Request"}
            </button>
            <p className="text-[0.65rem] text-white/20 text-center">
              By submitting, you agree to be contacted regarding your booking inquiry.
            </p>
          </div>
        </form>

        {/* FAQ Section */}
        <div className="border-t border-white/10 pt-20">
          <div className="text-center mb-12">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-white">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/10 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer group"
                >
                  <span className={`text-[0.85rem] font-bold transition-colors ${openFaq === i ? "text-[var(--color-accent)]" : "text-white group-hover:text-white/80"}`}>
                    {faq.q}
                  </span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-white/30 shrink-0 ml-4 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-5 pb-5 text-[0.8rem] text-white/40 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
