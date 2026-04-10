import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Star, MapPin, Users, Fuel, Settings2, Wind, ChevronLeft,
  ChevronRight, Calendar, Shield, CheckCircle2, MessageCircle
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  category: string
  transmission: string
  fuel: string
  seats: number
  airConditioning: boolean
  description: string
  pricePerDay: number | string
  city: string
  state: string
  images: string[]
  rating: number
  reviewCount: number
  isAvailable: boolean
  owner: { id: string; name: string; avatar?: string; phone?: string; createdAt: string }
}

interface BlockedDate { startDate: string; endDate: string }

const FUEL_LABELS: Record<string, string> = {
  GASOLINA: 'Gasolina', DIESEL: 'Diesel', ELETRICO: 'Elétrico', HIBRIDO: 'Híbrido', FLEX: 'Flex'
}

const CATEGORY_LABELS: Record<string, string> = {
  SUV: 'SUV', SEDAN: 'Sedan', ESPORTIVO: 'Esportivo', ECONOMICO: 'Econômico', HATCH: 'Hatch', PICKUP: 'Pickup'
}

export default function CarDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImg, setCurrentImg] = useState(0)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reserving, setReserving] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/cars/${id}`),
      api.get(`/reservations/car/${id}`)
    ]).then(([carRes, datesRes]) => {
      setCar(carRes.data)
      setBlockedDates(datesRes.data)
    }).catch(() => navigate('/cars')).finally(() => setLoading(false))
  }, [id, navigate])

  const price = car ? (typeof car.pricePerDay === 'string' ? parseFloat(car.pricePerDay) : car.pricePerDay) : 0

  const days = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const totalPrice = days > 0 ? days * price : 0

  const isDateBlocked = (date: string) => {
    const d = new Date(date)
    return blockedDates.some(({ startDate: s, endDate: e }) =>
      d >= new Date(s) && d <= new Date(e)
    )
  }

  const handleReserve = async () => {
    if (!user) { navigate('/login'); return }
    if (!startDate || !endDate) { setError('Selecione as datas de retirada e devolução.'); return }
    if (days <= 0) { setError('Data de devolução deve ser após a retirada.'); return }
    if (isDateBlocked(startDate) || isDateBlocked(endDate)) { setError('Período indisponível.'); return }

    setError('')
    setReserving(true)
    try {
      await api.post('/reservations', { carId: id, startDate, endDate })
      setReservationSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Erro ao fazer reserva.')
    } finally {
      setReserving(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <main className="pt-20 min-h-screen max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="aspect-[2/1] bg-dark-card rounded-2xl" />
          <div className="h-8 bg-dark-card rounded w-1/2" />
          <div className="h-4 bg-dark-card rounded w-1/3" />
        </div>
      </main>
    )
  }

  if (!car) return null

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link to="/cars" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-gold mb-6 transition-colors w-fit">
          <ChevronLeft size={16} /> Voltar para listagem
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="card-dark overflow-hidden">
              <div className="relative aspect-[16/9] bg-dark-surface">
                <img
                  src={car.images[currentImg] || 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80'}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImg((i) => (i === 0 ? car.images.length - 1 : i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-dark/80 backdrop-blur-sm border border-dark-border rounded-full p-2 text-white hover:text-gold transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentImg((i) => (i === car.images.length - 1 ? 0 : i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-dark/80 backdrop-blur-sm border border-dark-border rounded-full p-2 text-white hover:text-gold transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {car.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImg(i)}
                          className={`h-1.5 rounded-full transition-all ${i === currentImg ? 'w-6 bg-gold' : 'w-1.5 bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {car.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-dark-surface">
                  {car.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === currentImg ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-80'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="card-dark p-6">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h1 className="text-2xl font-bold text-white">{car.name}</h1>
                <span className="text-xs border border-gold/30 text-gold px-2.5 py-1 rounded-full shrink-0">
                  {CATEGORY_LABELS[car.category] || car.category}
                </span>
              </div>
              <p className="text-white/40 text-sm mb-3">{car.brand} · {car.year}</p>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-gold fill-gold" />
                  <span className="text-sm font-medium">{car.rating.toFixed(1)}</span>
                  <span className="text-white/30 text-sm">({car.reviewCount} avaliações)</span>
                </div>
                <span className="text-white/20">·</span>
                <div className="flex items-center gap-1 text-white/40 text-sm">
                  <MapPin size={13} /> {car.city}, {car.state}
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: <Settings2 size={16} />, label: 'Câmbio', value: car.transmission === 'AUTOMATICO' ? 'Automático' : 'Manual' },
                  { icon: <Fuel size={16} />, label: 'Combustível', value: FUEL_LABELS[car.fuel] || car.fuel },
                  { icon: <Users size={16} />, label: 'Lugares', value: `${car.seats} pessoas` },
                  { icon: <Wind size={16} />, label: 'Ar condicionado', value: car.airConditioning ? 'Sim' : 'Não' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-dark-surface border border-dark-border rounded-xl p-3 text-center">
                    <div className="text-gold/60 flex justify-center mb-1">{icon}</div>
                    <div className="text-xs text-white/40 mb-0.5">{label}</div>
                    <div className="text-sm font-medium text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="divider-gold mb-5" />

              <h2 className="font-semibold text-white mb-2">Sobre este veículo</h2>
              <p className="text-white/50 text-sm leading-relaxed">{car.description}</p>
            </div>

            {/* Owner */}
            <div className="card-dark p-6">
              <h2 className="font-semibold text-white mb-4">Anunciante</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-dark-surface border border-dark-border rounded-full flex items-center justify-center text-gold font-bold text-lg shrink-0">
                  {car.owner.avatar
                    ? <img src={car.owner.avatar} alt={car.owner.name} className="w-full h-full rounded-full object-cover" />
                    : car.owner.name.charAt(0).toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{car.owner.name}</p>
                  <p className="text-xs text-white/40">
                    Membro desde {new Date(car.owner.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 shrink-0">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-xs text-white/60">Verificado</span>
                </div>
              </div>

              {car.owner.phone ? (
                <a
                  href={`https://wa.me/55${car.owner.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    api.post('/analytics/whatsapp-click', {
                      nome: user?.name ?? 'Anônimo',
                      numero: user?.phone ?? 'não informado',
                      anunciante: car.owner.name,
                      anuncio: car.name,
                    }).catch(() => {})
                  }}
                  className="mt-4 flex items-center justify-center gap-2 w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366]/60 text-[#25D366] font-medium text-sm py-3 rounded-xl transition-all duration-200"
                >
                  <MessageCircle size={17} />
                  Falar no WhatsApp
                </a>
              ) : (
                <p className="mt-4 text-center text-xs text-white/30">
                  Anunciante não informou WhatsApp
                </p>
              )}
            </div>
          </div>

          {/* Right — reservation card */}
          <div className="lg:col-span-1">
            <div className="card-dark p-6 sticky top-24">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-gold">
                  R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </span>
                <span className="text-white/40 text-sm">/dia</span>
              </div>
              <div className="flex items-center gap-1 mb-5">
                <Star size={13} className="text-gold fill-gold" />
                <span className="text-xs text-white">{car.rating.toFixed(1)}</span>
                <span className="text-xs text-white/30">({car.reviewCount})</span>
              </div>

              {reservationSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={32} />
                  <p className="font-semibold text-white mb-1">Reserva confirmada!</p>
                  <p className="text-xs text-white/50">O anunciante entrará em contato em breve.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1.5">
                        <Calendar size={12} /> Data de retirada
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input-dark text-sm [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1.5">
                        <Calendar size={12} /> Data de devolução
                      </label>
                      <input
                        type="date"
                        min={startDate || today}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input-dark text-sm [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {days > 0 && (
                    <div className="bg-dark-surface border border-dark-border rounded-xl p-4 mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">R$ {price.toLocaleString('pt-BR')} × {days} dia{days > 1 ? 's' : ''}</span>
                        <span className="text-white">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="divider-gold" />
                      <div className="flex justify-between font-semibold">
                        <span className="text-white">Total</span>
                        <span className="text-gold">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-red-400 text-xs mb-3 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
                  )}

                  {!car.isAvailable ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center text-sm text-red-400">
                      Este carro está indisponível no momento.
                    </div>
                  ) : user?.id === car.owner.id ? (
                    <div className="bg-dark-surface border border-dark-border rounded-xl p-3 text-center text-sm text-white/40">
                      Este é seu anúncio.
                    </div>
                  ) : (
                    <button
                      onClick={handleReserve}
                      disabled={reserving}
                      className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reserving ? 'Reservando...' : 'Reservar agora'}
                    </button>
                  )}

                  {!user && (
                    <p className="text-center text-xs text-white/30 mt-2">
                      <Link to="/login" className="text-gold hover:underline">Entre</Link> para reservar
                    </p>
                  )}
                </>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-white/30 justify-center">
                <Shield size={12} />
                Reserva segura e garantida pelo AutoShare
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
