import { create } from "zustand";

interface CartDrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCartDrawer = create<CartDrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

interface AddToCartState {
  addingProductId: string | null;
  setAdding: (productId: string | null) => void;
}

export const useAddToCart = create<AddToCartState>((set) => ({
  addingProductId: null,
  setAdding: (productId) => set({ addingProductId: productId }),
}));
