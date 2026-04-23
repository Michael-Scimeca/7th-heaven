import Link from "next/link";

export default function NotFound() {
 return (
  <main className="min-h-screen bg-[rgb(10,10,15)] flex items-center justify-center px-6 relative overflow-hidden">
   {/* Background ambient */}
   <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-accent)] opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

   <div className="text-center relative z-10 max-w-lg">
    {/* Glitch 404 number */}
    <div className="relative mb-8">
     <h1
      className="text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-transparent select-none"
      style={{
       WebkitTextStroke: "2px rgba(168,85,247,0.3)",
      }}
     >
      404
     </h1>
     <h1
      className="absolute inset-0 text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-accent)] to-[#ec4899] select-none animate-pulse"
      style={{ opacity: 0.15 }}
     >
      404
     </h1>
    </div>

    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-3">
     Page Not <span className="text-[var(--color-accent)]">Found</span>
    </h2>

    <p className="text-white/40 text-sm md:text-base mb-10 max-w-sm mx-auto leading-relaxed">
     The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
    </p>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
     <Link
      href="/"
      className="px-8 py-3.5 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] hover:brightness-110 transition-all shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]"
     >
      Back to Home
     </Link>
     <Link
      href="/tour"
      className="px-8 py-3.5 border border-white/15 text-white/50 hover:text-white hover:border-white/30 font-bold text-sm uppercase tracking-[0.15em] transition-all"
     >
      View Tour Dates
     </Link>
    </div>

    <p className="mt-16 text-[0.6rem] uppercase tracking-[0.25em] text-white/15 font-bold">
     7th Heaven — Lost in the mix
    </p>
   </div>
  </main>
 );
}
