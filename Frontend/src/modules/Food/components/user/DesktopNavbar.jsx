import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useTheme } from "next-themes"
import { ChevronDown, ShoppingCart, Wallet, Search, X, User, Sun, Moon, MapPin } from "lucide-react"
import { Switch } from "@food/components/ui/switch"
import { useLocation as useLocationHook } from "@food/hooks/useLocation"
import { useCart } from "@food/context/CartContext"
import { useLocationSelector, useSearchOverlay } from "./UserLayout"
import { useProfile } from "@food/context/ProfileContext"
import { useAuth } from "@core/context/AuthContext"
import { cn } from "@/lib/utils"

import {
    loadBusinessSettings,
    getCachedSettings,
    getCompanyName,
    getAppLogo,
    getAppFavicon,
    updateBrowserFavicon
} from "@common/utils/businessSettings"
const debugError = (...args) => {}

export default function DesktopNavbar({ showLogo = true }) {
    const location = useLocation()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()
    const { location: userLocation, loading: locationLoading } = useLocationHook()
    const { getCartCount } = useCart()
    const { openLocationSelector } = useLocationSelector()
    const { setSearchValue } = useSearchOverlay()
    const { vegMode, setVegMode } = useProfile()
    const [heroSearch, setHeroSearch] = useState("")
    const [logoUrl, setLogoUrl] = useState(() => getAppLogo('user') || '/food/tiffingo-logo.png')
    const [companyName, setCompanyName] = useState(() => getCompanyName())
    const [hasScrolledPastBanner, setHasScrolledPastBanner] = useState(false)
    const navRef = useRef(null)
    const cartCount = getCartCount()

    // Show area if available, otherwise show city
    const areaName = userLocation?.area && userLocation?.area.trim() ? userLocation.area.trim() : null
    const cityName = userLocation?.city || null
    const stateName = userLocation?.state || null
    const mainLocationName = areaName || cityName || "Select"
    const secondaryLocation = areaName
        ? (cityName || "")
        : (cityName && stateName ? `${cityName}, ${stateName}` : cityName || stateName || "")

    const handleLocationClick = () => {
        openLocationSelector()
    }

    // Check active routes - support both /user/* and /* paths
    const normalizedPath =
        location.pathname.length > 1
            ? location.pathname.replace(/\/+$/, "")
            : location.pathname
    const profileSource = new URLSearchParams(location.search).get("from")
    const isQuick = normalizedPath === "/quick" || normalizedPath.startsWith("/quick/")
    const isSharedFoodProfile =
        (normalizedPath === "/profile" || normalizedPath.startsWith("/profile/")) &&
        profileSource !== "quick"
    const isProfile =
        location.pathname.startsWith("/food/user/profile") ||
        location.pathname.startsWith("/food/profile") ||
        isSharedFoodProfile
    const isBannerRoute =
        location.pathname === "/food/user/under-250" ||
        location.pathname === "/food/under-250"
    const searchPlaceholder = isQuick
        ? 'Search for milk, bread, eggs...'
        : "Search for restaurants, food..."

    // Load business settings logo
    useEffect(() => {
        const loadLogo = async () => {
            try {
                const cached = getCachedSettings()
                if (cached) {
                    const userLogo = getAppLogo('user')
                    setLogoUrl(userLogo || '/food/tiffingo-logo.png')
                    const userFav = getAppFavicon('user')
                    if (userFav) updateBrowserFavicon(userFav)
                    if (cached.companyName) {
                        setCompanyName(cached.companyName)
                    }
                } else {
                    const settings = await loadBusinessSettings()
                    if (settings) {
                        const userLogo = getAppLogo('user')
                        setLogoUrl(userLogo || '/food/tiffingo-logo.png')
                        const userFav = getAppFavicon('user')
                        if (userFav) updateBrowserFavicon(userFav)
                        if (settings.companyName) {
                            setCompanyName(settings.companyName)
                        }
                    }
                }
            } catch (error) {
                debugError('Error loading logo:', error)
            }
        }
        loadLogo()

        const handleSettingsUpdate = (e) => {
            const settings = e.detail || getCachedSettings()
            const userLogo = settings?.userLogo?.url || settings?.logo?.url
            const userFav = settings?.userFavicon?.url || settings?.favicon?.url
            setLogoUrl(userLogo || '/food/tiffingo-logo.png')
            if (userFav) updateBrowserFavicon(userFav)
            if (settings?.companyName) setCompanyName(settings.companyName)
        }
        window.addEventListener('businessSettingsUpdated', handleSettingsUpdate)

        return () => {
            window.removeEventListener('businessSettingsUpdated', handleSettingsUpdate)
        }
    }, [])

    useEffect(() => {
        if (!isBannerRoute) {
            setHasScrolledPastBanner(true)
            return
        }

        const handleScroll = () => {
            const heroShell =
                document.querySelector('[data-home-hero-shell="true"]') ||
                document.querySelector('[data-banner-shell="true"]')
            const navElement = navRef.current

            if (!heroShell || !navElement) {
                setHasScrolledPastBanner(false)
                return
            }

            const heroRect = heroShell.getBoundingClientRect()
            const navHeight = navElement.getBoundingClientRect().height || 0
            setHasScrolledPastBanner(heroRect.bottom <= navHeight)
        }

        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })
        window.addEventListener("resize", handleScroll)

        return () => {
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener("resize", handleScroll)
        }
    }, [isBannerRoute])

    const isTransparent = isBannerRoute && !hasScrolledPastBanner

    const iconButton =
        "sw-pressable flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-(--sw-text-secondary) transition-colors hover:border-(--sw-border) hover:bg-(--sw-surface-alt) hover:text-primary"

    return (
        <nav
            ref={navRef}
            className={cn(
                "fixed inset-x-0 top-0 z-50 hidden transition-colors duration-300 md:block",
                isTransparent
                    ? "border-0 bg-transparent"
                    : "border-b border-(--sw-border) bg-(--sw-surface)",
            )}
        >
            <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-10">
                {/* Brand + location live together on the left rail */}
                <div className="flex shrink-0 items-center gap-3">
                    {showLogo && (
                        <Link to="/food/user" className="flex shrink-0 items-center">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt={companyName || "Logo"}
                                    className="h-11 w-auto object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            ) : (
                                <span className="text-xl font-extrabold text-(--sw-text)">
                                    {companyName || "Tiffingo"}
                                </span>
                            )}
                        </Link>
                    )}

                    {showLogo && <span className="h-8 w-px bg-(--sw-border)" aria-hidden="true" />}

                    <button
                        type="button"
                        onClick={handleLocationClick}
                        disabled={locationLoading}
                        aria-label="Change delivery location"
                        className="sw-pressable flex min-w-0 shrink-0 items-center gap-2 rounded-(--sw-radius-pill) px-2.5 py-1.5 text-left transition-colors hover:bg-(--sw-surface-alt)"
                    >
                        {locationLoading ? (
                            <span className="text-sm font-bold text-(--sw-text)">Loading...</span>
                        ) : (
                            <>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <MapPin className="h-4 w-4 text-primary" strokeWidth={2.5} />
                                </span>
                                <span className="flex min-w-0 flex-col">
                                    <span className="flex items-center gap-0.5">
                                        <span className="max-w-[150px] truncate text-sm font-extrabold leading-tight text-(--sw-text)">
                                            {mainLocationName}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-(--sw-text-muted)" strokeWidth={3} />
                                    </span>
                                    {secondaryLocation && (
                                        <span className="max-w-[170px] truncate text-[11px] leading-tight text-(--sw-text-muted)">
                                            {secondaryLocation}
                                        </span>
                                    )}
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {/* Search now owns the centre of the bar */}
                <div className="relative mx-auto min-w-0 max-w-2xl flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-(--sw-text-muted)" />
                    <input
                        value={heroSearch}
                        onChange={(e) => {
                            const nextValue = e.target.value
                            setHeroSearch(nextValue)
                            setSearchValue(nextValue)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && heroSearch.trim()) {
                                navigate(
                                    isQuick
                                        ? `/quick/search?q=${encodeURIComponent(heroSearch.trim())}`
                                        : `/food/user/search?q=${encodeURIComponent(heroSearch.trim())}`
                                )
                            }
                        }}
                        placeholder={searchPlaceholder}
                        className="h-11 w-full rounded-(--sw-radius-pill) border border-(--sw-border) bg-(--sw-surface-alt) pl-11 pr-10 text-sm font-medium text-(--sw-text) transition-shadow placeholder:font-normal placeholder:text-(--sw-text-muted) focus:border-primary focus:bg-(--sw-surface) focus:outline-none focus:ring-4 focus:ring-primary/12"
                    />
                    {heroSearch && (
                        <button
                            type="button"
                            onClick={() => {
                                setHeroSearch("")
                                setSearchValue("")
                            }}
                            aria-label="Clear search"
                            className="sw-pressable absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-(--sw-surface-sunken) text-(--sw-text-muted)"
                        >
                            <X className="h-3 w-3" strokeWidth={3} />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                    {/* Veg mode reads as a chip so it doesn't float loose next to the icons */}
                    <label className="mr-1 flex shrink-0 cursor-pointer items-center gap-2 rounded-(--sw-radius-pill) border border-(--sw-border) bg-(--sw-surface-alt) px-3 py-1.5">
                        <span
                            className="text-[10px] font-extrabold uppercase tracking-wide"
                            style={{ color: "var(--sw-green)" }}
                        >
                            Veg
                        </span>
                        <Switch
                            checked={vegMode}
                            onCheckedChange={setVegMode}
                            aria-label="Veg mode"
                            className="h-5 w-9 border-none data-[state=checked]:bg-(--sw-green) data-[state=unchecked]:bg-(--sw-border-strong)"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className={iconButton}
                        title="Toggle theme"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
                        ) : (
                            <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
                        )}
                    </button>

                    <Link to="/food/user/wallet" className={iconButton} title="Wallet" aria-label="Wallet">
                        <Wallet className="h-[18px] w-[18px]" strokeWidth={2} />
                    </Link>

                    <Link
                        to={isAuthenticated ? "/food/user/profile" : "/user/auth/login"}
                        state={!isAuthenticated ? { redirectTo: "/food/user/profile" } : undefined}
                        className={cn(iconButton, isProfile && "border-(--sw-border) bg-primary/10 text-primary")}
                        title="Profile"
                        aria-label="Profile"
                    >
                        <User className="h-[18px] w-[18px]" strokeWidth={2} />
                    </Link>

                    <Link
                        to="/food/user/cart"
                        className="sw-pressable relative ml-1 flex h-10 items-center gap-2 rounded-(--sw-radius-pill) bg-primary px-4 text-white transition-opacity hover:opacity-90"
                        title="Cart"
                        aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
                    >
                        <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.2} />
                        <span className="text-sm font-extrabold">
                            {cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : "Cart"}
                        </span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
