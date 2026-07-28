/**
 * Food module — JS-side colour constants.
 *
 * CSS is the source of truth: the canonical palette lives in
 * `src/shared/styles/global.css` as `--sw-*` custom properties, and components
 * should consume it through Tailwind utilities (`bg-primary`, `text-primary`,
 * `bg-(--sw-green)`) so a single edit there re-themes every screen.
 *
 * These literals exist only for the handful of places a CSS variable CANNOT
 * resolve, and must be kept in sync with `--sw-*` by hand:
 *
 *   - HTML written into a new print window (OrderInvoice) — no stylesheet
 *   - SVG serialised into a `data:` URI (map pins in OrderTracking)
 *   - Third-party widget config (Razorpay checkout `theme.color`)
 *   - Recharts SVG presentation attributes
 *   - `normalizeHex()` contrast maths, which requires a literal 6-digit hex
 */

/** Brand red — primary actions, active states. Mirrors `--sw-primary`. */
export const FOOD_THEME_COLOR = "#E23744";
/** Pressed/hover step. Mirrors `--sw-primary-hover`. */
export const FOOD_THEME_HOVER = "#C72C38";
/** Deepest step, used for gradient ends. Mirrors `--sw-primary-active`. */
export const FOOD_THEME_ACTIVE = "#A8232D";
/** Lighter red for secondary marks and icons. Mirrors `--sw-accent`. */
export const FOOD_THEME_ACCENT = "#EF4F5F";

/** Rating pills, veg marks, ADD buttons. Mirrors `--sw-green`. */
export const FOOD_GREEN = "#267E3E";
/** Non-veg marks. Deeper than the primary so the two never read alike. */
export const FOOD_RED = "#A02334";

/** Near-black heading colour. Mirrors `--sw-text`. */
export const FOOD_TEXT = "#1C1C1C";
/** Page background. Mirrors `--sw-bg`. */
export const FOOD_BG = "#F4F4F2";
/** Card surface. Mirrors `--sw-surface`. */
export const FOOD_SURFACE = "#FFFFFF";
/** Hairline divider. Mirrors `--sw-border`. */
export const FOOD_BORDER = "#E8E8E4";

export const FOOD_THEME_SHADOW = "rgba(226, 55, 68, 0.2)";
export const FOOD_THEME_GRADIENT = `linear-gradient(to right, ${FOOD_THEME_COLOR}, ${FOOD_THEME_ACTIVE})`;
