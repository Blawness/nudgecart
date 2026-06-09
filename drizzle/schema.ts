import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  decimal,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["BUYER", "MERCHANT", "ADMIN"]);
export const merchantStatusEnum = pgEnum("merchant_status", [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "BANK_TRANSFER",
  "COD",
]);

export const ecoLabelEnum = pgEnum("eco_label", [
  "FRESH",
  "ECONOMICAL",
  "POPULAR",
]);
export const socialNormTypeEnum = pgEnum("social_norm_type", [
  "WEEKLY_BUYERS",
  "LOCAL_BUYERS",
]);
export const lifestyleTypeEnum = pgEnum("lifestyle_type", [
  "HEMAT",
  "SEHAT",
  "ECO",
]);
export const shoppingFrequencyEnum = pgEnum("shopping_frequency", [
  "HARIAN",
  "MINGGUAN",
  "BULANAN",
]);
export const nudgeTypeEnum = pgEnum("nudge_type", [
  "JUST_IN_TIME",
  "PRE_CHECKOUT",
  "LAST_CHANCE",
  "POST_PURCHASE",
  "PROMO_PERSONAL",
  "RECOMMENDATION",
]);
export const nudgeFramingEnum = pgEnum("nudge_framing", [
  "GAIN",
  "LOSS",
  "SOCIAL_NORM",
]);
export const nudgeContextEnum = pgEnum("nudge_context", [
  "HOME",
  "PRODUCT_DETAIL",
  "CART",
  "CHECKOUT",
  "POST_PURCHASE",
]);
export const nudgeEventEnum = pgEnum("nudge_event", [
  "NUDGE_DISPLAYED",
  "NUDGE_ACCEPTED",
  "NUDGE_DISMISSED",
  "ECO_PURCHASE",
  "PROMO_PERSONAL_CLICK",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("BUYER"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  recipientName: text("recipient_name").notNull(),
  phone: text("phone").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const merchants = pgTable("merchants", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  storeName: text("store_name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  status: merchantStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const banners = pgTable("banners", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  link: text("link").default("/promo"),
  bgColor: text("bg_color").default("#dc2626"),
  textColor: text("text_color").default("#ffffff"),
  order: integer("order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    stock: integer("stock").notNull().default(0),
    isActive: boolean("is_active").default(true).notNull(),
    isEcoFriendly: boolean("is_eco_friendly").default(false).notNull(),
    ecoLabel: ecoLabelEnum("eco_label"),
    ecoTooltip: text("eco_tooltip"),
    socialNormType: socialNormTypeEnum("social_norm_type"),
    carbonFootprint: decimal("carbon_footprint", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("products_name_idx").on(table.name),
    categoryIdx: index("products_category_idx").on(table.categoryId),
    merchantIdx: index("products_merchant_idx").on(table.merchantId),
  })
);

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  order: integer("order").default(0).notNull(),
});

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  bundleId: text("bundle_id"),
  bundleName: text("bundle_name"),
  bundleType: text("bundle_type"),
  bundlePrice: integer("bundle_price"),
  bundleNormalTotal: integer("bundle_normal_total"),
  bundleItems: text("bundle_items").array(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id),
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id),
  status: orderStatusEnum("status").notNull().default("PENDING_PAYMENT"),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull().default(10000),
  total: integer("total").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productName: text("product_name").notNull(),
  productPrice: integer("product_price").notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  favoriteCategories: text("favorite_categories").array().notNull().default([]),
  lifestyleType: lifestyleTypeEnum("lifestyle_type"),
  shoppingFrequency: shoppingFrequencyEnum("shopping_frequency"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  onboardingSkipped: boolean("onboarding_skipped").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const nudgeLogs = pgTable("nudge_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  nudgeType: nudgeTypeEnum("nudge_type").notNull(),
  framingType: nudgeFramingEnum("framing_type"),
  nudgeContext: nudgeContextEnum("nudge_context").notNull(),
  productId: uuid("product_id").references(() => products.id),
  alternativeProductId: uuid("alternative_product_id").references(
    () => products.id
  ),
  event: nudgeEventEnum("event").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nudgeFeedback = pgTable("nudge_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
