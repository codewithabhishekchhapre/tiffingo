import { Link, useLocation } from "react-router-dom"
import { ShoppingBag, Tag, Truck, UtensilsCrossed } from "lucide-react"
import { useEnabledModules } from "@/modules/common/hooks/useEnabledModules"
import { cn } from "@/lib/utils"

// Desktop counterpart of BottomNavigation: the module switcher used to sit in
// the top navbar, it now floats as a dock so the navbar stays search-first.
export default function DesktopBottomNav() {
  const location = useLocation()
  const { modules: enabledModules } = useEnabledModules()
  const pathname = location.pathname

  const isDining = pathname === "/food/dining" || pathname.startsWith("/food/user/dining")
  const isUnder250 = pathname === "/food/under-250" || pathname.startsWith("/food/user/under-250")
  const isProfile =
    pathname.startsWith("/food/profile") || pathname.startsWith("/food/user/profile")
  const isQuick = pathname === "/quick" || pathname.startsWith("/quick/")
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

  const isFoodModuleEnabled = enabledModules.food !== false

  const tabs = [
    isFoodModuleEnabled && {
      key: "delivery",
      label: "Delivery",
      icon: Truck,
      to: "/food/user",
      active: isDelivery,
    },
    enabledModules.quickCommerce !== false && {
      key: "quick",
      label: "Quick",
      icon: ShoppingBag,
      to: "/quick",
      active: isQuick,
    },
    isFoodModuleEnabled && {
      key: "under250",
      label: "Under 250",
      icon: Tag,
      to: "/food/user/under-250",
      active: isUnder250,
    },
    isFoodModuleEnabled && {
      key: "dining",
      label: "Dining",
      icon: UtensilsCrossed,
      to: "/food/user/dining",
      active: isDining,
    },
  ].filter(Boolean)

  if (tabs.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 hidden justify-center px-4 md:flex">
      <nav
        aria-label="Module navigation"
        className="pointer-events-auto flex items-center gap-1 rounded-(--sw-radius-pill) border border-(--sw-border) bg-(--sw-surface)/92 p-1.5 shadow-(--sw-shadow-lg) backdrop-blur-xl"
      >
        {tabs.map(({ key, label, icon: Icon, to, active }) => (
          <Link
            key={key}
            to={to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "sw-pressable flex items-center gap-2 rounded-(--sw-radius-pill) px-4 py-2.5 text-sm transition-colors",
              active
                ? "bg-primary text-white shadow-(--sw-shadow-sm)"
                : "text-(--sw-text-secondary) hover:bg-(--sw-surface-alt) hover:text-(--sw-text)",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.4 : 2} />
            <span className={cn("whitespace-nowrap", active ? "font-extrabold" : "font-semibold")}>
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
