import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { recipesApi, ingredientsApi, versionsApi } from '../services/api'
import type { RecipeDetail } from '../types'
import { UNITS, CATEGORIES } from '../types'

interface FormData {
  title: string
  description: string
  cuisine: string
  category: string
  changeNote: string
  ingredients: { name: string; quantity: number; unit: string; pricePerUnit: number | ''; sortOrder: number }[]
}

const CUISINES = ['svensk', 'italiensk', 'asiatisk', 'mexikansk', 'fransk', 'mellanöstern', 'indisk', 'japansk', 'övrig']

const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

export function RecipeFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      cuisine: '',
      category: '',
      changeNote: '',
      ingredients: [{ name: '', quantity: 1, unit: 'g', pricePerUnit: '', sortOrder: 0 }],
    },
  })

  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({ control, name: 'ingredients' })

  useEffect(() => {
    if (!isEdit || !id) return
    recipesApi.get(id).then((r: RecipeDetail) => {
      reset({
        title: r.title,
        description: r.description ?? '',
        cuisine: r.cuisine ?? '',
        category: r.category ?? '',
        changeNote: '',
        ingredients: r.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          pricePerUnit: i.pricePerUnit ?? '',
          sortOrder: i.sortOrder,
        })),
      })
    })
  }, [id, isEdit, reset])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: data.title,
        description: data.description || undefined,
        servings: 4,
        cuisine: data.cuisine || undefined,
        category: data.category || undefined,
        dietTags: [],
        isPublic: false,
      }

      let recipeId: string

      if (isEdit && id) {
        await recipesApi.update(id, { ...payload, changeNote: data.changeNote || undefined })
        recipeId = id

        const existing = await recipesApi.get(id)
        for (const ing of existing.ingredients) await ingredientsApi.delete(id, ing.id)

        if (data.changeNote) await versionsApi.create(id, data.changeNote)
      } else {
        const recipe = await recipesApi.create(payload)
        recipeId = recipe.id
      }

      for (let i = 0; i < data.ingredients.length; i++) {
        const ing = data.ingredients[i]
        if (!ing.name) continue
        await ingredientsApi.create(recipeId, {
          name: ing.name,
          quantity: Number(ing.quantity),
          unit: ing.unit,
          pricePerUnit: ing.pricePerUnit !== '' ? Number(ing.pricePerUnit) : undefined,
          sortOrder: i,
        })
      }

      navigate(`/recipes/${recipeId}`)
    } catch {
      setError('Kunde inte spara receptet. Försök igen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to={isEdit && id ? `/recipes/${id}` : '/recipes'} className="text-sm text-green-600 hover:text-green-700 font-medium">
          ← Tillbaka
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEdit ? 'Redigera recept' : 'Nytt recept'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Grundinfo</h2>

          <div>
            <label className={labelCls}>Titel *</label>
            <input
              {...register('title', { required: true })}
              placeholder="Receptets namn"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Beskrivning</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Beskriv receptet kort..."
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kategori</label>
              <select {...register('category')} className={inputCls}>
                <option value="">Välj kategori...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Kök</label>
              <select {...register('cuisine')} className={inputCls}>
                <option value="">Välj kök...</option>
                {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ingredienser</h2>

          <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_24px] gap-2 text-xs font-medium text-gray-400 px-0.5">
            <span>Namn</span>
            <span>Mängd</span>
            <span>Enhet</span>
            <span>Pris/enhet</span>
            <span />
          </div>

          {ingFields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_80px_80px_100px_24px] gap-2 items-center">
              <input
                {...register(`ingredients.${i}.name`)}
                placeholder="Ingrediens"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
              <input
                type="number"
                step="any"
                min={0}
                {...register(`ingredients.${i}.quantity`)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-center"
              />
              <select
                {...register(`ingredients.${i}.unit`)}
                className="border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <input
                type="number"
                step="any"
                min={0}
                {...register(`ingredients.${i}.pricePerUnit`)}
                placeholder="kr"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => removeIng(i)}
                className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition text-lg leading-none rounded-full hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendIng({ name: '', quantity: 1, unit: 'g', pricePerUnit: '', sortOrder: ingFields.length })}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1.5 mt-1"
          >
            <span className="text-lg leading-none">+</span> Lägg till ingrediens
          </button>
        </div>

        {isEdit && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className={labelCls}>
              Ändringskommentar <span className="text-gray-400 font-normal">(sparar ny version)</span>
            </label>
            <input
              {...register('changeNote')}
              placeholder="Beskriv vad som ändrades..."
              className={inputCls}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pb-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 active:bg-green-800 disabled:opacity-50 transition-colors shadow-sm shadow-green-200"
          >
            {saving ? 'Sparar...' : isEdit ? 'Spara ändringar' : 'Skapa recept'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border border-gray-200 px-6 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  )
}
