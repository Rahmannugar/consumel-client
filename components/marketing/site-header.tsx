import { Brand } from "./brand";
import { MobileNavigation } from "./mobile-navigation";
import { waitlistPopupAttributes, waitlistPopupHref } from "./waitlist-popup";

const navigation = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#atomic-consume" },
  { label: "Providers", href: "#providers" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-shell site-header__inner">
        <Brand inverse />
        <nav className="site-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="nav-action" href={waitlistPopupHref} {...waitlistPopupAttributes}>
          Join the waitlist
        </a>
        <MobileNavigation items={navigation} />
      </div>
    </header>
  );
}
