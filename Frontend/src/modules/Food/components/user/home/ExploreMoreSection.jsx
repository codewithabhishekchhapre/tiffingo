import React, { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExploreGridSkeleton } from "@food/components/ui/loading-skeletons";
import OptimizedImage from "@food/components/OptimizedImage";
import discoveryBg from "@food/assets/food_discovery_bg.png";
import SectionHeading from "./SectionHeading";

const ExploreMoreSection = memo(({
  exploreMoreHeading,
  showExploreSkeleton,
  finalExploreItems,
  backendOrigin = ""
}) => {
  return (
    <section className="border-b-8 border-(--sw-bg) bg-(--sw-surface) px-4 py-4">
      <SectionHeading
        title={exploreMoreHeading || "Explore More"}
        className="mb-3"
        action={<span className="text-xs font-extrabold text-primary">Discover →</span>}
      />

      {showExploreSkeleton ? (
        <div className="grid grid-cols-3 gap-3">
          <ExploreGridSkeleton count={3} className="grid-cols-3" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {finalExploreItems.map((item, index) => (
            <Link
              key={item.id}
              to={item.href}
              className="group flex flex-col items-center gap-2"
            >
              <div className="sw-image-scrim sw-pressable relative aspect-square w-full overflow-hidden rounded-(--sw-radius-card) bg-(--sw-surface-alt)">
                <OptimizedImage
                  src={item.image}
                  alt={item.label}
                  className="h-full w-full object-cover"
                  backendOrigin={backendOrigin}
                />
                <span className="absolute inset-x-0 bottom-2 z-10 px-2 text-center text-xs font-extrabold leading-tight text-white">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
});

export default ExploreMoreSection;
