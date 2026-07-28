import React, { memo } from "react";
import { Link } from "react-router-dom";
import { CategoryChipRowSkeleton } from "@food/components/ui/loading-skeletons";
import OptimizedImage from "@food/components/OptimizedImage";
import { SectionHeader } from "@food/components/user/swiggy";

const CategoryRail = memo(({
  displayCategories,
  showCategorySkeleton,
  navigate,
  setShowAllCategoriesModal,
  backendOrigin = ""
}) => {
  const openAllCategories = () => {
    if (typeof setShowAllCategoriesModal === "function") {
      setShowAllCategoriesModal(true);
      return;
    }
    navigate("/user/categories");
  };

  return (
    <section
      className="border-b-8 border-(--sw-bg) bg-(--sw-surface) px-4 pt-4 pb-3"
      data-purpose="mind-categories"
    >
      <SectionHeader
        title="What's on your mind?"
        onAction={openAllCategories}
        className="mb-3"
      />

      <div className="sw-rail -mx-4 gap-4 px-4 pb-1">
        {/* Offers tile — keeps its brand fill so it reads as a promo, not a cuisine */}
        <button
          type="button"
          onClick={() => navigate("/user/under-250")}
          className="sw-pressable flex w-[76px] flex-col items-center gap-2 bg-transparent"
        >
          <span className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-primary text-white">
            <span className="text-[8px] font-black uppercase tracking-wider opacity-90">Under</span>
            <span className="text-lg font-black leading-none tracking-tight">₹250</span>
          </span>
          <span className="text-center text-[11px] font-bold leading-tight text-(--sw-text-secondary)">
            Offers
          </span>
        </button>

        {!showCategorySkeleton && displayCategories.map((category, index) => (
          <Link
            key={category.id || index}
            to={`/user/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="sw-pressable flex w-[76px] flex-col items-center gap-2"
          >
            {/* Swiggy crops cuisine art to a circle with no border or shadow. */}
            <span className="h-[76px] w-[76px] overflow-hidden rounded-full bg-(--sw-surface-alt)">
              <OptimizedImage
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover"
                backendOrigin={backendOrigin}
              />
            </span>
            <span className="line-clamp-2 max-w-full text-center text-[11px] font-bold leading-tight text-(--sw-text-secondary)">
              {category.name}
            </span>
          </Link>
        ))}

        {showCategorySkeleton && <CategoryChipRowSkeleton className="flex-shrink-0" />}
      </div>
    </section>
  );
});

export default CategoryRail;
