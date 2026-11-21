import {
  BookOpen,
  Briefcase,
  Home,
  Laptop,
  Package,
  Shirt,
  Smartphone,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export interface CategoryVisual {
  Icon: LucideIcon;
  /** Pastel circle background and icon colour (Tailwind classes). */
  bg: string;
  fg: string;
}

const rules: { match: RegExp; visual: CategoryVisual }[] = [
  { match: /book|note|text|study|course/i, visual: { Icon: BookOpen, bg: "bg-indigo-50", fg: "text-indigo-700" } },
  { match: /phone|mobile|accessor/i, visual: { Icon: Smartphone, bg: "bg-sky-50", fg: "text-sky-700" } },
  { match: /electron|laptop|gadget|computer/i, visual: { Icon: Laptop, bg: "bg-blue-50", fg: "text-blue-700" } },
  { match: /fashion|cloth|wear|shoe|bag/i, visual: { Icon: Shirt, bg: "bg-rose-50", fg: "text-rose-700" } },
  { match: /food|snack|drink|cook/i, visual: { Icon: UtensilsCrossed, bg: "bg-orange-50", fg: "text-orange-700" } },
  { match: /hostel|home|room|furnit|kitchen/i, visual: { Icon: Home, bg: "bg-amber-50", fg: "text-amber-700" } },
  { match: /service|tutor|hair|laundry|print/i, visual: { Icon: Briefcase, bg: "bg-emerald-50", fg: "text-emerald-700" } },
];

const fallback: CategoryVisual = { Icon: Package, bg: "bg-stone-100", fg: "text-stone-700" };

/** Pick an icon and pastel colour for a category from its name or slug. Purely presentational. */
export function categoryVisual(name: string, slug?: string): CategoryVisual {
  const text = `${name} ${slug ?? ""}`;
  return rules.find((r) => r.match.test(text))?.visual ?? fallback;
}
