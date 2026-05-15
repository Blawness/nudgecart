CREATE TYPE "public"."eco_label" AS ENUM('FRESH', 'ECONOMICAL', 'POPULAR');--> statement-breakpoint
CREATE TYPE "public"."lifestyle_type" AS ENUM('HEMAT', 'SEHAT', 'ECO');--> statement-breakpoint
CREATE TYPE "public"."nudge_context" AS ENUM('HOME', 'PRODUCT_DETAIL', 'CART', 'CHECKOUT', 'POST_PURCHASE');--> statement-breakpoint
CREATE TYPE "public"."nudge_event" AS ENUM('NUDGE_DISPLAYED', 'NUDGE_ACCEPTED', 'NUDGE_DISMISSED', 'ECO_PURCHASE', 'PROMO_PERSONAL_CLICK');--> statement-breakpoint
CREATE TYPE "public"."nudge_framing" AS ENUM('GAIN', 'LOSS', 'SOCIAL_NORM');--> statement-breakpoint
CREATE TYPE "public"."nudge_type" AS ENUM('JUST_IN_TIME', 'PRE_CHECKOUT', 'LAST_CHANCE', 'POST_PURCHASE', 'PROMO_PERSONAL', 'RECOMMENDATION');--> statement-breakpoint
CREATE TYPE "public"."shopping_frequency" AS ENUM('HARIAN', 'MINGGUAN', 'BULANAN');--> statement-breakpoint
CREATE TYPE "public"."social_norm_type" AS ENUM('WEEKLY_BUYERS', 'LOCAL_BUYERS');--> statement-breakpoint
CREATE TABLE "nudge_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nudge_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text NOT NULL,
	"nudge_type" "nudge_type" NOT NULL,
	"framing_type" "nudge_framing",
	"nudge_context" "nudge_context" NOT NULL,
	"product_id" uuid,
	"alternative_product_id" uuid,
	"event" "nudge_event" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"favorite_categories" text[] DEFAULT '{}' NOT NULL,
	"lifestyle_type" "lifestyle_type",
	"shopping_frequency" "shopping_frequency",
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"onboarding_skipped" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_eco_friendly" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "eco_label" "eco_label";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "eco_tooltip" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "social_norm_type" "social_norm_type";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "carbon_footprint" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "nudge_feedback" ADD CONSTRAINT "nudge_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudge_logs" ADD CONSTRAINT "nudge_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudge_logs" ADD CONSTRAINT "nudge_logs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudge_logs" ADD CONSTRAINT "nudge_logs_alternative_product_id_products_id_fk" FOREIGN KEY ("alternative_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;