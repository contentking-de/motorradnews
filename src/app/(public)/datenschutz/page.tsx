import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/public/CookieSettingsButton";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung der motorrad.news – Arider GmbH & Co. KG",
  alternates: { canonical: "/datenschutz" },
  openGraph: {
    type: "website",
    title: "Datenschutzerklärung",
    description: "Datenschutzerklärung der motorrad.news – Arider GmbH & Co. KG",
    url: "/datenschutz",
  },
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight text-[#111111] md:text-4xl">
        Datenschutzerklärung
      </h1>
      <p className="mt-4 leading-relaxed text-[#111111]">
        Wir führen unsere Webseiten nach den im Folgenden geregelten
        Grundsätzen:
      </p>
      <p className="mt-3 leading-relaxed text-[#111111]">
        Wir verpflichten uns, die gesetzlichen Bestimmungen zum Datenschutz
        einzuhalten und bemühen uns, stets die Grundsätze der Datenvermeidung
        und der Datenminimierung zu berücksichtigen.
      </p>

      <div className="mt-10 space-y-10 text-[#111111] leading-relaxed">
        {/* ── 1. Verantwortlicher ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            1. Name und Anschrift des Verantwortlichen
          </h2>
          <p className="mt-3">
            Der Verantwortliche im Sinne der Datenschutz-Grundverordnung und
            anderer nationaler Datenschutzgesetze der Mitgliedsstaaten der
            Europäischen Union sowie sonstiger datenschutzrechtlicher
            Bestimmungen ist:
          </p>
          <address className="mt-4 not-italic space-y-1">
            <p className="font-semibold">Arider GmbH &amp; Co. KG</p>
            <p>Kettelerstraße 5 – 11, Pavillon 12</p>
            <p>97222 Rimpar</p>
            <p>Deutschland</p>
            <p>
              E-Mail:{" "}
              <a href="mailto:kontakt@arider.de" className="text-[#E31E24] underline hover:text-[#C41A1F]">
                kontakt@arider.de
              </a>
            </p>
            <p>Telefon: +49 9365 8274980</p>
          </address>
          <p className="mt-3 text-sm text-[#666666]">
            Bei Kundenanfragen bitte an kontakt@arider.de. Telefonisch sind wir
            von Mo – Fr 09:00 – 12:00 Uhr und 14:00 – 16:00 Uhr erreichbar.
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p>Handelsregister: Amtsgericht Würzburg, HRA 8922</p>
            <p>
              Persönlich haftende Gesellschafterin: Arider Verwaltungs GmbH,
              Gesellschaft mit beschränkter Haftung, eingetragen beim
              Amtsgericht Würzburg unter HRB 17675
            </p>
            <p>Vertreten durch den Geschäftsführer: Marius Klein</p>
            <p>Umsatzsteuer-Identifikationsnummer: DE451510652</p>
            <p>
              <a href="https://www.arider.de" target="_blank" rel="noopener noreferrer" className="text-[#E31E24] underline hover:text-[#C41A1F]">
                www.arider.de
              </a>
            </p>
          </div>
        </section>

        {/* ── 2. Begriffserklärungen ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            2. Begriffserklärungen
          </h2>
          <p className="mt-3">
            Wir haben unsere Datenschutzerklärung nach den Grundsätzen der
            Klarheit und Transparenz gestaltet. Sollten dennoch Unklarheiten in
            Bezug auf die Verwendung von verschiedenen Begrifflichkeiten
            bestehen, können die entsprechenden Definitionen hier eingesehen
            werden.
          </p>
        </section>

        {/* ── 3. Rechtsgrundlage ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            3. Rechtsgrundlage für die Verarbeitung von Daten
          </h2>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            a) Verarbeitung von personenbezogenen Daten nach der DSGVO
          </h3>
          <p className="mt-2">
            Wir verarbeiten Ihre personenbezogenen Daten wie bspw. Ihren Namen
            und Vornamen, Ihre E-Mail-Adresse und IP-Adresse usw. nur, wenn
            hierfür eine gesetzliche Grundlage gegeben ist. Hier kommen nach der
            Datenschutzgrundverordnung insbesondere folgende Regelungen in
            Betracht:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Art. 6 Abs. 1 S. 1 lit. a DSGVO:</strong> Die betroffene
              Person hat ihre Einwilligung zu der Verarbeitung der sie
              betreffenden personenbezogenen Daten für einen oder mehrere
              bestimmte Zwecke gegeben.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 S. 1 lit. b DSGVO:</strong> Die
              Verarbeitung ist für die Erfüllung eines Vertrags, dessen
              Vertragspartei die betroffene Person ist, oder zur Durchführung
              vorvertraglicher Maßnahmen erforderlich, die auf Anfrage der
              betroffenen Person erfolgen.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 S. 1 lit. c DSGVO:</strong> Die
              Verarbeitung ist zur Erfüllung einer rechtlichen Verpflichtung
              erforderlich, der der Verantwortliche unterliegt.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 S. 1 lit. d DSGVO:</strong> Die
              Verarbeitung ist erforderlich, um lebenswichtige Interessen der
              betroffenen Person oder einer anderen natürlichen Person zu
              schützen.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 S. 1 lit. e DSGVO:</strong> Die
              Verarbeitung ist für die Wahrnehmung einer Aufgabe erforderlich,
              die im öffentlichen Interesse liegt oder in Ausübung öffentlicher
              Gewalt erfolgt, die dem Verantwortlichen übertragen wurde.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 S. 1 lit. f DSGVO:</strong> Die
              Verarbeitung ist zur Wahrung der berechtigten Interessen des
              Verantwortlichen oder eines Dritten erforderlich, sofern nicht die
              Interessen oder Grundrechte und Grundfreiheiten der betroffenen
              Person, die den Schutz personenbezogener Daten erfordern,
              überwiegen, insbesondere dann, wenn es sich bei der betroffenen
              Person um ein Kind handelt.
            </li>
          </ul>
          <p className="mt-3">
            Wir weisen Sie aber an den jeweiligen Stellen dieser
            Datenschutzerklärung immer noch einmal darauf hin, auf welcher
            Rechtsgrundlage die Verarbeitung Ihrer personenbezogenen Daten
            erfolgt.
          </p>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            b) Zustimmung der Sorgeberechtigten nach Art. 8 Abs. 1 S. 2 Alt. 2
            DSGVO
          </h3>
          <p className="mt-2">
            Ein Sorgeberechtigter muss sämtlichen Datenverarbeitungen im Rahmen
            dieser Webseite zustimmen, für die die Einwilligung eines
            Minderjährigen, der das 16. Lebensjahr noch nicht vollendet hat,
            benötigt wird.
          </p>
          <p className="mt-2">
            Informationen zu den einzelnen Datenverarbeitungsvorgängen, deren
            Zwecke und die hierbei betroffenen Datenkategorien, für die eine
            Einwilligung des Betroffenen benötigt wird, erhalten Sie in der
            Datenschutzerklärung.
          </p>
          <p className="mt-2">
            Sie können Ihre Einwilligung jederzeit durch Übersendung der
            Widerrufserklärung in Textform an die Kontaktdaten des
            Verantwortlichen widerrufen. Die Verarbeitung bis zum Widerruf
            bleibt rechtmäßig.
          </p>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            c) Verarbeitung von Informationen nach § 25 Abs. 1 TTDSG
          </h3>
          <p className="mt-2">
            Wir verarbeiten außerdem Informationen gem. § 25 Abs. 1 TTDSG,
            indem wir Informationen auf Ihrer Endeinrichtung speichern oder auf
            Informationen zugreifen, die bereits in Ihrer Endeinrichtung
            gespeichert sind. Dabei kann es sich um sowohl um personenbezogene
            Informationen als auch um nicht-personenbezogene Daten, z.&nbsp;B.
            Cookies, Browser Fingerprints, Werbe-IDs, MAC-Adressen und
            IMEI-Nummern handeln. Endeinrichtung ist dabei jede direkt oder
            indirekt an die Schnittstelle eines öffentlichen
            Telekommunikationsnetzes angeschlossene Einrichtung zum Aussenden,
            Verarbeiten oder Empfangen von Nachrichten, § 2 Abs. 2 Nr. 6
            TTDSG.
          </p>
          <p className="mt-2">
            Diese Informationen verarbeiten wir im Regelfall aufgrund Ihrer
            Einwilligung, § 25 Abs. 1 TTDSG.
          </p>
          <p className="mt-2">
            Soweit eine Ausnahme nach § 25 Abs. 2 Nr. 1 und Nr. 2 TTDSG
            gegeben ist, benötigen wir keine Einwilligung. Eine solche Ausnahme
            ist gegeben, wenn wir ausschließlich auf die Informationen zugreifen
            oder diese speichern, um eine Nachricht über ein öffentliches
            Telekommunikationsnetz zu übertragen oder wenn dies unbedingt
            erforderlich ist, damit wir einen von Ihnen ausdrücklich gewünschten
            Telemediendienst zur Verfügung stellen können. Ihre Einwilligung
            können Sie jederzeit widerrufen.
          </p>
          <p className="mt-2">
            Wir setzen Sie davon in Kenntnis, dass durch den Widerruf der
            Einwilligung die Rechtmäßigkeit der aufgrund der Einwilligung bis
            zum Widerruf erfolgten Verarbeitung nicht berührt wird.
          </p>
        </section>

        {/* ── 4. Weitergabe ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            4. Weitergabe der personenbezogenen Daten
          </h2>
          <div className="mt-3 space-y-3">
            <p>
              Auch bei der Weitergabe von personenbezogenen Daten handelt es
              sich um eine Verarbeitung im Sinne der vorangegangenen Ziffer 3.
              Wir wollen Sie an dieser Stelle jedoch nochmal gesondert über das
              Thema der Weitergabe an Dritte informieren. Der Schutz Ihrer
              personenbezogenen Daten liegt uns sehr am Herzen. Aus diesem Grund
              sind wir besonders vorsichtig, wenn es darum geht Ihre Daten an
              Dritte weiterzugeben.
            </p>
            <p>
              Eine Weitergabe an Dritte erfolgt daher nur, wenn eine
              Rechtsgrundlage für die Verarbeitung gegeben ist. Beispielsweise
              geben wir personenbezogene Daten an Personen oder Unternehmen
              weiter, die für uns als Auftragsverarbeiter gemäß Art. 28 DSGVO
              tätig sind. Auftragsverarbeiter ist jeder, der in unserem Auftrag
              für uns – also insbesondere in einem Weisungs- und
              Kontrollverhältnis zu uns – personenbezogene Daten verarbeitet.
            </p>
            <p>
              Entsprechend den Vorgaben der DSGVO schließen wir mit jedem
              unserer Auftragsverarbeiter einen Vertrag, um diesen auf die
              Einhaltung datenschutzrechtlicher Vorschriften zu verpflichten und
              Ihren Daten somit umfassenden Schutz zu gewähren.
            </p>
          </div>
        </section>

        {/* ── 5. Speicherdauer ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            5. Speicherdauer und Löschung
          </h2>
          <p className="mt-3">
            Ihre personenbezogenen Daten werden von uns gelöscht, soweit diese
            für die Zwecke, für die sie erhoben oder auf sonstige Weise
            verarbeitet wurden, nicht mehr notwendig sind, die Verarbeitung
            nicht zur Ausübung des Rechts auf freie Meinungsäußerung und
            Information, zur Erfüllung einer rechtlichen Verpflichtung, aus
            Gründen des öffentlichen Interesses oder zur Geltendmachung,
            Ausübung oder Verteidigung von Rechtsansprüchen erforderlich sind.
          </p>
        </section>

        {/* ── 6. SSL/TLS ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            6. SSL- bzw. TLS-Verschlüsselung
          </h2>
          <div className="mt-3 space-y-3">
            <p>
              Diese Webseite nutzt aus Gründen der Sicherheit und zum Schutz der
              Übertragung vertraulicher Inhalte, wie z.&nbsp;B. der Anfragen,
              die Sie an uns als Webseitenbetreiber senden, eine SSL- bzw.
              TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
              daran, dass die Adresszeile des Browsers von „http://" auf
              „https://" wechselt und an dem Schloss-Symbol in Ihrer
              Browserzeile.
            </p>
            <p>
              Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die
              Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen
              werden.
            </p>
          </div>
        </section>

        {/* ── 7. Cookies ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            7. Cookies
          </h2>
          <div className="mt-3 space-y-3">
            <p>
              Auf unserer Webseite setzen wir Cookies ein. Cookies sind kleine
              Datenpakete, die Ihr Browser automatisch erstellt und die auf Ihrem
              Endgerät gespeichert werden, wenn Sie unsere Webseite besuchen.
              Diese Cookies dienen dazu, Informationen im Zusammenhang mit dem
              jeweils eingesetzten Endgerät abzulegen.
            </p>
            <p>
              Bei dem Einsatz von Cookies unterscheidet man zwischen den
              technisch notwendigen Cookies und den „weiteren" Cookies.
              Technisch notwendige Cookies sind dann gegeben, wenn diese
              unbedingt erforderlich sind, um einen von Ihnen ausdrücklich
              gewünschten Dienst der Informationsgesellschaft zur Verfügung zu
              stellen.
            </p>

            <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
              a) Technisch notwendige Cookies
            </h3>
            <p>
              Um Ihnen die Nutzung unseres Angebots angenehmer zu gestalten,
              setzen wir technisch notwendige Cookies ein, hierbei kann es sich
              um sogenannte Session-Cookies (z.&nbsp;B. Sprach- und
              Schriftwahl, Warenkorb usw.), Consent-Cookies, Cookies zur
              Gewährleistung der Serverstabilität und Sicherheit o.&nbsp;Ä.
              handeln. Die Rechtsgrundlage für die Cookies ergibt sich aus
              Art. 6 Abs. 1 S. 1 lit. f) DSGVO, unserem berechtigten Interesse
              am fehlerfreien Betrieb der Webseite und dem Interesse daran,
              Ihnen unsere Dienste optimiert zur Verfügung zu stellen.
            </p>

            <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
              b) Weitere Cookies
            </h3>
            <p>
              Unter die weiteren Cookies fallen Cookies zu statistischen
              Zwecken, Analyse- und Marketing- und Retargetingzwecken.
            </p>
            <p>
              Diese Cookies setzen wir auf Grund Ihrer Einwilligung gem. Art. 6
              Abs. 1 S. 1 lit. a) DSGVO für Sie ein.
            </p>
            <p>
              Ihre Einwilligung für den Einsatz von Cookies können Sie jederzeit
              widerrufen.
            </p>
            <p>
              Wir setzen Sie davon in Kenntnis, dass durch den Widerruf der
              Einwilligung die Rechtmäßigkeit der aufgrund der Einwilligung bis
              zum Widerruf erfolgten Verarbeitung nicht berührt wird.
            </p>
            <p>
              Hierzu können Sie entweder Ihre Cookie-Einstellungen auf unserer
              Webseite bearbeiten, in Ihren Browser-Einstellungen die Nutzung
              von Cookies deaktivieren (wobei hierdurch auch die
              Funktionsfähigkeit des Onlineangebots eingeschränkt werden kann)
              oder im Einzelfall für den entsprechenden Dienst ein Opt-out
              setzen.
            </p>
            <p>
              Wir weisen Sie bei den jeweiligen Diensten innerhalb der
              Datenschutzerklärung darauf hin, auf welcher Rechtsgrundlage diese
              Daten verarbeitet werden.
            </p>
            <div className="mt-4">
              <CookieSettingsButton />
            </div>
          </div>
        </section>

        {/* ── 8. Cookie-Banner ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            8. Cookie-Banner
          </h2>
          <p className="mt-3">
            Zur Einholung der Einwilligungen für die von uns eingesetzten
            Cookies, nutzen wir den Cookie-Banner des Dienstleisters Borlabs
            GmbH, Hamburger Str. 11, 22083 Hamburg. Dieser setzt selbst einen
            sog. Consent-Cookie, um den jeweiligen Einwilligungsstatus
            abzufragen und zu verarbeiten. Dieser Consent-Cookie ist technisch
            notwendig und wird daher aufgrund unseres berechtigten Interesses
            gem. Art. 6 Abs. 1 S. 1 lit. f DSGVO, § 25 Abs. 1 TTDSG
            eingesetzt.
          </p>
        </section>

        {/* ── 9. Erhebung und Speicherung ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            9. Erhebung und Speicherung von personenbezogenen Daten sowie deren
            Art und Zweck der Verwendung
          </h2>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            a) Externes Hosting
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Unsere Webseite wird bei ALL-INKL.COM – Neue Medien Münnich, René
              Münnich, Hauptstraße 68, D-02742 Friedersdorf gehostet. Aus
              diesem Grund werden alle personenbezogenen Daten, die auf unserer
              Webseite erfasst werden, auf den Servern unseres Hosters
              gespeichert, soweit nicht ein externer Dienst eines Dritten
              eingebunden ist.
            </p>
            <p>
              Der Hoster verarbeitet Ihre Daten nur auf unsere Weisung und
              soweit dies zur Erfüllung der Leistungen auf der Webseite
              erforderlich ist. Eine Verarbeitung der Daten durch den Hoster zu
              eigenen Zwecken findet nicht statt. Wir haben einen Vertrag zur
              Auftragsverarbeitung mit diesem geschlossen.
            </p>
          </div>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            b) Beim Besuch der Webseite
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Beim Aufrufen unserer Webseite werden durch den auf Ihrem Endgerät
              zum Einsatz kommenden Browser automatisch Informationen an den
              Server unserer Webseite gesendet. Diese Informationen werden
              temporär in einem sogenannten Logfile gespeichert. Folgende
              Informationen werden dabei ohne Ihr Zutun erfasst und bis zur
              automatisierten Löschung gespeichert:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>IP-Adresse des anfragenden Rechners</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>
                Webseite, von der aus der Zugriff erfolgt (Referrer-URL)
              </li>
              <li>
                Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners
                sowie der Name Ihres Access-Providers
              </li>
            </ul>
            <p>
              Die genannten Daten werden durch uns zu folgenden Zwecken
              verarbeitet:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Gewährleistung eines reibungslosen Verbindungsaufbaus der
                Webseite
              </li>
              <li>
                Gewährleistung einer komfortablen Nutzung unserer Webseite
              </li>
              <li>Auswertung der Systemsicherheit und -stabilität</li>
              <li>Fehleranalyse</li>
              <li>zu weiteren administrativen Zwecken</li>
            </ul>
            <p>
              Daten, die einen Rückschluss auf Ihre Person zulassen, wie
              bspw. die IP-Adresse, werden spätestens nach 7 Tagen gelöscht.
              Sollten wir die Daten über diesen Zeitraum hinaus speichern,
              werden diese Daten pseudonymisiert, so dass eine Zuordnung zu
              Ihnen nicht mehr möglich ist.
            </p>
            <p>
              Die Rechtsgrundlage für die Datenverarbeitung ist Art. 6 Abs. 1
              S. 1 lit. f DSGVO. Unser berechtigtes Interesse folgt aus oben
              aufgelisteten Zwecken zur Datenerhebung. In keinem Fall verwenden
              wir die erhobenen Daten zu dem Zweck, Rückschlüsse auf Ihre Person
              zu ziehen.
            </p>
          </div>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            c) Shopsystem
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Zum Angebot unserer Waren nutzen wir das Shopsystem WooCommerce
              der Automattic Inc., 60 29th Street #343, San Francisco, CA
              94110-4929, USA.
            </p>
            <p>
              Die von Ihnen angegebenen Daten werden daher auch durch unseren
              Shopanbieter im Rahmen des Betriebs des Shopsystems verarbeitet.
              Außerdem werden durch das Shopsystem möglicherweise weitere Cookies
              gesetzt.
            </p>
            <p>
              Aus diesem Grund haben wir mit diesem einen Vertrag zur
              Auftragsdatenverarbeitung/die Standardvertragsklauseln
              geschlossen.
            </p>
            <p>
              Weitere Informationen zum Datenschutz finden Sie unter:{" "}
              <a
                href="https://automattic.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                automattic.com/privacy
              </a>
            </p>
          </div>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            d) Vertragsverhältnis
          </h3>

          <h4 className="mt-4 font-semibold text-[#111111]">
            (1) Vertragsschluss
          </h4>
          <div className="mt-2 space-y-3">
            <p>
              Im Rahmen der Begründung des Vertragsverhältnisses werden gemäß
              Art. 6 Abs. 1 S. 1 lit. b DSGVO nur die zur Vertragsabwicklung
              zwingend erforderlichen personenbezogenen Daten verarbeitet.
            </p>
            <p>
              Soweit Sie darüber hinaus freiwillige Angaben machen, werden diese
              nur auf Grund der von Ihnen erteilten Einwilligung nach Art. 6
              Abs. 1 S. 1 lit. a DSGVO verarbeitet. Diese freiwilligen Angaben
              nutzen wir, um einen kundenfreundlichen Service anzubieten und
              diesen stets zu verbessern.
            </p>
          </div>

          <h4 className="mt-4 font-semibold text-[#111111]">
            (2) Kundenkonto
          </h4>
          <div className="mt-2 space-y-3">
            <p>
              Sie haben die Möglichkeit bei uns ein Kundenkonto anzulegen.
              Hierzu werden neben Ihren personenbezogenen Daten zur
              Vertragsabwicklung auch Ihre weiteren freiwilligen Angaben sowie
              die von Ihnen in der Vergangenheit bei uns getätigten Einkäufe
              gespeichert und verarbeitet.
            </p>
            <p>
              Die Rechtsgrundlage ergibt sich auf Grund der von Ihnen erteilten
              Einwilligung nach Art. 6 Abs. 1 S. 1 lit. a DSGVO.
            </p>
            <p>
              Sie haben jederzeit die Möglichkeit, Ihre Daten im Kundenkonto zu
              ändern bzw. zu löschen und das Konto auch im Ganzen zu löschen.
              Wenn Sie von dieser Funktion Gebrauch machen, wird Ihr Kundenkonto
              mit all den darin enthaltenen Daten unmittelbar gelöscht.
            </p>
          </div>

          <h4 className="mt-4 font-semibold text-[#111111]">
            (3) Weitergabe der Daten für den Versand
          </h4>
          <div className="mt-2 space-y-3">
            <p>
              Die für den Versand unserer Waren notwendigen Daten (Vorname und
              Name, Adresse, E-Mail-Adresse, Telefonnummer soweit auf Grund von
              Speditionsware erforderlich) geben wir an den entsprechenden
              Versanddienstleister zur Benachrichtigung/Abstimmung zur Lieferung
              der Waren und zur Zustellung der Waren weiter.
            </p>
            <p>
              Die Rechtsgrundlage für die Weitergabe ergibt sich aus Art. 6
              Abs. 1 S. 1 lit. b DSGVO.
            </p>
            <p>
              <strong>DHL</strong> – DHL Paket GmbH, Sträßchensweg 10, 53113
              Bonn, Telefon: +49 (0) 228 1820, E-Mail:
              impressum.paket[at]dhl.com;{" "}
              <a
                href="https://www.dhl.de/de/toolbar/footer/datenschutz.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                DHL Datenschutz
              </a>
            </p>
          </div>

          <h4 className="mt-4 font-semibold text-[#111111]">
            (4) Weitergabe der Daten bei Einsatz von Online-Zahlungsdienstleistern
          </h4>
          <div className="mt-2 space-y-3">
            <p>
              Sollten Sie sich im Rahmen Ihres Bestellvorgangs für eine
              Bezahlung mit einem der von uns angebotenen
              Online-Zahlungsdienstleister entscheiden, werden im Rahmen der so
              ausgelösten Bestellung Ihre Kontaktdaten an diesen übermittelt.
              Die Rechtmäßigkeit der Weitergabe der Daten ergibt sich aus Art. 6
              Abs. 1 S. 1 lit. b DSGVO, zur Durchführung der von Ihnen
              gewählten Zahlungsart sowie unserer berechtigten Interessen gem.
              Art. 6 Abs. 1 S. 1 lit. f DSGVO zur Ermöglichung einer
              benutzerfreundlichen und unkomplizierten Zahlungsabwicklung.
            </p>
            <p>
              <strong>PayPal</strong> – PayPal (Europe) S.à.r.l. &amp; Cie.
              S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg;{" "}
              <a
                href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                PayPal Datenschutz
              </a>
            </p>
          </div>

          <h4 className="mt-4 font-semibold text-[#111111]">
            (5) Kreditkartenzahlung
          </h4>
          <div className="mt-2 space-y-3">
            <p>
              Soweit Sie sich für eine Zahlung mit Kreditkarte entscheiden,
              erheben und verarbeiten wir Ihre notwendigen personenbezogenen
              Daten und leiten diese an das kartenherausgebende Institut zur
              Zahlungsabwicklung und zur Erfüllung der gesetzlichen
              Anforderungen weiter.
            </p>
            <p>
              Die technische Abwicklung der Kreditkartenzahlung erfolgt durch
              den PayPal Kreditkartenservice, PayPal (Europe) S.à.r.l. &amp;
              Cie. S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg.
            </p>
          </div>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            e) Billbee CRM-System
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir haben auf unserer Webseite das CRM-System Billbee der Billbee
              GmbH, Arolser Str. 10, 34477 Twistetal angeschlossen. Hierüber
              können wir alle eingehenden Bestellungen, Aufträge, Anfragen sowie
              Kontakte verwalten und abwickeln.
            </p>
            <p>
              Der Einsatz dieses CRM-Systems erfolgt auf Grund unserer
              berechtigten Interessen gem. Art. 6 Abs. 1 S. 1 lit. f DSGVO.
            </p>
            <p>
              Wir haben mit Billbee einen Vertrag zur Auftragsverarbeitung
              abgeschlossen. Die Datenschutzerklärung von Billbee finden Sie
              unter{" "}
              <a
                href="https://www.billbee.io/rechtliches/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                billbee.io/rechtliches/datenschutz
              </a>
              .
            </p>
          </div>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            f) Newsletter
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              <strong>Inhalt des Newsletters und Anmeldedaten</strong>
            </p>
            <p>
              Die Zusendung unseres Newsletters sowie die Durchführung von
              statistischen Erhebungen und Analysen sowie Protokollierung des
              Anmeldeverfahrens findet nur statt, wenn Sie diesen bei uns
              bestellen und Ihre entsprechende Einwilligung nach Art. 6 Abs. 1
              S. 1 lit. a DSGVO, § 25 Abs. 1 TTDSG erteilt haben.
            </p>
            <p>
              Für die Anmeldung des Newsletters reicht die Angabe Ihrer
              E-Mail-Adresse aus. Wenn Sie weitere freiwillige Angaben wie
              bspw. Ihren Namen und/oder Ihr Geschlecht machen, so werden diese
              ausschließlich für die Personalisierung des an Sie gerichteten
              Newsletters verwendet.
            </p>

            <p>
              <strong>Double-Opt-In und Protokollierung</strong>
            </p>
            <p>
              Für die Anmeldung zu unserem Newsletter verwenden wir aus
              Sicherheitsgründen das so genannte Double-Opt-In Verfahren. Sie
              bekommen daher nach Ihrer Anmeldung zunächst eine E-Mail mit der
              Bitte, Ihre Anmeldung zu bestätigen. Erst mit der Bestätigung wird
              diese wirksam.
            </p>
            <p>
              Des Weiteren wird Ihre Anmeldung zum Newsletter protokolliert. Zu
              der Protokollierung gehört die Speicherung des Anmelde- und
              Bestätigungszeitpunktes, Ihre angegebenen Daten sowie Ihre
              IP-Adresse.
            </p>

            <p>
              <strong>Widerruf</strong>
            </p>
            <p>
              Wenn Sie unseren Newsletter nicht mehr erhalten möchten, können Sie
              Ihre Einwilligung jederzeit für die Zukunft widerrufen. Hierzu
              können Sie auf den Link zum Abbestellen des Newsletters am Ende
              eines jeden Newsletters klicken oder uns eine E-Mail an{" "}
              <a href="mailto:kontakt@arider.de" className="text-[#E31E24] underline hover:text-[#C41A1F]">
                kontakt@arider.de
              </a>{" "}
              senden.
            </p>

            <p>
              <strong>Einsatz von ActiveCampaign</strong>
            </p>
            <p>
              Wir versenden unseren Newsletter mit Hilfe des Newsletter-Dienstes
              „ActiveCampaign", der von der ActiveCampaign, LLC (1 North
              Dearborn St, 5th Floor, Chicago, IL 60602, USA) betrieben wird.
            </p>
            <p>
              Die E-Mail-Adressen unserer Newsletterempfänger, als auch deren
              weitere Daten, werden auf den Servern von ActiveCampaign in den
              USA gespeichert. ActiveCampaign verwendet diese Informationen zum
              Versand und zur Auswertung des Newsletters in unserem Auftrag.
            </p>
            <p>
              Wir haben mit ActiveCampaign die Standardvertragsklauseln
              abgeschlossen. Die Datenschutzbestimmungen von ActiveCampaign
              finden Sie hier:{" "}
              <a
                href="https://www.activecampaign.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                activecampaign.com/legal/privacy-policy
              </a>
            </p>

            <p>
              <strong>Statistische Erhebungen und Analysen</strong>
            </p>
            <p>
              Die über ActiveCampaign verschickten Newsletter enthalten einen
              sog. „web-beacon", d.&nbsp;h. eine pixelgroße Datei, die beim
              Öffnen des Newsletters vom Server des Versanddienstleisters
              abgerufen wird. Im Rahmen dieses Abrufs werden technische
              Informationen, wie Informationen zum Browser und Ihrem System, als
              auch Ihre IP-Adresse und Zeitpunkt des Abrufs erhoben.
            </p>
            <p>
              Zu den statistischen Erhebungen gehört ebenfalls die Feststellung,
              ob die Newsletter geöffnet werden, wann sie geöffnet werden und
              welche Links geklickt werden.
            </p>
          </div>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            g) Kontaktformular
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir stellen Ihnen auf unserer Webseite ein Formular zur Verfügung,
              so dass Sie die Möglichkeit haben, jederzeit Kontakt mit uns
              aufzunehmen. Für die Verwendung des Kontaktformulars ist die
              Angabe eines Namens und einer gültigen E-Mail-Adresse notwendig.
            </p>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden
              Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort
              angegebenen Kontaktdaten sowie Ihre IP-Adresse gem. Art. 6 Abs. 1
              S. 1 lit. b und f DSGVO verarbeitet.
            </p>
            <p>
              Die Anfragen sowie die damit einhergehenden Daten werden
              spätestens 3 Monate nach Erhalt gelöscht, sofern diese nicht für
              eine weitere vertragliche Beziehung benötigt werden.
            </p>
          </div>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            i) Verwendung von Google Maps
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Unsere Webseite verwendet die Google Maps API. Durch die Nutzung
              von Google Maps können Informationen über Ihre Benutzung dieser
              Webseite (einschließlich Ihrer IP-Adresse) an einen Server von
              Google (Google Ireland Limited, Gordon House, Barrow Street, Dublin
              4, Irland) in den USA übertragen und dort gespeichert werden.
            </p>
            <p>
              Wir haben mit Google einen Vertrag zur Auftragsverarbeitung
              abgeschlossen. Die Google-Datenschutzerklärung finden Sie{" "}
              <a
                href="https://www.google.com/policies/privacy/?hl=de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                hier
              </a>
              .
            </p>
            <p>
              Die Verwendung von Google Maps erfolgt auf Grundlage Ihrer
              Einwilligung gem. Art. 6 Abs. 1 S. 1 lit. a DSGVO.
            </p>
          </div>

          <h3 className="font-display mt-6 text-lg font-semibold text-[#111111]">
            j) Google Tag Manager
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir setzen auf unserer Webseite den Google Tag Manager von Google
              (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
              Irland) ein. Der Google Tag Manager ist ein Verwaltungs- und
              Managementtool, in welchem andere Tracking- und/oder
              Statistik-Tools zentral verwaltet und ausgespielt werden können.
            </p>
            <p>
              Bei dem Besuch unserer Webseite und bei Erteilung Ihrer
              Einwilligung nach Art. 6 Abs. 1 S. 1 lit. a) DSGVO erhebt und
              verarbeitet der Google Tag Manager Ihre IP-Adresse, welche auch in
              die USA übertragen werden kann. Der Google Tag Manager erstellt
              jedoch selbst kein Nutzerprofil und keine Analysen.
            </p>
            <p>
              Wir haben mit Google einen Vertrag zur Auftragsverarbeitung
              abgeschlossen. Die Google-Datenschutzerklärung finden Sie{" "}
              <a
                href="https://www.google.com/policies/privacy/?hl=de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                hier
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── 10. Analyse- und Trackingtools ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            10. Analyse- und Trackingtools
          </h2>
          <div className="mt-3 space-y-3">
            <p>
              Wir setzen auf unserer Webseite die nachfolgend aufgelisteten
              Analyse- und Trackingtools ein. Diese dienen dazu, die
              fortlaufende Optimierung unserer Webseite sicherzustellen und
              diese bedarfsgerecht zu gestalten.
            </p>
            <p>
              Diese Tools setzen wir auf Grund der von Ihnen erteilten
              Einwilligung gem. Art. 6 Abs. 1 S. 1 lit. a DSGVO ein. Sie können
              Ihre Einwilligung jederzeit durch Änderung der
              Cookie-Einstellungen widerrufen. Die Verarbeitung bis zum Widerruf
              bleibt rechtmäßig.
            </p>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            a) Google Analytics
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir benutzen auf unserer Webseite Google Analytics, einen
              Webanalysedienst von Google (Google Ireland Limited, Gordon House,
              Barrow Street, Dublin 4, Irland).
            </p>
            <p>
              Google Analytics verwendet Cookies. Die durch das Cookie erzeugten
              Informationen über Ihre Benutzung dieser Webseite werden in der
              Regel an einen Server von Google in den USA übertragen und dort
              gespeichert.
            </p>
            <p>
              Ihre IP-Adresse wird automatisch von Google anonymisiert, bevor
              sie über EU-Domains und -Server aufgezeichnet wird.
            </p>
            <p>
              Wir haben mit Google einen Vertrag zur Auftragsverarbeitung
              abgeschlossen.{" "}
              <a
                href="https://support.google.com/analytics/answer/6004245"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                Übersicht zum Datenschutz bei Google
              </a>
            </p>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            b) Google Remarketing
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir verwenden die Remarketing-Funktion von Google Analytics, um
              Werbekampagnen – inklusive Google AdWords Kampagnen – an die
              Besucher unserer Webseite zu richten. Hierbei werden Ihnen,
              basierend auf Ihren vorherigen Aufrufen unserer Webseite, bei
              Ihrem Besuch von anderen Webseiten des Google Display Netzwerks
              relevante Werbeanzeigen präsentiert.
            </p>
            <p>
              Wir haben mit Google einen Vertrag zur Auftragsverarbeitung
              abgeschlossen.{" "}
              <a
                href="https://support.google.com/analytics/answer/6004245"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                Übersicht zum Datenschutz bei Google
              </a>
            </p>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            c) Google Ads Conversion Tracking
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir nutzen auf unserer Webseite mit Google Ads ein
              Online-Werbeprogramm von Google. Dabei wird auch das
              Conversion-Tracking eingesetzt. Mit diesem Tool setzt Google Ads
              ein Cookie auf Ihrem Endgerät wenn Sie über eine
              Google-Werbeanzeige auf unsere Webseite kommen.
            </p>
            <p>
              Der Cookie dient keiner persönlichen Rückverfolgbarkeit. Wir
              erfahren so die Gesamtanzahl der Nutzer, die auf unsere Anzeige
              reagiert haben. Wir erhalten bei diesem Vorgang keine
              Informationen, mit denen wir Sie als Nutzer persönlich
              identifizieren könnten.
            </p>
            <p>
              Näheres zu den Datenschutzbestimmungen von Google erfahren Sie
              unter{" "}
              <a
                href="https://www.google.de/policies/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                google.de/policies/privacy
              </a>
              .
            </p>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            d) Facebook Conversion Pixel
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir setzen den „Conversion-Pixel" bzw. Besucheraktions-Pixel der
              Meta Platforms Ireland Ltd. (4 Grand Canal Square, Grand Canal
              Harbour, Dublin 2, Ireland) ein. Durch den Aufruf dieses Pixels
              kann Meta Platforms erkennen, ob eine Facebook-Werbeanzeige
              erfolgreich war.
            </p>
            <p>
              Wir erhalten von Meta Platforms hierzu ausschließlich statistische
              Daten ohne Bezug zu einer konkreten Person.{" "}
              <a
                href="https://www.facebook.com/about/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                Facebook Datenschutz
              </a>
            </p>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            e) Microsoft Advertising Conversion Tracking
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir setzen auf unserer Webseite das Werbeprogramm Microsoft
              Advertising ein, welches von der Microsoft Ireland Operations
              Limited, One Microsoft Place, South Country Business Park,
              Leopardstown, Dublin, Ireland 18 bereitgestellt wird.
            </p>
            <p>
              Mithilfe des Universal-Event Tracking (UET) können wir mehr über
              Ihr Nutzerverhalten auf unseren Webseiten erfahren und unsere
              Werbeanzeigen und Angebote optimieren.
            </p>
            <p>
              Wir haben mit Microsoft einen Vertrag zur Auftragsverarbeitung
              geschlossen. Weitere Informationen:{" "}
              <a
                href="https://privacy.microsoft.com/de-de/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                Microsoft Datenschutz
              </a>
            </p>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            f) TikTok Pixel
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Wir verwenden auf unserer Website das TikTok Pixel der TikTok
              Technology Limited (10 Earlsfort Terrace, Dublin, D02 T380,
              Ireland) und TikTok Information Technologies UK Limited (WeWork,
              125 Kingsway, London, WC2B 6NH, United Kingdom), die im
              Europäischen Raum als gemeinsame Verantwortliche agieren.
            </p>
            <p>
              Das TikTok Pixel ist ein JavaScript-Code-Ausschnitt, anhand
              dessen wir die Aktivitäten von Besuchern auf unserer Website
              sehen und nachverfolgen können.
            </p>
            <p>
              Bei der Erhebung und Übermittlung der Event-Daten agieren wir mit
              TikTok als gemeinsame Verantwortliche. Sie können die Vereinbarung
              unter{" "}
              <a
                href="https://ads.tiktok.com/i18n/official/policy/jurisdiction-specific-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                ads.tiktok.com
              </a>{" "}
              abrufen. Weitere Informationen:{" "}
              <a
                href="https://www.tiktok.com/legal/privacy-policy?lang=de-DE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                TikTok Datenschutz
              </a>
            </p>
          </div>
        </section>

        {/* ── 11. Bild-, Ton- und Videoeinbindung ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            11. Bild-, Ton- und Videoeinbindung
          </h2>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            YouTube
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Unsere Webseite nutzt das Plugin YouTube, welches von Google
              (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
              Irland) betrieben wird.
            </p>
            <p>
              Wenn Sie während Ihres Besuchs das YouTube-Plugin aktivieren, wird
              eine Verbindung zu den Servern von YouTube hergestellt und dem
              YouTube-Server mitgeteilt, welche unserer Seiten Sie besucht
              haben. Dadurch kann YouTube Ihr Surfverhalten direkt Ihrem
              persönlichen Profil zuordnen. Sie können dies verhindern, wenn Sie
              sich vor dem Besuch unserer Webseite aus Ihrem Mitgliedskonto
              ausloggen.
            </p>
            <p>
              Weitere Informationen zum Umgang von Nutzerdaten finden Sie in
              der{" "}
              <a
                href="https://www.google.de/intl/de/policies/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                Datenschutzerklärung von YouTube
              </a>
              .
            </p>
            <p>
              Durch die Einbindung von YouTube werden auch die Google Fonts von
              Google dynamisch nachgeladen. Hierdurch wird an den Server
              möglicherweise folgendes übermittelt und von Google gespeichert:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Name und Version des verwendeten Browsers</li>
              <li>
                Webseite, von der die Anfrage ausgelöst wurde (Referrer-URL)
              </li>
              <li>Betriebssystem Ihres Rechners</li>
              <li>Bildschirmauflösung Ihres Rechners</li>
              <li>IP-Adresse des anfragenden Rechners</li>
              <li>
                Spracheinstellungen des Browsers bzw. des Betriebssystems
              </li>
            </ul>
            <p>
              Nähere Informationen finden Sie in den{" "}
              <a
                href="https://www.google.com/policies/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E31E24] underline hover:text-[#C41A1F]"
              >
                Datenschutzhinweisen von Google
              </a>
              .
            </p>
            <p>
              Die Rechtsgrundlage ergibt sich aus der von Ihnen erteilten
              Einwilligung gem. Art. 6 Abs. 1 S. 1 lit. a DSGVO.
            </p>
          </div>
        </section>

        {/* ── 12. Rechte des Betroffenen ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            12. Rechte des Betroffenen
          </h2>
          <p className="mt-3">Ihnen stehen folgende Rechte zu:</p>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            a) Auskunft
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Sie haben gemäß Art. 15 DSGVO das Recht, Auskunft über Ihre von
              uns verarbeiteten personenbezogenen Daten zu verlangen. Dieses
              Auskunftsrecht umfasst dabei Informationen über:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>die Verarbeitungszwecke</li>
              <li>die Kategorien der personenbezogenen Daten</li>
              <li>
                die Empfänger oder Kategorien von Empfängern, gegenüber denen
                Ihre Daten offengelegt wurden oder werden
              </li>
              <li>
                die geplante Speicherdauer oder zumindest die Kriterien für die
                Festlegung der Speicherdauer
              </li>
              <li>
                das Bestehen eines Rechts auf Berichtigung, Löschung,
                Einschränkung der Verarbeitung oder Widerspruch
              </li>
              <li>
                das Bestehen eines Beschwerderechts bei einer Aufsichtsbehörde
              </li>
              <li>
                die Herkunft Ihrer personenbezogenen Daten, sofern diese nicht
                bei uns erhoben wurden
              </li>
              <li>
                das Bestehen einer automatisierten Entscheidungsfindung
                einschließlich Profiling
              </li>
            </ul>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            b) Berichtigung
          </h3>
          <p className="mt-2">
            Ihnen steht nach Art. 16 DSGVO ein Recht auf unverzügliche
            Berichtigung unrichtiger oder unvollständiger gespeicherter
            personenbezogener Daten bei uns zu.
          </p>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            c) Löschung
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Sie haben nach Art. 17 DSGVO das Recht, die unverzügliche
              Löschung Ihrer personenbezogenen Daten bei uns zu verlangen,
              soweit die weitere Verarbeitung nicht aus einem der nachfolgenden
              Gründe erforderlich ist:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                die personenbezogenen Daten sind für die Zwecke, für die sie
                erhoben wurden, noch notwendig
              </li>
              <li>
                zur Ausübung des Rechts auf freie Meinungsäußerung und
                Information
              </li>
              <li>zur Erfüllung einer rechtlichen Verpflichtung</li>
              <li>
                aus Gründen des öffentlichen Interesses im Bereich der
                öffentlichen Gesundheit
              </li>
              <li>
                für im öffentlichen Interesse liegende Archivzwecke,
                wissenschaftliche oder historische Forschungszwecke
              </li>
              <li>
                zur Geltendmachung, Ausübung oder Verteidigung von
                Rechtsansprüchen
              </li>
            </ul>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            d) Einschränkung der Verarbeitung
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Sie können gemäß Art. 18 DSGVO die Einschränkung der Verarbeitung
              Ihrer personenbezogenen Daten aus einem der nachfolgenden Gründe
              verlangen:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Sie bestreiten die Richtigkeit Ihrer personenbezogenen Daten.
              </li>
              <li>
                Die Verarbeitung ist unrechtmäßig und Sie lehnen die Löschung
                ab.
              </li>
              <li>
                Wir benötigen die Daten für die Zwecke der Verarbeitung nicht
                länger, Sie benötigen diese jedoch zur Geltendmachung, Ausübung
                oder Verteidigung von Rechtsansprüchen.
              </li>
              <li>
                Sie legen Widerspruch gegen die Verarbeitung gemäß Art. 21
                Abs. 1 DSGVO ein.
              </li>
            </ul>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            e) Unterrichtung
          </h3>
          <p className="mt-2">
            Wenn Sie die Berichtigung oder Löschung Ihrer personenbezogenen
            Daten oder eine Einschränkung der Verarbeitung nach Art. 16, Art. 17
            oder Art. 18 DSGVO verlangt haben, teilen wir dies allen Empfängern,
            denen Ihre personenbezogenen Daten offengelegt wurden, mit, es sei
            denn, dies erweist sich als unmöglich oder ist mit einem
            unverhältnismäßigen Aufwand verbunden.
          </p>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            f) Übermittlung
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Sie haben das Recht, Ihre personenbezogenen Daten, die Sie uns
              bereitgestellt haben, in einem strukturierten, gängigen und
              maschinenlesbaren Format zu erhalten.
            </p>
            <p>
              Sie haben ebenfalls das Recht, die Übermittlung dieser Daten an
              einen Dritten zu verlangen, sofern die Verarbeitung mithilfe
              automatisierter Verfahren erfolgte und auf einer Einwilligung oder
              einem Vertrag beruht.
            </p>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            g) Widerruf
          </h3>
          <p className="mt-2">
            Sie haben gemäß Art. 7 Abs. 3 DSGVO das Recht, Ihre erteilte
            Einwilligung jederzeit uns gegenüber zu widerrufen. Durch den
            Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der
            Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.
          </p>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            h) Beschwerde
          </h3>
          <p className="mt-2">
            Sie haben gemäß Art. 77 DSGVO das Recht, sich bei einer
            Aufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind, dass die
            Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO
            verstößt.
          </p>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            i) Widerspruch
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Sofern Ihre personenbezogenen Daten auf Grundlage von berechtigten
              Interessen gemäß Art. 6 Abs. 1 S. 1 lit. f DSGVO verarbeitet
              werden, haben Sie das Recht, gemäß Art. 21 DSGVO Widerspruch
              gegen die Verarbeitung einzulegen, soweit dafür Gründe vorliegen,
              die sich aus Ihrer besonderen Situation ergeben oder sich der
              Widerspruch gegen Direktwerbung richtet.
            </p>
            <p>
              Möchten Sie von Ihrem Widerrufs- oder Widerspruchsrecht Gebrauch
              machen, genügt eine E-Mail an{" "}
              <a href="mailto:kontakt@arider.de" className="text-[#E31E24] underline hover:text-[#C41A1F]">
                kontakt@arider.de
              </a>
              .
            </p>
          </div>

          <h3 className="font-display mt-4 text-lg font-semibold text-[#111111]">
            j) Automatisierte Entscheidung im Einzelfall einschließlich
            Profiling
          </h3>
          <div className="mt-2 space-y-3">
            <p>
              Sie haben das Recht, nicht einer ausschließlich auf einer
              automatisierten Verarbeitung – einschließlich Profiling –
              beruhenden Entscheidung unterworfen zu werden, die Ihnen gegenüber
              rechtliche Wirkung entfaltet oder Sie in ähnlicher Weise erheblich
              beeinträchtigt. Dies gilt nicht, wenn die Entscheidung
            </p>
            <ol className="list-[lower-roman] space-y-1 pl-6">
              <li>
                für den Abschluss oder die Erfüllung eines Vertrags zwischen
                Ihnen und uns erforderlich ist
              </li>
              <li>
                aufgrund von Rechtsvorschriften der Europäischen Union oder der
                Mitgliedstaaten zulässig ist
              </li>
              <li>mit Ihrer ausdrücklichen Einwilligung erfolgt</li>
            </ol>
          </div>
        </section>

        {/* ── 13. Änderung ── */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#111111]">
            13. Änderung der Datenschutzerklärung
          </h2>
          <p className="mt-3">
            Sollten wir die Datenschutzerklärung ändern, dann wird dies auf der
            Webseite kenntlich gemacht und die registrierten Kunden werden
            darüber informiert.
          </p>
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
