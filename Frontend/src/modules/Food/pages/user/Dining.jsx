import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin, Search, Mic, SlidersHorizontal, Star, ArrowDownUp,
  Timer, IndianRupee, Clock, Bookmark, UtensilsCrossed, ChevronDown,
  ChevronLeft, ChevronRight, X
} from "lucide-react"
import { Input } from "@food/components/ui/input"
import { Skeleton } from "@food/components/ui/skeleton"
import AnimatedPage from "@food/components/user/AnimatedPage"
import SectionHeader from "@food/components/user/swiggy/SectionHeader"
import { useSearchOverlay } from "@food/components/user/UserLayout"
import { useLocation as useLocationHook } from "@food/hooks/useLocation"
import { useProfile } from "@food/context/ProfileContext"
import { diningAPI } from "@food/api"
import PageNavbar from "@food/components/user/PageNavbar"
import OptimizedImage from "@food/components/OptimizedImage"
import { cn } from "@/lib/utils"

const slugifyValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const getCoordinates = (restaurant) => {
  const latitude = restaurant?.location?.latitude
  const longitude = restaurant?.location?.longitude
  if (typeof latitude === "number" && typeof longitude === "number") {
    return { latitude, longitude }
  }
  const coords = restaurant?.location?.coordinates
  if (Array.isArray(coords) && coords.length === 2) {
    return { latitude: coords[1], longitude: coords[0] }
  }
  return null
}

const getDistanceKm = (userLocation, restaurant) => {
  const userLat = Number(userLocation?.latitude)
  const userLng = Number(userLocation?.longitude)
  const restaurantCoords = getCoordinates(restaurant)
  if (!Number.isFinite(userLat) || !Number.isFinite(userLng) || !restaurantCoords) {
    return Number.POSITIVE_INFINITY
  }
  const toRadians = (value) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRadians(restaurantCoords.latitude - userLat)
  const dLng = toRadians(restaurantCoords.longitude - userLng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(userLat)) *
      Math.cos(toRadians(restaurantCoords.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/* ─── Static option sets (module scope so they aren't rebuilt per render) ─── */
const CUISINES = ["Continental", "Italian", "Asian", "Indian", "Chinese", "American", "Seafood", "Cafe"]

const SORT_OPTIONS = [
  { id: null, label: "Relevance" },
  { id: "rating-high", label: "Rating: high to low" },
  { id: "rating-low", label: "Rating: low to high" },
]

const FILTER_CHIPS = [
  { id: "delivery-under-30", label: "Under 30 mins", icon: Timer, group: "time" },
  { id: "delivery-under-45", label: "Under 45 mins", icon: Timer, group: "time" },
  { id: "distance-under-1km", label: "Under 1 km", icon: MapPin, group: "distance" },
  { id: "distance-under-2km", label: "Under 2 km", icon: MapPin, group: "distance" },
  { id: "rating-35-plus", label: "3.5+ rating", icon: Star, group: "rating" },
  { id: "rating-4-plus", label: "4.0+ rating", icon: Star, group: "rating" },
  { id: "rating-45-plus", label: "4.5+ rating", icon: Star, group: "rating" },
  { id: "price-under-200", label: "Under ₹200", icon: IndianRupee, group: "price" },
  { id: "price-under-500", label: "Under ₹500", icon: IndianRupee, group: "price" },
]

const FILTER_LABELS = Object.fromEntries(FILTER_CHIPS.map((chip) => [chip.id, chip.label]))

const FILTER_TABS = [
  { id: "sort", label: "Sort by", icon: ArrowDownUp },
  { id: "time", label: "Time", icon: Timer },
  { id: "rating", label: "Rating", icon: Star },
  { id: "distance", label: "Distance", icon: MapPin },
  { id: "price", label: "Price", icon: IndianRupee },
  { id: "cuisine", label: "Cuisine", icon: UtensilsCrossed },
]

/* ─── Skeletons ─── */
function CategoryTileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="aspect-square w-full rounded-(--sw-radius-card)" />
      <Skeleton className="h-3 w-3/4 rounded-full" />
    </div>
  )
}

function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-(--sw-radius-card) border border-(--sw-border) bg-(--sw-surface)">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-2/3 rounded-full" />
          <Skeleton className="h-5 w-11 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <div className="flex items-center justify-between border-t border-(--sw-border) pt-3">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/* ─── Category tile ─── */
function CategoryTile({ category, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.24) }}
    >
      <Link
        to={`/food/user/dining/${category.slug}`}
        className="sw-pressable group flex flex-col items-center gap-2"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-(--sw-radius-card) border border-(--sw-border) bg-(--sw-surface-alt)">
          {category.imageUrl ? (
            <OptimizedImage
              src={category.imageUrl}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              objectFit="cover"
              sizes="(max-width: 640px) 25vw, 12vw"
              priority={index < 8}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/5">
              <UtensilsCrossed className="h-6 w-6 text-primary/70" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 rounded-(--sw-radius-card) ring-inset ring-primary/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/30" />
        </div>

        <span className="line-clamp-2 w-full text-center text-[11px] font-bold leading-tight text-(--sw-text-secondary) transition-colors group-hover:text-primary sm:text-xs">
          {category.name}
        </span>
      </Link>
    </motion.div>
  )
}

/* ─── Restaurant card ─── */
function DiningRestaurantCard({ restaurant, index, isFavorite, onToggleFavorite }) {
  const restaurantSlug = restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, "-")
  const diningDetailPath = `/food/user/dining/${restaurant.diningType || "dining"}/${restaurantSlug}`
  const favorite = isFavorite(restaurantSlug)

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite(restaurantSlug, restaurant, favorite)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className="group h-full"
    >
      <Link to={diningDetailPath} state={{ restaurant }} className="block h-full">
        <article className="flex h-full flex-col overflow-hidden rounded-(--sw-radius-card) border border-(--sw-border) bg-(--sw-surface) transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-(--sw-shadow-lg)">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-(--sw-surface-alt)">
            {restaurant.image ? (
              <OptimizedImage
                src={restaurant.image}
                alt={restaurant.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                objectFit="cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                priority={index < 4}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/5">
                <UtensilsCrossed className="h-10 w-10 text-primary/40" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            {restaurant.featuredDish && (
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-(--sw-radius-pill) border border-white/15 bg-black/45 px-2.5 py-1 backdrop-blur-md">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="max-w-[120px] truncate text-[11px] font-bold text-white">
                  {restaurant.featuredDish}
                </span>
                {restaurant.featuredPrice > 0 && (
                  <span className="text-[11px] font-extrabold text-amber-300">
                    ₹{restaurant.featuredPrice}
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={favorite ? "Remove from saved" : "Save restaurant"}
              aria-pressed={favorite}
              className="sw-pressable absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-(--sw-surface)/95 shadow-(--sw-shadow-sm) backdrop-blur-md transition-colors hover:bg-primary"
            >
              <Bookmark
                className={cn(
                  "h-4 w-4 transition-colors",
                  favorite ? "fill-primary text-primary" : "text-(--sw-text-secondary)",
                )}
                strokeWidth={favorite ? 0 : 2}
              />
            </button>

            {restaurant.offer && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 pb-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/70">
                    Pre-book table
                  </p>
                  <p className="truncate text-[13px] font-extrabold leading-tight text-white">
                    {restaurant.offer}
                  </p>
                </div>
                <span className="shrink-0 rounded-(--sw-radius-pill) bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  Book
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <h3 className="line-clamp-1 flex-1 text-[15px] font-extrabold tracking-tight text-(--sw-text) transition-colors group-hover:text-primary">
                  {restaurant.name}
                </h3>
                <span
                  className="flex shrink-0 items-center gap-1 rounded-(--sw-radius-pill) px-2 py-0.5 text-white"
                  style={{ backgroundColor: "var(--sw-green)" }}
                >
                  <span className="text-xs font-extrabold leading-none">
                    {restaurant.rating ? restaurant.rating.toFixed(1) : "—"}
                  </span>
                  <Star className="h-3 w-3 fill-white text-white" />
                </span>
              </div>

              {restaurant.cuisine && (
                <p className="line-clamp-1 text-xs font-medium text-(--sw-text-muted)">
                  {restaurant.cuisine}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-(--sw-border) pt-3 text-[11px] font-bold uppercase tracking-wide text-(--sw-text-muted)">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                {restaurant.deliveryTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                {restaurant.distance}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}

/* ─── Filter chip (mobile rail) ─── */
function FilterChip({ label, icon: Icon, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "sw-pressable flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--sw-radius-pill) border px-3.5 py-2 text-xs font-bold transition-colors",
        isActive
          ? "border-primary bg-primary text-white"
          : "border-(--sw-border) bg-(--sw-surface) text-(--sw-text-secondary) hover:border-primary hover:text-primary",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
      {label}
    </button>
  )
}

/* ─── Desktop filter dropdown ─── */
function FilterDropdown({ label, icon: Icon, isOpen, toggleOpen, children, activeCount }) {
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        toggleOpen()
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [isOpen, toggleOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        className={cn(
          "sw-pressable flex items-center gap-1.5 rounded-(--sw-radius-pill) border px-4 py-2 text-[13px] font-bold transition-colors",
          isOpen || activeCount > 0
            ? "border-primary bg-primary/10 text-primary"
            : "border-(--sw-border) bg-(--sw-surface) text-(--sw-text-secondary) hover:border-primary hover:text-primary",
        )}
      >
        {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
        {label}
        {activeCount > 0 && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-(--sw-radius-card) border border-(--sw-border) bg-(--sw-surface) p-3 shadow-(--sw-shadow-lg)"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Shared option row inside dropdowns / sheet ─── */
function OptionButton({ label, selected, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "sw-pressable w-full rounded-(--sw-radius-control) px-3 py-2 text-left text-xs font-bold transition-colors",
        selected
          ? "bg-primary/10 text-primary"
          : "text-(--sw-text-secondary) hover:bg-(--sw-surface-alt) hover:text-(--sw-text)",
        className,
      )}
    >
      {label}
    </button>
  )
}

/* ─── Sheet option card ─── */
function SheetOption({ label, icon: Icon, selected, onClick, stacked = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "sw-pressable w-full rounded-(--sw-radius-card) border p-4 text-sm font-bold transition-colors",
        stacked ? "flex flex-col items-center gap-2" : "text-left",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-(--sw-border) text-(--sw-text-secondary) hover:border-primary hover:text-primary",
      )}
    >
      {Icon && (
        <Icon
          className={cn("h-5 w-5", selected ? "text-primary" : "text-(--sw-text-muted)")}
          strokeWidth={1.8}
        />
      )}
      <span className="text-xs font-bold">{label}</span>
    </button>
  )
}

/* ─── Main Component ─── */
export default function Dining() {
  const navigate = useNavigate()
  const [heroSearch, setHeroSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState("sort")
  const [sortBy, setSortBy] = useState(null)
  const [selectedCuisine, setSelectedCuisine] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const { openSearch, closeSearch, setSearchValue } = useSearchOverlay()
  const { location } = useLocationHook()
  const { addFavorite, removeFavorite, isFavorite } = useProfile()

  const [categories, setCategories] = useState([])
  const [restaurantList, setRestaurantList] = useState([])
  const [loading, setLoading] = useState(true)
  const [diningHeroBanners, setDiningHeroBanners] = useState([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const autoSlideIntervalRef = useRef(null)
  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)
  const touchEndXRef = useRef(0)
  const touchEndYRef = useRef(0)
  const isBannerSwipingRef = useRef(false)

  useEffect(() => {
    const fetchDiningData = async () => {
      try {
        setLoading(true)
        const [bannerResponse, cats, rests] = await Promise.all([
          diningAPI.getHeroBanners().catch(() => ({ data: { success: false, data: { banners: [] } } })),
          diningAPI.getCategories(),
          diningAPI.getRestaurants(location?.city ? { city: location.city } : {}),
        ])

        const heroBanners = Array.isArray(bannerResponse?.data?.data?.banners)
          ? bannerResponse.data.data.banners
              .map((banner, index) => {
                const imageUrl = String(banner?.imageUrl || "").trim()
                if (!imageUrl) return null
                return {
                  id: String(banner?._id || banner?.id || `dining-banner-${index}`),
                  imageUrl,
                  tagline: String(banner?.title || banner?.tagline || "").trim(),
                  promoCode: String(banner?.ctaText || banner?.promoCode || "").trim(),
                }
              })
              .filter(Boolean)
          : []

        setDiningHeroBanners(heroBanners)
        setCategories(cats?.data?.success ? (cats.data.data || []) : [])
        setRestaurantList(rests?.data?.success ? (rests.data.data || []) : [])
      } catch {
        setDiningHeroBanners([])
        setCategories([])
        setRestaurantList([])
      } finally {
        setLoading(false)
      }
    }
    fetchDiningData()
  }, [location?.city])

  const safeCategories = useMemo(() => {
    return (Array.isArray(categories) ? categories : [])
      .filter((c) => String(c?.name || "").trim().length > 0)
      .map((c) => ({
        ...c,
        name: String(c?.name || "").trim(),
        slug: slugifyValue(c?.slug || c?.name || ""),
        imageUrl: String(c?.imageUrl || "").trim(),
      }))
  }, [categories])

  const normalizedRestaurantList = useMemo(() => {
    return (Array.isArray(restaurantList) ? restaurantList : [])
      .filter((r) => {
        const hasName = String(r?.restaurantName || r?.name || "").trim().length > 0
        return hasName && r?.diningSettings?.isEnabled !== false && r?.isAcceptingOrders !== false
      })
      .map((r, index) => {
        const distanceKm = getDistanceKm(location, r)
        const restaurantName = String(r?.restaurantName || r?.name || "").trim()
        return {
          ...r,
          id: r?._id || r?.id || `restaurant-${index}`,
          name: restaurantName,
          slug: String(r?.restaurantNameNormalized || "").trim() || slugifyValue(restaurantName),
          cuisine: Array.isArray(r?.cuisines) && r.cuisines.length > 0 ? r.cuisines.join(", ") : "Multi-cuisine",
          image: String(
            r?.coverImages?.[0]?.url || r?.coverImages?.[0] || r?.coverImage ||
            r?.menuImages?.[0]?.url || r?.menuImages?.[0] || r?.profileImage?.url || r?.profileImage || ""
          ).trim(),
          offer: String(r?.offer || "Pre-book table").trim(),
          featuredDish: String(r?.featuredDish || "Chef's special").trim(),
          featuredPrice: Number(r?.featuredPrice || 0),
          rating: Number(r?.rating || r?.avgRating || 0),
          deliveryTime: String(r?.estimatedDeliveryTime || r?.deliveryTime || (r?.estimatedDeliveryTimeMinutes ? `${r.estimatedDeliveryTimeMinutes} mins` : "30–40 mins")).trim(),
          distanceValue: distanceKm,
          distance: Number.isFinite(distanceKm) ? `${distanceKm.toFixed(1)} km` : "—",
          diningType: r?.diningSettings?.diningType || r?.categories?.[0]?.slug || "dining",
        }
      })
  }, [restaurantList, location])

  const categoryRestaurantKeys = useMemo(() => {
    const keySet = new Set()
    normalizedRestaurantList.forEach((r) => {
      const raw = []
      if (Array.isArray(r?.categories)) raw.push(...r.categories)
      if (r?.diningSettings?.diningType) raw.push(r.diningSettings.diningType)
      raw.forEach((c) => {
        if (typeof c === "string") { const n = slugifyValue(c); if (n) keySet.add(n); return }
        if (c && typeof c === "object") { const s = slugifyValue(c?.slug || c?.name || c?.title || ""); if (s) keySet.add(s) }
      })
    })
    return keySet
  }, [normalizedRestaurantList])

  const filteredCategories = useMemo(() =>
    safeCategories.filter((c) => categoryRestaurantKeys.has(c.slug)),
    [safeCategories, categoryRestaurantKeys]
  )

  const nearbyPopularRestaurants = useMemo(() => {
    const within10 = normalizedRestaurantList
      .filter((r) => Number.isFinite(r.distanceValue) && r.distanceValue <= 10)
      .sort((a, b) => a.distanceValue - b.distanceValue)
    return within10.length > 0 ? within10 : normalizedRestaurantList
  }, [normalizedRestaurantList])

  const toggleFilter = useCallback((id) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setActiveFilters(new Set())
    setSortBy(null)
    setSelectedCuisine(null)
    setOpenDropdown(null)
  }, [])

  const filteredRestaurants = useMemo(() => {
    let filtered = [...nearbyPopularRestaurants]
    if (activeFilters.has("delivery-under-30")) filtered = filtered.filter((r) => { const m = r.deliveryTime.match(/(\d+)/); return m && parseInt(m[1]) <= 30 })
    if (activeFilters.has("delivery-under-45")) filtered = filtered.filter((r) => { const m = r.deliveryTime.match(/(\d+)/); return m && parseInt(m[1]) <= 45 })
    if (activeFilters.has("distance-under-1km")) filtered = filtered.filter((r) => { const m = r.distance.match(/(\d+\.?\d*)/); return m && parseFloat(m[1]) <= 1.0 })
    if (activeFilters.has("distance-under-2km")) filtered = filtered.filter((r) => { const m = r.distance.match(/(\d+\.?\d*)/); return m && parseFloat(m[1]) <= 2.0 })
    if (activeFilters.has("rating-35-plus")) filtered = filtered.filter((r) => r.rating >= 3.5)
    if (activeFilters.has("rating-4-plus")) filtered = filtered.filter((r) => r.rating >= 4.0)
    if (activeFilters.has("rating-45-plus")) filtered = filtered.filter((r) => r.rating >= 4.5)
    if (activeFilters.has("price-under-200")) filtered = filtered.filter((r) => r.featuredPrice > 0 && r.featuredPrice <= 200)
    if (activeFilters.has("price-under-500")) filtered = filtered.filter((r) => r.featuredPrice > 0 && r.featuredPrice <= 500)
    if (selectedCuisine) filtered = filtered.filter((r) => r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()))
    if (sortBy === "rating-high") filtered.sort((a, b) => b.rating - a.rating)
    else if (sortBy === "rating-low") filtered.sort((a, b) => a.rating - b.rating)
    return filtered
  }, [nearbyPopularRestaurants, activeFilters, selectedCuisine, sortBy])

  /* Banner auto-slide */
  useEffect(() => {
    setCurrentBannerIndex((p) => (diningHeroBanners.length === 0 ? 0 : Math.min(p, diningHeroBanners.length - 1)))
  }, [diningHeroBanners.length])

  useEffect(() => {
    if (typeof window === "undefined") return
    diningHeroBanners.forEach((b) => { if (b?.imageUrl) { const img = new window.Image(); img.src = b.imageUrl } })
  }, [diningHeroBanners])

  const startBannerAutoSlide = useCallback(() => {
    if (autoSlideIntervalRef.current) clearInterval(autoSlideIntervalRef.current)
    if (diningHeroBanners.length <= 1) return
    autoSlideIntervalRef.current = setInterval(() => {
      if (!isBannerSwipingRef.current) setCurrentBannerIndex((p) => (p + 1) % diningHeroBanners.length)
    }, 3500)
  }, [diningHeroBanners.length])

  useEffect(() => {
    startBannerAutoSlide()
    return () => { if (autoSlideIntervalRef.current) clearInterval(autoSlideIntervalRef.current) }
  }, [startBannerAutoSlide])

  const goToBanner = useCallback((index) => {
    if (diningHeroBanners.length === 0) return
    const total = diningHeroBanners.length
    setCurrentBannerIndex(((index % total) + total) % total)
    startBannerAutoSlide()
  }, [diningHeroBanners.length, startBannerAutoSlide])

  const handleBannerTouchStart = useCallback((e) => {
    if (diningHeroBanners.length <= 1) return
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
    touchEndXRef.current = e.touches[0].clientX
    touchEndYRef.current = e.touches[0].clientY
    isBannerSwipingRef.current = true
  }, [diningHeroBanners.length])

  const handleBannerTouchMove = useCallback((e) => {
    if (!isBannerSwipingRef.current) return
    touchEndXRef.current = e.touches[0].clientX
    touchEndYRef.current = e.touches[0].clientY
  }, [])

  const handleBannerTouchEnd = useCallback(() => {
    if (!isBannerSwipingRef.current || diningHeroBanners.length <= 1) { isBannerSwipingRef.current = false; return }
    const deltaX = touchEndXRef.current - touchStartXRef.current
    const deltaY = Math.abs(touchEndYRef.current - touchStartYRef.current)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > deltaY) {
      setCurrentBannerIndex((p) => deltaX > 0 ? (p - 1 + diningHeroBanners.length) % diningHeroBanners.length : (p + 1) % diningHeroBanners.length)
      startBannerAutoSlide()
    }
    isBannerSwipingRef.current = false
  }, [diningHeroBanners.length, startBannerAutoSlide])

  const handleSearchFocus = useCallback(() => {
    if (heroSearch) setSearchValue(heroSearch)
    openSearch()
  }, [heroSearch, openSearch, setSearchValue])

  const handleToggleFavorite = useCallback((slug, restaurant, isFav) => {
    if (isFav) {
      removeFavorite(slug)
    } else {
      addFavorite({ slug, name: restaurant.name, cuisine: restaurant.cuisine, rating: restaurant.rating, deliveryTime: restaurant.deliveryTime, distance: restaurant.distance, image: restaurant.image })
    }
  }, [addFavorite, removeFavorite])

  const activeFilterCount = activeFilters.size + (sortBy ? 1 : 0) + (selectedCuisine ? 1 : 0)

  // Every applied refinement as a removable chip, so the result set is never a mystery.
  const appliedFilters = useMemo(() => {
    const applied = []
    if (sortBy) {
      applied.push({
        key: `sort:${sortBy}`,
        label: SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Sorted",
        onRemove: () => setSortBy(null),
      })
    }
    if (selectedCuisine) {
      applied.push({
        key: `cuisine:${selectedCuisine}`,
        label: selectedCuisine,
        onRemove: () => setSelectedCuisine(null),
      })
    }
    activeFilters.forEach((id) => {
      applied.push({
        key: `filter:${id}`,
        label: FILTER_LABELS[id] || id,
        onRemove: () => toggleFilter(id),
      })
    })
    return applied
  }, [sortBy, selectedCuisine, activeFilters, toggleFilter])

  const countLabel = loading
    ? "Finding tables near you…"
    : `${filteredRestaurants.length} ${filteredRestaurants.length === 1 ? "place" : "places"} near you`

  return (
    <AnimatedPage
      className="bg-(--sw-bg) text-(--sw-text) transition-colors duration-200"
      style={{ minHeight: "100vh", paddingBottom: "80px" }}
    >
      {/* ── Sticky header (mobile only) ── */}
      <header className="sticky top-0 z-40 w-full border-b border-(--sw-border) bg-(--sw-surface)/95 backdrop-blur-xl md:hidden">
        {/* PageNavbar owns the location selector plus the wallet/cart actions. */}
        <div className="px-4 pb-1 pt-2">
          <PageNavbar
            textColor="dark"
            zIndex={20}
            showLogo={false}
            onNavClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="px-4 pb-3">
          <div
            className="flex cursor-pointer items-center gap-2.5 rounded-(--sw-radius-pill) border border-(--sw-border) bg-(--sw-surface-alt) px-4 py-2.5 transition-colors focus-within:border-primary"
            onClick={handleSearchFocus}
          >
            <Search className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
            <Input
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={(e) => {
                if (e.key === "Enter" && heroSearch.trim()) {
                  navigate(`/food/user/search?q=${encodeURIComponent(heroSearch.trim())}`)
                  closeSearch()
                  setHeroSearch("")
                }
              }}
              className="h-auto flex-1 border-0 bg-transparent p-0 text-[13px] font-semibold text-(--sw-text) placeholder:font-normal placeholder:text-(--sw-text-muted) focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search restaurants, cuisines…"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleSearchFocus() }}
              className="shrink-0 p-0.5"
              aria-label="Voice search"
            >
              <Mic className="h-4 w-4 text-(--sw-text-muted)" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Hero ── */}
        <section className="pt-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="group relative h-[210px] w-full overflow-hidden rounded-(--sw-radius-card) border border-(--sw-border) sm:h-[260px] md:h-[320px]"
            onTouchStart={handleBannerTouchStart}
            onTouchMove={handleBannerTouchMove}
            onTouchEnd={handleBannerTouchEnd}
          >
            {diningHeroBanners.length > 0 ? (
              <>
                <div
                  className="flex h-full w-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                >
                  {diningHeroBanners.map((banner, index) => (
                    <div key={banner.id} className="relative h-full w-full shrink-0">
                      <OptimizedImage
                        src={banner.imageUrl}
                        alt={banner.tagline || `Dining banner ${index + 1}`}
                        className="h-full w-full object-cover"
                        objectFit="cover"
                        priority={index === 0}
                        sizes="100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                      <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                        {banner.promoCode && (
                          <span className="mb-2 inline-block rounded-(--sw-radius-pill) bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                            {banner.promoCode}
                          </span>
                        )}
                        {banner.tagline && (
                          <h2 className="max-w-2xl text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                            {banner.tagline}
                          </h2>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <span className="pointer-events-none absolute left-4 top-4 rounded-(--sw-radius-pill) border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-md">
                  Dining out
                </span>

                {diningHeroBanners.length > 1 && (
                  <>
                    <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                      {diningHeroBanners.map((b, i) => (
                        <button
                          key={`${b.id}-dot`}
                          type="button"
                          aria-label={`Go to banner ${i + 1}`}
                          onClick={(e) => { e.stopPropagation(); goToBanner(i) }}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            i === currentBannerIndex ? "w-6 bg-white" : "w-2 bg-white/45",
                          )}
                        />
                      ))}
                    </div>

                    {/* Arrows are a desktop affordance; touch users swipe. */}
                    <button
                      type="button"
                      aria-label="Previous banner"
                      onClick={() => goToBanner(currentBannerIndex - 1)}
                      className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 md:flex"
                    >
                      <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next banner"
                      onClick={() => goToBanner(currentBannerIndex + 1)}
                      className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 md:flex"
                    >
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="relative flex h-full w-full items-center bg-gradient-to-br from-[#2b1000] via-[#541f00] to-[#2b1000] px-6 sm:px-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,106,0,0.18),rgba(0,0,0,0))]" />
                <div className="relative z-10 max-w-lg">
                  <span className="mb-3 inline-block rounded-(--sw-radius-pill) border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-md">
                    Dining out
                  </span>
                  <h2 className="mb-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                    {loading ? "Finding dining spots near you…" : "Premium dining picks near you"}
                  </h2>
                  <p className="text-xs font-medium leading-relaxed text-white/75 sm:text-sm">
                    {loading
                      ? "Discovering the best tables, bookings, and cuisine selections."
                      : "Explore curated restaurants with exclusive table pre-booking offers."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── Categories ── */}
        <section className="pt-8">
          <SectionHeader
            eyebrow="Browse by mood"
            title="Explore categories"
            to="/food/user/categories"
            className="mb-4"
          />

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 lg:gap-4">
            {loading
              ? Array.from({ length: 8 }, (_, i) => <CategoryTileSkeleton key={i} />)
              : filteredCategories.map((cat, i) => (
                  <CategoryTile key={cat._id || cat.id || cat.slug} category={cat} index={i} />
                ))}
          </div>

          {!loading && filteredCategories.length === 0 && (
            <p className="rounded-(--sw-radius-card) border border-dashed border-(--sw-border) px-4 py-6 text-center text-xs text-(--sw-text-muted)">
              No dining categories available in this area yet.
            </p>
          )}
        </section>

        {/* ── Filters ── */}
        {/* Sticky only from md up: on mobile the page header already owns top-0. */}
        <section className="z-30 -mx-4 mt-8 bg-(--sw-bg)/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 md:sticky md:top-[76px] lg:-mx-8 lg:px-8">
          {/* Mobile: filter button + quick chips */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto md:hidden">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                "sw-pressable flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--sw-radius-pill) border px-3.5 py-2 text-xs font-bold transition-colors",
                activeFilterCount > 0
                  ? "border-primary bg-primary text-white"
                  : "border-(--sw-border) bg-(--sw-surface) text-(--sw-text-secondary)",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.5} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {FILTER_CHIPS.map((chip) => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                icon={chip.icon}
                isActive={activeFilters.has(chip.id)}
                onClick={() => toggleFilter(chip.id)}
              />
            ))}
          </div>

          {/* Desktop: dropdown rail */}
          <div className="hidden items-center justify-between gap-4 md:flex">
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown
                label={sortBy ? SORT_OPTIONS.find((o) => o.id === sortBy)?.label : "Sort by"}
                icon={ArrowDownUp}
                isOpen={openDropdown === "sort"}
                toggleOpen={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
                activeCount={sortBy ? 1 : 0}
              >
                <div className="flex min-w-[190px] flex-col gap-1">
                  {SORT_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.id || "relevance"}
                      label={opt.label}
                      selected={sortBy === opt.id}
                      onClick={() => { setSortBy(opt.id); setOpenDropdown(null) }}
                    />
                  ))}
                </div>
              </FilterDropdown>

              <FilterDropdown
                label={selectedCuisine || "Cuisine"}
                icon={UtensilsCrossed}
                isOpen={openDropdown === "cuisine"}
                toggleOpen={() => setOpenDropdown(openDropdown === "cuisine" ? null : "cuisine")}
                activeCount={selectedCuisine ? 1 : 0}
              >
                <div className="grid w-[260px] grid-cols-2 gap-1">
                  {CUISINES.map((c) => (
                    <OptionButton
                      key={c}
                      label={c}
                      selected={selectedCuisine === c}
                      onClick={() => {
                        setSelectedCuisine(selectedCuisine === c ? null : c)
                        setOpenDropdown(null)
                      }}
                      className="text-center"
                    />
                  ))}
                </div>
              </FilterDropdown>

              <FilterDropdown
                label="Rating"
                icon={Star}
                isOpen={openDropdown === "rating"}
                toggleOpen={() => setOpenDropdown(openDropdown === "rating" ? null : "rating")}
                activeCount={
                  (activeFilters.has("rating-35-plus") ? 1 : 0) +
                  (activeFilters.has("rating-4-plus") ? 1 : 0) +
                  (activeFilters.has("rating-45-plus") ? 1 : 0)
                }
              >
                <div className="flex min-w-[190px] flex-col gap-1">
                  {[
                    { id: "rating-35-plus", label: "3.5 and above" },
                    { id: "rating-4-plus", label: "4.0 and above" },
                    { id: "rating-45-plus", label: "4.5 and above" },
                  ].map((opt) => (
                    <OptionButton
                      key={opt.id}
                      label={opt.label}
                      selected={activeFilters.has(opt.id)}
                      onClick={() => toggleFilter(opt.id)}
                    />
                  ))}
                </div>
              </FilterDropdown>

              <FilterDropdown
                label="Distance & time"
                icon={Timer}
                isOpen={openDropdown === "distance-time"}
                toggleOpen={() => setOpenDropdown(openDropdown === "distance-time" ? null : "distance-time")}
                activeCount={
                  (activeFilters.has("delivery-under-30") ? 1 : 0) +
                  (activeFilters.has("delivery-under-45") ? 1 : 0) +
                  (activeFilters.has("distance-under-1km") ? 1 : 0) +
                  (activeFilters.has("distance-under-2km") ? 1 : 0)
                }
              >
                <div className="flex min-w-[200px] flex-col gap-3">
                  <div>
                    <p className="sw-eyebrow mb-1.5 px-1">Distance</p>
                    <div className="flex flex-col gap-0.5">
                      {[
                        { id: "distance-under-1km", label: "Under 1 km" },
                        { id: "distance-under-2km", label: "Under 2 km" },
                      ].map((opt) => (
                        <OptionButton
                          key={opt.id}
                          label={opt.label}
                          selected={activeFilters.has(opt.id)}
                          onClick={() => toggleFilter(opt.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="sw-eyebrow mb-1.5 px-1">Time</p>
                    <div className="flex flex-col gap-0.5">
                      {[
                        { id: "delivery-under-30", label: "Under 30 mins" },
                        { id: "delivery-under-45", label: "Under 45 mins" },
                      ].map((opt) => (
                        <OptionButton
                          key={opt.id}
                          label={opt.label}
                          selected={activeFilters.has(opt.id)}
                          onClick={() => toggleFilter(opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </FilterDropdown>

              <FilterDropdown
                label="Price"
                icon={IndianRupee}
                isOpen={openDropdown === "price"}
                toggleOpen={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
                activeCount={
                  (activeFilters.has("price-under-200") ? 1 : 0) +
                  (activeFilters.has("price-under-500") ? 1 : 0)
                }
              >
                <div className="flex min-w-[170px] flex-col gap-1">
                  {[
                    { id: "price-under-200", label: "Under ₹200" },
                    { id: "price-under-500", label: "Under ₹500" },
                  ].map((opt) => (
                    <OptionButton
                      key={opt.id}
                      label={opt.label}
                      selected={activeFilters.has(opt.id)}
                      onClick={() => toggleFilter(opt.id)}
                    />
                  ))}
                </div>
              </FilterDropdown>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="sw-pressable flex shrink-0 items-center gap-1 whitespace-nowrap rounded-(--sw-radius-pill) bg-primary/10 px-3.5 py-2 text-xs font-extrabold text-primary"
              >
                Clear all
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            )}
          </div>
        </section>

        {/* ── Applied filters ── */}
        {appliedFilters.length > 0 && (
          <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto">
            {appliedFilters.map(({ key, label, onRemove }) => (
              <button
                key={key}
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${label} filter`}
                className="sw-pressable flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--sw-radius-pill) border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary"
              >
                {label}
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="sw-pressable shrink-0 whitespace-nowrap px-2 py-1.5 text-[11px] font-extrabold text-(--sw-text-muted) underline underline-offset-2 md:hidden"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Results ── */}
        <section className="pt-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold tracking-tight text-(--sw-text)">
                Restaurants for dining out
              </h2>
              <p className="mt-0.5 text-xs text-(--sw-text-muted)">{countLabel}</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="mx-auto max-w-md rounded-(--sw-radius-card) border border-dashed border-(--sw-border) bg-(--sw-surface) px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UtensilsCrossed className="h-7 w-7 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-base font-extrabold text-(--sw-text)">No dining places found</h3>
              <p className="mx-auto mb-6 max-w-xs text-[13px] leading-relaxed text-(--sw-text-muted)">
                {activeFilterCount > 0
                  ? "No restaurants match your active filters. Try loosening a few."
                  : "We couldn't find restaurants for dining out around this location."}
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="sw-pressable rounded-(--sw-radius-pill) bg-primary px-6 py-2.5 text-[13px] font-extrabold text-white"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRestaurants.map((restaurant, index) => (
                <DiningRestaurantCard
                  key={restaurant._id || restaurant.id}
                  restaurant={restaurant}
                  index={index}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Filter sheet (mobile) / dialog (desktop) ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters and sorting"
              className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-(--sw-radius-sheet) border border-(--sw-border) bg-(--sw-surface) shadow-(--sw-shadow-sheet) md:bottom-8 md:left-1/2 md:right-auto md:w-[560px] md:-translate-x-1/2 md:rounded-(--sw-radius-sheet)"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="flex justify-center pb-1 pt-3 md:hidden">
                <div className="h-1.5 w-12 rounded-full bg-(--sw-surface-sunken)" />
              </div>

              <div className="flex items-center justify-between gap-3 border-b border-(--sw-border) px-5 py-4">
                <h2 className="text-base font-extrabold tracking-tight text-(--sw-text)">
                  Filters &amp; sorting
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveFilters(new Set()); setSortBy(null); setSelectedCuisine(null) }}
                    className="sw-pressable rounded-(--sw-radius-pill) bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    aria-label="Close filters"
                    className="sw-pressable flex h-8 w-8 items-center justify-center rounded-full bg-(--sw-surface-alt) text-(--sw-text-secondary)"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="flex w-24 shrink-0 flex-col overflow-y-auto border-r border-(--sw-border) bg-(--sw-surface-alt) sm:w-28">
                  {FILTER_TABS.map(({ id, label, icon: Icon }) => {
                    const isActive = activeFilterTab === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveFilterTab(id)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "relative flex flex-col items-center gap-1 px-2 py-4 text-center transition-colors",
                          isActive
                            ? "bg-(--sw-surface) text-primary"
                            : "text-(--sw-text-muted) hover:text-(--sw-text-secondary)",
                        )}
                      >
                        {isActive && (
                          <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-primary" />
                        )}
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                        <span className="text-[11px] font-bold leading-tight">{label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  {activeFilterTab === "sort" && (
                    <div className="space-y-2">
                      <h3 className="mb-4 text-sm font-extrabold text-(--sw-text)">Sort by</h3>
                      {SORT_OPTIONS.map((opt) => (
                        <SheetOption
                          key={opt.id || "relevance"}
                          label={opt.label}
                          selected={sortBy === opt.id}
                          onClick={() => setSortBy(opt.id)}
                        />
                      ))}
                    </div>
                  )}

                  {activeFilterTab === "time" && (
                    <div>
                      <h3 className="mb-4 text-sm font-extrabold text-(--sw-text)">Estimated time</h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: "delivery-under-30", label: "Under 30 mins" },
                          { id: "delivery-under-45", label: "Under 45 mins" },
                        ].map(({ id, label }) => (
                          <SheetOption
                            key={id}
                            label={label}
                            icon={Timer}
                            stacked
                            selected={activeFilters.has(id)}
                            onClick={() => toggleFilter(id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFilterTab === "rating" && (
                    <div>
                      <h3 className="mb-4 text-sm font-extrabold text-(--sw-text)">Restaurant rating</h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: "rating-35-plus", label: "3.5 and above" },
                          { id: "rating-4-plus", label: "4.0 and above" },
                          { id: "rating-45-plus", label: "4.5 and above" },
                        ].map(({ id, label }) => (
                          <SheetOption
                            key={id}
                            label={label}
                            icon={Star}
                            stacked
                            selected={activeFilters.has(id)}
                            onClick={() => toggleFilter(id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFilterTab === "distance" && (
                    <div>
                      <h3 className="mb-4 text-sm font-extrabold text-(--sw-text)">Distance</h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: "distance-under-1km", label: "Under 1 km" },
                          { id: "distance-under-2km", label: "Under 2 km" },
                        ].map(({ id, label }) => (
                          <SheetOption
                            key={id}
                            label={label}
                            icon={MapPin}
                            stacked
                            selected={activeFilters.has(id)}
                            onClick={() => toggleFilter(id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFilterTab === "price" && (
                    <div>
                      <h3 className="mb-4 text-sm font-extrabold text-(--sw-text)">Dish price</h3>
                      <div className="flex flex-col gap-2.5">
                        {[
                          { id: "price-under-200", label: "Under ₹200" },
                          { id: "price-under-500", label: "Under ₹500" },
                        ].map(({ id, label }) => (
                          <SheetOption
                            key={id}
                            label={label}
                            selected={activeFilters.has(id)}
                            onClick={() => toggleFilter(id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFilterTab === "cuisine" && (
                    <div>
                      <h3 className="mb-4 text-sm font-extrabold text-(--sw-text)">Cuisine</h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        {CUISINES.map((c) => (
                          <SheetOption
                            key={c}
                            label={c}
                            selected={selectedCuisine === c}
                            onClick={() => setSelectedCuisine(selectedCuisine === c ? null : c)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-(--sw-border) px-5 py-4">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="sw-pressable flex-1 rounded-(--sw-radius-pill) border border-(--sw-border) py-3.5 text-center text-sm font-bold text-(--sw-text-secondary)"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="sw-pressable flex-1 rounded-(--sw-radius-pill) bg-primary py-3.5 text-center text-sm font-extrabold text-white"
                >
                  Show {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "result" : "results"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  )
}
