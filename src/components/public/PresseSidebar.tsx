import { Mail } from "lucide-react";

export function PresseSidebar() {
  return (
    <div>
      <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#111111]">
        Presse &amp; Werbung
      </h2>
      <div className="mt-4 border-t border-[#E5E5E5] pt-4 text-sm leading-relaxed text-[#444444]">
        <p>
          Du möchtest Deine News und Produktneuheiten bei uns veröffentlichen, oder
          Werbung schalten? Dann schreibe uns unter{" "}
          <a
            href="mailto:vermarktung@motorrad.news"
            className="inline-flex items-center gap-1 font-semibold text-[#E31E24] transition-colors hover:text-[#C41A1F]"
          >
            <Mail className="size-3.5" aria-hidden />
            vermarktung@motorrad.news
          </a>{" "}
          und wir melden uns bei Dir.
        </p>
      </div>
    </div>
  );
}
