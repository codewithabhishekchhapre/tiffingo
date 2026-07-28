import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "h-8 min-w-[72px] text-xs",
  md: "h-9 min-w-[88px] text-sm",
  lg: "h-10 min-w-[104px] text-sm",
};

/**
 * Swiggy's ADD control. Presentational only — the caller owns the cart state.
 *
 * With `quantity === 0` it renders the bordered white "ADD" button; above zero
 * it swaps to the −/qty/+ stepper occupying the exact same footprint so the
 * surrounding layout never shifts.
 *
 * @param {number}   quantity     current quantity in cart
 * @param {Function} onAdd        called when ADD or + is pressed
 * @param {Function} onRemove     called when − is pressed
 * @param {boolean}  disabled     renders the sold-out state
 * @param {string}   disabledLabel text shown when disabled (default "SOLD OUT")
 */
export default function AddButton({
  quantity = 0,
  onAdd,
  onRemove,
  disabled = false,
  disabledLabel = "SOLD OUT",
  size = "md",
  className,
}) {
  const box = cn(
    "inline-flex items-center justify-center rounded-(--sw-radius-control) border font-extrabold uppercase tracking-wide",
    SIZE[size] || SIZE.md,
    className,
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          box,
          "cursor-not-allowed border-(--sw-border) bg-(--sw-surface-alt) text-(--sw-text-disabled)",
        )}
      >
        {disabledLabel}
      </span>
    );
  }

  if (quantity > 0) {
    return (
      <div
        className={cn(
          box,
          "justify-between border-(--sw-border) bg-(--sw-surface) px-1 shadow-(--sw-shadow-sm)",
        )}
        style={{ color: "var(--sw-green)" }}
      >
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove one"
          className="sw-pressable flex h-full w-7 items-center justify-center rounded-md bg-transparent"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>

        <span aria-live="polite" className="min-w-5 text-center tabular-nums">
          {quantity}
        </span>

        <button
          type="button"
          onClick={onAdd}
          aria-label="Add one"
          className="sw-pressable flex h-full w-7 items-center justify-center rounded-md bg-transparent"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        box,
        "sw-pressable relative gap-0.5 border-(--sw-border) bg-(--sw-surface) shadow-(--sw-shadow-sm) hover:bg-(--sw-green-soft)",
      )}
      style={{ color: "var(--sw-green)" }}
    >
      Add
      <Plus className="h-3 w-3 -translate-y-1" strokeWidth={3} />
    </button>
  );
}
