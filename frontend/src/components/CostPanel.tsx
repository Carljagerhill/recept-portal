import { useState, useEffect } from 'react'
import { recipesApi } from '../services/api'
import type { CostResult } from '../types'

export function CostPanel({ recipeId }: { recipeId: string }) {
  const [cost, setCost] = useState<CostResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recipesApi.cost(recipeId)
      .then(setCost)
      .catch(() => setCost(null))
      .finally(() => setLoading(false))
  }, [recipeId])

  if (loading) return (
    <div className="text-sm text-gray-400 py-2">Beräknar kostnad...</div>
  )

  if (!cost || cost.totalCost === 0) return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
      <p className="text-sm text-amber-700">
        💡 Fyll i pris per enhet på ingredienserna för att se kostnadsberäkning.
      </p>
    </div>
  )

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-4">
      <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
        <span>💰</span> Kostnad
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm">
          <p className="text-xs text-amber-600 mb-1">Totalt</p>
          <p className="text-lg font-bold text-amber-900">{cost.totalCost.toFixed(2)} kr</p>
        </div>
        <div className="bg-amber-500 rounded-xl px-4 py-3 text-center shadow-sm">
          <p className="text-xs text-amber-100 mb-1">Per portion</p>
          <p className="text-lg font-bold text-white">{cost.costPerServing.toFixed(2)} kr</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {cost.breakdown
          .filter((b) => b.totalCost != null)
          .map((b) => (
            <div key={b.name} className="flex justify-between text-xs text-amber-800">
              <span>{b.name} <span className="text-amber-500">({b.quantity} {b.unit})</span></span>
              <span className="font-medium">{b.totalCost!.toFixed(2)} kr</span>
            </div>
          ))}
      </div>
    </div>
  )
}
