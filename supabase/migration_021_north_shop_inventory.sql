-- ==============================================================
-- Migration 021: North Shop Inventory (products, variants, orders)
-- ==============================================================
-- Backs the /payment-test shop with real inventory instead of the static
-- north-shop-products.ts catalog: real per-variant stock counts, an admin
-- CRUD page to manage them, and order records that get created on checkout
-- and decremented/finalized when North (EPX) returns a payment result.

-- ── Products ──
CREATE TABLE IF NOT EXISTS public.north_shop_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('Shirts', 'Albums', 'Hats')),
  variant_kind TEXT NOT NULL CHECK (variant_kind IN ('Size', 'Format', 'Color')),
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Variants (one row per size/format/color) ──
CREATE TABLE IF NOT EXISTS public.north_shop_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.north_shop_products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_north_shop_variants_product_id
  ON public.north_shop_variants (product_id);

-- ── Orders (created pending at checkout, finalized on payment result) ──
CREATE TABLE IF NOT EXISTS public.north_shop_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tran_nbr TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  line_items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  auth_resp TEXT,
  auth_resp_text TEXT,
  masked_account_nbr TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_north_shop_orders_tran_nbr
  ON public.north_shop_orders (tran_nbr);
CREATE INDEX IF NOT EXISTS idx_north_shop_orders_created_at
  ON public.north_shop_orders (created_at DESC);

-- Locked down: service role only (server-side API routes). No anon access —
-- the public product list is served through our own API route, which uses
-- the service role key, not direct client-side Supabase reads.
ALTER TABLE public.north_shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.north_shop_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.north_shop_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON public.north_shop_products;
DROP POLICY IF EXISTS "Service role only" ON public.north_shop_variants;
DROP POLICY IF EXISTS "Service role only" ON public.north_shop_orders;

-- ── Seed data, ported from src/data/north-shop-products.ts ──
DO $$
DECLARE
  p_id UUID;
BEGIN
  -- Skip seeding if products already exist (safe to re-run this migration).
  IF EXISTS (SELECT 1 FROM public.north_shop_products LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO public.north_shop_products (slug, title, description, image_url, category, variant_kind, sort_order)
  VALUES ('logo-tee', 'Official 7th Heaven Logo Tee', '100% ring-spun cotton crewneck tee with the classic band crest.', '/images/merch/logo-tee.png', 'Shirts', 'Size', 1)
  RETURNING id INTO p_id;
  INSERT INTO public.north_shop_variants (product_id, label, price, stock_quantity, sort_order) VALUES
    (p_id, 'S', 35, 20, 1), (p_id, 'M', 35, 20, 2), (p_id, 'L', 35, 20, 3),
    (p_id, 'XL', 35, 20, 4), (p_id, '2XL', 38, 15, 5);

  INSERT INTO public.north_shop_products (slug, title, description, image_url, category, variant_kind, sort_order)
  VALUES ('tour-hoodie', '2026 Tour Hoodie', 'Ultra-heavyweight fleece hoodie with tour dates printed on the back.', '/images/merch/hoodie.png', 'Shirts', 'Size', 2)
  RETURNING id INTO p_id;
  INSERT INTO public.north_shop_variants (product_id, label, price, stock_quantity, sort_order) VALUES
    (p_id, 'S', 65, 15, 1), (p_id, 'M', 65, 15, 2), (p_id, 'L', 65, 15, 3),
    (p_id, 'XL', 65, 15, 4), (p_id, '2XL', 68, 10, 5);

  INSERT INTO public.north_shop_products (slug, title, description, image_url, category, variant_kind, sort_order)
  VALUES ('color-in-motion', 'Color in Motion', 'The album that put 7th Heaven on the map. Pick your format.', '/images/album/colot-in-motion.png', 'Albums', 'Format', 3)
  RETURNING id INTO p_id;
  INSERT INTO public.north_shop_variants (product_id, label, price, stock_quantity, sort_order) VALUES
    (p_id, 'Vinyl LP', 30, 25, 1), (p_id, 'CD', 18, 40, 2), (p_id, 'Cassette', 15, 10, 3);

  INSERT INTO public.north_shop_products (slug, title, description, image_url, category, variant_kind, sort_order)
  VALUES ('be-here', 'Be Here', 'Fan-favorite release, remastered. Pick your format.', '/images/album/Be-Here.png', 'Albums', 'Format', 4)
  RETURNING id INTO p_id;
  INSERT INTO public.north_shop_variants (product_id, label, price, stock_quantity, sort_order) VALUES
    (p_id, 'Vinyl LP', 30, 25, 1), (p_id, 'CD', 18, 40, 2);

  INSERT INTO public.north_shop_products (slug, title, description, image_url, category, variant_kind, sort_order)
  VALUES ('luminous', 'Luminous', 'The latest studio record. Pick your format.', '/images/album/luminous.png', 'Albums', 'Format', 5)
  RETURNING id INTO p_id;
  INSERT INTO public.north_shop_variants (product_id, label, price, stock_quantity, sort_order) VALUES
    (p_id, 'Vinyl LP', 32, 25, 1), (p_id, 'CD', 18, 40, 2);

  INSERT INTO public.north_shop_products (slug, title, description, image_url, category, variant_kind, sort_order)
  VALUES ('snapback', '7th Heaven Snapback', 'Structured 6-panel snapback with embroidered logo.', '/images/merch/hoodie.png', 'Hats', 'Color', 6)
  RETURNING id INTO p_id;
  INSERT INTO public.north_shop_variants (product_id, label, price, stock_quantity, sort_order) VALUES
    (p_id, 'Black', 28, 20, 1), (p_id, 'Cyan', 28, 20, 2), (p_id, 'Purple', 28, 20, 3);

  INSERT INTO public.north_shop_products (slug, title, description, image_url, category, variant_kind, sort_order)
  VALUES ('dad-hat', 'Tour Dad Hat', 'Unstructured low-profile dad hat, adjustable strap.', '/images/merch/logo-tee.png', 'Hats', 'Color', 7)
  RETURNING id INTO p_id;
  INSERT INTO public.north_shop_variants (product_id, label, price, stock_quantity, sort_order) VALUES
    (p_id, 'Black', 25, 20, 1), (p_id, 'Stone', 25, 20, 2);
END $$;
