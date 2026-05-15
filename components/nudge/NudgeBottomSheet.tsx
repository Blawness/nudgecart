"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Leaf } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

interface AlternativeProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
}

interface NudgeBottomSheetProps {
  open: boolean;
  headline: string;
  body: string;
  ctaText: string;
  alternativeProduct?: AlternativeProduct;
  onAccept: () => void;
  onDismiss: () => void;
  framingType: string | null;
}

export function NudgeBottomSheet({
  open,
  onClose,
  headline,
  body,
  ctaText,
  alternativeProduct,
  onAccept,
  onDismiss,
  framingType,
}: NudgeBottomSheetProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    timerRef.current = timer;
    return () => clearTimeout(timer);
  }, [open]);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onDismiss();
  }, [onDismiss]);

  const isEco = framingType === "GAIN" || headline.toLowerCase().includes("ramah lingkungan");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 shadow-xl ${
              isEco ? "bg-green-50" : "bg-white"
            }`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {open && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-2xl overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </div>
            )}

            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="mb-4">
              {isEco && <Leaf className="size-6 text-green-600 mb-1" />}
              <h3 className="font-semibold text-base">{headline}</h3>
              <p className="text-sm text-muted-foreground mt-1">{body}</p>
            </div>

            {alternativeProduct && (
              <div className="flex gap-3 items-center mb-4 p-3 rounded-lg bg-background border">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={alternativeProduct.imageUrl}
                    alt={alternativeProduct.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{alternativeProduct.name}</p>
                  <p className="text-sm font-bold text-primary">{formatRupiah(alternativeProduct.price)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Tetap Pilihan Ini
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (timerRef.current) clearTimeout(timerRef.current);
                  onAccept();
                }}
              >
                {ctaText}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
