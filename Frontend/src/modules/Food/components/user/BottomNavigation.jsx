import { Link, useLocation } from "react-router-dom"
import { Package, ShoppingBag, Tag, User, Truck, UtensilsCrossed } from "lucide-react"
import { useAuth } from "@core/context/AuthContext"
import { useEnabledModules } from "@/modules/common/hooks/useEnabledModules"
import { cn } from "@/lib/utils"

export default function BottomNavigation() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  // Quick and Porter live here now that the home header no longer carries a
  // module switcher — they only appear when the business has them switched on.
  const { modules: enabledModules } = useEnabledModules()
  const pathname = location.pathname
  const profileSource = new URLSearchParams(location.search).get("from")

  // Check active routes - support both /user/* and /* paths
  const isDining = pathname === "/food/dining" || pathname.startsWith("/food/user/dining")
  const isUnder250 = pathname === "/food/under-250" || pathname.startsWith("/food/user/under-250")
  const isSharedFoodProfile =
    (pathname === "/profile" || pathname.startsWith("/profile/")) &&
    profileSource !== "quick"
  const isProfile =
    pathname.startsWith("/food/profile") ||
    pathname.startsWith("/food/user/profile") ||
    isSharedFoodProfile
  const isDelivery =
    !isDining &&
    !isUnder250 &&
    !isProfile &&
    (pathname === "/food" ||
      pathname === "/food/" ||
      pathname === "/food/user" ||
      (pathname.startsWith("/food/user") &&
        !pathname.includes("/dining") &&
        !pathname.includes("/under-250") &&
        !pathname.includes("/profile")))

  const isQuick = pathname === "/quick" || pathname.startsWith("/quick/")
  const isPorter = pathname === "/porter" || pathname.startsWith("/porter/")

  const tabs = [
    { key: "delivery", label: "Delivery", icon: Truck, to: "/food/user", active: isDelivery },
    { key: "dining", label: "Dining", icon: UtensilsCrossed, to: "/food/user/dining", active: isDining },
    { key: "under250", label: "Under 250", icon: Tag, to: "/food/user/under-250", active: isUnder250 },
    enabledModules.quickCommerce !== false && {
      key: "quick",
      label: "Quick",
      icon: ShoppingBag,
      to: "/quick",
      active: isQuick,
    },
    enabledModules.porter !== false && {
      key: "porter",
      label: "Porter",
      icon: Package,
      to: "/porter",
      active: isPorter,
    },
    {
      key: "profile",
      label: "Profile",
      icon: User,
      to: isAuthenticated ? "/food/user/profile" : "/user/auth/login",
      state: !isAuthenticated ? { redirectTo: "/food/user/profile" } : undefined,
      active: isProfile,
    },
  ].filter(Boolean)

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-(--sw-border) bg-(--sw-surface)/95 shadow-[0_-6px_20px_rgba(28,28,28,0.06)] backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden">
      <div className="flex items-stretch px-1">
        {tabs.map(({ key, label, icon: Icon, to, state, active }) => (
          <Link
            key={key}
            to={to}
            state={state}
            aria-current={active ? "page" : undefined}
            className="sw-pressable flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-1 transition-transform active:scale-95"
          >
            {/* The active tab reads as a filled capsule instead of a hairline bar. */}
            <span
              className={cn(
                "flex h-7 w-full max-w-[52px] items-center justify-center rounded-full transition-colors duration-200",
                active ? "bg-primary/12 text-primary" : "bg-transparent text-(--sw-text-muted)",
              )}
            >
              <Icon
                className="h-[21px] w-[21px] shrink-0"
                strokeWidth={active ? 2.4 : 1.9}
              />
            </span>

            <span
              className={cn(
                "max-w-full truncate text-[10px] leading-none transition-colors",
                active ? "font-extrabold text-primary" : "font-medium text-(--sw-text-muted)",
              )}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
