import { cn } from "@/lib/utils";

/**
 * The pinned footer CTA used on cart, checkout and item pages: an optional
 * summary block on the left and a full-height primary button on the right.
 *
 * Respects the iOS home-indicator inset so the button is never cut off.
 */
export default function StickyActionBar({
  summary,
  actionLabel,
  onAction,
  disabled = false,
  loading = false,
  tone = "primary",
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-(--sw-border) bg-(--sw-surface) px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-(--sw-shadow-sheet)",
        className,
      )}
    >
      {children || (
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {summary && <div className="min-w-0 flex-1">{summary}</div>}

          <button
            type="button"
            onClick={onAction}
            disabled={disabled || loading}
            className={cn(
              "sw-pressable flex h-12 items-center justify-center gap-2 rounded-(--sw-radius-control) px-6 text-sm font-extrabold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50",
              summary ? "shrink-0" : "w-full",
            )}
            style={{
              backgroundColor: tone === "green" ? "var(--sw-green)" : "var(--sw-primary)",
            }}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              actionLabel
            )}
          </button>
        </div>
      )}
    </div>
  );
}
