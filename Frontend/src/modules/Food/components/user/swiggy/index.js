/**
 * Swiggy-pattern UI primitives for the Food user experience.
 *
 * These are presentational only — they hold no cart, routing or fetch logic, so
 * pages keep owning their behaviour and can adopt the new look without any
 * change to how they work. Colour comes exclusively from the `--sw-*` tokens
 * in `src/shared/styles/global.css`.
 */
export { default as VegMark, resolveFoodType } from "./VegMark";
export { default as RatingPill } from "./RatingPill";
export { default as AddButton } from "./AddButton";
export { default as SectionHeader } from "./SectionHeader";
export { default as ListRow, ListGroup } from "./ListRow";
export { default as OfferStrip } from "./OfferStrip";
export { default as BottomSheet } from "./BottomSheet";
export { default as PriceRow } from "./PriceRow";
export { default as Chip } from "./Chip";
export { default as PageHeader } from "./PageHeader";
export { default as StickyActionBar } from "./StickyActionBar";
