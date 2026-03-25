import Link from "next/link";
import { cn } from "@/lib/utils";
export type CategoryNavItem = {
  name: string;
  slug: string;
};

export type CategoryNavProps = {
  categories: CategoryNavItem[];
  activeSlug?: string;
};

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      className="sticky top-16 z-40 border-b border-[#E5E5E5] bg-white/95 backdrop-blur-sm"
      aria-label="Kategorien"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="-mx-1 flex gap-2 overflow-x-auto py-3 [scrollbar-width:thin]">
          {categories.map((cat) => {
            const active = activeSlug === cat.slug;
            return (
              <li key={cat.slug} className="shrink-0">
                <Link
                  href={`/${cat.slug}`}
                  className={cn(
                    "font-display inline-block rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
                    active
                      ? "bg-[#E31E24] text-white"
                      : "bg-[#F9F9F9] text-[#111111] hover:bg-[#E5E5E5]",
                  )}
                >
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
