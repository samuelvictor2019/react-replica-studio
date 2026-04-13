import { useState } from "react";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import logo from "@/assets/logo.png";
import aboutTwc from "@/assets/about_nav.jpg";
import doctrinal from "@/assets/doctrinal_nav.jpg";
import pastor from "@/assets/pastor_nav.jpg";
import contactImg from "@/assets/contact_nav.jpg";
import newMember from "@/assets/newmember_nav.jpg";
import houseGroups from "@/assets/housegroup_nav.jpg";
import stewards from "@/assets/stewards_nav.jpg";
import formsImg from "@/assets/forms_nav.jpg";

const navItems = [
  { label: "HOME", href: "/" },
  {
    label: "ABOUT",
    submenu: [
      { label: "About TWC", href: "/about" },
      { label: "Doctrinal Statement", href: "/doctrine" },
      { label: "Apostle's Profile", href: "/apostle" },
      { label: "Contact US", href: "#" },
    ],
  },
  {
    label: "GET INVOLVED",
    submenu: [
      { label: "I'm a New Member", href: "/new-member" },
      { label: "House Groups", href: "/house-groups" },
      { label: "Faithful Stewards", href: "/stewards" },
      { label: "Forms", href: "/forms" },
    ],
  },
  { label: "EVENTS", href: "/events" },
  { label: "MEDIA", href: "/media" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileGetOpen, setMobileGetOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 w-full z-50">
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="inline-flex items-center" aria-label="Home">
          <img src={logo} alt="Watergate" className="h-10 object-contain" />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) =>
            item.submenu ? (
              <div key={item.label} className="relative group">
                <button className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-black/80 hover:text-black transition-colors">
                  {item.label}
                  <ChevronDown className="w-3 h-3" />
                </button>

                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute left-0 top-full mt-0 w-56 bg-background border border-foreground/10 shadow-md rounded-md p-2 z-50">
                  {item.submenu.map((s) => (
                    <a key={s.label} href={s.href} className="flex items-center gap-3 px-3 py-2 hover:bg-sky-100 rounded">
                      {/* <img src={s.icon} alt="" className="w-8 h-8 object-cover rounded" /> */}
                      <span className="text-sm font-medium text-black">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-[11px] font-semibold tracking-widest text-black/80 hover:text-black transition-colors"
              >
                {item.label}
              </a>
            )
          )}

          {/* Admin Link */}
          <a
            href="/admin/login"
            className="text-[11px] font-semibold tracking-widest text-black/80 hover:text-black transition-colors"
          >
            ADMIN
          </a>
        </div>

        {/* CTA */}
        <a
          href="/events"
          className="hidden md:inline-flex bg-black text-white text-[11px] font-semibold tracking-widest px-5 py-2.5 rounded-sm hover:bg-sky-100 hover:text-black transition-colors"
        >
          UPCOMING EVENTS
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-black"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white backdrop-blur-sm px-4 pb-6 pt-2 flex flex-col gap-2">
          {navItems.map((item) =>
            item.submenu ? (
              <div key={item.label} className="w-full">
                <button
                  onClick={() => {
                    if (item.label === "ABOUT") setMobileAboutOpen((s) => !s);
                    if (item.label === "GET INVOLVED") setMobileGetOpen((s) => !s);
                  }}
                  className="w-full flex items-center justify-between text-xs font-semibold tracking-widest text-black/80 hover:text-black py-2"
                >
                  <span>{item.label}</span>
                  <span aria-hidden>{(item.label === "ABOUT" ? mobileAboutOpen : mobileGetOpen) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
                </button>

                <div className={`${item.label === "ABOUT" ? (mobileAboutOpen ? "block" : "hidden") : mobileGetOpen ? "block" : "hidden"} pl-3` }>
                  {item.submenu.map((s) => (
                    <a key={s.label} href={s.href} className="flex items-center gap-3 py-2 text-sm">
                      {/* <img src={s.icon} alt="" className="w-8 h-8 object-cover rounded" /> */}
                      <span className="font-medium text-black">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-xs font-semibold tracking-widest text-black/80 hover:text-black py-2"
              >
                {item.label}
              </a>
            )
          )}

          {/* Admin Link */}
          <a
            href="/admin/login"
            className="text-xs font-semibold tracking-widest text-black/80 hover:text-black py-2"
          >
            ADMIN
          </a>

          <a
            href="/events"
            className="bg-black text-white text-xs font-semibold tracking-widest px-5 py-2.5 rounded-sm text-center hover:bg-sky-100 hover:text-black transition-colors"
          >
            UPCOMING EVENTS
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
