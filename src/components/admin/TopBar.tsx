"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

function titleForPath(pathname: string): string {
  if (pathname.startsWith("/admin/news-quellen")) return "News-Quellen";
  if (pathname.startsWith("/admin/artikel")) return "Artikel";
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  if (pathname.startsWith("/admin/kategorien")) return "Kategorien";
  if (pathname.startsWith("/admin/redakteure")) return "Redakteure";
  return "Administration";
}

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = titleForPath(pathname);
  const user = session?.user;
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-[#111111] hover:bg-[#F9F9F9] md:hidden"
          aria-label="Menü öffnen"
          onClick={onMenuClick}
        >
          <Menu className="size-6" />
        </button>
        <h1 className="font-display truncate text-lg font-bold tracking-wide text-[#111111] md:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {user ? (
          <div className="hidden items-center gap-3 sm:flex">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="size-9 rounded-full object-cover ring-1 ring-[#E5E5E5]"
              />
            ) : (
              <span
                className="flex size-9 items-center justify-center rounded-full bg-[#F9F9F9] font-display text-sm font-bold text-[#E31E24] ring-1 ring-[#E5E5E5]"
                aria-hidden
              >
                {initials}
              </span>
            )}
            <div className="flex min-w-0 flex-col text-right leading-tight">
              <span className="font-display truncate text-sm font-semibold text-[#111111]">
                {user.name}
              </span>
              <span className="truncate text-xs text-[#666666]">
                {user.email}
              </span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className={cn(
            "font-display inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
            "text-[#666666] hover:bg-[#F9F9F9] hover:text-[#111111]"
          )}
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="size-4" aria-hidden />
          <span className="hidden sm:inline">Abmelden</span>
        </button>
      </div>
    </header>
  );
}
