import { memo } from "react";
import { motion } from "framer-motion";
import OptimizedImage from "@food/components/OptimizedImage";
import BannerFallback from "./BannerFallback";

/**
 * The full-bleed home hero.
 *
 * Split in two because the pieces sit on different layers: `HomeHeroBackdrop`
 * is absolutely positioned so the location bar, module switcher and search
 * field render *over* the artwork, while `HomeHeroCaption` stays in normal flow
 * underneath them and gives the backdrop its height.
 *
 * Both read the same `banners` payload the boxed carousel used, so nothing
 * changes for the CMS — only where the imagery lands on screen.
 */

/** Scrim. Dark at the top so white header text stays legible over any photo,
 *  fading into the page background so the hero dissolves into the content. */
const Scrim = () => (
  <>
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/55" />
    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-(--sw-bg)" />
  </>
);

export const HomeHeroBackdrop = memo(({
  images = [],
  data = [],
  currentIndex = 0,
  loading = false,
  backendOrigin = "",
}) => {
  // No artwork yet: a flat brand wash keeps the white-on-hero header readable
  // instead of letting it fall onto the page background mid-load.
  if (loading || images.length === 0) {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <BannerFallback index={currentIndex} className="absolute inset-0" />
        <Scrim />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {images.map((image, index) => {
        const bannerData = data[index];
        const isVideo =
          bannerData?.type === "video" ||
          (typeof image === "string" && image.toLowerCase().endsWith(".mp4"));
        const isActive = currentIndex === index;

        return (
          <div
            key={`${index}-${image}`}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }}
          >
            {isVideo ? (
              <video
                src={image}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <OptimizedImage
                src={image}
                alt=""
                className="h-full w-full object-cover"
                priority={isActive}
                backendOrigin={backendOrigin}
                draggable={false}
                fallback={<BannerFallback index={index} />}
              />
            )}
          </div>
        );
      })}

      <div className="absolute inset-0 z-[3]">
        <Scrim />
      </div>
    </div>
  );
});

HomeHeroBackdrop.displayName = "HomeHeroBackdrop";

export const HomeHeroCaption = memo(({
  images = [],
  data = [],
  currentIndex = 0,
  loading = false,
  onSelectIndex,
  navigate,
}) => {
  const bannerData = data[currentIndex];
  const hasBanners = !loading && images.length > 0;

  const openBanner = () => {
    const linked = bannerData?.linkedRestaurants || [];
    if (!linked.length) return;
    const first = linked[0];
    navigate?.(`/restaurants/${first.slug || first.restaurantId || first._id}`);
  };

  return (
    <div className="px-4 pb-6 pt-5">
      <motion.div
        // Re-keyed per slide so the copy re-animates as the carousel advances.
        key={currentIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-[19rem]"
      >
        {bannerData?.title && (
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">
            {bannerData.title}
          </p>
        )}

        <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
          {bannerData?.subtitle || "Your favourites, delivered fast"}
        </h2>

        {bannerData?.linkedRestaurants?.length > 0 && (
          <button
            type="button"
            onClick={openBanner}
            className="sw-pressable mt-3 inline-flex items-center gap-1 rounded-(--sw-radius-pill) bg-(--sw-surface) px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-primary shadow-(--sw-shadow-md)"
          >
            {bannerData?.action || "Order now"}
            <span className="tracking-tighter">&gt;&gt;</span>
          </button>
        )}
      </motion.div>

      {hasBanners && images.length > 1 && (
        <div className="mt-4 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectIndex?.(index)}
              aria-label={`Show banner ${index + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                currentIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

HomeHeroCaption.displayName = "HomeHeroCaption";
