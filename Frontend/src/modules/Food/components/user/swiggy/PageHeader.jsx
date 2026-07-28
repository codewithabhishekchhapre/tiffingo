import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * The sticky top bar on every inner page: back arrow, title (with optional
 * subtitle) and trailing actions, over a hairline.
 *
 * `onBack` defaults to `navigate(-1)` so pages get correct behaviour for free.
 */
export default function PageHeader({
  title,
  subtitle,
  onBack,
  actions,
  sticky = true,
  border = true,
  className,
  children,
}) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "z-40 bg-(--sw-surface) px-2 py-2.5",
        sticky && "sticky top-0",
        border && "border-b border-(--sw-border)",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onBack || (() => navigate(-1))}
          aria-label="Go back"
          className="sw-pressable flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent text-(--sw-text)"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>

        <div className="min-w-0 flex-1">
          {title && (
            <h1 className="truncate text-base font-extrabold leading-tight text-(--sw-text)">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="truncate text-[11px] leading-tight text-(--sw-text-muted)">{subtitle}</p>
          )}
        </div>

        {actions && <div className="flex shrink-0 items-center gap-1 pr-1">{actions}</div>}
      </div>

      {children}
    </header>
  );
}
