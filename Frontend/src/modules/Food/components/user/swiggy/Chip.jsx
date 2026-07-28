import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The filter pill in Swiggy's sort/filter rail. Selected chips invert to a
 * tinted surface with a primary border and gain a clear affordance.
 *
 * @param {boolean} selected
 * @param {boolean} hasDropdown  renders a caret (for "Sort by" style chips)
 * @param {Function} onClear     when selected, renders an × instead of the caret
 */
export default function Chip({
  label,
  icon: Icon,
  selected = false,
  hasDropdown = false,
  onClick,
  onClear,
  count,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "sw-pressable inline-flex h-8 shrink-0 items-center gap-1.5 rounded-(--sw-radius-pill) border px-3 text-xs font-semibold whitespace-nowrap",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-(--sw-border) bg-(--sw-surface) text-(--sw-text-secondary)",
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
      <span>{label}</span>

      {count > 0 && (
        <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
          {count}
        </span>
      )}

      {selected && onClear ? (
        <span
          role="button"
          tabIndex={-1}
          aria-label={`Clear ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
          className="-mr-1 flex h-4 w-4 items-center justify-center rounded-full"
        >
          <X className="h-3 w-3" strokeWidth={3} />
        </span>
      ) : (
        hasDropdown && <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2.5} />
      )}
    </button>
  );
}
