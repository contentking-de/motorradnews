import {
  Sparkles,
  Gauge,
  Wrench,
  Compass,
  Flag,
  Mountain,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export const categoryIconBySlug: Record<string, LucideIcon> = {
  neuheiten: Sparkles,
  tests: Gauge,
  technik: Wrench,
  reisen: Compass,
  motorsport: Flag,
  offroad: Mountain,
  "sonstige-news": Newspaper,
};
