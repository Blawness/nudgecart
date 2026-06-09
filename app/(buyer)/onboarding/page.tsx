"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryOptions = [
  { id: "sayuran_telur", label: "Sayuran & Telur" },
  { id: "buah", label: "Buah-Buahan" },
  { id: "rumah_tangga", label: "Kebutuhan Rumah Tangga" },
  { id: "lainnya", label: "Lainnya" },
];

async function savePreferences(data: {
  favoriteCategories: string[];
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
}) {
  const res = await fetch("/api/nudge/preference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Gagal menyimpan preferensi");
  }

  return res.json();
}

export default function OnboardingPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const saveMutation = useMutation({
    mutationFn: savePreferences,
    onSuccess: async (_data, variables) => {
      await updateSession({
        onboardingCompleted: variables.onboardingCompleted,
        onboardingSkipped: variables.onboardingSkipped,
      });
      router.replace("/");
      router.refresh();
    },
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  const handleContinue = () => {
    saveMutation.mutate({
      favoriteCategories: selectedCategories,
      onboardingCompleted: true,
      onboardingSkipped: false,
    });
  };

  const handleSkip = () => {
    saveMutation.mutate({
      favoriteCategories: [],
      onboardingCompleted: false,
      onboardingSkipped: true,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="px-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div
            className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100"
            aria-label="Progress onboarding"
          >
            <div className="h-full w-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-300" />
          </div>
          <button
            type="button"
            onClick={handleSkip}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
          >
            Lewati <X className="size-3" />
          </button>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        <div className="mb-7 text-center">
          <h1 className="text-xl font-bold leading-tight text-gray-900">
            Kategori Produk apa yang paling Sering Kamu Beli?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pilih yang paling sesuai
          </p>
        </div>

        <div className="space-y-2.5">
          {categoryOptions.map((option) => {
            const isSelected = selectedCategories.includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleCategory(option.id)}
                className={`flex min-h-14 w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium motion-safe:transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="size-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <div className="mx-auto w-full max-w-md px-6 pb-8">
        {saveMutation.isError && (
          <p className="mb-3 text-center text-xs font-medium text-destructive">
            {saveMutation.error.message}
          </p>
        )}
        <p className="mb-3 text-center text-xs text-muted-foreground">
          Preferensi ini membantu kami menampilkan produk yang paling relevan untuk kamu
        </p>
        <Button
          className="w-full"
          size="lg"
          disabled={selectedCategories.length === 0 || saveMutation.isPending}
          onClick={handleContinue}
        >
          {saveMutation.isPending ? "Menyimpan..." : "Lanjut"}
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
