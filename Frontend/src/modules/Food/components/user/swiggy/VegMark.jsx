import { cn } from "@/lib/utils";

const TONE = {
  veg: "--sw-green",
  nonveg: "--sw-red",
  egg: "--sw-gold",
};

const SIZE = {
  sm: "h-3 w-3 rounded-[3px] border-[1.5px]",
  md: "h-3.5 w-3.5 rounded-[3px] border-[1.5px]",
  lg: "h-4 w-4 rounded-[4px] border-2",
};

const DOT = {
  sm: "h-1.5 w-1.5",
  md: "h-[7px] w-[7px]",
  lg: "h-2 w-2",
};

/**
 * The square food-type indicator: a coloured outline with a filled dot inside.
 * Green for veg, red for non-veg, amber for egg.
 *
 * @param {"veg"|"nonveg"|"egg"} type
 * @param {"sm"|"md"|"lg"} size
 */
export default function VegMark({ type = "veg", size = "md", className }) {
  const token = TONE[type] || TONE.veg;
  const label = type === "nonveg" ? "Non-vegetarian" : type === "egg" ? "Contains egg" : "Vegetarian";

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-(--sw-surface)",
        SIZE[size] || SIZE.md,
        className,
      )}
      style={{ borderColor: `var(${token})` }}
    >
      <span
        className={cn("rounded-full", DOT[size] || DOT.md)}
        style={{ backgroundColor: `var(${token})` }}
      />
    </span>
  );
}

/**
 * Normalises the many shapes the API uses for food type into a VegMark `type`.
 * Accepts booleans (`isVeg`), strings ("veg" / "non-veg" / "egg") or numbers.
 */
export function resolveFoodType(item) {
  if (!item) return "veg";

  const raw =
    item.foodType ?? item.type ?? item.dietaryType ?? item.veg ?? item.isVeg;

  if (typeof raw === "boolean") return raw ? "veg" : "nonveg";
  if (typeof raw === "number") return raw === 1 ? "veg" : "nonveg";

  const value = String(raw ?? "").trim().toLowerCase();
  if (!value) return "veg";
  if (value.includes("egg")) return "egg";
  if (value.includes("non") || value === "0" || value === "false") return "nonveg";
  return "veg";
}
