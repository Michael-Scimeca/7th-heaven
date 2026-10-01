export default function AdminLoading() {
  return (
    <main
      className="page-container page-stack min-h-screen pt-24 pb-16"
      aria-busy="true"
      aria-label="Loading Admin Portal"
    >
      <div className="site-container mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-white/10" />
            <div className="flex flex-col gap-2">
              <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-10 w-36 animate-pulse rounded-full bg-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6" />
          <div className="h-48 animate-pulse rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6" />
          <div className="h-48 animate-pulse rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6" />
        </div>
      </div>
    </main>
  );
}
