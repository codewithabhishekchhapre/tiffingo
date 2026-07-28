import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Swiggy's bottom sheet: scrim, grab handle, sticky title bar, scrollable body
 * and an optional pinned footer for the primary action.
 *
 * Portals to <body>, so it carries `food-theme-scope` itself to keep the
 * Tailwind colour mapping — see the note in global.css.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  showHandle = true,
  maxHeight = "86vh",
  className,
}) {
  // Lock body scroll while the sheet is up.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="food-theme-scope fixed inset-0 z-[9999] flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-(--sw-overlay)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            className={cn(
              "relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-(--sw-radius-sheet) bg-(--sw-surface) shadow-(--sw-shadow-sheet)",
              className,
            )}
            style={{ maxHeight }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 340 }}
          >
            {showHandle && (
              <div className="flex shrink-0 justify-center pt-2.5">
                <span className="h-1 w-9 rounded-full bg-(--sw-border-strong)" />
              </div>
            )}

            {(title || subtitle) && (
              <header className="flex shrink-0 items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  {title && (
                    <h2 className="truncate text-base font-extrabold text-(--sw-text)">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="mt-0.5 truncate text-xs text-(--sw-text-muted)">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="sw-pressable -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--sw-surface-alt) text-(--sw-text-secondary)"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </header>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

            {footer && (
              <footer className="shrink-0 border-t border-(--sw-border) bg-(--sw-surface) p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
