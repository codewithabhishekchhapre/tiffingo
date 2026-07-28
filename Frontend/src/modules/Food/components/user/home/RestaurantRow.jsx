import React, { memo } from "react";
import SectionHeading from "./SectionHeading";
import RestaurantRowCard from "./RestaurantRowCard";

const RestaurantRow = memo(({ eyebrow, title, restaurants, backendOrigin = "" }) => {
  if (!Array.isArray(restaurants) || restaurants.length === 0) return null;

  return (
    <section
      className="border-b-8 border-(--sw-bg) bg-(--sw-surface) px-4 py-4"
      data-purpose="restaurant-row"
    >
      <div className="mb-3">
        <SectionHeading eyebrow={eyebrow} title={title} />
      </div>
      <div className="sw-rail -mx-4 gap-3 px-4 pb-1">
        {restaurants.map((restaurant, index) => (
          <RestaurantRowCard
            key={restaurant?.id || restaurant?._id || restaurant?.slug || index}
            restaurant={restaurant}
            index={index}
            backendOrigin={backendOrigin}
          />
        ))}
      </div>
    </section>
  );
});

export default RestaurantRow;
