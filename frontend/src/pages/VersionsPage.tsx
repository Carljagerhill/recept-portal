import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { versionsApi } from '../services/api'
import type { RecipeVersion } from '../types'

export function VersionsPage() {
  const { id } = useParams<{ id: string }>()
  const [versions, setVersions] = useState<RecipeVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    versionsApi.list(id)
      .then(setVersions)
      .finally(() => setLoading(false))
  }, [id])

  const createVersion = async () => {
    if (!id) return
    const note = prompt('Beskriv vad som ändrades (valfritt):')
    setSaving(true)
    try {
      const v = await versionsApi.create(id, note ?? undefined)
      setVersions([v, ...versions])
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">⏳</div>
      <p>Laddar versioner...</p>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/recipes/${id}`} className="text-sm text-green-600 hover:text-green-700 font-medium">
            ← Tillbaka till recept
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Versionshistorik</h1>
        </div>
        <button
          onClick={createVersion}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm shadow-green-200"
        >
          {saving ? 'Sparar...' : 'Spara version'}
        </button>
      </div>

      {versions.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500">Inga versioner sparade ännu.</p>
          <p className="text-gray-400 text-sm mt-1">Klicka "Spara version" för att ta en snapshot av nuvarande recept.</p>
        </div>
      )}

      <div className="space-y-3">
        {versions.map((v, idx) => (
          <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded-lg font-semibold">
                    v{v.versionNumber}
                  </span>
                  {idx === 0 && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-medium">senaste</span>
                  )}
                  <span className="text-sm font-medium text-gray-900">{v.title}</span>
                </div>
                {v.changeNote && (
                  <p className="text-sm text-gray-500">{v.changeNote}</p>
                )}
              </div>
              <div className="text-xs text-gray-400 shrink-0">
                {new Date(v.createdAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <button
              onClick={() => setExpanded(expanded === v.id ? null : v.id)}
              className="text-xs text-green-600 hover:text-green-700 mt-3 font-medium flex items-center gap-1"
            >
              {expanded === v.id ? '▲ Dölj snapshot' : '▼ Visa snapshot'}
            </button>
            {expanded === v.id && (
              <pre className="mt-3 text-xs bg-gray-50 rounded-xl p-4 overflow-auto max-h-64 text-gray-500 border border-gray-100">
                {JSON.stringify(v.snapshot, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
