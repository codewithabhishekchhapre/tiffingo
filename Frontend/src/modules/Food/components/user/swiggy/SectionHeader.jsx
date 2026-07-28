import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * The heading that sits above every home rail: an optional uppercase eyebrow,
 * a heavy title, and an optional "see all" affordance on the right.
 *
 * Pass either `to` (renders a Link) or `onAction` (renders a button); passing
 * neither hides the action entirely.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel = "See all",
  to,
  onAction,
  size = "md",
  className,
}) {
  const showAction = Boolean(to || onAction);

  const actionInner = (
    <>
      <span>{actionLabel}</span>
      <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
    </>
  );

  const actionClass =
    "sw-pressable inline-flex items-center gap-0.5 bg-transparent text-xs font-extrabold text-primary";

  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="sw-eyebrow mb-0.5">{eyebrow}</p>}
        <h2
          className={cn(
            "font-extrabold tracking-tight text-(--sw-text)",
            size === "lg" ? "text-xl" : size === "sm" ? "text-base" : "text-lg",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 line-clamp-1 text-xs text-(--sw-text-muted)">{subtitle}</p>
        )}
      </div>

      {showAction &&
        (to ? (
          <Link to={to} className={cn(actionClass, "shrink-0")}>
            {actionInner}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className={cn(actionClass, "shrink-0")}>
            {actionInner}
          </button>
        ))}
    </div>
  );
}
