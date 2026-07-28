import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * The settings/profile row Swiggy uses everywhere: leading icon, label with
 * optional description, optional trailing value, and a chevron.
 *
 * Renders as a Link when `to` is given, a button when `onClick` is given, and
 * a plain div otherwise (for read-only rows).
 */
export default function ListRow({
  icon: Icon,
  label,
  description,
  value,
  to,
  onClick,
  showChevron,
  danger = false,
  trailing,
  className,
}) {
  const interactive = Boolean(to || onClick);
  const chevron = showChevron ?? interactive;

  const content = (
    <>
      {Icon && (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            danger ? "bg-(--sw-red-soft)" : "bg-(--sw-surface-alt)",
          )}
        >
          <Icon
            className="h-[18px] w-[18px]"
            strokeWidth={2}
            style={{ color: danger ? "var(--sw-red)" : "var(--sw-text-secondary)" }}
          />
        </span>
      )}

      <span className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            "block truncate text-sm font-semibold",
            danger ? "text-(--sw-red)" : "text-(--sw-text)",
          )}
        >
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block truncate text-xs text-(--sw-text-muted)">
            {description}
          </span>
        )}
      </span>

      {value && (
        <span className="shrink-0 text-sm font-semibold text-(--sw-text-secondary)">
          {value}
        </span>
      )}

      {trailing}

      {chevron && (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-(--sw-text-muted)"
          strokeWidth={2.5}
        />
      )}
    </>
  );

  const base = cn(
    "flex w-full items-center gap-3 bg-(--sw-surface) px-4 py-3.5",
    interactive && "sw-pressable",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={base}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {content}
      </button>
    );
  }

  return <div className={base}>{content}</div>;
}

/**
 * Groups ListRows into one rounded card with hairlines between rows —
 * the standard Swiggy "settings block".
 */
export function ListGroup({ title, children, className }) {
  return (
    <section className={cn("px-4", className)}>
      {title && <p className="sw-eyebrow mb-2 px-0.5">{title}</p>}
      <div className="overflow-hidden rounded-(--sw-radius-card) border border-(--sw-border) bg-(--sw-surface) [&>*+*]:border-t [&>*+*]:border-(--sw-border)">
        {children}
      </div>
    </section>
  );
}
