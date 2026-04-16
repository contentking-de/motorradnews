export type CategoryMeta = {
  heading: string;
  subtext: string;
};

export const categoryMetaBySlug: Record<string, CategoryMeta> = {
  neuheiten: {
    heading: "Neuheiten",
    subtext:
      "Neue Modelle, Rückrufe, Branchennews und alles, was die Motorrad-Welt bewegt — kompakt und aktuell.",
  },
  tests: {
    heading: "Tests & Fahrberichte",
    subtext:
      "Ehrliche Testberichte, Vergleichstests und Erfahrungen aus erster Hand — damit du das richtige Bike findest.",
  },
  technik: {
    heading: "Technik & Ratgeber",
    subtext:
      "Praxisnahe Technik-Tipps, Pflegeanleitungen und Ratgeber rund um Wartung, Zubehör und Ausrüstung.",
  },
  reisen: {
    heading: "Reisen & Touren",
    subtext:
      "Inspirierende Reiserouten, Tourentipps und Erlebnisse von Bikern für Biker — von Alpenpass bis Küstenstraße.",
  },
  motorsport: {
    heading: "Motorsport",
    subtext:
      "MotoGP, Superbike-WM und nationale Rennserien — Ergebnisse, Analysen und Hintergründe vom Rennsport.",
  },
  offroad: {
    heading: "Offroad & Enduro",
    subtext:
      "Abenteuer abseits der Straße — Enduros, Offroad-Touren, Geländetechnik und alles für Dreck-Fans auf zwei Rädern.",
  },
};
