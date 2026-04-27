interface Props {
  label: string
  options: readonly string[]
  value: string
  onChange: (val: string) => void
}

export function TagFilter({ label, options, value, onChange }: Props) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onChange('')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
            value === ''
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Alla
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt === value ? '' : opt)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              opt === value
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
