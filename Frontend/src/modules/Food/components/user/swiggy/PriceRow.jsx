import { cn } from "@/lib/utils";

const formatAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  const sign = amount < 0 ? "−" : "";
  return `${sign}₹${Math.abs(amount).toFixed(2)}`;
};

/**
 * One line of the bill panel: label on the left, amount on the right.
 *
 * @param {"default"|"discount"|"total"} tone
 *        `discount` prints green, `total` prints heavier with a rule above.
 * @param {boolean} strikethrough  shows the pre-discount amount crossed out
 */
export default function PriceRow({
  label,
  hint,
  value,
  tone = "default",
  strikethrough,
  className,
}) {
  const isTotal = tone === "total";
  const isDiscount = tone === "discount";

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 py-1.5",
        isTotal && "mt-1.5 border-t border-(--sw-border) pt-3",
        className,
      )}
    >
      <div className="min-w-0">
        <span
          className={cn(
            "block text-sm",
            isTotal ? "font-extrabold text-(--sw-text)" : "text-(--sw-text-secondary)",
          )}
          style={isDiscount ? { color: "var(--sw-green)" } : undefined}
        >
          {label}
        </span>
        {hint && <span className="mt-0.5 block text-[11px] text-(--sw-text-muted)">{hint}</span>}
      </div>

      <div className="flex shrink-0 items-baseline gap-1.5">
        {strikethrough != null && (
          <span className="text-xs text-(--sw-text-muted) line-through">
            {formatAmount(strikethrough)}
          </span>
        )}
        <span
          className={cn(
            "text-sm tabular-nums",
            isTotal ? "font-extrabold text-(--sw-text)" : "font-semibold text-(--sw-text-secondary)",
          )}
          style={isDiscount ? { color: "var(--sw-green)" } : undefined}
        >
          {typeof value === "number" ? formatAmount(value) : value}
        </span>
      </div>
    </div>
  );
}
