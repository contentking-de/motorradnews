"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "E-Mail oder Passwort ist ungültig. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut."
        );
        return;
      }

      if (result?.ok) {
        router.push("/admin/dashboard");
        router.refresh();
        return;
      }

      setError("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } catch {
      setError(
        "Es ist ein technischer Fehler aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white px-4 py-12">
      {/* Subtiler Motorsport-Hintergrund: Zielflaggen-Raster + diagonale Speed-Linien */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(135deg, #111 25%, transparent 25%),
            linear-gradient(225deg, #111 25%, transparent 25%),
            linear-gradient(45deg, #111 25%, transparent 25%),
            linear-gradient(315deg, #111 25%, transparent 25%)
          `,
          backgroundSize: "12px 12px",
          backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-[140%] w-48 -translate-y-1/2 skew-x-[-12deg] bg-gradient-to-b from-[#E31E24]/[0.07] via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-32 w-[120%] skew-y-[-2deg] border-t border-[#E31E24]/15 bg-gradient-to-r from-transparent via-[#F9F9F9] to-transparent"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <header className="mb-10 text-center">
          <div className="mb-2 inline-flex items-baseline gap-0 font-display">
            <span className="text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
              motorrad
            </span>
            <span className="text-3xl font-bold tracking-tight text-[#E31E24] sm:text-4xl">
              .news
            </span>
          </div>
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[#E31E24]" aria-hidden />
          <h1 className="font-display text-xl font-bold uppercase tracking-[0.2em] text-[#111111] sm:text-2xl">
            CMS-Anmeldung
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Melden Sie sich mit Ihren Redaktionsdaten an.
          </p>
        </header>

        <div className="relative rounded-2xl border border-[#E5E5E5] bg-white/90 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:p-10">
          <div
            className="absolute left-0 top-8 bottom-8 w-1 rounded-r-full bg-[#E31E24]"
            aria-hidden
          />

          <form onSubmit={handleSubmit} className="space-y-6 pl-2 sm:pl-4">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </div>
            )}

            <Input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              label="E-Mail-Adresse"
              placeholder="name@beispiel.de"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
              disabled={isSubmitting}
            />

            <Input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              label="Passwort"
              placeholder="••••••••"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full uppercase tracking-wide"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Wird angemeldet…" : "Anmelden"}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-[#999999]">
          Nur für autorisierte Redakteurinnen und Redakteure.
        </p>
      </div>
    </div>
  );
}
