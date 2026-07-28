import { BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The offer line Swiggy prints under a restaurant name, separated from the
 * details above by a dashed hairline.
 *
 * @param {string} label  e.g. "Flat ₹150 OFF above ₹299"
 * @param {string} note   optional qualifier shown after the label
 */
export default function OfferStrip({ label, note, icon: Icon = BadgePercent, className }) {
  if (!label) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 border-t border-dashed border-(--sw-border-strong) pt-1.5",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} style={{ color: "var(--sw-accent)" }} />
      <span className="truncate text-xs font-extrabold uppercase tracking-tight text-(--sw-text-secondary)">
        {label}
      </span>
      {note && <span className="shrink-0 text-[11px] text-(--sw-text-muted)">{note}</span>}
    </div>
  );
}
