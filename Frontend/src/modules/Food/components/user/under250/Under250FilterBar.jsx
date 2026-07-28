import { ArrowDownUp, Timer } from "lucide-react"
import { Chip } from "@food/components/user/swiggy"

// The sort glyph reads as an up/down arrow pair only when rotated, and `Chip`
// owns the icon's sizing — so the rotation has to ride along with the class.
const SortIcon = ({ className }) => (
  <ArrowDownUp className={`${className} rotate-90`} strokeWidth={2} />
)

export default function Under250FilterBar({
  selectedSort,
  sortOptions,
  under30MinsFilter,
  onOpenSort,
  onToggleUnder30,
  resultCount,
}) {
  const sortLabel = selectedSort
    ? sortOptions.find((opt) => opt.id === selectedSort)?.label
    : "Sort"

  return (
    <section className="sticky top-0 md:top-[160px] z-30 mt-4 w-full min-w-0 overflow-hidden">
      <div className="bg-(--sw-surface)/85 backdrop-blur-md border-y border-(--sw-border) py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full min-w-0 flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0 overscroll-x-contain"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <Chip
              label={sortLabel}
              icon={SortIcon}
              hasDropdown
              selected={Boolean(selectedSort)}
              onClick={onOpenSort}
            />

            <Chip
              label="Under 30 mins"
              icon={Timer}
              selected={under30MinsFilter}
              onClick={onToggleUnder30}
            />
          </div>

          {resultCount > 0 && (
            <span className="text-[11px] font-bold text-(--sw-text-muted) whitespace-nowrap hidden sm:block">
              {resultCount} restaurant{resultCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
