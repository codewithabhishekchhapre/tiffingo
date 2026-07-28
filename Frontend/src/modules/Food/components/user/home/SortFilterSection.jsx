import React, { memo } from "react";
import { SlidersHorizontal, MapPin } from "lucide-react";
import { Chip } from "@food/components/user/swiggy";

const PRIMARY_FILTERS = [
  { id: "delivery-under-30", label: "Under 30 mins" },
  { id: "delivery-under-45", label: "Under 45 mins" },
  { id: "distance-under-1km", label: "Under 1km", icon: MapPin },
  { id: "distance-under-2km", label: "Under 2km", icon: MapPin },
];

const SortFilterSection = memo(({ activeFilters, toggleFilter, setIsFilterOpen }) => {
  // Sticks below the 72px desktop navbar; flush to the top on mobile.
  return (
    <section className="sticky top-0 z-40 border-b border-(--sw-border) bg-(--sw-surface) px-4 py-3 md:top-[72px]">
      <div className="sw-rail mx-auto max-w-6xl gap-2">
        <Chip
          label="Filters"
          icon={SlidersHorizontal}
          onClick={() => setIsFilterOpen(true)}
          count={activeFilters.size}
        />

        {PRIMARY_FILTERS.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.label}
            icon={filter.icon}
            selected={activeFilters.has(filter.id)}
            onClick={() => toggleFilter(filter.id)}
          />
        ))}
      </div>
    </section>
  );
});

export default SortFilterSection;
