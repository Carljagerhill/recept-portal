interface Props {
  originalServings: number
  targetServings: number
  onChange: (servings: number) => void
}

export function ServingsScaler({ originalServings, targetServings, onChange }: Props) {
  const isScaled = targetServings !== originalServings

  return (
    <div>
      <div className="flex items-center gap-1 mb-3">
        <span className="text-sm font-semibold text-gray-700">Portioner</span>
        {isScaled && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-2">
            skalat från {originalServings}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, targetServings - 1))}
          className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 flex items-center justify-center transition text-lg leading-none"
        >
          −
        </button>

        <input
          type="number"
          min={1}
          max={200}
          value={targetServings}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-center border border-gray-200 rounded-xl px-2 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />

        <button
          onClick={() => onChange(targetServings + 1)}
          className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 flex items-center justify-center transition text-lg leading-none"
        >
          +
        </button>

        {isScaled && (
          <button
            onClick={() => onChange(originalServings)}
            className="text-xs text-green-600 hover:text-green-700 font-medium ml-1 underline underline-offset-2"
          >
            Återställ
          </button>
        )}
      </div>
    </div>
  )
}
