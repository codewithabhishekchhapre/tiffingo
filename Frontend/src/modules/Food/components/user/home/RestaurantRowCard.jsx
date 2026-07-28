import React, { memo } from "react";
import { Link } from "react-router-dom";
import OptimizedImage from "@food/components/OptimizedImage";
import { RatingPill } from "@food/components/user/swiggy";

const RestaurantRowCard = memo(({ restaurant, index = 0, backendOrigin = "" }) => {
  const nameStr = typeof restaurant?.name === "string" ? restaurant.name.trim() : "";
  const fallbackSlugSource =
    nameStr || String(restaurant?.slug || restaurant?.id || restaurant?._id || `restaurant-${index}`);
  const restaurantSlug =
    typeof restaurant?.slug === "string" && restaurant.slug.trim()
      ? restaurant.slug.trim()
      : fallbackSlugSource.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link
      to={`/user/restaurants/${restaurantSlug}`}
      className="sw-pressable group flex w-[152px] flex-col sm:w-[168px]"
    >
      <div className="relative h-[104px] w-full overflow-hidden rounded-(--sw-radius-card) bg-(--sw-surface-alt) sm:h-28">
        <OptimizedImage
          src={restaurant?.image}
          alt={nameStr || "Restaurant"}
          className="h-full w-full object-cover"
          backendOrigin={backendOrigin}
        />
      </div>

      <div className="pt-2">
        <h3 className="line-clamp-1 text-[13px] font-extrabold leading-tight tracking-tight text-(--sw-text)">
          {restaurant?.name}
        </h3>
        <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-(--sw-text-secondary)">
          <RatingPill value={restaurant?.rating} size="sm" variant="plain" />
          {restaurant?.deliveryTime && (
            <>
              <span className="text-(--sw-text-muted)">•</span>
              <span className="truncate">{restaurant.deliveryTime}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
});

export default RestaurantRowCard;
