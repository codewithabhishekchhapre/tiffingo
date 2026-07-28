import React, { memo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Timer } from "lucide-react";
import { RestaurantGridSkeleton, LoadingSkeletonRegion } from "@food/components/ui/loading-skeletons";
import { getRestaurantAvailabilityStatus } from "@food/utils/restaurantAvailability";
import { RatingPill, OfferStrip, SectionHeader } from "@food/components/user/swiggy";
import RestaurantImageCarousel from "./RestaurantImageCarousel";

const getRestaurantDisplayLocation = (restaurant) => {
  const loc = restaurant?.location;
  if (typeof loc === "string" && loc.trim()) return loc.trim();

  const area = (typeof loc === "object" && loc?.area) || restaurant?.area;
  const city = (typeof loc === "object" && loc?.city) || restaurant?.city;
  const areaCity = [area, city].filter(Boolean).join(", ");
  if (areaCity) return areaCity;

  if (loc && typeof loc === "object") {
    return loc.formattedAddress || loc.address || null;
  }

  return null;
};

/** Swiggy prints cuisines as a comma-joined, truncated line under the name. */
const getCuisineLine = (restaurant) => {
  const raw = restaurant?.cuisines ?? restaurant?.cuisine ?? restaurant?.categories;
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => (typeof entry === "string" ? entry : entry?.name))
      .filter(Boolean)
      .join(", ");
  }
  return typeof raw === "string" ? raw : "";
};

const FoodRestaurantCard = memo(({
  restaurant,
  index,
  isOutOfService,
  currentDate,
  isFavorite,
  onFavoriteToggle,
  backendOrigin
}) => {
  const nameStr = typeof restaurant?.name === "string" ? restaurant.name.trim() : "";
  const fallbackSlugSource =
    nameStr ||
    (typeof restaurant?.restaurantName === "string" ? restaurant.restaurantName.trim() : "") ||
    String(restaurant?.slug || restaurant?.id || restaurant?._id || `restaurant-${index}`);

  const restaurantSlug =
    typeof restaurant?.slug === "string" && restaurant.slug.trim()
      ? restaurant.slug.trim()
      : fallbackSlugSource.toLowerCase().replace(/\s+/g, "-");

  const availability = getRestaurantAvailabilityStatus(restaurant, currentDate, {
    ignoreOperationalStatus: false,
  });
  const favorite = isFavorite(restaurantSlug);
  const displayLocation = getRestaurantDisplayLocation(restaurant);
  const cuisineLine = getCuisineLine(restaurant);
  const isClosed = isOutOfService || !availability.isOpen;

  return (
    <Link
      to={`/user/restaurants/${restaurantSlug}`}
      className="sw-pressable group block"
      style={{
        animation: index < 10 ? `fade-in-up 0.4s ease-out ${index * 0.04}s backwards` : "none",
      }}
    >
      {/* Photo block — fully rounded and separate from the text, Swiggy-style */}
      <div
        className={`sw-image-scrim relative overflow-hidden rounded-(--sw-radius-card) ${
          isClosed ? "grayscale" : ""
        }`}
      >
        <RestaurantImageCarousel
          restaurant={restaurant}
          priority={index < 3}
          backendOrigin={backendOrigin}
          topRadiusClassName="rounded-(--sw-radius-card)"
          heightClassName="h-40 sm:h-44 lg:h-48"
        />

        {/* Offer headline burned into the image, as on Swiggy */}
        {restaurant.featuredDish && (
          <div className="absolute bottom-2 left-3 z-10 pr-3">
            <p className="truncate text-lg font-black uppercase italic leading-none tracking-tight text-white drop-shadow">
              {restaurant.featuredDish}
              {restaurant.featuredPrice ? ` ₹${restaurant.featuredPrice}` : ""}
            </p>
          </div>
        )}

        {/* Favourite */}
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onFavoriteToggle(event, restaurant, restaurantSlug, favorite);
          }}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className="sw-pressable absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
        >
          <Heart
            className={`h-4 w-4 transition-all ${favorite ? "fill-white text-white" : "text-white"}`}
            strokeWidth={2.5}
          />
        </button>

        {isClosed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="rounded-(--sw-radius-control) bg-black/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white">
              Currently closed
            </span>
          </div>
        )}
      </div>

      {/* Metadata — sits on the page background, no card chrome */}
      <div className={`px-1 pt-2.5 ${isClosed ? "opacity-60" : ""}`}>
        <h3 className="line-clamp-1 text-[15px] font-extrabold tracking-tight text-(--sw-text)">
          {restaurant.name}
        </h3>

        <div className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-(--sw-text-secondary)">
          <RatingPill value={restaurant.rating} size="sm" variant="plain" />
          {restaurant.deliveryTime && (
            <>
              <span className="text-(--sw-text-muted)">•</span>
              <span>{restaurant.deliveryTime}</span>
            </>
          )}
          {availability.isOpen && availability.closingCountdownLabel && (
            <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] font-bold text-(--sw-red)">
              <Timer className="h-3 w-3" strokeWidth={2.5} />
              {availability.closingCountdownLabel}
            </span>
          )}
        </div>

        {cuisineLine && (
          <p className="mt-0.5 line-clamp-1 text-[13px] text-(--sw-text-muted)">{cuisineLine}</p>
        )}

        <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-(--sw-text-muted)">
          {displayLocation && <span className="line-clamp-1">{displayLocation}</span>}
          {restaurant.distance && (
            <>
              {displayLocation && <span>•</span>}
              <span className="shrink-0">{restaurant.distance}</span>
            </>
          )}
        </div>

        {restaurant.offer && <OfferStrip label={restaurant.offer} className="mt-2" />}
      </div>
    </Link>
  );
});

const RestaurantGrid = memo(({
  filteredRestaurants,
  visibleRestaurants,
  showRestaurantSkeleton,
  isLoadingFilterResults,
  loadingRestaurants,
  isOutOfService,
  availabilityTick,
  isFavorite,
  onFavoriteToggle,
  backendOrigin,
  hasMoreRestaurants,
  loadMoreRestaurants,
  restaurantLoadMoreRef
}) => {
  const observer = React.useRef();

  // Pre-compute Date object once per tick to avoid N new Date() calls inside card renders
  const currentDate = React.useMemo(() => new Date(availabilityTick), [availabilityTick]);

  React.useEffect(() => {
    if (loadingRestaurants || !hasMoreRestaurants) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreRestaurants();
      }
    }, { threshold: 0.1, rootMargin: '100px' });

    if (restaurantLoadMoreRef?.current) {
      observer.current.observe(restaurantLoadMoreRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loadingRestaurants, hasMoreRestaurants, loadMoreRestaurants, restaurantLoadMoreRef]);

  return (
    <section className="content-auto mx-auto max-w-6xl pb-8 pt-4 md:pb-10">
      <div className="mb-4 px-4">
        <SectionHeader
          title="Restaurants with online food delivery"
          subtitle={`${filteredRestaurants.length} places near you`}
          size="lg"
        />
      </div>

      <div className={`relative ${showRestaurantSkeleton ? "min-h-[360px] sm:min-h-[420px]" : ""}`}>
        <AnimatePresence>
          {showRestaurantSkeleton && (
            <motion.div
              className="absolute inset-0 z-10 rounded-lg bg-(--sw-bg)/95"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LoadingSkeletonRegion label="Loading restaurants" className="h-full p-1 sm:p-2">
                <RestaurantGridSkeleton count={3} className="grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3" compact />
              </LoadingSkeletonRegion>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`grid grid-cols-2 items-start gap-x-3 gap-y-6 px-4 transition-opacity duration-300 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 ${
            isLoadingFilterResults || loadingRestaurants ? "opacity-50" : "opacity-100"
          }`}
        >
          {visibleRestaurants.map((restaurant, index) => (
            <FoodRestaurantCard
              key={restaurant?.id || restaurant?._id || restaurant?.slug || index}
              restaurant={restaurant}
              index={index}
              isOutOfService={isOutOfService}
              currentDate={currentDate}
              isFavorite={isFavorite}
              onFavoriteToggle={onFavoriteToggle}
              backendOrigin={backendOrigin}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 pt-4 sm:pt-6">
        {hasMoreRestaurants && loadingRestaurants && (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        )}
        <div ref={restaurantLoadMoreRef} className="h-10 w-full" aria-hidden="true" />
      </div>
    </section>
  );
});

export default RestaurantGrid;
