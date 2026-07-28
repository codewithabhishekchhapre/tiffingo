import React from "react";

/**
 * Legacy heading, kept for callers that supply a custom `action` node.
 * For the standard "See all" affordance prefer SectionHeader from
 * `@food/components/user/swiggy`.
 */
const SectionHeading = ({
  eyebrow,
  title,
  icon: Icon,
  action,
  size = "md", // "md" (CategoryRail/Recommended/ExploreMore) | "lg" (RestaurantGrid)
  className = "",
}) => {
  const titleSizeClass =
    size === "lg"
      ? "text-xl font-extrabold tracking-tight leading-tight"
      : "text-lg font-extrabold tracking-tight leading-tight";

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="flex min-w-0 flex-col">
        {eyebrow && <span className="sw-eyebrow mb-0.5">{eyebrow}</span>}
        <h2 className={`flex min-w-0 items-center gap-1.5 text-(--sw-text) ${titleSizeClass}`}>
          {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2.5} />}
          <span className="truncate">{title}</span>
        </h2>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default SectionHeading;
