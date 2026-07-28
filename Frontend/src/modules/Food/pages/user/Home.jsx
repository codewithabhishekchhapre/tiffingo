import { useSearchParams, Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import React, {
  Suspense,
  lazy,
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  startTransition,
} from "react";
import { createPortal } from "react-dom";
import {
  Star,
  Clock,
  MapPin,
  Heart,
  Search,
  Tag,
  Flame,
  ShoppingBag,
  ShoppingCart,
  Mic,
  SlidersHorizontal,
  CheckCircle2,
  Bookmark,
  BadgePercent,
  X,
  ArrowDownUp,
  Timer,
  CalendarClock,
  ShieldCheck,
  IndianRupee,
  UtensilsCrossed,
  Leaf,
  AlertCircle,
  Loader2,
  Plus,
  Check,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CategoryChipRowSkeleton,
  ExploreGridSkeleton,
  HeroBannerSkeleton,
  LoadingSkeletonRegion,
  RestaurantCardSkeleton,
  RestaurantGridSkeleton,
} from "@food/components/ui/loading-skeletons";
import { useProfile } from "@food/context/ProfileContext";
import { useCart } from "@food/context/CartContext";
import { HorizontalCarousel } from "@food/components/ui/horizontal-carousel";
import { DotPattern } from "@food/components/ui/dot-pattern";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@food/components/ui/card";
import { Button } from "@food/components/ui/button";
import { Badge } from "@food/components/ui/badge";
import { Input } from "@food/components/ui/input";
import { Switch } from "@food/components/ui/switch";
import { Checkbox } from "@food/components/ui/checkbox";
import {
  useSearchOverlay,
  useLocationSelector,
} from "@food/components/user/UserLayout";

const debugLog = (...args) => { };
const debugWarn = (...args) => { };
const debugError = (...args) => { };

// Import shared food images - prevents duplication
import { foodImages } from "@food/constants/images";

import { Avatar, AvatarFallback } from "@food/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@food/components/ui/dropdown-menu";
import { useLocation } from "@food/hooks/useLocation";
import { useZone } from "@food/hooks/useZone";

import offerImage from "@food/assets/offerimage.png";
import bannerEatingFood from "../../../../assets/eading_food_2_image-removebg-preview.png";
import bannerEatingBoy from "../../../../assets/eating_boy_image-removebg-preview.png";
import api, { publicGetOnce, restaurantAPI, adminAPI } from "@food/api";
import { API_BASE_URL } from "@food/api/config";
import OptimizedImage from "@food/components/OptimizedImage";
import { getRestaurantAvailabilityStatus } from "@food/utils/restaurantAvailability";
import HomeHeader from "@food/components/user/home/HomeHeader";
import { LocationProvider as QuickLocationProvider } from "../../../quickCommerce/user/context/LocationContext";
import { ProductDetailProvider as QuickProductDetailProvider } from "../../../quickCommerce/user/context/ProductDetailContext";
import { WishlistProvider as QuickWishlistProvider } from "../../../quickCommerce/user/context/WishlistContext";
import { CartAnimationProvider as QuickCartAnimationProvider } from "../../../quickCommerce/user/context/CartAnimationContext";
import { CartProvider as QuickCartProvider } from "../../../quickCommerce/user/context/CartContext";
import { prefetchQuickHomeBootstrap } from "../../../quickCommerce/user/services/customerApi";
import { PorterProvider } from "../../../porter/user/context/BookingContext";
import PromoRow from "@food/components/user/home/PromoRow";
import { optimizeCloudinaryUrl } from "../../../../shared/utils/cloudinaryUtils";
import VegModePopups from "@food/components/user/VegModePopups";
import { useEnabledModules } from "@/modules/common/hooks/useEnabledModules";
import {
  getFirstEnabledModulePath,
  getVisibleHomeTabs,
} from "@/modules/common/utils/enabledModules";

import * as imgUtils from "@food/utils/imageUtils";
import { useFoodHomeData } from "@food/hooks/useFoodHomeData";

// Extracted Sub-components
const BannerSection = lazy(() => import("@food/components/user/home/BannerSection"));
const CategoryRail = lazy(() => import("@food/components/user/home/CategoryRail"));
const RecommendedSection = lazy(() => import("@food/components/user/home/RecommendedSection"));
const RestaurantGrid = lazy(() => import("@food/components/user/home/RestaurantGrid"));
const RestaurantRow = lazy(() => import("@food/components/user/home/RestaurantRow"));
const SortFilterSection = lazy(() => import("@food/components/user/home/SortFilterSection"));
const ExploreMoreSection = lazy(() => import("@food/components/user/home/ExploreMoreSection"));

const MiniCart = lazy(() => import("@food/components/user/MiniCart"));
const OrderTrackingCard = lazy(() => import("@food/components/user/OrderTrackingCard"));
const QuickCommerceHomePage = lazy(() => import("../../../quickCommerce/user/pages/Home"));
const PorterHomePage = lazy(() => import("../../../porter/user/pages/Home"));

// Animated placeholder for search - moved outside component to prevent recreation
const placeholders = [
  'Search "burger"', 'Search "biryani"', 'Search "pizza"', 'Search "desserts"',
  'Search "chinese"', 'Search "thali"', 'Search "momos"', 'Search "dosa"', 'Search "thali"',
];

const quickPlaceholders = [
  'Search "milk"', 'Search "bread"', 'Search "eggs"', 'Search "chips"',
  'Search "fruits"', 'Search "atta"', 'Search "cold drink"', 'Search "ice cream"',
];

const WEBVIEW_SESSION_CACHE_BUSTER = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getStoredDeliveryAddressMode = () => {
  if (typeof window === "undefined") return "saved";
  return window.localStorage.getItem("deliveryAddressMode") || "saved";
};

const defaultBannersImages = [
  bannerEatingBoy,
  bannerEatingFood,
  bannerEatingBoy
];

const defaultBannersData = [
  { isFallback: true, title: "A SIX IS HIT! 🏏", subtitle: "66% OFF FOR 10 MIN!", action: "Order Now" },
  { isFallback: true, title: "MATCH DAY SPECIAL", subtitle: "Free Delivery on Pizza", action: "Explore" },
  { isFallback: true, title: "CRAVINGS SATISFIED", subtitle: "Flat ₹150 Off", action: "Claim Offer" }
];

export default function Home() {
  const HERO_BANNER_AUTO_SLIDE_MS = 3500;
  const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [heroSearch, setHeroSearch] = useState("");
  const { openSearch, closeSearch, searchValue, setSearchValue } = useSearchOverlay();
  const { openLocationSelector } = useLocationSelector();
  const { vegMode, setVegMode: setVegModeContext, isFavorite, addFavorite, removeFavorite, getDefaultAddress } = useProfile();
  const { cart } = useCart();
  const hasFoodCartItems = useMemo(
    () => cart.some((item) => (item?.orderType || "food") !== "quick"),
    [cart],
  );

  const [prevVegMode, setPrevVegMode] = useState(vegMode);
  const [showVegModePopup, setShowVegModePopup] = useState(false);
  const [showSwitchOffPopup, setShowSwitchOffPopup] = useState(false);
  const [isApplyingVegMode, setIsApplyingVegMode] = useState(false);
  const [isSwitchingOffVegMode, setIsSwitchingOffVegMode] = useState(false);
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [availabilityTick, setAvailabilityTick] = useState(Date.now());
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("food");
  const [showToast, setShowToast] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const heroShellRef = useRef(null);
  const restaurantLoadMoreRef = useRef(null);
  const isHandlingSwitchOff = useRef(false);
  const routerLocation = useRouterLocation();
  const { modules: enabledModules, loading: modulesLoading } = useEnabledModules();
  const visibleHomeTabs = useMemo(
    () => getVisibleHomeTabs(enabledModules),
    [enabledModules],
  );

  // --- Location Logic ---
  const { location } = useLocation();
  const { zoneId: liveZoneId, isInService: isLiveInService } = useZone(location);
  const defaultSavedAddress = useMemo(() => getDefaultAddress?.() || null, [getDefaultAddress]);
  const defaultSavedAddressLocation = useMemo(() => {
    if (!defaultSavedAddress) return null;
    const coords = defaultSavedAddress?.location?.coordinates;
    const latitude = Array.isArray(coords) && coords.length >= 2 ? coords[1] : (defaultSavedAddress.latitude ?? null);
    const longitude = Array.isArray(coords) && coords.length >= 2 ? coords[0] : (defaultSavedAddress.longitude ?? null);
    return {
      ...defaultSavedAddress,
      latitude,
      longitude,
      area: defaultSavedAddress.additionalDetails || defaultSavedAddress.area || "",
      zipCode: defaultSavedAddress.zipCode || defaultSavedAddress.postalCode || "",
      postalCode: defaultSavedAddress.postalCode || defaultSavedAddress.zipCode || "",
    };
  }, [defaultSavedAddress]);
  const { zoneId: savedZoneId, isInService: isSavedInService } = useZone(defaultSavedAddressLocation);

  const deliveryAddressMode = getStoredDeliveryAddressMode();
  const effectiveZoneId = (deliveryAddressMode === "current" ? liveZoneId : savedZoneId) || liveZoneId;
  const effectiveLocation = (deliveryAddressMode === "current" ? location : defaultSavedAddressLocation) || location;

  // --- Core Data Hook ---
  const {
    banners,
    categories,
    restaurants,
    landing,
    meta,
    actions,
    state
  } = useFoodHomeData({
    zoneId: effectiveZoneId,
    location: effectiveLocation,
    vegMode,
    backendOrigin: BACKEND_ORIGIN,
    availabilityTick
  });

  // --- Curated horizontal-row groupings (derived client-side, no extra API calls) ---
  const topRatedRestaurants = useMemo(() => {
    return [...(restaurants?.visible || [])]
      .filter((r) => Number(r.rating) >= 4.0)
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 10);
  }, [restaurants?.visible]);

  const quickDeliveryRestaurants = useMemo(() => {
    return [...(restaurants?.visible || [])]
      .sort((a, b) => (parseInt(a.deliveryTime, 10) || 99) - (parseInt(b.deliveryTime, 10) || 99))
      .slice(0, 10);
  }, [restaurants?.visible]);

  // --- UI Effects ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      startTransition(() => setAvailabilityTick(Date.now()));
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const activePlaceholders = activeTab === "quick" ? quickPlaceholders : placeholders;
      setPlaceholderIndex((prev) => (prev + 1) % activePlaceholders.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const activeBannerImages = useMemo(() => {
    // Show what the CMS actually returned. A row whose imageUrl is missing or
    // broken falls through to the gradient fallback inside the hero, so it no
    // longer borrows a bundled PNG that has nothing to do with the copy.
    // The bundled artwork stays as the "no banners configured at all" demo set.
    if (banners?.data?.length > 0) {
      return banners.data.map((b, i) => {
        const url = typeof b?.imageUrl === "string" ? b.imageUrl.trim() : "";
        return url || banners.images?.[i] || "";
      });
    }
    return defaultBannersImages;
  }, [banners?.data, banners?.images]);

  const activeBannerData = useMemo(() => banners?.data?.length > 0 ? banners.data : defaultBannersData, [banners?.data]);

  // Auto-slide banners
  useEffect(() => {
    if (!activeBannerImages.length) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBannerImages.length);
    }, HERO_BANNER_AUTO_SLIDE_MS);
    return () => clearInterval(interval);
  }, [activeBannerImages.length]);

  // Prevent body scroll when popups are open
  useEffect(() => {
    if (showVegModePopup || showSwitchOffPopup || showAllCategoriesModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showVegModePopup, showSwitchOffPopup, showAllCategoriesModal]);

  // Sync activeTab with URL and respect disabled modules
  useEffect(() => {
    if (modulesLoading) return;

    const path = routerLocation.pathname;
    const targetTab = path.endsWith("/quick")
      ? "quick"
      : path === "/porter" || path.endsWith("/porter")
      ? "porter"
      : "food";

    const moduleKey =
      targetTab === "quick" ? "quickCommerce" : targetTab === "porter" ? "porter" : "food";

    if (enabledModules[moduleKey] === false) {
      const fallbackPath = getFirstEnabledModulePath(enabledModules);
      if (fallbackPath && fallbackPath !== path) {
        navigate(fallbackPath, { replace: true });
      }
      return;
    }

    if (activeTab !== targetTab) setActiveTab(targetTab);
  }, [routerLocation.pathname, enabledModules, modulesLoading, activeTab, navigate]);

  useEffect(() => {
    if (modulesLoading || visibleHomeTabs.length === 0) return;
    const allowedTabIds = new Set(visibleHomeTabs.map((tab) => tab.id));
    if (!allowedTabIds.has(activeTab)) {
      const nextTab = visibleHomeTabs[0].id;
      if (nextTab === "quick") navigate("/quick", { replace: true });
      else if (nextTab === "porter") navigate("/porter", { replace: true });
      else navigate("/food/user", { replace: true });
    }
  }, [activeTab, modulesLoading, navigate, visibleHomeTabs]);

  // --- Handlers ---
  // Module switching moved to the bottom navigation, which navigates by route;
  // the effect above keeps `activeTab` in step with the URL.

  const handleVegModeChange = (newValue) => {
    if (isHandlingSwitchOff.current) return;
    if (newValue && !vegMode) setShowVegModePopup(true);
    else if (!newValue && vegMode) {
      isHandlingSwitchOff.current = true;
      setShowSwitchOffPopup(true);
    } else {
      setVegModeContext(newValue);
    }
  };

  const handleSearchFocus = useCallback(() => {
    if (activeTab === "quick") navigate("/quick/search");
    else {
      if (heroSearch) setSearchValue(heroSearch);
      openSearch();
    }
  }, [activeTab, heroSearch, navigate, openSearch, setSearchValue]);

  const handleFavoriteToggle = useCallback((e, restaurant, slug, favorite) => {
    if (favorite) removeFavorite(slug);
    else {
      addFavorite({
        ...restaurant,
        slug: slug,
        image: restaurant.profileImageUrl?.url || restaurant.image || "",
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  }, [addFavorite, removeFavorite]);

  // --- Render ---
  return (
    <div className="relative min-h-screen bg-(--sw-bg) pb-16 md:pb-6">
      <div className="md:hidden relative z-[50]">
        {!state.isBootstrapped ? (
          <div className="bg-(--sw-surface) px-4 pt-6 pb-4">
            <div className="mb-6 h-10 w-48 animate-pulse rounded-(--sw-radius-control) bg-(--sw-surface-sunken)" />
            <div className="h-11 w-full animate-pulse rounded-(--sw-radius-card) bg-(--sw-surface-sunken)" />
          </div>
        ) : (
          <HomeHeader
            activeTab={activeTab}
            location={location}
            savedAddressText={imgUtils.formatSavedAddress(effectiveLocation)}
            handleLocationClick={() => openLocationSelector()}
            handleSearchFocus={handleSearchFocus}
            placeholderIndex={placeholderIndex}
            placeholders={activeTab === "quick" ? quickPlaceholders : placeholders}
            vegMode={vegMode}
            onVegModeChange={handleVegModeChange}
            headerVideoUrl={landing.videoUrl}
            hero={{
              images: activeBannerImages,
              data: activeBannerData,
              currentIndex: currentBannerIndex,
              onSelectIndex: setCurrentBannerIndex,
              loading: banners.loading,
              backendOrigin: BACKEND_ORIGIN,
            }}
          />
        )}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {activeTab === "food" ? (
          <motion.div
            key="food-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="bg-(--sw-bg)"
          >
            <div className="max-w-6xl mx-auto">
              <Suspense fallback={<CategoryChipRowSkeleton className="py-1" />}>
                <CategoryRail
                  displayCategories={categories.display}
                  showCategorySkeleton={categories.loading}
                  navigate={navigate}
                  setShowAllCategoriesModal={setShowAllCategoriesModal}
                  backendOrigin={BACKEND_ORIGIN}
                />
              </Suspense>

              <Suspense fallback={<HeroBannerSkeleton className="h-full w-full px-4 mt-3" />}>
                <section className="hidden md:block content-auto px-4 py-3 sm:py-5 lg:py-6">
                  <div className="h-48 overflow-hidden rounded-(--sw-radius-card) border border-(--sw-border) sm:h-64 md:h-72 lg:h-[320px]">
                    <BannerSection
                      showBannerSkeleton={banners.loading}
                      heroBannerImages={banners.images}
                      heroBannersData={banners.data}
                      currentBannerIndex={currentBannerIndex}
                      setCurrentBannerIndex={setCurrentBannerIndex}
                      heroShellRef={heroShellRef}
                      navigate={navigate}
                      backendOrigin={BACKEND_ORIGIN}
                      hideOverlay={true}
                    />
                  </div>
                </section>
              </Suspense>

              <Suspense fallback={null}>
                <RestaurantRow
                  eyebrow="Highly rated"
                  title="Top Rated Near You"
                  restaurants={topRatedRestaurants}
                  backendOrigin={BACKEND_ORIGIN}
                />
              </Suspense>

              <Suspense fallback={null}>
                <RestaurantRow
                  eyebrow="Fastest to your door"
                  title="Quick Delivery"
                  restaurants={quickDeliveryRestaurants}
                  backendOrigin={BACKEND_ORIGIN}
                />
              </Suspense>

              <Suspense fallback={null}>
                <RecommendedSection recommendedForYouRestaurants={meta.recommended} />
              </Suspense>

              <Suspense fallback={null}>
                <ExploreMoreSection
                  exploreMoreHeading={landing.heading}
                  showExploreSkeleton={landing.loading}
                  finalExploreItems={landing.exploreMore}
                  backendOrigin={BACKEND_ORIGIN}
                />
              </Suspense>
            </div>

            <Suspense fallback={null}>
              <SortFilterSection
                activeFilters={state.activeFilters}
                toggleFilter={actions.toggleFilter}
                setIsFilterOpen={(val) => { }} // Hook handles internal apply
              />
            </Suspense>

            <Suspense fallback={<RestaurantGridSkeleton count={3} />}>
              <RestaurantGrid
                filteredRestaurants={restaurants.visible}
                visibleRestaurants={restaurants.visible}
                showRestaurantSkeleton={restaurants.loading}
                isLoadingFilterResults={restaurants.isLoadingFilterResults}
                loadingRestaurants={restaurants.loading}
                availabilityTick={availabilityTick}
                isFavorite={isFavorite}
                onFavoriteToggle={handleFavoriteToggle}
                backendOrigin={BACKEND_ORIGIN}
                hasMoreRestaurants={restaurants.hasMore}
                loadMoreRestaurants={actions.loadMoreRestaurants}
                restaurantLoadMoreRef={restaurantLoadMoreRef}
              />
            </Suspense>
          </motion.div>
        ) : activeTab === "quick" ? (
          <motion.div
            key="quick-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="bg-transparent"
          >
            <QuickLocationProvider>
              <QuickCartProvider>
                <QuickWishlistProvider>
                  <QuickCartAnimationProvider>
                    <QuickProductDetailProvider>
                      <Suspense fallback={<div className="h-screen w-full bg-white dark:bg-[#0a0a0a]" />}>
                        <QuickCommerceHomePage
                          embedded
                        />
                      </Suspense>
                    </QuickProductDetailProvider>
                  </QuickCartAnimationProvider>
                </QuickWishlistProvider>
              </QuickCartProvider>
            </QuickLocationProvider>
          </motion.div>
        ) : (
          <motion.div
            key="porter-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="bg-transparent"
          >
            <PorterProvider>
              <Suspense fallback={<div className="h-screen w-full bg-[#FAF7F2] dark:bg-[#0a0a0a]" />}>
                <PorterHomePage embedded />
              </Suspense>
            </PorterProvider>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Veg Mode Popups (Enable / Switch Off) */}
      <VegModePopups
        showVegModePopup={showVegModePopup}
        showSwitchOffPopup={showSwitchOffPopup}
        onCloseVegPopup={(level) => {
          setShowVegModePopup(false);
          if (level) {
            setVegModeContext(level);
          }
        }}
        onCloseSwitchOffPopup={() => {
          setShowSwitchOffPopup(false);
          isHandlingSwitchOff.current = false;
        }}
        onConfirmSwitchOff={() => {
          setVegModeContext(false);
          setShowSwitchOffPopup(false);
          isHandlingSwitchOff.current = false;
        }}
      />

      {/* Category Modal */}
      <AnimatePresence>
        {showAllCategoriesModal && (
          <div className="fixed inset-0 z-[9999] flex flex-col bg-(--sw-surface)">
            <HomeHeader embedded location={location} savedAddressText="All Categories" handleLocationClick={() => setShowAllCategoriesModal(false)} />
            <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6">
              <div className="grid grid-cols-3 gap-x-3 gap-y-5 min-[430px]:grid-cols-4 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-6 md:grid-cols-5 lg:grid-cols-6">
                {categories.display.map(cat => (
                  <Link key={cat.id} to={`/user/category/${cat.slug}`} className="sw-pressable flex min-w-0 flex-col items-center gap-2" onClick={() => setShowAllCategoriesModal(false)}>
                    <div className="h-[72px] w-[72px] overflow-hidden rounded-full bg-(--sw-surface-alt) sm:h-20 sm:w-20">
                      <OptimizedImage src={cat.image} className="w-full h-full object-cover" backendOrigin={BACKEND_ORIGIN} />
                    </div>
                    <span className="line-clamp-2 max-w-full text-center text-[11px] font-bold leading-tight text-(--sw-text-secondary)">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="fixed inset-x-0 bottom-0 border-t border-(--sw-border) bg-(--sw-surface) p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setShowAllCategoriesModal(false)}
                className="sw-pressable h-12 w-full rounded-(--sw-radius-control) bg-primary text-sm font-extrabold uppercase tracking-wide text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {hasFoodCartItems && <Suspense fallback={null}><MiniCart /></Suspense>}
      <Suspense fallback={null}><OrderTrackingCard hasBottomNav /></Suspense>
    </div>
  );
}
