import { memo } from "react";
import foodPattern from "@food/assets/food_pattern_background.png";
import eatingBoy from "../../../../../assets/eating_boy_image-removebg-preview.png";
import eatingFood from "../../../../../assets/eading_food_2_image-removebg-preview.png";

/**
 * What a banner shows when its artwork can't be shown: the CMS row has no
 * image, the URL is broken, or the request failed. Bundled food artwork over a
 * brand wash reads as a deliberate slide, unlike a grey "image unavailable"
 * tile — and it needs no network request of its own.
 *
 * Keyed off the slide index so two neighbouring slides don't land on the same
 * look, and so a given slide keeps its look across re-renders.
 */
const GRADIENTS = [
  "linear-gradient(135deg, var(--sw-primary) 0%, var(--sw-primary-active) 58%, #2b0d12 100%)",
  "linear-gradient(135deg, #F97316 0%, var(--sw-primary) 62%, #7c1d27 100%)",
  "linear-gradient(135deg, #7C3AED 0%, var(--sw-primary) 68%, #3b0d18 100%)",
  "linear-gradient(135deg, #0F766E 0%, #115E59 55%, #0B2B2B 100%)",
];

const SUBJECTS = [eatingBoy, eatingFood];

const SHEEN =
  "radial-gradient(120% 80% at 85% 12%, rgba(255,255,255,0.20), transparent 62%), " +
  "radial-gradient(95% 70% at 8% 100%, rgba(0,0,0,0.30), transparent 60%)";

const BannerFallback = memo(({ index = 0, className = "", children }) => {
  const slot = Math.abs(index);

  return (
    <div
      aria-hidden={children ? undefined : "true"}
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ backgroundImage: GRADIENTS[slot % GRADIENTS.length] }}
    >
      {/* Tiled dish line-art — the "food image" layer. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url(${foodPattern})`,
          backgroundSize: "190px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Cut-out subject, mirroring where real banner artwork sits. */}
      <img
        src={SUBJECTS[slot % SUBJECTS.length]}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute -bottom-2 right-2 h-[92%] w-auto max-w-[45%] object-contain object-bottom drop-shadow-2xl sm:right-6"
      />

      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: SHEEN }} />

      {children}
    </div>
  );
});

BannerFallback.displayName = "BannerFallback";

export default BannerFallback;
