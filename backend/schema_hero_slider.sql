-- =========================================================
-- HERO SLIDER IMAGES - DATABASE SCHEMA & RLS POLICIES
-- =========================================================

-- Create hero_slider_images Table
CREATE TABLE IF NOT EXISTS public.hero_slider_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.hero_slider_images ENABLE ROW LEVEL SECURITY;

-- Create Public Read Policy
DROP POLICY IF EXISTS "Public hero_slider_images read policy" ON public.hero_slider_images;
CREATE POLICY "Public hero_slider_images read policy" ON public.hero_slider_images FOR SELECT USING (true);

-- Create Admin Full Write Policy
DROP POLICY IF EXISTS "Admin full hero_slider_images access" ON public.hero_slider_images;
CREATE POLICY "Admin full hero_slider_images access" ON public.hero_slider_images FOR ALL USING (true) WITH CHECK (true);
