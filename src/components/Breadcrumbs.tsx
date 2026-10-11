import React from "react";
import Link from "next/link";
import { DotChevronRight } from "@/components/ui/DotArrow";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  id?: string;
}

export function Breadcrumbs({ items, className, id = "breadcrumb-nav" }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const position = index + 1;
      const fullUrl = item.href
        ? item.href.startsWith("http")
          ? item.href
          : `https://7thheavenband.com${item.href}`
        : undefined;

      return {
        "@type": "ListItem",
        position,
        name: item.name,
        ...(fullUrl ? { item: fullUrl } : {}),
      };
    }),
  };

  return (
    <>
      <script
        id={`${id}-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      <nav aria-label="Breadcrumb" id={id} className={`py-2 mb-4 ${className || ""}`}>
        <ol className="flex flex-wrap items-center gap-2 text-xs text-white/50">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href || item.name} className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className="text-white/90 font-medium truncate max-w-[280px] sm:max-w-md"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.name}
                  </span>
                )}
                {!isLast && (
                  <DotChevronRight className="h-3 w-3 text-white/30 shrink-0" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
