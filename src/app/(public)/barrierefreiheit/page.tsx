import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Erklärung zur Barrierefreiheit",
  description:
    "Erklärung zur Barrierefreiheit der motorrad.news – Arider GmbH & Co. KG gemäß BFSG",
  alternates: { canonical: "/barrierefreiheit" },
  openGraph: {
    type: "website",
    title: "Erklärung zur Barrierefreiheit",
    description:
      "Erklärung zur Barrierefreiheit der motorrad.news – Arider GmbH & Co. KG gemäß BFSG",
    url: "/barrierefreiheit",
  },
};

export default function BarrierefreiheitPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight text-[#111111] md:text-4xl">
        Erklärung zur Barrierefreiheit
      </h1>
      <p className="mt-4 leading-relaxed text-[#111111]">
        Die Arider GmbH &amp; Co. KG ist bemüht, die Website{" "}
        <strong>motorrad.news</strong> im Einklang mit dem
        Barrierefreiheitsstärkungsgesetz (BFSG) sowie der harmonisierten
        europäischen Norm EN&nbsp;301&nbsp;549 barrierefrei zugänglich zu
        machen.
      </p>

      <div className="mt-10 space-y-10 text-[#111111] leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Stand der Konformität
          </h2>
          <p className="mt-3">
            Diese Website ist <strong>teilweise konform</strong> mit der
            EN&nbsp;301&nbsp;549 bzw. den Web Content Accessibility Guidelines
            (WCAG)&nbsp;2.1 Level&nbsp;AA. Die nachstehend aufgeführten Inhalte
            sind noch nicht vollständig barrierefrei.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Nicht barrierefreie Inhalte
          </h2>
          <p className="mt-3">
            Folgende Inhalte sind derzeit noch nicht oder nur eingeschränkt
            barrierefrei:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Farbkontraste einzelner Textelemente können in bestimmten
              Bereichen unterhalb der Mindestanforderungen liegen.
            </li>
            <li>
              Bei eingebetteten Inhalten von Drittanbietern (z.&nbsp;B. Karten)
              kann die Barrierefreiheit eingeschränkt sein.
            </li>
            <li>
              In einigen Formularen fehlen noch einzelne programmatische
              Verknüpfungen zwischen Feldern und Fehlermeldungen.
            </li>
          </ul>
          <p className="mt-3">
            Wir arbeiten kontinuierlich daran, bestehende Barrieren abzubauen
            und die Zugänglichkeit unserer Website zu verbessern.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Erstellung dieser Erklärung
          </h2>
          <p className="mt-3">
            Diese Erklärung wurde am <time dateTime="2026-04-17">17.&nbsp;April&nbsp;2026</time>{" "}
            erstellt. Die technische Überprüfung der Barrierefreiheit erfolgte
            durch eine Selbstbewertung.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Feedback und Kontakt
          </h2>
          <p className="mt-3">
            Sollten Ihnen Mängel in Bezug auf die barrierefreie Gestaltung
            unserer Website auffallen, können Sie uns gerne kontaktieren. Wir
            sind bemüht, Ihre Anfragen zeitnah zu beantworten und bestehende
            Probleme zu beheben.
          </p>
          <address className="mt-4 space-y-1 not-italic">
            <p className="font-semibold">Arider GmbH &amp; Co. KG</p>
            <p>Kettelerstraße 5 – 11, Pavillon 12</p>
            <p>97222 Rimpar</p>
            <p>
              E-Mail:{" "}
              <a
                href="mailto:kontakt@arider.de"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                kontakt@arider.de
              </a>
            </p>
            <p>
              Telefon:{" "}
              <a
                href="tel:+4993658274980"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                +49 9365 8274980
              </a>
            </p>
          </address>
          <p className="mt-3 text-sm text-[#666666]">
            Telefonisch erreichbar: Mo – Fr 09:00 – 12:00 Uhr und 14:00 –
            16:00 Uhr.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Durchsetzungsverfahren
          </h2>
          <p className="mt-3">
            Sollten Sie nach Ihrer Kontaktaufnahme keine zufriedenstellende
            Lösung erhalten, können Sie sich an die zuständige
            Marktüberwachungsbehörde wenden. Das Recht, sich an die zuständige
            Durchsetzungsbehörde zu wenden, bleibt hiervon unberührt.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Technische Informationen
          </h2>
          <p className="mt-3">
            Diese Website basiert auf folgenden Technologien, auf die für die
            Barrierefreiheit gesetzt wird:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>HTML5</li>
            <li>WAI-ARIA</li>
            <li>CSS</li>
            <li>JavaScript</li>
          </ul>
        </section>
      </div>

      <div className="mt-10 border-t border-[#E5E5E5] pt-6">
        <Link
          href="/"
          className="font-display text-sm font-semibold text-[#E31E24] transition-colors hover:text-[#C41A1F]"
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
