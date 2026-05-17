import { describe, it, expect } from "vitest";
import { useCartDrawer, useAddToCart } from "@/stores/cartStore";

function getCartDrawerState() {
  return useCartDrawer.getState();
}

function getAddToCartState() {
  return useAddToCart.getState();
}

describe("cartStore", () => {
  describe("useCartDrawer", () => {
    it("starts closed", () => {
      expect(getCartDrawerState().isOpen).toBe(false);
    });

    it("open sets isOpen to true", () => {
      getCartDrawerState().open();
      expect(getCartDrawerState().isOpen).toBe(true);
    });

    it("close sets isOpen to false", () => {
      getCartDrawerState().open();
      getCartDrawerState().close();
      expect(getCartDrawerState().isOpen).toBe(false);
    });

    it("toggle flips the state", () => {
      getCartDrawerState().close();
      getCartDrawerState().toggle();
      expect(getCartDrawerState().isOpen).toBe(true);
      getCartDrawerState().toggle();
      expect(getCartDrawerState().isOpen).toBe(false);
    });
  });

  describe("useAddToCart", () => {
    it("starts with null addingProductId", () => {
      expect(getAddToCartState().addingProductId).toBeNull();
    });

    it("setAdding sets the product ID", () => {
      getAddToCartState().setAdding("product-123");
      expect(getAddToCartState().addingProductId).toBe("product-123");
    });

    it("setAdding null clears the product ID", () => {
      getAddToCartState().setAdding("product-456");
      getAddToCartState().setAdding(null);
      expect(getAddToCartState().addingProductId).toBeNull();
    });
  });
});
