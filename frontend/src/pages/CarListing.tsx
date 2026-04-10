import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, MapPin, LocateFixed } from 'lucide-react'
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

const RADIUS_OPTIONS = [
  { label: 'Qualquer distância', value: '' },
  { label: 'Até 50 km', value: '50' },
  { label: 'Até 100 km', value: '100' },
  { label: 'Até 200 km', value: '200' },
]

export default function CarListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cars, setCars] = useState<Car[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Autocomplete de cidade
  const [allCities, setAllCities] = useState<{ city: string; state: string }[]>([])
  const [citySuggestions, setCitySuggestions] = useState<{ city: string; state: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const cityInputRef = useRef<HTMLInputElement>(null)

  // Geolocation state (from URL when coming from Hero)
  const geoLat = searchParams.get('lat')
  const geoLng = searchParams.get('lng')
  const isGeo = !!(geoLat && geoLng)

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'recent',
    page: Number(searchParams.get('page') || '1'),
    radius: searchParams.get('radius') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
  })

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // If we have geo coords, use lat/lng/radius; otherwise use city/radius
      if (filters.lat && filters.lng) {
        params.set('lat', filters.lat)
        params.set('lng', filters.lng)
        if (filters.radius) params.set('radius', filters.radius)
      } else {
        if (filters.city) params.set('city', filters.city)
        if (filters.radius) params.set('radius', filters.radius)
      }
      if (filters.category) params.set('category', filters.category)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      if (filters.page > 1) params.set('page', String(filters.page))
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
    if (filters.lat && filters.lng) {
      params.set('lat', filters.lat)
      params.set('lng', filters.lng)
    } else if (filters.city) {
      params.set('city', filters.city)
    }
    if (filters.radius) params.set('radius', filters.radius)
    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.sortBy && filters.sortBy !== 'recent') params.set('sortBy', filters.sortBy)
    if (filters.page > 1) params.set('page', String(filters.page))
    setSearchParams(params, { replace: true })
  }, [filters, fetchCars, setSearchParams])

  // Carrega todas as cidades uma única vez
  useEffect(() => {
    api.get('/cars/cities').then(({ data }) => setAllCities(data)).catch(() => {})
  }, [])

  // Filtra sugestões conforme o usuário digita
  const handleCityInput = (value: string) => {
    updateFilter('city', value)
    if (value.length >= 2) {
      const matches = allCities.filter(c =>
        c.city.toLowerCase().includes(value.toLowerCase())
      )
      setCitySuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectCity = (city: string) => {
    updateFilter('city', city)
    setShowSuggestions(false)
    cityInputRef.current?.blur()
  }

  const updateFilter = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value),
      // Clear geo coords when user manually types a city
      ...(key === 'city' ? { lat: '', lng: '' } : {}),
    }))
  }

  const clearFilters = () => {
    setFilters({ city: '', category: '', minPrice: '', maxPrice: '', sortBy: 'recent', page: 1, radius: '', lat: '', lng: '' })
  }

  const activeFiltersCount = [filters.city || (filters.lat && filters.lng), filters.category, filters.minPrice, filters.maxPrice, filters.radius]
    .filter(Boolean).length

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {filters.lat && filters.lng
                ? `Carros próximos a você${filters.radius ? ` (${filters.radius} km)` : ''}`
                : filters.city ? `Carros em ${filters.city}` : 'Explorar carros'}
            </h1>
            <p className="text-white/40 text-sm mt-1 flex items-center gap-1.5">
              {filters.lat && filters.lng && <LocateFixed size={12} className="text-emerald-400/70" />}
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

              {/* City autocomplete */}
              <div className="mb-4 relative">
                <label className="text-xs font-medium text-white/60 mb-2 block">Cidade</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    ref={cityInputRef}
                    type="text"
                    placeholder="Ex: São Paulo"
                    value={filters.city}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onFocus={() => filters.city.length >= 2 && setShowSuggestions(citySuggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="input-dark text-sm pl-8"
                    autoComplete="off"
                  />
                  {filters.city && (
                    <button
                      onClick={() => { updateFilter('city', ''); setShowSuggestions(false) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                {showSuggestions && (
                  <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-xl">
                    {citySuggestions.map(({ city, state }) => (
                      <li key={`${city}-${state}`}>
                        <button
                          onMouseDown={() => selectCity(city)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-dark-hover hover:text-gold transition-colors text-left"
                        >
                          <MapPin size={12} className="text-gold/50 shrink-0" />
                          {city}
                          <span className="text-white/30 text-xs ml-auto">{state}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
