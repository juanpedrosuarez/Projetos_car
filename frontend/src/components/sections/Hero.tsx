import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, ChevronRight, Shield, Star, Users } from 'lucide-react'

export default function Hero() {
  const navigate = useNavigate()
  const [city, setCity] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/cars${city ? `?city=${encodeURIComponent(city)}` : ''}`)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"
          alt="Carro de luxo"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
      </div>

      {/* Decorative lines */}
      <div className="absolute top-1/4 left-0 w-64 h-px bg-gradient-to-r from-gold/30 to-transparent" />
      <div className="absolute top-1/3 right-0 w-64 h-px bg-gradient-to-l from-gold/30 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 text-gold text-xs font-medium mb-6">
          <Star size={12} className="fill-gold" />
          O marketplace premium de aluguel de carros do Brasil
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fade-up">
          Dirija o carro
          <br />
          <span className="text-transparent bg-clip-text bg-gold-gradient">dos seus sonhos</span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Alugue carros premium diretamente com os proprietários. Sem intermediários, com segurança e preços justos.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="bg-dark-card border border-dark-border rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-6 shadow-[0_0_40px_rgba(201,168,76,0.08)]">
          <div className="flex-1 flex items-center gap-3 px-4 py-2">
            <MapPin size={18} className="text-gold/60 shrink-0" />
            <input
              type="text"
              placeholder="Qual cidade?"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent text-white placeholder-white/30 text-sm focus:outline-none w-full"
            />
          </div>
          <div className="hidden sm:block w-px bg-dark-border self-stretch" />
          <button type="submit" className="btn-gold flex items-center justify-center gap-2 sm:px-6 py-3 rounded-xl">
            <Search size={16} />
            <span>Buscar carros</span>
          </button>
        </form>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
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

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </section>
  )
}
