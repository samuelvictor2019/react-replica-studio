import { useState, useEffect } from "react";
import { Moon, Sun, ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";

const FloatingActions = () => {
  const { theme, setTheme } = useTheme();
  const [showScroll, setShowScroll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`p-2.5 rounded-full bg-card border border-border shadow-lg text-foreground transition-all duration-300 hover:scale-110 ${
          showScroll ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ArrowUp size={18} />
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
        className="p-2.5 rounded-full bg-card border border-border shadow-lg text-foreground transition-all duration-200 hover:scale-110"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
};

export default FloatingActions;
