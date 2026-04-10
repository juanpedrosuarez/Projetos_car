import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ChevronRight, Shield, Star, Users, LocateFixed, Loader2 } from 'lucide-react'
import api from '../../lib/api'

const RADIUS_OPTIONS = [
  { label: 'Qualquer distância', value: '' },
  { label: 'Até 50 km', value: '50' },
  { label: 'Até 100 km', value: '100' },
  { label: 'Até 200 km', value: '200' },
]

export default function Hero() {
  const navigate = useNavigate()
  const [city, setCity] = useState('')
  const [radius, setRadius] = useState('')
  const [allCities, setAllCities] = useState<{ city: string; state: string }[]>([])
  const [suggestions, setSuggestions] = useState<{ city: string; state: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/cars/cities').then(({ data }) => setAllCities(data)).catch(() => {})
  }, [])

  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

  const handleInput = (value: string) => {
    setCity(value)
    setGeoCoords(null)
    if (value.length >= 2) {
      const matches = allCities.filter(c => normalize(c.city).includes(normalize(value)))
      setSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectCity = (name: string) => {
    setCity(name)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setGeoCoords({ lat: latitude, lng: longitude })
        // Reverse geocode com Nominatim (gratuito)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`
          )
          const data = await res.json()
          const cityName = data.address?.city || data.address?.town || data.address?.village || ''
          setCity(cityName)
        } catch {
          setCity('Minha localização')
        } finally {
          setLocating(false)
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (geoCoords && radius) {
      params.set('lat', String(geoCoords.lat))
      params.set('lng', String(geoCoords.lng))
      params.set('radius', radius)
    } else if (city) {
      params.set('city', city)
      if (radius) params.set('radius', radius)
    }
    navigate(`/cars?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"
          alt="Carro"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="absolute top-1/4 left-0 w-64 h-px bg-gradient-to-r from-gold/30 to-transparent" />
      <div className="absolute top-1/3 right-0 w-64 h-px bg-gradient-to-l from-gold/30 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-24 w-full">
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 text-gold text-xs font-medium mb-6">
          <Star size={12} className="fill-gold" />
          O marketplace de aluguel de carros do Brasil
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 animate-fade-up">
          Alugue o carro
          <br />
          <span className="text-transparent bg-clip-text bg-gold-gradient">que você precisa</span>
        </h1>

        <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Alugue carros diretamente com os proprietários. Sem intermediários, com segurança e preços justos.
        </p>

        {/* Webmotors-style search card */}
        <form onSubmit={handleSearch} className="bg-dark-card border border-dark-border rounded-2xl p-4 max-w-3xl mx-auto mb-5 shadow-[0_0_50px_rgba(201,168,76,0.07)] text-left">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* City input */}
            <div className="flex-1 relative">
              <label className="text-xs text-white/40 font-medium block mb-1.5 pl-1">Localização</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cidade ou região"
                  value={city}
                  onChange={(e) => handleInput(e.target.value)}
                  onFocus={() => city.length >= 2 && setShowSuggestions(suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="input-dark text-sm pl-8 pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  title="Usar minha localização"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold transition-colors disabled:opacity-50"
                >
                  {locating
                    ? <Loader2 size={15} className="animate-spin" />
                    : <LocateFixed size={15} />
                  }
                </button>
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && (
                <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-2xl">
                  {suggestions.slice(0, 6).map(({ city: c, state }) => (
                    <li key={`${c}-${state}`}>
                      <button
                        type="button"
                        onMouseDown={() => selectCity(c)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-dark-hover hover:text-gold transition-colors text-left"
                      >
                        <MapPin size={12} className="text-gold/50 shrink-0" />
                        {c}
                        <span className="ml-auto text-xs text-white/30">{state}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Radius */}
            <div className="sm:w-48">
              <label className="text-xs text-white/40 font-medium block mb-1.5 pl-1">Raio de busca</label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="input-dark text-sm appearance-none cursor-pointer"
              >
                {RADIUS_OPTIONS.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="sm:self-end">
              <label className="text-xs text-white/40 font-medium block mb-1.5 pl-1 invisible">Buscar</label>
              <button type="submit" className="btn-gold flex items-center justify-center gap-2 w-full sm:w-auto px-6 whitespace-nowrap">
                <Search size={15} />
                Buscar
              </button>
            </div>
          </div>

          {/* Geolocation hint */}
          {geoCoords && (
            <p className="text-xs text-emerald-400/70 mt-2 pl-1 flex items-center gap-1.5">
              <LocateFixed size={11} /> Usando sua localização atual
              {radius && ` · raio de ${radius} km`}
            </p>
          )}
        </form>

        {/* Quick cities */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Florianópolis', 'Brasília'].map((c) => (
            <button
              key={c}
              onClick={() => navigate(`/cars?city=${encodeURIComponent(c)}`)}
              className="text-xs text-white/40 hover:text-gold border border-dark-border hover:border-gold/30 rounded-full px-3 py-1.5 transition-all"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { icon: <Users size={20} />, value: '8.500+', label: 'Locatários' },
            { icon: <Star size={20} />, value: '4.9', label: 'Avaliação média' },
            { icon: <Shield size={20} />, value: '100%', label: 'Verificados' },
          ].map(({ icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="text-gold/60 flex justify-center mb-1">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </section>
  )
}
