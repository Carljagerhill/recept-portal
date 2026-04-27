import { Link } from 'react-router-dom'
import type { RecipeListItem } from '../types'

interface Props {
  recipe: RecipeListItem
}

export function RecipeCard({ recipe }: Props) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors">
          {recipe.title}
        </h3>
        {recipe.category && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
            {recipe.category}
          </span>
        )}
      </div>

      {recipe.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
      )}

      {recipe.cuisine && (
        <div className="flex items-center gap-1.5 mt-auto">
          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
            {recipe.cuisine}
          </span>
          {recipe.currentVersion > 1 && (
            <span className="text-xs text-gray-300 ml-auto">v{recipe.currentVersion}</span>
          )}
        </div>
      )}
    </Link>
  )
}
