import { AudioLines, Compass, Menu, X } from "lucide-react";
import { useState } from "react";

type SiteNavProps = {
  active: "app" | "about";
  onNavigate: (path: "/" | "/about") => void;
  onTour?: () => void;
};

export function SiteNav({ active, onNavigate, onTour }: SiteNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(path: "/" | "/about") {
    setMenuOpen(false);
    onNavigate(path);
  }

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <button type="button" className="site-nav__brand" onClick={() => navigate("/")} aria-label="EDITH home">
        <span className="site-nav__mark" aria-hidden="true"><AudioLines size={18} /></span>
        <span>EDITH</span>
      </button>

      <button
        type="button"
        className="site-nav__menu"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-controls="site-navigation-links"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <div id="site-navigation-links" className={`site-nav__links ${menuOpen ? "is-open" : ""}`}>
        <button type="button" className={active === "app" ? "is-active" : ""} onClick={() => navigate("/")}>App</button>
        <button type="button" className={active === "about" ? "is-active" : ""} onClick={() => navigate("/about")}>
          <Compass size={15} aria-hidden="true" /> How it works
        </button>
        {onTour && (
          <button type="button" className="site-nav__tour" onClick={() => { setMenuOpen(false); onTour(); }}>
            Take the tour <span aria-hidden="true">↗</span>
          </button>
        )}
      </div>
    </nav>
  );
}
