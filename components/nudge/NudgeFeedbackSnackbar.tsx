"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";

interface NudgeFeedbackSnackbarProps {
  open: boolean;
  onClose: () => void;
  onSubmitRating: (rating: number) => void;
}

export function NudgeFeedbackSnackbar({
  open,
  onClose,
  onSubmitRating,
}: NudgeFeedbackSnackbarProps) {
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (rating: number) => {
    setSubmitted(true);
    onSubmitRating(rating);
    setTimeout(onClose, 1500);
  };

  return (
    <AnimatePresence>
      {open && !submitted && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-50 bg-white shadow-lg border rounded-xl px-4 py-3 flex items-center gap-3"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <p className="text-xs text-muted-foreground flex-1">
            Apakah saran produk tadi membantu keputusan belanjaanmu?
          </p>
          <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHovered(star)}
                className="text-yellow-400 hover:scale-110 transition-transform"
              >
                <Star
                  className="size-4"
                  fill={star <= hovered ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}
      {submitted && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-50 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <p className="text-xs text-green-700 font-medium">Terima kasih atas feedback kamu!</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
