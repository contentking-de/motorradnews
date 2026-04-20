export type CategoryMeta = {
  heading: string;
  subtext: string;
  metaTitle: string;
  metaDescription: string;
};

export const categoryMetaBySlug: Record<string, CategoryMeta> = {
  neuheiten: {
    heading: "Neuheiten",
    subtext:
      "Neue Modelle, Rückrufe, Branchennews und alles, was die Motorrad-Welt bewegt — kompakt und aktuell.",
    metaTitle: "Motorrad-Neuheiten: Neue Modelle, Rückrufe & Branchennews",
    metaDescription:
      "Aktuelle Motorrad-Neuheiten auf einen Blick: neue Modelle, Rückrufe, Branchennews und alles, was die Motorrad-Welt bewegt – kompakt und aktuell auf motorrad.news.",
  },
  tests: {
    heading: "Tests & Fahrberichte",
    subtext:
      "Ehrliche Testberichte, Vergleichstests und Erfahrungen aus erster Hand — damit du das richtige Bike findest.",
    metaTitle: "Motorrad-Tests & Fahrberichte: Ehrliche Bike-Bewertungen",
    metaDescription:
      "Unabhängige Motorrad-Tests, Vergleichstests und Fahrberichte aus erster Hand. Finde das richtige Bike mit unseren ehrlichen Bewertungen auf motorrad.news.",
  },
  technik: {
    heading: "Technik & Ratgeber",
    subtext:
      "Praxisnahe Technik-Tipps, Pflegeanleitungen und Ratgeber rund um Wartung, Zubehör und Ausrüstung.",
    metaTitle: "Motorrad-Technik: Tipps, Ratgeber & Wartungsanleitungen",
    metaDescription:
      "Praxisnahe Motorrad-Technik: Wartungstipps, Pflegeanleitungen und Ratgeber rund um Zubehör und Ausrüstung. Jetzt informieren auf motorrad.news.",
  },
  reisen: {
    heading: "Reisen & Touren",
    subtext:
      "Inspirierende Reiserouten, Tourentipps und Erlebnisse von Bikern für Biker — von Alpenpass bis Küstenstraße.",
    metaTitle: "Motorrad-Reisen & Touren: Routen, Tipps & Erlebnisse",
    metaDescription:
      "Inspirierende Motorrad-Reiserouten, Tourentipps und Erlebnisse von Bikern für Biker – von Alpenpass bis Küstenstraße. Jetzt entdecken auf motorrad.news.",
  },
  motorsport: {
    heading: "Motorsport",
    subtext:
      "MotoGP, Superbike-WM und nationale Rennserien — Ergebnisse, Analysen und Hintergründe vom Rennsport.",
    metaTitle: "Motorrad-Motorsport: MotoGP, WSBK & Rennserien-News",
    metaDescription:
      "MotoGP, Superbike-WM und nationale Rennserien – aktuelle Ergebnisse, Analysen und Hintergründe vom Motorrad-Rennsport auf motorrad.news.",
  },
  offroad: {
    heading: "Offroad & Enduro",
    subtext:
      "Abenteuer abseits der Straße — Enduros, Offroad-Touren, Geländetechnik und alles für Dreck-Fans auf zwei Rädern.",
    metaTitle: "Offroad & Enduro: Gelände-News, Touren & Technik-Tipps",
    metaDescription:
      "Abenteuer abseits der Straße: Enduro-Tests, Offroad-Touren, Geländetechnik und alles für Motorradfahrer im Gelände. Jetzt lesen auf motorrad.news.",
  },
};
