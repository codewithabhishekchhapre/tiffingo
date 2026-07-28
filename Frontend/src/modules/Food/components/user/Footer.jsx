import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { getCachedSettings, loadBusinessSettings } from "@common/utils/businessSettings"
import { useCompanyName } from "@food/hooks/useCompanyName"

const footerLinks = {
  company: [
    { name: "About Us", href: "/profile/about" },
    { name: "Help & Support", href: "/user/help" },
    { name: "Offers", href: "/user/offers" },
    { name: "Collections", href: "/user/collections" },
  ],
  support: [
    { name: "Help Center", href: "/user/help" },
    { name: "Privacy Policy", href: "/profile/privacy" },
    { name: "Terms of Service", href: "/profile/terms" },
    { name: "Refund Policy", href: "/profile/refund" },
  ],
  user: [
    { name: "My Account", href: "/user/profile" },
    { name: "My Orders", href: "/user/orders" },
    { name: "Favorites", href: "/user/profile/favorites" },
    { name: "Wallet", href: "/food/user/wallet" },
  ],
  partners: [
    { name: "Partner With Us", href: "/user/help" },
    { name: "Restaurant Login", href: "/food/restaurant" },
    { name: "Ride With Us", href: "/food/delivery" },
  ],
}

const LinkColumn = ({ title, links }) => (
  <div>
    <h3 className="sw-eyebrow mb-3">{title}</h3>
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.name}>
          <Link
            to={link.href}
            className="text-sm text-(--sw-text-secondary) transition-colors hover:text-primary"
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

export default function Footer() {
  const companyName = useCompanyName()
  const currentYear = new Date().getFullYear()
  const [logoUrl, setLogoUrl] = useState('/food/tiffingo-logo.png')

  // Load business settings logo
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const cached = getCachedSettings()
        if (cached?.logo?.url) {
          setLogoUrl(cached.logo.url)
        } else {
          const settings = await loadBusinessSettings()
          if (settings?.logo?.url) {
            setLogoUrl(settings.logo.url)
          }
        }
      } catch (error) {
        // Silently fail, use default logo
      }
    }
    loadLogo

    const handleSettingsUpdate = () => {
      const cached = getCachedSettings()
      if (cached?.logo?.url) {
        setLogoUrl(cached.logo.url)
      }
    }
    window.addEventListener('businessSettingsUpdated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('businessSettingsUpdated', handleSettingsUpdate)
    }
  }, [])

  const supportEmail = `support@${(companyName || "tiffingo").toLowerCase().replace(/\s+/g, '')}.com`

  return (
    <footer className="mt-auto block border-t border-(--sw-border) bg-(--sw-surface)">
      {/* Bottom room so neither the mobile tab bar nor the desktop module dock covers the last row. */}
      <div className="mx-auto max-w-6xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-10 sm:px-6 md:pb-28 md:pt-12 lg:px-8">
        <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-8 md:mb-10 md:gap-8 lg:grid-cols-6">
          {/* Brand — full width until the 6-column desktop grid kicks in */}
          <div className="col-span-2 space-y-5 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={companyName || "Logo"}
                  className="h-10 w-10 rounded-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              <span className="text-xl font-extrabold tracking-tight text-(--sw-text)">
                {companyName || "Tiffingo"}
              </span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-(--sw-text-muted)">
              Delivering delicious food to your doorstep. Order from your favourite
              restaurants and enjoy fresh, hot meals in minutes.
            </p>

            <div className="space-y-2">
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 text-sm text-(--sw-text-secondary) transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-(--sw-text-muted)" />
                <span>+1 (555) 123-4567</span>
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2 text-sm text-(--sw-text-secondary) transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0 text-(--sw-text-muted)" />
                <span>{supportEmail}</span>
              </a>
              <p className="flex items-center gap-2 text-sm text-(--sw-text-secondary)">
                <MapPin className="h-4 w-4 shrink-0 text-(--sw-text-muted)" />
                <span>New York, NY</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="sw-pressable flex h-9 w-9 items-center justify-center rounded-full bg-(--sw-surface-alt) text-(--sw-text-secondary) transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn title="Company" links={footerLinks.company} />
          <LinkColumn title="Support" links={footerLinks.support} />
          <LinkColumn title="For You" links={footerLinks.user} />
          <LinkColumn title="Partners" links={footerLinks.partners} />
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-(--sw-border) pt-6 text-center md:flex-row md:gap-3 md:text-left">
          <p className="text-xs text-(--sw-text-muted)">
            © {currentYear} {companyName || "Tiffingo"}. All rights reserved.
          </p>
          <p className="text-xs text-(--sw-text-muted)">Made for food lovers</p>
        </div>
      </div>
    </footer>
  )
}
