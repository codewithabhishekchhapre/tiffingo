import React, { memo, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Bookmark, Share2, Minus, Plus } from "lucide-react";
import { restaurantAPI } from "@food/api";
import { useCart } from "@food/context/CartContext";
import {
  VegMark,
  resolveFoodType,
  AddButton,
  BottomSheet,
} from "@food/components/user/swiggy";
import SectionHeading from "./SectionHeading";

// Module-level cache: persists across component unmount/remount, avoids re-fetching same restaurants
const productsCache = new Map();

const ProductSheet = ({ product, onClose, onAdd }) => {
  const [quantity, setQuantity] = useState(1);

  // Reset the stepper whenever a different dish opens the sheet.
  useEffect(() => {
    setQuantity(1);
  }, [product?._id, product?.id]);

  if (!product) return null;

  const price = Number(product.price) || 0;

  return (
    <BottomSheet
      open={Boolean(product)}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-3">
          <div className="flex h-12 items-center rounded-(--sw-radius-control) border border-(--sw-border) px-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
              className="sw-pressable flex h-10 w-9 items-center justify-center bg-transparent text-(--sw-text-secondary)"
            >
              <Minus className="h-4 w-4" strokeWidth={3} />
            </button>
            <span className="w-7 text-center text-sm font-extrabold tabular-nums text-(--sw-text)">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className="sw-pressable flex h-10 w-9 items-center justify-center bg-transparent text-(--sw-text-secondary)"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onAdd(product, quantity)}
            className="sw-pressable flex h-12 flex-1 items-center justify-center rounded-(--sw-radius-control) bg-primary text-sm font-extrabold uppercase tracking-wide text-white"
          >
            Add item • ₹{price * quantity}
          </button>
        </div>
      }
    >
      <div className="relative h-56 bg-(--sw-surface-alt)">
        <img
          src={product.image || product.imageUrl || "https://via.placeholder.com/400"}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute -bottom-5 right-4 flex gap-2">
          <button
            type="button"
            aria-label="Save dish"
            className="sw-pressable flex h-11 w-11 items-center justify-center rounded-full border border-(--sw-border) bg-(--sw-surface) text-(--sw-text-secondary) shadow-(--sw-shadow-md)"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Share dish"
            className="sw-pressable flex h-11 w-11 items-center justify-center rounded-full border border-(--sw-border) bg-(--sw-surface) text-(--sw-text-secondary) shadow-(--sw-shadow-md)"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-6 pt-8">
        <div className="mb-2 flex items-start gap-2">
          <VegMark type={resolveFoodType(product)} size="lg" className="mt-1" />
          <h2 className="text-lg font-extrabold leading-tight text-(--sw-text)">
            {product.name}
          </h2>
        </div>
        <p className="text-base font-extrabold text-(--sw-text)">₹{price}</p>
        <p className="mt-2.5 text-sm leading-relaxed text-(--sw-text-muted)">
          {product.description || "Delicious food item from our menu."}
        </p>
      </div>
    </BottomSheet>
  );
};

const RecommendedSection = memo(({ recommendedForYouRestaurants }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  // Stable key derived from IDs — prevents unnecessary re-fetches when parent re-renders
  const restaurantIdsKey = useMemo(
    () => (recommendedForYouRestaurants || []).map(r => r.mongoId || r.id).join(","),
    [recommendedForYouRestaurants]
  );

  useEffect(() => {
    if (!restaurantIdsKey) return;

    // Serve from cache if available
    if (productsCache.has(restaurantIdsKey)) {
      setProducts(productsCache.get(restaurantIdsKey));
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const restaurantsToFetch = (recommendedForYouRestaurants || []).slice(0, 3);
        const fetchPromises = restaurantsToFetch.map(async (restaurant) => {
          try {
            const res = await restaurantAPI.getMenuByRestaurantId(restaurant.mongoId || restaurant.id);
            const menu = res.data?.data?.menu;
            const items = [];
            if (menu?.sections) {
              menu.sections.forEach(section => {
                if (section.items) {
                  section.items.forEach(item => {
                    items.push({
                      ...item,
                      restaurantId: restaurant.mongoId || restaurant.id,
                      restaurant: restaurant.name,
                      restaurantData: restaurant
                    });
                  });
                }
              });
            }
            return items;
          } catch {
            return [];
          }
        });

        const results = await Promise.all(fetchPromises);
        const allProducts = results.flat().slice(0, 6);
        productsCache.set(restaurantIdsKey, allProducts);
        setProducts(allProducts);
      } catch {
        // Silently fail — section simply won't show
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [restaurantIdsKey]); // Stable string dependency — no spurious re-runs

  // Loading Skeleton
  if (loading) {
    return (
      <section
        className="border-b-8 border-(--sw-bg) bg-(--sw-surface) px-4 py-4"
        data-purpose="recommended-section"
      >
        <div className="mb-3 h-6 w-48 animate-pulse rounded bg-(--sw-surface-sunken)" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 rounded-(--sw-radius-card) bg-(--sw-surface-sunken)" />
              <div className="mt-2 h-4 w-3/4 rounded bg-(--sw-surface-sunken)" />
              <div className="mt-1.5 h-3 w-1/2 rounded bg-(--sw-surface-sunken)" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  const handleAddToCart = async (product, quantity) => {
    const result = await addToCart({
      ...product,
      quantity,
      price: product.price,
      name: product.name,
      restaurantId: product.restaurantId,
      restaurant: product.restaurant
    });
    if (result?.ok === false) {
      // keep sheet open on mismatch so user can decide
      return;
    }
    setSelectedProduct(null);
  };

  return (
    <section
      className="border-b-8 border-(--sw-bg) bg-(--sw-surface) px-4 py-4"
      data-purpose="recommended-section"
    >
      <SectionHeading icon={Flame} title="Recommended for you" className="mb-3" />

      <div className="grid grid-cols-2 gap-x-3 gap-y-5">
        {products.map((product, index) => (
          <motion.div
            key={`recommended-prod-${product._id || product.id || index}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <div
              onClick={() => setSelectedProduct(product)}
              className="sw-pressable group flex h-full cursor-pointer flex-col"
              data-purpose="product-card"
            >
              <div className="relative h-32 overflow-hidden rounded-(--sw-radius-card) bg-(--sw-surface-alt)">
                <img
                  src={product.image || product.imageUrl || "https://via.placeholder.com/150"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {product.isVeg !== undefined && (
                  <VegMark
                    type={resolveFoodType(product)}
                    size="lg"
                    className="absolute left-2 top-2"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col pt-2">
                <h4 className="line-clamp-2 text-sm font-extrabold leading-tight text-(--sw-text)">
                  {product.name}
                </h4>
                <p className="mb-auto mt-0.5 line-clamp-1 text-xs text-(--sw-text-muted)">
                  {product.restaurant}
                </p>
                <div className="mt-2 flex shrink-0 items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-(--sw-text)">
                    ₹{product.price || "199"}
                  </span>
                  <AddButton
                    size="sm"
                    onAdd={(event) => {
                      event?.stopPropagation?.();
                      setSelectedProduct(product);
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ProductSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={handleAddToCart}
      />
    </section>
  );
});

export default RecommendedSection;
