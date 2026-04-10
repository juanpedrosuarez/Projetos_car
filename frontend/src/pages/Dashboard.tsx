import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Car, Calendar, CheckCircle2, XCircle, Clock,
  Upload, X, ImagePlus, AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

interface MyCar {
  id: string
  name: string
  brand: string
  year: number
  pricePerDay: number | string
  images: string[]
  isAvailable: boolean
  city: string
  state: string
  rating: number
  reviewCount: number
  reservations: Reservation[]
}

interface Reservation {
  id: string
  startDate: string
  endDate: string
  totalPrice: number | string
  status: string
  car?: { name: string; images: string[] }
  renter?: { name: string; email: string; phone?: string }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CONFIRMED: { label: 'Confirmada', color: 'text-emerald-400', icon: <CheckCircle2 size={14} /> },
  PENDING: { label: 'Pendente', color: 'text-yellow-400', icon: <Clock size={14} /> },
  CANCELLED: { label: 'Cancelada', color: 'text-red-400', icon: <XCircle size={14} /> },
  COMPLETED: { label: 'Concluída', color: 'text-blue-400', icon: <CheckCircle2 size={14} /> },
}

const CATEGORIES = ['SUV', 'SEDAN', 'ESPORTIVO', 'ECONOMICO', 'HATCH', 'PICKUP']
const FUELS = ['FLEX', 'GASOLINA', 'DIESEL', 'HIBRIDO', 'ELETRICO']

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<'cars' | 'reservations' | 'new'>('cars')
  const [cars, setCars] = useState<MyCar[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: new Date().getFullYear(),
    category: 'SEDAN', transmission: 'AUTOMATICO', fuel: 'FLEX',
    seats: 5, airConditioning: true, description: '',
    pricePerDay: '', city: '', state: '',
  })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([
      api.get('/cars/my'),
      api.get('/reservations/received'),
    ]).then(([carsRes, resRes]) => {
      setCars(carsRes.data)
      setReservations(resRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [user, navigate])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 5)
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const removeFile = (i: number) => {
    const newFiles = files.filter((_, idx) => idx !== i)
    const newPreviews = previews.filter((_, idx) => idx !== i)
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (files.length === 0) { setSubmitError('Adicione pelo menos uma foto do veículo.'); return }

    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)))
    files.forEach(f => formData.append('images', f))

    setSubmitLoading(true)
    try {
      const { data } = await api.post('/cars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setCars(prev => [data, ...prev])
      setSubmitSuccess(true)
      setTimeout(() => { setSubmitSuccess(false); setTab('cars') }, 2000)
      setForm({
        name: '', brand: '', model: '', year: new Date().getFullYear(),
        category: 'SEDAN', transmission: 'AUTOMATICO', fuel: 'FLEX',
        seats: 5, airConditioning: true, description: '',
        pricePerDay: '', city: '', state: '',
      })
      setFiles([])
      setPreviews([])
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setSubmitError(msg || 'Erro ao cadastrar carro.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const toggleAvailability = async (carId: string, current: boolean) => {
    try {
      await api.put(`/cars/${carId}`, { isAvailable: !current })
      setCars(prev => prev.map(c => c.id === carId ? { ...c, isAvailable: !current } : c))
    } catch (err) { console.error(err) }
  }

  if (!user) return null

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Olá, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-white/40 text-sm mt-1">Gerencie seus anúncios e reservas</p>
          </div>
          <button onClick={() => setTab('new')} className="btn-gold flex items-center gap-2 text-sm py-2.5">
            <Plus size={16} /> Novo anúncio
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Carros anunciados', value: cars.length, icon: <Car size={18} /> },
            { label: 'Reservas recebidas', value: reservations.length, icon: <Calendar size={18} /> },
            { label: 'Confirmadas', value: reservations.filter(r => r.status === 'CONFIRMED').length, icon: <CheckCircle2 size={18} /> },
            { label: 'Disponíveis', value: cars.filter(c => c.isAvailable).length, icon: <Clock size={18} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card-dark p-4 flex flex-col gap-3">
              <div className="text-gold/60">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-white/40">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-surface border border-dark-border rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'cars', label: 'Meus carros' },
            { key: 'reservations', label: 'Reservas recebidas' },
            { key: 'new', label: '+ Novo anúncio' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? 'bg-gold text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: My cars */}
        {tab === 'cars' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card-dark">
                    <div className="aspect-[16/9] bg-dark-surface animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-dark-surface rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-dark-surface rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-16">
                <Car className="mx-auto text-white/20 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum carro anunciado</h3>
                <p className="text-white/40 text-sm mb-4">Comece anunciando seu primeiro veículo.</p>
                <button onClick={() => setTab('new')} className="btn-gold text-sm">Anunciar agora</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map(car => {
                  const price = typeof car.pricePerDay === 'string' ? parseFloat(car.pricePerDay) : car.pricePerDay
                  return (
                    <div key={car.id} className="card-dark overflow-hidden">
                      <div className="relative aspect-[16/9]">
                        <img
                          src={car.images[0] || 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&q=80'}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-medium ${
                          car.isAvailable
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {car.isAvailable ? 'Disponível' : 'Indisponível'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm">{car.name}</h3>
                        <p className="text-white/40 text-xs mb-3">{car.city}, {car.state}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gold font-bold">R$ {price.toLocaleString('pt-BR')}/dia</span>
                          <div className="flex gap-2">
                            <Link to={`/cars/${car.id}`} className="text-xs text-white/40 hover:text-white border border-dark-border rounded-lg px-2.5 py-1.5 transition-colors">
                              Ver
                            </Link>
                            <button
                              onClick={() => toggleAvailability(car.id, car.isAvailable)}
                              className="text-xs text-white/40 hover:text-gold border border-dark-border rounded-lg px-2.5 py-1.5 transition-colors"
                            >
                              {car.isAvailable ? 'Pausar' : 'Ativar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Reservations */}
        {tab === 'reservations' && (
          <div className="space-y-3">
            {reservations.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="mx-auto text-white/20 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhuma reserva recebida</h3>
                <p className="text-white/40 text-sm">Quando alguém reservar seu carro, aparecerá aqui.</p>
              </div>
            ) : (
              reservations.map(res => {
                const statusCfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.PENDING
                const total = typeof res.totalPrice === 'string' ? parseFloat(res.totalPrice) : res.totalPrice
                return (
                  <div key={res.id} className="card-dark p-4 flex flex-col sm:flex-row gap-4">
                    <img
                      src={res.car?.images[0] || 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=120&q=80'}
                      alt={res.car?.name}
                      className="w-full sm:w-28 h-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-white text-sm">{res.car?.name}</h4>
                        <span className={`flex items-center gap-1 text-xs ${statusCfg.color} shrink-0`}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        {new Date(res.startDate).toLocaleDateString('pt-BR')} → {new Date(res.endDate).toLocaleDateString('pt-BR')}
                      </p>
                      {res.renter && (
                        <p className="text-xs text-white/50 mt-1">
                          Locatário: <span className="text-white">{res.renter.name}</span> · {res.renter.email}
                          {res.renter.phone && ` · ${res.renter.phone}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-gold font-bold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs text-white/30 mt-0.5">total</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Tab: New car form */}
        {tab === 'new' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Cadastrar novo veículo</h2>

            {submitSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4 flex items-center gap-3">
                <CheckCircle2 className="text-emerald-400 shrink-0" />
                <p className="text-emerald-400 text-sm font-medium">Carro cadastrado com sucesso!</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photos */}
              <div className="card-dark p-5">
                <h3 className="font-semibold text-white text-sm mb-3">Fotos do veículo <span className="text-gold">*</span></h3>
                <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />

                {previews.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-20 border-2 border-dashed border-dark-border rounded-lg flex flex-col items-center justify-center text-white/30 hover:border-gold/40 hover:text-gold transition-colors"
                      >
                        <ImagePlus size={20} />
                        <span className="text-xs mt-1">Adicionar</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-dark-border rounded-xl p-8 flex flex-col items-center gap-2 text-white/30 hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    <Upload size={28} />
                    <span className="text-sm">Clique para adicionar fotos</span>
                    <span className="text-xs">JPEG, PNG ou WebP · Máx. 5MB cada · Até 5 fotos</span>
                  </button>
                )}
              </div>

              {/* Car info */}
              <div className="card-dark p-5 space-y-4">
                <h3 className="font-semibold text-white text-sm">Informações do veículo</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Nome completo *</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: BMW X5 2022" required className="input-dark text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Marca *</label>
                    <input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="Ex: BMW" required className="input-dark text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Modelo *</label>
                    <input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Ex: X5" required className="input-dark text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Ano *</label>
                    <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))} min="1990" max="2030" required className="input-dark text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Categoria *</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-dark text-sm">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Combustível *</label>
                    <select value={form.fuel} onChange={e => setForm(p => ({ ...p, fuel: e.target.value }))} className="input-dark text-sm">
                      {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Câmbio *</label>
                    <select value={form.transmission} onChange={e => setForm(p => ({ ...p, transmission: e.target.value }))} className="input-dark text-sm">
                      <option value="AUTOMATICO">Automático</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Lugares *</label>
                    <input type="number" value={form.seats} onChange={e => setForm(p => ({ ...p, seats: Number(e.target.value) }))} min="1" max="15" required className="input-dark text-sm" />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.airConditioning} onChange={e => setForm(p => ({ ...p, airConditioning: e.target.checked }))} className="w-4 h-4 accent-yellow-500" />
                    <span className="text-sm text-white/70">Possui ar condicionado</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">Descrição *</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descreva o veículo, diferenciais, estado de conservação..." required rows={4} className="input-dark text-sm resize-none" />
                </div>
              </div>

              {/* Location & price */}
              <div className="card-dark p-5 space-y-4">
                <h3 className="font-semibold text-white text-sm">Localização e preço</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Cidade *</label>
                    <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="São Paulo" required className="input-dark text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1.5 block">Estado *</label>
                    <input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="SP" maxLength={2} required className="input-dark text-sm uppercase" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">Preço por dia (R$) *</label>
                  <input type="number" value={form.pricePerDay} onChange={e => setForm(p => ({ ...p, pricePerDay: e.target.value }))} placeholder="Ex: 250" min="1" required className="input-dark text-sm" />
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}

              <button type="submit" disabled={submitLoading} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {submitLoading ? 'Cadastrando...' : 'Publicar anúncio'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
