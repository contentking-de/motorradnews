import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-6xl font-bold text-[#E31E24]">404</h1>
      <h2 className="mt-4 font-display text-2xl font-bold text-[#111111]">
        Seite nicht gefunden
      </h2>
      <p className="mt-2 max-w-md text-[#666666]">
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-[#E31E24] px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-[#C41A1F]"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
