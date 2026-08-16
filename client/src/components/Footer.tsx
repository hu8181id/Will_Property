import React from "react";
import { MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-4">Primedeal</h3>
            <p className="text-sm text-gray-300">
              Platform properti terpercaya untuk menemukan rumah impian Anda dengan mudah dan transparan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/listing" className="hover:text-white transition-colors">
                  Listing Properti
                </a>
              </li>
              <li>
                <a href="/kalkulator" className="hover:text-white transition-colors">
                  Kalkulator KPR
                </a>
              </li>
              <li>
                <a href="/tentang" className="hover:text-white transition-colors">
                  Tentang Kami
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Layanan</h4>
            <div className="space-y-2 text-sm">
              <a
                href="https://wa.me/6282230357009?text=Halo%20Primedeal%2C%20saya%20ingin%20menjual%20properti."
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md py-1 text-gray-300 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Jual Properti
              </a>
              <a
                href="/listing"
                className="block rounded-md py-1 text-gray-300 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Beli Properti
              </a>
              <a
                href="https://wa.me/6282230357009?text=Halo%20Primedeal%2C%20saya%20mencari%20properti%20untuk%20disewa."
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md py-1 text-gray-300 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Sewa Properti
              </a>
              <a
                href="https://wa.me/6282230357009?text=Halo%20Primedeal%2C%20saya%20ingin%20konsultasi%20properti."
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md py-1 text-gray-300 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Konsultasi Properti
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontak Kami</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <Phone size={16} className="mt-1 flex-shrink-0" />
                <a
                  href="https://wa.me/6282230357009?text=Halo%20Primedeal%2C%20saya%20ingin%20mengetahui%20lebih%20lanjut%20tentang%20properti%20Anda."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  0822-3035-7009
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>Surabaya, Indonesia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2024 Primedeal. Semua hak dilindungi.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="/privasi" className="hover:text-white transition-colors">
                Kebijakan Privasi
              </a>
              <a href="/ketentuan" className="hover:text-white transition-colors">
                Syarat &amp; Ketentuan
              </a>
              <a
                href="https://wa.me/6282230357009?text=Halo%20Primedeal%2C%20saya%20ingin%20menghubungi%20Anda."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
