"use client";

import { Truck, Zap, Award, Package } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Gratis Ongkir Tanpa Syarat",
    description: "Belanja berapa pun, gratis biaya pengiriman tanpa batas maksimal",
  },
  {
    icon: Zap,
    title: "Sameday Delivery",
    description: "Pesanan diantar lebih cepat karena diantar dari toko terdekat",
  },
  {
    icon: Award,
    title: "Poin Terintegrasi",
    description: "Dapatkan poin untuk setiap pembelanjaan di Pasarku",
  },
  {
    icon: Package,
    title: "Produk Lebih Lengkap",
    description: "Lebih lengkap dengan produk premium, kemasan besar, dan kebutuhan lainnya",
  },
];

export function ValueProposition() {
  return (
    <section className="bg-primary py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-lg font-bold text-white">
          Yuk, belanja di Pasarku dan Dapatkan Keuntungannya!
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {benefits.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="mb-3 flex size-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/10">
                <item.icon className="size-7 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="mt-1 text-xs text-white/70">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
