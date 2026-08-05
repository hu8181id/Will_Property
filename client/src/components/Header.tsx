import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Listing", href: "/listing" },
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

        {/* CTA Button & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button
            className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white"
            onClick={() => {
              const phone = "6281234567890";
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
                const phone = "6281234567890";
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
