import axios from 'axios'
import { supabase } from './supabase'
import type {
  RecipeListItem,
  RecipeDetail,
  Ingredient,
  RecipeStep,
  NutritionalInfo,
  ScaledRecipe,
  CostResult,
  RecipeVersion,
  UnitConversionResult,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
})

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Recipes ────────────────────────────────────────────────

export interface RecipeFilters {
  category?: string
  cuisine?: string
  difficulty?: string
  diet?: string
  search?: string
}

export interface CreateRecipePayload {
  title: string
  description?: string
  servings: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  difficulty?: string
  category?: string
  cuisine?: string
  dietTags?: string[]
  teamId?: string
  isPublic: boolean
}

export const recipesApi = {
  list: (filters?: RecipeFilters) =>
    api.get<RecipeListItem[]>('/api/recipes', { params: filters }).then((r) => r.data),

  get: (id: string) =>
    api.get<RecipeDetail>(`/api/recipes/${id}`).then((r) => r.data),

  create: (payload: CreateRecipePayload) =>
    api.post<RecipeDetail>('/api/recipes', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateRecipePayload> & { changeNote?: string }) =>
    api.put<RecipeDetail>(`/api/recipes/${id}`, payload).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/recipes/${id}`),

  scale: (id: string, servings: number) =>
    api.get<ScaledRecipe>(`/api/recipes/${id}/scale`, { params: { servings } }).then((r) => r.data),

  cost: (id: string) =>
    api.get<CostResult>(`/api/recipes/${id}/cost`).then((r) => r.data),
}

// ─── Ingredients ────────────────────────────────────────────

export interface IngredientPayload {
  name: string
  quantity: number
  unit: string
  pricePerUnit?: number
  sortOrder: number
}

export const ingredientsApi = {
  list: (recipeId: string) =>
    api.get<Ingredient[]>(`/api/recipes/${recipeId}/ingredients`).then((r) => r.data),

  create: (recipeId: string, payload: IngredientPayload) =>
    api.post<Ingredient>(`/api/recipes/${recipeId}/ingredients`, payload).then((r) => r.data),

  update: (recipeId: string, id: string, payload: IngredientPayload) =>
    api.put<Ingredient>(`/api/recipes/${recipeId}/ingredients/${id}`, payload).then((r) => r.data),

  delete: (recipeId: string, id: string) =>
    api.delete(`/api/recipes/${recipeId}/ingredients/${id}`),
}

// ─── Steps ──────────────────────────────────────────────────

export interface StepPayload {
  stepNumber: number
  instruction: string
}

export const stepsApi = {
  list: (recipeId: string) =>
    api.get<RecipeStep[]>(`/api/recipes/${recipeId}/steps`).then((r) => r.data),

  create: (recipeId: string, payload: StepPayload) =>
    api.post<RecipeStep>(`/api/recipes/${recipeId}/steps`, payload).then((r) => r.data),

  update: (recipeId: string, id: string, payload: StepPayload) =>
    api.put<RecipeStep>(`/api/recipes/${recipeId}/steps/${id}`, payload).then((r) => r.data),

  delete: (recipeId: string, id: string) =>
    api.delete(`/api/recipes/${recipeId}/steps/${id}`),
}

// ─── Nutrition ──────────────────────────────────────────────

export const nutritionApi = {
  get: (recipeId: string) =>
    api.get<NutritionalInfo>(`/api/recipes/${recipeId}/nutrition`).then((r) => r.data),

  upsert: (recipeId: string, payload: NutritionalInfo) =>
    api.put<NutritionalInfo>(`/api/recipes/${recipeId}/nutrition`, payload).then((r) => r.data),
}

// ─── Versions ───────────────────────────────────────────────

export const versionsApi = {
  list: (recipeId: string) =>
    api.get<RecipeVersion[]>(`/api/recipes/${recipeId}/versions`).then((r) => r.data),

  create: (recipeId: string, changeNote?: string) =>
    api.post<RecipeVersion>(`/api/recipes/${recipeId}/versions`, { changeNote }).then((r) => r.data),
}

// ─── Units ──────────────────────────────────────────────────

export const unitsApi = {
  convert: (value: number, from: string, to: string) =>
    api
      .get<UnitConversionResult>('/api/units/convert', { params: { value, from, to } })
      .then((r) => r.data),

  list: () => api.get<string[]>('/api/units').then((r) => r.data),
}
