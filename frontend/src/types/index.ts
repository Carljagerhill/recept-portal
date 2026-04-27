export interface RecipeListItem {
  id: string
  title: string
  description?: string
  servings: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert'
  category?: string
  cuisine?: string
  dietTags: string[]
  isPublic: boolean
  currentVersion: number
  createdBy: string
  createdAt: string
}

export interface RecipeDetail extends RecipeListItem {
  updatedAt: string
  ingredients: Ingredient[]
  steps: RecipeStep[]
  nutritionalInfo?: NutritionalInfo
}

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerUnit?: number
  sortOrder: number
}

export interface RecipeStep {
  id: string
  stepNumber: number
  instruction: string
}

export interface NutritionalInfo {
  caloriesPerServing?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  fiberG?: number
}

export interface ScaledRecipe {
  recipeId: string
  originalServings: number
  targetServings: number
  scaleFactor: number
  ingredients: ScaledIngredient[]
}

export interface ScaledIngredient {
  id: string
  name: string
  originalQuantity: number
  scaledQuantity: number
  unit: string
}

export interface CostResult {
  recipeId: string
  servings: number
  totalCost: number
  costPerServing: number
  breakdown: IngredientCost[]
}

export interface IngredientCost {
  name: string
  quantity: number
  unit: string
  pricePerUnit?: number
  totalCost?: number
}

export interface RecipeVersion {
  id: string
  versionNumber: number
  title: string
  description?: string
  servings: number
  changeNote?: string
  createdBy: string
  createdAt: string
  snapshot: unknown
}

export interface UnitConversionResult {
  originalValue: number
  fromUnit: string
  convertedValue: number
  toUnit: string
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Enkel',
  medium: 'Medel',
  hard: 'Svår',
  expert: 'Expert',
}

export const UNITS = ['g', 'kg', 'ml', 'dl', 'l', 'tsk', 'msk', 'krm', 'st'] as const

export const UNIT_LABELS: Record<string, string> = {
  g: 'gram (g)',
  kg: 'kilogram (kg)',
  ml: 'milliliter (ml)',
  dl: 'deciliter (dl)',
  l: 'liter (l)',
  tsk: 'tesked (tsk)',
  msk: 'matsked (msk)',
  krm: 'kryddmått (krm)',
  st: 'styck (st)',
}

export const CATEGORIES = [
  'förrätt', 'huvudrätt', 'dessert', 'tillbehör', 'övrigt',
]
