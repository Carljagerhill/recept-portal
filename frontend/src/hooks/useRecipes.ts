import { useState, useEffect, useCallback } from 'react'
import { recipesApi, type RecipeFilters } from '../services/api'
import type { RecipeListItem, RecipeDetail } from '../types'

export function useRecipes(filters?: RecipeFilters) {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await recipesApi.list(filters)
      setRecipes(data)
    } catch {
      setError('Kunde inte ladda recept.')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { load() }, [load])

  return { recipes, loading, error, reload: load }
}

export function useRecipe(id: string) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    recipesApi.get(id)
      .then((data) => { if (!cancelled) setRecipe(data) })
      .catch(() => { if (!cancelled) setError('Kunde inte ladda recept.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  return { recipe, loading, error, setRecipe }
}
