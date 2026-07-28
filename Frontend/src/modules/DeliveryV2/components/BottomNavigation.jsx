import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { History, LayoutGrid, User, Wallet } from "lucide-react"
import { deliveryAPI } from "@food/api"
const debugError = (...args) => {}

// Rider tab bar. Kept as a flow element by default because the home screen is a
// h-screen flex column; pass `floating` for screens that scroll under it.
const TABS = [
  { key: "feed", label: "Feed", icon: LayoutGrid, to: "/food/delivery/feed" },
  { key: "pocket", label: "Pocket", icon: Wallet, to: "/food/delivery/pocket" },
  { key: "history", label: "Trip History", icon: History, to: "/food/delivery/history" },
  { key: "profile", label: "Profile", icon: User, to: "/food/delivery/profile" },
]

export default function BottomNavigation({
  activeTab,
  profileImage: profileImageProp,
  badgeCount = 0,
  requestBadgeCount = 0,
  floating = false,
  className = "",
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [fetchedProfileImage, setFetchedProfileImage] = useState(null)
  const [imageError, setImageError] = useState(false)

  const profileImage = profileImageProp ?? fetchedProfileImage
  const pocketBadge = badgeCount || requestBadgeCount || 0

  // Derive the active tab from the URL unless the host screen already knows it.
  const pathname = location.pathname.replace(/\/+$/, "") || "/"
  const derivedTab =
    pathname === "/food/delivery" || pathname.endsWith("/feed")
      ? "feed"
      : pathname.includes("/pocket")
        ? "pocket"
        : pathname.includes("/history")
          ? "history"
          : pathname.includes("/profile")
            ? "profile"
            : "feed"
  const current = activeTab || derivedTab

  // Only self-fetch when the parent has no avatar to hand down.
  useEffect(() => {
    if (profileImageProp !== undefined) return

    const fetchProfileImage = async () => {
      try {
        const response = await deliveryAPI.getProfile()
        if (response?.data?.success && response?.data?.data?.profile) {
          const profile = response.data.data.profile
          const imageUrl = profile.profileImage?.url || profile.documents?.photo
          if (imageUrl) {
            setFetchedProfileImage(imageUrl)
            setImageError(false)
          }
        }
      } catch (error) {
        // Skip logging network and timeout errors (handled by axios interceptor)
        if (
          error.code !== "ECONNABORTED" &&
          error.code !== "ERR_NETWORK" &&
          error.message !== "Network Error" &&
          !error.message?.includes("timeout")
        ) {
          debugError("Error fetching profile image for navigation:", error)
        }
      }
    }

    fetchProfileImage()

    const handleProfileRefresh = () => {
      fetchProfileImage()
    }

    window.addEventListener("deliveryProfileRefresh", handleProfileRefresh)
    return () => {
      window.removeEventListener("deliveryProfileRefresh", handleProfileRefresh)
    }
  }, [profileImageProp])

  return (
    <nav
      aria-label="Rider navigation"
      className={[
        "z-[200] w-full shrink-0 rounded-t-[26px] border-t border-gray-100 bg-white",
        "shadow-[0_-8px_28px_rgba(17,17,17,0.08)]",
        "px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        floating ? "fixed inset-x-0 bottom-0 md:hidden" : "relative",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Grab-handle hint ties the bar to the app's sheet language */}
      <div className="mx-auto mb-1.5 h-1 w-9 rounded-full bg-gray-200" aria-hidden="true" />

      <div className="flex items-stretch">
        {TABS.map(({ key, label, icon: Icon, to }) => {
          const active = current === key
          const isProfileTab = key === "profile"
          const showBadge = key === "pocket" && pocketBadge > 0

          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(to)}
              aria-current={active ? "page" : undefined}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-transform active:scale-95"
            >
              <span
                className={[
                  "relative flex h-8 w-[54px] items-center justify-center rounded-full transition-all duration-200",
                  active ? "bg-[#FF6A00]/12 text-[#FF6A00]" : "bg-transparent text-gray-400",
                ].join(" ")}
              >
                {isProfileTab && profileImage && !imageError ? (
                  <img
                    src={profileImage}
                    alt=""
                    className={[
                      "h-6 w-6 rounded-full object-cover ring-2 transition-all",
                      active ? "ring-[#FF6A00]" : "ring-gray-200",
                    ].join(" ")}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.9} />
                )}

                {showBadge && (
                  <span className="absolute -top-0.5 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {pocketBadge > 99 ? "99+" : pocketBadge}
                  </span>
                )}
              </span>

              <span
                className={[
                  "max-w-full truncate text-[10px] leading-none transition-colors",
                  active ? "font-bold text-[#FF6A00]" : "font-medium text-gray-400",
                ].join(" ")}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
