import { Mail, MapPin, Phone } from "lucide-react";

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
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Jual Properti</li>
              <li>Beli Properti</li>
              <li>Sewa Properti</li>
              <li>Konsultasi Properti</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontak Kami</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <Phone size={16} className="mt-1 flex-shrink-0" />
                <a
                  href="https://wa.me/62822303570009?text=Halo%20Primedeal%2C%20saya%20ingin%20mengetahui%20lebih%20lanjut%20tentang%20properti%20Anda."
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
              <a href="#" className="hover:text-white transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Syarat & Ketentuan
              </a>
              <a
                href="https://wa.me/62822303570009?text=Halo%20Primedeal%2C%20saya%20ingin%20menghubungi%20Anda."
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
