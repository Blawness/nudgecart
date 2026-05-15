import Link from "next/link";
import { Globe, Mail, Phone, CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Layanan Pelanggan */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Layanan Pelanggan</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/faq" className="hover:text-primary">
                  Pertanyaan Umum
                </Link>
              </li>
              <li>
                <Link href="/howtobuy" className="hover:text-primary">
                  Cara Belanja
                </Link>
              </li>
              <li>
                <Link href="/shipping-cost" className="hover:text-primary">
                  Gratis Ongkir
                </Link>
              </li>
              <li>
                <Link href="/beli-voucher" className="hover:text-primary">
                  Beli Voucher
                </Link>
              </li>
            </ul>
          </div>

          {/* Jelajahi */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Jelajahi Pasarku</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-primary">
                  Tentang Pasarku
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <a
                  href="https://blog.pasarku.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Metode Pembayaran</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm border">
                <CreditCard className="mr-1 size-3" /> COD
              </span>
              <span className="inline-flex items-center rounded bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm border">
                BCA
              </span>
              <span className="inline-flex items-center rounded bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm border">
                Mandiri
              </span>
              <span className="inline-flex items-center rounded bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm border">
                ATM Bersama
              </span>
            </div>
          </div>

          {/* Ikuti Kami & Kontak */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Ikuti Kami</h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary"
                aria-label="Facebook"
              >
                <Globe className="size-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary"
                aria-label="Twitter"
              >
                <Globe className="size-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary"
                aria-label="Instagram"
              >
                <Globe className="size-5" />
              </a>
            </div>
            <h3 className="mb-2 mt-4 text-sm font-bold text-gray-900">Hubungi Kami</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-1.5">
                <Mail className="size-3.5" />
                <span>care@pasarku.id</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                <span>1500-959</span>
              </li>
            </ul>
          </div>
        </div>

        {/* App download & Copyright */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="inline-flex items-center rounded-lg bg-black px-3 py-2 text-xs font-bold text-white">
                Google Play
              </span>
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="inline-flex items-center rounded-lg bg-black px-3 py-2 text-xs font-bold text-white">
                App Store
              </span>
            </a>
          </div>
          <p className="text-xs text-gray-500">
            &copy; 2026 Pasarku. PT Sumber Pasarku. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
