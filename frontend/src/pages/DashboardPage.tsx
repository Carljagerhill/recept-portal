import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { RecipeCard } from '../components/RecipeCard'
import { useAuth } from '../context/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()
  const { recipes, loading, error } = useRecipes()

  const recent = recipes.slice(0, 6)
  const firstName = user?.email?.split('@')[0] ?? 'kock'

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-sm shadow-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">Välkommen tillbaka,</p>
            <h1 className="text-2xl font-bold">{firstName}</h1>
            <p className="text-green-200 text-sm mt-1">
              {recipes.length === 0
                ? 'Inga recept än — skapa ditt första!'
                : `${recipes.length} recept i ditt bibliotek`}
            </p>
          </div>
          <Link
            to="/recipes/new"
            className="bg-white text-green-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors shadow-sm"
          >
            + Nytt recept
          </Link>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-3">⏳</div>
          <p>Laddar recept...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {!loading && recipes.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🥘</div>
          <p className="text-lg font-medium text-gray-700 mb-1">Inga recept ännu</p>
          <p className="text-gray-400 text-sm mb-5">Börja bygga ditt receptbibliotek</p>
          <Link
            to="/recipes/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Skapa ditt första recept →
          </Link>
        </div>
      )}

      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Senaste recept</h2>
            {recipes.length > 6 && (
              <Link to="/recipes" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Visa alla {recipes.length} →
              </Link>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}
