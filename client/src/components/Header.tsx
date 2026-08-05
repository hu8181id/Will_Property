import { Button } from "@/components/ui/button";
import { Menu, X, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("primedeal_favorites_ids");
      if (saved) {
        try {
          setFavoriteCount(JSON.parse(saved).length);
        } catch (error) {
          console.error("Error loading favorite count:", error);
        }
      } else {
        setFavoriteCount(0);
      }
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isActive = (path: string) => location === path;

  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Listing", href: "/listing" },
    { label: "Favorit", href: "/favorit" },
    { label: "Kalkulator KPR", href: "/kalkulator" },
    { label: "Tentang Kami", href: "/tentang" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img
            src="/manus-storage/primedeal-logo_56b8d4a1.png"
            alt="Primedeal Logo"
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-primary">Primedeal</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Favorite Button & CTA Button & Mobile Menu */}
        <div className="flex items-center gap-4">
          <a
            href="/favorit"
            className="relative hidden sm:flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            title="Favorit"
          >
            <Heart size={20} className={favoriteCount > 0 ? "fill-red-500 text-red-500" : ""} />
            {favoriteCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {favoriteCount > 9 ? "9+" : favoriteCount}
              </span>
            )}
          </a>
          <Button
            className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white"
            onClick={() => {
              const phone = "62822303570009";
              const message = "Halo Primedeal, saya tertarik dengan properti Anda.";
              window.open(
                `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                "_blank"
              );
            }}
          >
            Hubungi Kami
          </Button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden border-t border-border bg-white">
          <div className="container py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                const phone = "62822303570009";
                const message =
                  "Halo Primedeal, saya tertarik dengan properti Anda.";
                window.open(
                  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                  "_blank"
                );
                setIsOpen(false);
              }}
            >
              Hubungi Kami
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
