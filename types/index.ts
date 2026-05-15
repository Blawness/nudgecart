export type UserRole = "BUYER" | "MERCHANT" | "ADMIN";

export type MerchantStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "BANK_TRANSFER" | "COD";

export type EcoLabel = "FRESH" | "ECONOMICAL" | "POPULAR";

export type SocialNormType = "WEEKLY_BUYERS" | "LOCAL_BUYERS";

export type LifestyleType = "HEMAT" | "SEHAT" | "ECO";

export type ShoppingFrequency = "HARIAN" | "MINGGUAN" | "BULANAN";

export type NudgeType =
  | "JUST_IN_TIME"
  | "PRE_CHECKOUT"
  | "LAST_CHANCE"
  | "POST_PURCHASE"
  | "PROMO_PERSONAL"
  | "RECOMMENDATION";

export type NudgeFraming = "GAIN" | "LOSS" | "SOCIAL_NORM";

export type NudgeContext =
  | "HOME"
  | "PRODUCT_DETAIL"
  | "CART"
  | "CHECKOUT"
  | "POST_PURCHASE";

export type NudgeEvent =
  | "NUDGE_DISPLAYED"
  | "NUDGE_ACCEPTED"
  | "NUDGE_DISMISSED"
  | "ECO_PURCHASE"
  | "PROMO_PERSONAL_CLICK";

export interface UserPreference {
  id: string;
  userId: string;
  favoriteCategories: string[];
  lifestyleType: LifestyleType | null;
  shoppingFrequency: ShoppingFrequency | null;
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
}

export interface NudgeLog {
  id: string;
  userId: string;
  sessionId: string;
  nudgeType: NudgeType;
  framingType: NudgeFraming | null;
  nudgeContext: NudgeContext;
  productId: string | null;
  alternativeProductId: string | null;
  event: NudgeEvent;
  createdAt: string;
}

export interface NudgeFeedback {
  id: string;
  userId: string;
  sessionId: string;
  rating: number;
  createdAt: string;
}

export interface NudgeDecision {
  shouldShow: boolean;
  nudgeType: NudgeType | null;
  framingType: NudgeFraming | null;
  content: {
    headline: string;
    body: string;
    ctaText: string;
    alternativeProduct?: {
      id: string;
      name: string;
      slug: string;
      price: number;
      imageUrl: string;
    };
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
}
