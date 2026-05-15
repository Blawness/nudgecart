import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { PromoStrip } from "@/components/shared/PromoStrip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pasarku - Belanja Kebutuhan Dapur",
  description:
    "Marketplace belanja kebutuhan dapur dan grocery segar di Indonesia. Sayur, buah, daging, bumbu dapur segar langsung dari petani dan pedagang terpercaya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 pb-16 sm:pb-0">{children}</main>
          <div className="hidden sm:block">
            <Footer />
          </div>
          <BottomNav />
          <PromoStrip />
        </Providers>
      </body>
    </html>
  );
}
