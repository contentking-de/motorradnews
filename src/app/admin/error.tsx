"use client";

export default function AdminError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const message =
    error.message?.trim() ||
    "Bitte laden Sie die Seite erneut oder versuchen Sie es später noch einmal.";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-[#E5E5E5] bg-white p-6 shadow-sm">
        <h1 className="font-display text-lg font-bold text-[#111111]">
          Ein Fehler ist aufgetreten
        </h1>
        <p className="mt-3 text-sm text-[#666666]">{message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 w-full rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] px-4 py-2 text-sm font-medium text-[#111111] transition-colors hover:bg-[#E5E5E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E31E24] focus-visible:ring-offset-2"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
