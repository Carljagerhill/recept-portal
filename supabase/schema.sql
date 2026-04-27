-- RecipeApp Supabase Schema
-- Run this in the Supabase SQL editor (https://app.supabase.com → SQL Editor)

-- ─────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 4 CHECK (servings > 0),
  prep_time_minutes INTEGER CHECK (prep_time_minutes >= 0),
  cook_time_minutes INTEGER CHECK (cook_time_minutes >= 0),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  category TEXT,
  cuisine TEXT,
  diet_tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL,
  change_note TEXT,
  snapshot JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recipe_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  price_per_unit DECIMAL CHECK (price_per_unit >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number > 0),
  instruction TEXT NOT NULL,
  UNIQUE (recipe_id, step_number)
);

CREATE TABLE IF NOT EXISTS public.nutritional_info (
  recipe_id UUID PRIMARY KEY REFERENCES public.recipes(id) ON DELETE CASCADE,
  calories_per_serving DECIMAL CHECK (calories_per_serving >= 0),
  protein_g DECIMAL CHECK (protein_g >= 0),
  carbs_g DECIMAL CHECK (carbs_g >= 0),
  fat_g DECIMAL CHECK (fat_g >= 0),
  fiber_g DECIMAL CHECK (fiber_g >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON public.recipes(created_by);
CREATE INDEX IF NOT EXISTS idx_recipes_team_id ON public.recipes(team_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON public.recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON public.ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON public.recipe_steps(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe_id ON public.recipe_versions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- ─────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_info ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is a team member
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user can access a recipe
CREATE OR REPLACE FUNCTION public.can_access_recipe(p_recipe_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = p_recipe_id
      AND (r.is_public OR r.created_by = auth.uid() OR public.is_team_member(r.team_id))
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop existing policies to allow re-running this script
DROP POLICY IF EXISTS "team_members_can_view" ON public.teams;
DROP POLICY IF EXISTS "authenticated_can_create_team" ON public.teams;
DROP POLICY IF EXISTS "owner_can_delete_team" ON public.teams;
DROP POLICY IF EXISTS "team_members_can_view_members" ON public.team_members;
DROP POLICY IF EXISTS "owner_can_manage_members" ON public.team_members;
DROP POLICY IF EXISTS "self_can_leave" ON public.team_members;
DROP POLICY IF EXISTS "recipes_select" ON public.recipes;
DROP POLICY IF EXISTS "recipes_insert" ON public.recipes;
DROP POLICY IF EXISTS "recipes_update" ON public.recipes;
DROP POLICY IF EXISTS "recipes_delete" ON public.recipes;
DROP POLICY IF EXISTS "ingredients_select" ON public.ingredients;
DROP POLICY IF EXISTS "ingredients_write" ON public.ingredients;
DROP POLICY IF EXISTS "steps_select" ON public.recipe_steps;
DROP POLICY IF EXISTS "steps_write" ON public.recipe_steps;
DROP POLICY IF EXISTS "versions_select" ON public.recipe_versions;
DROP POLICY IF EXISTS "versions_insert" ON public.recipe_versions;
DROP POLICY IF EXISTS "nutrition_select" ON public.nutritional_info;
DROP POLICY IF EXISTS "nutrition_write" ON public.nutritional_info;

-- Teams policies
CREATE POLICY "team_members_can_view" ON public.teams
  FOR SELECT USING (public.is_team_member(id));

CREATE POLICY "authenticated_can_create_team" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "owner_can_delete_team" ON public.teams
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE team_id = id AND user_id = auth.uid() AND role = 'owner')
  );

-- Team members policies
CREATE POLICY "team_members_can_view_members" ON public.team_members
  FOR SELECT USING (public.is_team_member(team_id));

CREATE POLICY "owner_can_manage_members" ON public.team_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "self_can_leave" ON public.team_members
  FOR DELETE USING (user_id = auth.uid());

-- Recipes policies
CREATE POLICY "recipes_select" ON public.recipes
  FOR SELECT USING (is_public OR created_by = auth.uid() OR public.is_team_member(team_id));

CREATE POLICY "recipes_insert" ON public.recipes
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "recipes_update" ON public.recipes
  FOR UPDATE USING (created_by = auth.uid() OR public.is_team_member(team_id));

CREATE POLICY "recipes_delete" ON public.recipes
  FOR DELETE USING (created_by = auth.uid());

-- Ingredients / steps / versions / nutrition inherit recipe access
CREATE POLICY "ingredients_select" ON public.ingredients
  FOR SELECT USING (public.can_access_recipe(recipe_id));
CREATE POLICY "ingredients_write" ON public.ingredients
  FOR ALL USING (public.can_access_recipe(recipe_id));

CREATE POLICY "steps_select" ON public.recipe_steps
  FOR SELECT USING (public.can_access_recipe(recipe_id));
CREATE POLICY "steps_write" ON public.recipe_steps
  FOR ALL USING (public.can_access_recipe(recipe_id));

CREATE POLICY "versions_select" ON public.recipe_versions
  FOR SELECT USING (public.can_access_recipe(recipe_id));
CREATE POLICY "versions_insert" ON public.recipe_versions
  FOR INSERT WITH CHECK (public.can_access_recipe(recipe_id));

CREATE POLICY "nutrition_select" ON public.nutritional_info
  FOR SELECT USING (public.can_access_recipe(recipe_id));
CREATE POLICY "nutrition_write" ON public.nutritional_info
  FOR ALL USING (public.can_access_recipe(recipe_id));
