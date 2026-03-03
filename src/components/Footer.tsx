import logo from "@/assets/logo.png";

const footerLinks = {
  about: [
    { name: "ABOUT TWC", route: "/about" },
    { name: "DOCTRINAL STATEMENT", route: "/doctrinal" },
    { name: "PASTORS PROFILE", route: "/apostle-profile" },
    { name: "CONTACT US", route: "#" }, // No page available
  ],
  getInvolved: [
    { name: "I'M A NEW MEMBER", route: "/forms" },
    { name: "HOUSE GROUPS", route: "#" }, // No page available
    { name: "FAITHFUL STEWARDS", route: "#" }, // No page available
    { name: "FORMS", route: "/forms" },
  ],
  events: [
    { name: "BOOTCAMP", route: "#" }, // No page available
    { name: "CONFERENCE", route: "#" }, // No page available
    { name: "WEEKLY SERVICE", route: "#" }, // No page available
    { name: "MONTHLY SERVICE", route: "#" }, // No page available
  ],
  media: [
    { name: "SERMON", route: "#" }, // No page available
    { name: "MUSIC", route: "#" }, // No page available
    { name: "PRESENT TRUTH", route: "#" }, // No page available
    { name: "PROCLAMATION", route: "#" }, // No page available
  ],
};

const Footer = () => {
  return (
    <footer className="bg-[hsl(220,60%,96%)] text-black">
      <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-10 md:gap-6">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <div>
              <img src={logo} alt="Watergate" className="h-10 object-contain" />
            </div>
              <p className="text-xs text-black/70 mt-2">Expressing His Fullness</p>
            <div className="mt-4">
              <p className="text-xs font-semibold tracking-wide text-black mb-3">CONNECT WITH US</p>
              <div className="flex items-center gap-3">
                {/* YouTube */}
                <a href="#" className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>
                </a>
                {/* Instagram */}
                <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.69-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>
                </a>
                {/* X / Twitter */}
                <a href="#" className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background hover:opacity-80 transition-opacity" aria-label="X">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* Facebook */}
                <a href="#" className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="text-xs font-bold tracking-[0.15em] text-black mb-4 uppercase">
                {key === "getInvolved" ? "GET INVOLVED" : key.toUpperCase()}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <a href={link.route} className="text-xs text-black hover:text-black transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-foreground/10">
        <div className="container max-w-6xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-black/70">
            ©{new Date().getFullYear()} Watergate Church
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
