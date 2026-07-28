import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  MapPin,
  ChevronDown,
  Search,
  Mic,
  Wallet,
  Bell,
  BellOff,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@food/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@food/components/ui/popover";
import { Badge } from "@food/components/ui/badge";
import useNotificationInbox from "@food/hooks/useNotificationInbox";
import { HomeHeroBackdrop, HomeHeroCaption } from "./HomeHero";

const isMeaningfulLocationValue = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return Boolean(
    normalized &&
    normalized !== "select location" &&
    normalized !== "current location"
  );
};

const buildLocationDisplay = (savedAddressText, location) => {
  if (isMeaningfulLocationValue(savedAddressText)) {
    const parts = String(savedAddressText)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 3) {
      return {
        title: parts.slice(0, 2).join(", "),
        subtitle: parts.slice(2).join(", "),
      };
    }

    if (parts.length === 2) {
      return {
        title: parts.join(", "),
        subtitle: "Tap to choose delivery location",
      };
    }

    return {
      title: String(savedAddressText).trim(),
      subtitle: "Tap to choose delivery location",
    };
  }

  const fallbackTitle =
    location?.area || location?.city || "Select Location";
  const fallbackSubtitle =
    location?.address || location?.city || "Tap to choose delivery location";

  return {
    title: fallbackTitle,
    subtitle: fallbackSubtitle,
  };
};

export default function HomeHeader({
  activeTab,
  location,
  savedAddressText,
  handleLocationClick,
  handleSearchFocus,
  placeholderIndex,
  placeholders,
  vegMode = false,
  onVegModeChange,
  hero,
  embedded = false,
}) {
  const navigate = useNavigate();
  const { theme: colorMode, setTheme: setColorMode } = useTheme();
  const [isListening, setIsListening] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("food_user_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const {
    items: broadcastNotifications,
    unreadCount: broadcastUnreadCount,
    dismiss: dismissBroadcastNotification,
  } = useNotificationInbox("user", { limit: 20 });

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem("food_user_notifications");
      setNotifications(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener("notificationsUpdated", sync);
    return () => window.removeEventListener("notificationsUpdated", sync);
  }, []);

  const isFood = activeTab === "food";
  // Veg mode swings the accent green; every other state stays on Swiggy orange.
  const accent = isFood && vegMode ? "var(--sw-green)" : "var(--sw-primary)";

  const hasHero = Boolean(hero) && !embedded;

  // Swiggy's hero pattern: the bar is transparent while it sits over the
  // artwork, then swaps to the solid surface once the hero scrolls past — the
  // sticky header would otherwise be white text on white content.
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!hasHero) {
      setIsScrolled(false);
      return undefined;
    }
    const sync = () => setIsScrolled(window.scrollY > 24);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [hasHero]);

  // True only while the chrome is actually drawn on top of the hero image.
  const onHero = hasHero && !isScrolled;

  const walletPath =
    activeTab === "quick"
      ? "/quick/wallet"
      : activeTab === "porter"
        ? "/food/user/wallet?from=porter"
        : "/food/user/wallet";

  const { title: locationTitle, subtitle: locationSubtitle } = useMemo(
    () => buildLocationDisplay(savedAddressText, location),
    [savedAddressText, location],
  );

  const mergedNotifications = useMemo(() => {
    const localItems = Array.isArray(notifications)
      ? notifications.map((item) => ({ ...item, source: "local" }))
      : [];
    const remoteItems = (broadcastNotifications || []).map((item) => ({
      ...item,
      id: item.id || item._id,
      source: "broadcast",
      time: item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        : "Just now",
    }));
    return [...remoteItems, ...localItems].sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp || 0).getTime() -
        new Date(a.createdAt || a.timestamp || 0).getTime(),
    );
  }, [broadcastNotifications, notifications]);

  const unreadCount =
    notifications.filter((item) => !item.read).length + broadcastUnreadCount;

  const removeNotification = (id, source) => {
    if (source === "broadcast") {
      dismissBroadcastNotification(id);
      return;
    }
    setNotifications((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem("food_user_notifications", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("notificationsUpdated"));
      return next;
    });
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        if (activeTab === "quick") {
          navigate("/quick/search", { state: { query: transcript } });
        } else {
          navigate("/food/user/search", { state: { query: transcript } });
        }
      }
    };
    recognition.start();
  };

  const iconButtonClass = cn(
    "sw-pressable flex h-9 w-9 items-center justify-center rounded-full",
    onHero
      ? "bg-white/15 text-white backdrop-blur-sm"
      : "bg-(--sw-surface-alt) text-(--sw-text-secondary)",
  );

  return (
    // `min-h` is a floor, not the height: the blocks inside already stack to
    // roughly this much, so it only matters on short content (e.g. a module
    // with no search field) where the hero would otherwise stop too high.
    <div
      className={cn(
        "relative z-50",
        hasHero ? "min-h-[46vh]" : "bg-(--sw-surface)",
      )}
    >
      {/* 0. Hero artwork — sits behind the bar, switcher and search field.
             Absolute, so the blocks below give the hero its height. */}
      {hasHero && (
        <HomeHeroBackdrop
          images={hero.images}
          data={hero.data}
          currentIndex={hero.currentIndex}
          loading={hero.loading}
          backendOrigin={hero.backendOrigin}
        />
      )}

      {/* 1. Location + actions bar */}
      <header
        className={cn(
          "relative z-10 px-4 py-2.5 transition-colors duration-200",
          !embedded && "sticky top-0",
          onHero
            ? "border-b border-transparent bg-transparent"
            : "border-b border-(--sw-border) bg-(--sw-surface)",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Location selector */}
          <button
            type="button"
            onClick={handleLocationClick}
            className="sw-pressable flex min-w-0 shrink items-start gap-2 bg-transparent p-0 text-left"
          >
            <MapPin
              className="mt-0.5 h-[18px] w-[18px] shrink-0"
              style={{ color: onHero ? "#fff" : accent }}
              strokeWidth={2.5}
            />
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-0.5">
                <span
                  className={cn(
                    "truncate text-[15px] font-extrabold leading-tight",
                    onHero ? "text-white" : "text-(--sw-text)",
                  )}
                >
                  {locationTitle}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0", onHero ? "text-white" : "text-(--sw-text)")}
                  strokeWidth={3}
                />
              </span>
              <span
                className={cn(
                  "mt-0.5 truncate text-[11px] leading-tight",
                  onHero ? "text-white/75" : "text-(--sw-text-muted)",
                )}
              >
                {locationSubtitle}
              </span>
            </span>
          </button>

          {/* Actions */}
          {!embedded && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setColorMode(colorMode === "dark" ? "light" : "dark")}
                className={iconButtonClass}
                aria-label="Toggle theme"
              >
                {colorMode === "dark" ? (
                  <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
                ) : (
                  <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
                )}
              </button>

              <Link to={walletPath} className={iconButtonClass} aria-label="Open wallet">
                <Wallet className="h-[18px] w-[18px]" strokeWidth={2} />
              </Link>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(iconButtonClass, "relative")}
                    aria-label="Open notifications"
                  >
                    <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-(--sw-surface)" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="food-theme-scope z-[200] mt-2 w-80 overflow-hidden rounded-(--sw-radius-card) border border-(--sw-border) p-0 shadow-(--sw-shadow-lg)"
                  align="end"
                >
                  <div className="bg-(--sw-surface)">
                    <div className="flex items-center justify-between border-b border-(--sw-border) px-4 py-3">
                      <h3 className="flex items-center gap-2 text-sm font-extrabold text-(--sw-text)">
                        Notifications
                        {unreadCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-4 border-none bg-primary/10 text-[10px] text-primary"
                          >
                            {unreadCount} New
                          </Badge>
                        )}
                      </h3>
                      {mergedNotifications.length > 0 && (
                        <Link
                          to="/food/user/notifications"
                          className="text-xs font-extrabold text-primary"
                        >
                          View All
                        </Link>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {mergedNotifications.length > 0 ? (
                        mergedNotifications.slice(0, 5).map((item, index) => (
                          <div
                            key={item.id || `notif-${index}`}
                            className="flex items-start gap-3 border-b border-(--sw-border) p-4 last:border-0"
                          >
                            <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                              <Bell className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-0.5 flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-bold text-(--sw-text)">
                                  {item.title}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="whitespace-nowrap text-[10px] text-(--sw-text-muted)">
                                    {item.time}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      removeNotification(item.id, item.source);
                                    }}
                                    className="rounded-full border-0 bg-transparent p-1 text-(--sw-text-muted) transition-colors hover:bg-(--sw-red-soft) hover:text-(--sw-red)"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="line-clamp-2 text-xs leading-relaxed text-(--sw-text-muted)">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-8 text-center">
                          <BellOff className="h-9 w-9 text-(--sw-text-muted)" />
                          <p className="text-xs font-medium text-(--sw-text-muted)">
                            All caught up!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </header>

      {!embedded && (
        <>
          {/* 2. Search field — the module switcher used to sit above this;
                 Quick and Porter now live in the bottom navigation instead. */}
          {isFood && (
            <div className="relative z-10 px-4 py-3">
              <div className="relative flex w-full items-center">
                <Search
                  className="pointer-events-none absolute left-3.5 z-10 h-[18px] w-[18px]"
                  style={{ color: accent }}
                  strokeWidth={2.5}
                />

                {/* Stays solid on the hero — a translucent field over artwork
                    makes the placeholder unreadable. */}
                <input
                  onClick={() => (handleSearchFocus ? handleSearchFocus() : navigate("/food/user/search"))}
                  type="text"
                  readOnly
                  placeholder={placeholders?.[placeholderIndex] || "Search for food, restaurants..."}
                  className={cn(
                    "block h-11 w-full cursor-pointer rounded-(--sw-radius-card) border pl-11 pr-28 text-sm text-(--sw-text) placeholder:text-(--sw-text-muted) focus:outline-none",
                    onHero
                      ? "border-transparent bg-(--sw-surface) shadow-(--sw-shadow-md)"
                      : "border-(--sw-border) bg-(--sw-surface-alt)",
                  )}
                />

                <div className="absolute right-2.5 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    style={{ color: accent }}
                    className={cn(
                      "sw-pressable rounded-full border-0 bg-transparent p-1",
                      isListening && "animate-pulse",
                    )}
                    aria-label="Voice search"
                  >
                    <Mic className="h-4 w-4" strokeWidth={2.5} />
                  </button>

                  <span className="h-4 w-px bg-(--sw-border-strong)" />

                  <div className="flex items-center gap-1">
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wide"
                      style={{ color: "var(--sw-green)" }}
                    >
                      Veg
                    </span>
                    <div className="flex h-5 scale-[0.8] items-center">
                      <Switch
                        checked={vegMode}
                        onCheckedChange={onVegModeChange}
                        className="border-none data-[state=checked]:bg-(--sw-green) data-[state=unchecked]:bg-(--sw-border-strong)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Hero copy — in normal flow, so it is what stretches the
                 backdrop down to roughly the middle of the viewport. */}
          {hasHero && (
            <div className="relative z-10">
              <HomeHeroCaption
                images={hero.images}
                data={hero.data}
                currentIndex={hero.currentIndex}
                loading={hero.loading}
                onSelectIndex={hero.onSelectIndex}
                navigate={navigate}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
