"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag, Leaf, Heart, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LifestyleType, ShoppingFrequency } from "@/types";

const steps = [
  {
    id: "categories",
    question: "Kategori produk apa yang paling sering kamu beli?",
    subtitle: "Pilih yang paling sesuai",
    options: [
      { id: "sayur", icon: "🥬", label: "Sayur & Buah" },
      { id: "protein", icon: "🥩", label: "Daging & Protein" },
      { id: "sembako", icon: "🍚", label: "Sembako" },
      { id: "snack", icon: "🍪", label: "Snack & Minuman" },
      { id: "bumbu", icon: "🧂", label: "Bumbu Dapur" },
      { id: "susu", icon: "🥛", label: "Susu & Olahan" },
    ],
  },
  {
    id: "lifestyle",
    question: "Gaya belanja seperti apa yang paling cocok untukmu?",
    subtitle: "Ini membantu kami menyesuaikan rekomendasi",
    options: [
      { id: "HEMAT", icon: "💰", label: "Hemat", desc: "Harga terjangkau, value terbaik" },
      { id: "SEHAT", icon: "🥗", label: "Sehat", desc: "Produk segar & bernutrisi" },
      { id: "ECO", icon: "🌍", label: "Ramah Lingkungan", desc: "Produk eco-friendly & sustainable" },
    ],
  },
  {
    id: "frequency",
    question: "Seberapa sering kamu berbelanja grocery?",
    subtitle: "Biarkan kami tahu ritme belanjamu",
    options: [
      { id: "HARIAN", icon: "📅", label: "Harian", desc: "Hampir setiap hari" },
      { id: "MINGGUAN", icon: "📆", label: "Mingguan", desc: "1-2 kali seminggu" },
      { id: "BULANAN", icon: "🗓️", label: "Bulanan", desc: "1-2 kali sebulan" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const saveMutation = useMutation({
    mutationFn: async (data: {
      favoriteCategories: string[];
      lifestyleType: LifestyleType | null;
      shoppingFrequency: ShoppingFrequency | null;
    }) => {
      const res = await fetch("/api/nudge/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          onboardingCompleted: true,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan preferensi");
      return res.json();
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  const step = steps[currentStep];
  const selected = answers[step.id] ?? [];

  const toggleOption = (optionId: string) => {
    if (step.id === "categories") {
      setAnswers((prev) => {
        const current = prev[step.id] ?? [];
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [step.id]: next };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [step.id]: [optionId] }));
    }
  };

  const isMultiSelect = step.id === "categories";
  const canProceed =
    (isMultiSelect && selected.length > 0) || (!isMultiSelect && selected.length > 0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      saveMutation.mutate({
        favoriteCategories: answers.categories ?? [],
        lifestyleType: (answers.lifestyle?.[0] as LifestyleType) ?? null,
        shoppingFrequency: (answers.frequency?.[0] as ShoppingFrequency) ?? null,
      });
    }
  };

  const handleSkip = async () => {
    await fetch("/api/nudge/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        favoriteCategories: [],
        onboardingSkipped: true,
        onboardingCompleted: false,
      }),
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-4 flex items-center justify-between">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= currentStep ? "bg-primary w-8" : "bg-gray-200 w-4"
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleSkip}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          Lewati <X className="size-3" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h1 className="text-xl font-bold text-center mb-1">{step.question}</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">{step.subtitle}</p>

            <div className="space-y-2.5">
              {step.options.map((option) => {
                const isSelected = selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{option.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      {"desc" in option && (
                        <p className="text-xs text-muted-foreground">{(option as { desc: string }).desc}</p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="ml-auto size-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <p className="text-center text-xs text-muted-foreground mb-3">
          Preferensi ini membantu kami menampilkan produk yang paling relevan untuk kamu.
        </p>
        <Button
          className="w-full"
          size="lg"
          disabled={!canProceed || saveMutation.isPending}
          onClick={handleNext}
        >
          {saveMutation.isPending
            ? "Menyimpan..."
            : currentStep < steps.length - 1
            ? "Lanjut"
            : "Mulai Belanja"}
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
