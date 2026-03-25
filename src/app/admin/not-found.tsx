import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-5xl font-bold text-[#E31E24]">404</h1>
      <h2 className="mt-3 font-display text-xl font-bold text-[#111111]">
        Nicht gefunden
      </h2>
      <p className="mt-2 text-sm text-[#666666]">
        Diese Admin-Seite existiert nicht.
      </p>
      <Link
        href="/admin/dashboard"
        className="mt-5 inline-flex items-center rounded-lg bg-[#E31E24] px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-[#C41A1F]"
      >
        Zum Dashboard
      </Link>
    </div>
  );
}
