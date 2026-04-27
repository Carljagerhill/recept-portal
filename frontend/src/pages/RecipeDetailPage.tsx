import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecipe } from '../hooks/useRecipes'
import { recipesApi } from '../services/api'
import { CostPanel } from '../components/CostPanel'
import { NutritionPanel } from '../components/NutritionPanel'
import { useAuth } from '../context/AuthContext'

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { recipe, loading, error } = useRecipe(id!)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (!recipe || !confirm(`Ta bort "${recipe.title}"?`)) return
    await recipesApi.delete(recipe.id)
    navigate('/recipes')
  }

  if (loading) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">⏳</div>
      <p>Laddar recept...</p>
    </div>
  )
  if (error || !recipe) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-600 text-sm">
      {error ?? 'Recept hittades inte.'}
    </div>
  )

  const isOwner = user?.id === recipe.createdBy

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <Link to="/recipes" className="text-sm text-green-600 hover:text-green-700 font-medium">
            ← Alla recept
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2 leading-tight">{recipe.title}</h1>

          <div className="flex flex-wrap gap-2 mt-3">
            {recipe.category && (
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                {recipe.category}
              </span>
            )}
            {recipe.cuisine && (
              <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full font-medium">
                {recipe.cuisine}
              </span>
            )}
            {recipe.currentVersion > 1 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                v{recipe.currentVersion}
              </span>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2 shrink-0">
            <Link
              to={`/recipes/${recipe.id}/edit`}
              className="text-sm border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700"
            >
              Redigera
            </Link>
            <Link
              to={`/recipes/${recipe.id}/versions`}
              className="text-sm border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700"
            >
              Versioner
            </Link>
            <button
              onClick={handleDelete}
              className="text-sm border border-red-100 text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition font-medium"
            >
              Ta bort
            </button>
          </div>
        )}
      </div>

      {recipe.description && (
        <p className="text-gray-600 text-base leading-relaxed">{recipe.description}</p>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🧂</span> Ingredienser
          </h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm">
                <span className="font-semibold text-gray-900 w-24 shrink-0 text-right tabular-nums">
                  {ing.quantity % 1 === 0 ? ing.quantity : +ing.quantity.toFixed(2)} {ing.unit}
                </span>
                <span className="text-gray-600">{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {recipe.steps.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Instruktioner
            </h2>
            <ol className="space-y-3">
              {recipe.steps.map((step) => (
                <li key={step.id} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {step.stepNumber}
                  </span>
                  <span className="text-gray-600 leading-relaxed pt-0.5">{step.instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <CostPanel recipeId={recipe.id} />
        {recipe.nutritionalInfo && <NutritionPanel info={recipe.nutritionalInfo} />}
      </div>
    </div>
  )
}
