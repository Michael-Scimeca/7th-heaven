"use client";

import { useState } from "react";
import MediaPagination, {
  PAGINATION_INFO,
  PAGINATION_VARIANTS,
  type PaginationVariant,
} from "@/components/MediaPagination";
import { PageSection } from "@/components/PageSection";
import { SectionHeader } from "@/components/SectionHeader";
import { Stack } from "@/components/Stack";

const PAGE_SIZE = 20;
const COUNTS = [98, 400] as const;

function VariantDemo({ variant, total }: { variant: PaginationVariant; total: number }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const safePage = Math.min(page, totalPages);
  return (
    <div className="flex min-h-48 w-full items-center justify-center rounded-[var(--radius-box)] bg-black/30 px-4 py-8 sm:px-8">
      <MediaPagination
        variant={variant}
        page={safePage}
        totalPages={totalPages}
        totalItems={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

export default function PaginationPreviewClient() {
  const [total, setTotal] = useState<number>(COUNTS[0]);

  return (
    <main className="flex flex-col">
      <header className="site-container flex flex-col gap-4 pt-32">
        <h1>Pagination Styles</h1>
        <p className="text-[var(--color-text-secondary)]">
          20 ways to page through the video archive. Every one is live — click around. Switch to 400 videos to see how
          each handles lots of pages.
        </p>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Number of videos">
          {COUNTS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={total === c}
              onClick={() => setTotal(c)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)] ${
                total === c ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {c} videos ({Math.ceil(c / PAGE_SIZE)} pages)
            </button>
          ))}
        </div>
      </header>

      {PAGINATION_VARIANTS.map((v, i) => {
        const id = `pagination-${v}`;
        return (
          <PageSection key={v} id={id} size="sm" aria-labelledby={`${id}-heading`}>
            <Stack gap="md">
              <SectionHeader
                id={`${id}-heading`}
                title={`${String(i + 1).padStart(2, "0")} · ${PAGINATION_INFO[v].name}`}
                subtitle={PAGINATION_INFO[v].desc}
                divider={false}
              />
              <VariantDemo variant={v} total={total} />
            </Stack>
          </PageSection>
        );
      })}
    </main>
  );
}
