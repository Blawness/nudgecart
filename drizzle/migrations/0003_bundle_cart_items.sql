ALTER TABLE "cart_items" ADD COLUMN "bundle_id" text;
ALTER TABLE "cart_items" ADD COLUMN "bundle_name" text;
ALTER TABLE "cart_items" ADD COLUMN "bundle_type" text;
ALTER TABLE "cart_items" ADD COLUMN "bundle_price" integer;
ALTER TABLE "cart_items" ADD COLUMN "bundle_normal_total" integer;
ALTER TABLE "cart_items" ADD COLUMN "bundle_items" text[];
