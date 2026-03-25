import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#111111] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-display text-sm text-white/90">
          © 2024 motorrad.news
        </p>
        <nav className="font-display flex flex-wrap gap-6 text-sm font-semibold uppercase tracking-wide">
          <Link href="#" className="text-white/80 transition-colors hover:text-white">
            Impressum
          </Link>
          <Link href="#" className="text-white/80 transition-colors hover:text-white">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
