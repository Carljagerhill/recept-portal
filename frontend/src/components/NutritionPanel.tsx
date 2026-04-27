import type { NutritionalInfo } from '../types'

export function NutritionPanel({ info }: { info: NutritionalInfo }) {
  const rows = [
    { label: 'Kalorier', value: info.caloriesPerServing, unit: 'kcal', emoji: '🔥' },
    { label: 'Protein', value: info.proteinG, unit: 'g', emoji: '💪' },
    { label: 'Kolhydrater', value: info.carbsG, unit: 'g', emoji: '🌾' },
    { label: 'Fett', value: info.fatG, unit: 'g', emoji: '🥑' },
    { label: 'Fibrer', value: info.fiberG, unit: 'g', emoji: '🌿' },
  ].filter((r) => r.value != null)

  if (rows.length === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <span>📊</span> Näringsvärde per portion
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="bg-white rounded-xl px-3 py-2.5 shadow-sm">
            <p className="text-xs text-blue-500 mb-0.5">{r.emoji} {r.label}</p>
            <p className="text-sm font-bold text-blue-900">{r.value} {r.unit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
