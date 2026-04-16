"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  CalendarDays,
  FileText,
  FolderOpen,
  Globe,
  LayoutDashboard,
  LogOut,
  Store,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navBase =
  "font-display flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wide transition-colors";

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const links: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    adminOnly?: boolean;
  }[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/artikel", label: "Artikel", icon: FileText },
    { href: "/admin/events", label: "Messen & Events", icon: CalendarDays },
    { href: "/admin/haendler", label: "Händler", icon: Store },
    { href: "/admin/kategorien", label: "Kategorien", icon: FolderOpen },
    {
      href: "/admin/news-quellen",
      label: "News-Quellen",
      icon: Globe,
      adminOnly: true,
    },
    {
      href: "/admin/redakteure",
      label: "Redakteure",
      icon: Users,
      adminOnly: true,
    },
  ];

  const visibleLinks = links.filter((l) => !l.adminOnly || isAdmin);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Navigation schließen"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E5E5E5] bg-white transition-transform duration-200 ease-out md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-[#E5E5E5] px-4">
          <Link
            href="/admin/dashboard"
            className="font-display text-xl font-bold tracking-tight text-[#111111]"
            onClick={onMobileClose}
          >
            motorrad<span className="text-[#E31E24]">.news</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Hauptnavigation">
          {visibleLinks.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  navBase,
                  active
                    ? "bg-[#E31E24] text-white"
                    : "text-[#111111] hover:bg-[#F9F9F9]"
                )}
                onClick={onMobileClose}
              >
                <Icon className="size-5 shrink-0 opacity-90" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E5E5E5] p-3 space-y-3">
          <div className="px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-[#999999]">
              motorrad.news powered by
            </p>
            <Image
              src="/arider-logo.svg"
              alt="aRider"
              width={120}
              height={32}
              className="mt-2 h-8 w-auto"
            />
          </div>
          <button
            type="button"
            className={cn(
              navBase,
              "w-full text-[#666666] hover:bg-[#F9F9F9] hover:text-[#111111]"
            )}
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
            Abmelden
          </button>
        </div>
      </aside>
    </>
  );
}
