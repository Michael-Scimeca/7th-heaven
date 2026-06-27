export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 bg-[#07070a] flex flex-col items-center justify-center">
      {/* Logo mark */}
      <div className="mb-8 opacity-30 animate-pulse">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <polygon
            points="20,2 38,38 2,38"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
          />
          <line x1="20" y1="2" x2="20" y2="38" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Animated bar */}
      <div className="w-40 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)] rounded-full"
          style={{
            animation: 'loading-bar 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes loading-bar {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 70%;  margin-left: 15%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
