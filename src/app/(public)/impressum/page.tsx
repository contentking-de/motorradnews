import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum der motorrad.news – Arider GmbH & Co. KG",
  alternates: { canonical: "/impressum" },
  openGraph: {
    type: "website",
    title: "Impressum",
    description: "Impressum der motorrad.news – Arider GmbH & Co. KG",
  },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight text-[#111111] md:text-4xl">
        Impressum
      </h1>

      <div className="mt-8 space-y-8 text-[#111111] leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Angaben gemäß § 5 TMG
          </h2>
          <address className="mt-3 not-italic space-y-1">
            <p className="font-semibold">Arider GmbH &amp; Co. KG</p>
            <p>Inhaber: Marius Klein</p>
            <p>Ketellerstraße 5 – 11</p>
            <p>Pavillon 12</p>
            <p>97222 Rimpar</p>
          </address>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Handelsregister
          </h2>
          <div className="mt-3 space-y-2">
            <p>Amtsgericht Würzburg, HRA 8922</p>
            <p>
              Persönlich haftende Gesellschafterin: Arider Verwaltungs GmbH,
              Gesellschaft mit beschränkter Haftung, eingetragen beim
              Amtsgericht Würzburg unter HRB 17675
            </p>
            <p>Vertreten durch den Geschäftsführer: Marius Klein</p>
            <p>Umsatzsteuer-Identifikationsnummer: DE451510652</p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Kontakt
          </h2>
          <div className="mt-3 space-y-1">
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
            <p className="mt-2 text-sm text-[#666666]">
              Bei Kundenanfragen bitte an kontakt@arider.de. Telefonisch sind
              wir von Mo – Fr 09:00 – 12:00 Uhr und 14:00 – 16:00 Uhr
              erreichbar.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Redaktionell Verantwortliche
          </h2>
          <p className="mt-1 text-sm text-[#666666]">
            im Sinne des § 18 Abs. 2 MStV
          </p>
          <address className="mt-3 not-italic space-y-1">
            <p className="font-semibold">Marius Klein</p>
            <p>Ketellerstraße 5 – 11</p>
            <p>Pavillon 12</p>
            <p>97222 Rimpar</p>
          </address>
          <p className="mt-2 text-sm text-[#666666]">
            Kontaktdaten entsprechen den Angaben wie oben.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            Außergerichtliche Streitbeilegung
          </h2>
          <div className="mt-3 space-y-3">
            <p>
              Seitens der Europäischen Kommission wird eine Online-Plattform zur
              außergerichtlichen Streitbeilegung bereitgehalten. Diese Plattform
              können Sie unter folgendem Link abrufen:{" "}
              <a
                href="http://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                ec.europa.eu/consumers/odr
              </a>
              . In diesem Zusammenhang sind wir darüber hinaus verpflichtet,
              Ihnen unsere E-Mail-Adresse mitzuteilen. Diese lautet:{" "}
              <a
                href="mailto:kontakt@arider.de"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                kontakt@arider.de
              </a>
              .
            </p>
            <p>
              Wir sind weder bereit noch verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
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
