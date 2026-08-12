import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Lock, LogOut } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
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
            src="/manus-storage/primedeal-logo-new_719501eb.webp"
            alt="Primedeal Logo"
            className="h-10 w-10"
          />
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

        {/* Auth status & Favorite & WhatsApp CTA */}
        <div className="flex items-center gap-3">
          {(() => {
            const { user, isAuthenticated, logout } = useAuth();
            if (isAuthenticated && user) {
              return (
                <div className="hidden md:flex items-center gap-2 text-xs bg-secondary px-3 py-1.5 rounded-lg">
                  <span className="font-semibold text-slate-800">{user.name || "Admin"}</span>
                  {user.role === "admin" ? (
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">Admin</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">User (Bukan Admin)</span>
                  )}
                  <button
                    onClick={() => logout()}
                    className="text-muted-foreground hover:text-red-600 ml-1"
                    title="Keluar"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              );
            }
            return (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex gap-1 text-xs"
                onClick={() => startLogin()}
              >
                <Lock size={13} />
                Login Admin
              </Button>
            );
          })()}
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
              const phone = "6282230357009";
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
                const phone = "6282230357009";
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
