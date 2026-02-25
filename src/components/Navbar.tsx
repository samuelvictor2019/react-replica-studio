import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "GET INVOLVED", href: "#" },
  { label: "EVENTS", href: "#events" },
  { label: "MEDIA", href: "#" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 w-full z-50">
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="text-primary-foreground font-heading text-xl font-bold tracking-wider">
          WATERGATE
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11px] font-semibold tracking-widest text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#events"
          className="hidden md:inline-flex bg-primary text-primary-foreground text-[11px] font-semibold tracking-widest px-5 py-2.5 rounded-sm hover:bg-primary/90 transition-colors"
        >
          UPCOMING EVENTS
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-foreground/95 backdrop-blur-sm px-4 pb-6 pt-2 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold tracking-widest text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#events"
            className="bg-primary text-primary-foreground text-xs font-semibold tracking-widest px-5 py-2.5 rounded-sm text-center hover:bg-primary/90 transition-colors"
          >
            UPCOMING EVENTS
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
