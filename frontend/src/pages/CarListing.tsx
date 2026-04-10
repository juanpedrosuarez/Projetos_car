import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import CarCard from '../components/ui/CarCard'
import api from '../lib/api'

interface Car {
  id: string
  name: string
  brand: string
  year: number
  category: string
  transmission: string
  fuel: string
  seats: number
  pricePerDay: number
  rating: number
  reviewCount: number
  images: string[]
  city: string
  state: string
}

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'SUV', label: 'SUV' },
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'ESPORTIVO', label: 'Esportivo' },
  { value: 'ECONOMICO', label: 'Econômico' },
  { value: 'HATCH', label: 'Hatch' },
  { value: 'PICKUP', label: 'Pickup' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
]

export default function CarListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cars, setCars] = useState<Car[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'recent',
    page: Number(searchParams.get('page') || '1'),
  })

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
      const { data } = await api.get(`/cars?${params.toString()}`)
      setCars(data.cars)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchCars()
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v && !(k === 'page' && v === 1)) params.set(k, String(v)) })
    setSearchParams(params, { replace: true })
  }, [filters, fetchCars, setSearchParams])

  const updateFilter = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : Number(value) }))
  }

  const clearFilters = () => {
    setFilters({ city: '', category: '', minPrice: '', maxPrice: '', sortBy: 'recent', page: 1 })
  }

  const activeFiltersCount = [filters.city, filters.category, filters.minPrice, filters.maxPrice]
    .filter(Boolean).length

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {filters.city ? `Carros em ${filters.city}` : 'Explorar carros'}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {loading ? 'Buscando...' : `${total} veículos encontrados`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative hidden sm:block">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="input-dark text-sm pr-8 appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
            {/* Filter toggle mobile */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 btn-outline text-sm py-2.5 px-4"
            >
              <SlidersHorizontal size={15} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`${filtersOpen ? 'flex' : 'hidden'} lg:flex flex-col gap-5 w-64 shrink-0`}>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white text-sm">Filtros</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-gold hover:underline flex items-center gap-1">
                    <X size={12} /> Limpar tudo
                  </button>
                )}
              </div>

              {/* City */}
              <div className="mb-4">
                <label className="text-xs font-medium text-white/60 mb-2 block">Cidade</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                  className="input-dark text-sm"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-xs font-medium text-white/60 mb-2 block">Categoria</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateFilter('category', value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        filters.category === value
                          ? 'bg-gold text-black border-gold font-medium'
                          : 'border-dark-border text-white/50 hover:border-gold/40 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-4">
                <label className="text-xs font-medium text-white/60 mb-2 block">Preço por dia</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="input-dark text-sm"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="input-dark text-sm"
                    min="0"
                  />
                </div>
              </div>

              {/* Sort mobile */}
              <div className="sm:hidden">
                <label className="text-xs font-medium text-white/60 mb-2 block">Ordenar por</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="input-dark text-sm"
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Cars grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card-dark">
                    <div className="aspect-[16/9] bg-dark-surface animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-dark-surface rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-dark-surface rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🚗</div>
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum carro encontrado</h3>
                <p className="text-white/40 text-sm mb-4">Tente ajustar os filtros de busca.</p>
                <button onClick={clearFilters} className="btn-gold text-sm py-2.5 px-5">Limpar filtros</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {cars.map((car) => <CarCard key={car.id} car={car} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateFilter('page', i + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          filters.page === i + 1
                            ? 'bg-gold text-black'
                            : 'bg-dark-surface border border-dark-border text-white/50 hover:border-gold/40'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
