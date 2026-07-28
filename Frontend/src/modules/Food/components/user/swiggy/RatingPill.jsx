import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: { box: "h-4 gap-0.5 px-1 text-[10px]", icon: "h-2 w-2" },
  md: { box: "h-5 gap-1 px-1.5 text-[11px]", icon: "h-2.5 w-2.5" },
  lg: { box: "h-6 gap-1 px-2 text-xs", icon: "h-3 w-3" },
};

/**
 * Swiggy's rating chip. Solid green above 4.0, muted amber between 3 and 4,
 * grey below that, and a plain "NEW" pill when the place has no rating yet.
 *
 * @param {number|string} value   raw rating
 * @param {"solid"|"plain"} variant  `solid` = filled pill on imagery,
 *                                   `plain` = green text inline in a card body
 */
export default function RatingPill({
  value,
  count,
  size = "md",
  variant = "solid",
  className,
}) {
  const rating = Number(value);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const s = SIZE[size] || SIZE.md;

  const tone = !hasRating
    ? "var(--sw-text-muted)"
    : rating >= 4
      ? "var(--sw-green)"
      : rating >= 3
        ? "var(--sw-gold)"
        : "var(--sw-text-secondary)";

  if (variant === "plain") {
    return (
      <span
        className={cn("inline-flex items-center font-bold", s.box, "px-0", className)}
        style={{ color: tone }}
      >
        <Star className={cn(s.icon, "fill-current")} strokeWidth={0} />
        <span className="leading-none">{hasRating ? rating.toFixed(1) : "New"}</span>
        {count ? (
          <span className="font-medium text-(--sw-text-muted)">({count})</span>
        ) : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-(--sw-radius-control) font-bold text-white",
        s.box,
        className,
      )}
      style={{ backgroundColor: hasRating ? tone : "var(--sw-text-secondary)" }}
    >
      {hasRating && <Star className={cn(s.icon, "fill-white")} strokeWidth={0} />}
      <span className="leading-none tracking-tight">
        {hasRating ? rating.toFixed(1) : "NEW"}
      </span>
    </span>
  );
}
