"use client";

export default function PublicError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const message =
    error.message?.trim() ||
    "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-md rounded-xl border border-[#E5E5E5] bg-white p-8 shadow-sm">
        <div
          className="mb-6 h-1 w-12 rounded-full bg-[#E31E24]"
          aria-hidden
        />
        <h1 className="font-display text-xl font-bold tracking-tight text-[#111111] sm:text-2xl">
          Etwas ist schiefgelaufen
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#666666]">{message}</p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-[#999999]">
            Referenz: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[#E31E24] px-4 py-2.5 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E31E24] focus-visible:ring-offset-2 sm:w-auto"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
