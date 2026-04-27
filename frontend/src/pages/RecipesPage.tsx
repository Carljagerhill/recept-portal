import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { RecipeCard } from '../components/RecipeCard'
import { TagFilter } from '../components/TagFilter'
import { CATEGORIES } from '../types'

export function RecipesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { recipes, loading, error } = useRecipes({ search, category })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Recept</h1>
        <Link
          to="/recipes/new"
          className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
        >
          + Nytt recept
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Sök på titel eller beskrivning..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>
        <div className="pt-1 border-t border-gray-50">
          <TagFilter label="Kategori" options={CATEGORIES} value={category} onChange={setCategory} />
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-400">Laddar...</div>}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-600 text-sm">{error}</div>
      )}

      {!loading && recipes.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500">Inga recept hittades.</p>
        </div>
      )}

      {recipes.length > 0 && (
        <>
          <p className="text-sm text-gray-400">{recipes.length} recept</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </>
      )}
    </div>
  )
}
