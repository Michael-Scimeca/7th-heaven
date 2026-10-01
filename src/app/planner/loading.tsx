export default function PlannerLoading() {
  return (
    <main
      className="page-container flex min-h-screen items-center justify-center pt-24 pb-16"
      aria-busy="true"
      aria-label="Loading Planner Portal"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
        <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
      </div>
    </main>
  );
}
