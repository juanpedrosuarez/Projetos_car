import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres.'); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500']
  const strengthLabels = ['', 'Fraca', 'Média', 'Forte']

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center">
              <Car size={20} className="text-black" />
            </div>
            <span className="text-2xl font-bold">Auto<span className="text-gold">Share</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Criar conta grátis</h1>
          <p className="text-white/40 text-sm mt-1">Comece a anunciar ou alugar em minutos</p>
        </div>

        <div className="card-dark p-7 shadow-[0_0_60px_rgba(201,168,76,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/60 mb-1.5 block">Nome completo *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Seu nome" required autoComplete="name" className="input-dark text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 mb-1.5 block">E-mail *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="seu@email.com" required autoComplete="email" className="input-dark text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 mb-1.5 block">Telefone (opcional)</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="input-dark text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 mb-1.5 block">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  required
                  autoComplete="new-password"
                  className="input-dark text-sm pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-dark-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strengthColors[passwordStrength]}`} style={{ width: `${(passwordStrength / 3) * 100}%` }} />
                  </div>
                  <span className={`text-xs ${passwordStrength === 1 ? 'text-red-400' : passwordStrength === 2 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-5 space-y-2">
            {['Anuncie seu carro gratuitamente', 'Acesse carros premium verificados', 'Reservas seguras e garantidas'].map(b => (
              <div key={b} className="flex items-center gap-2 text-xs text-white/40">
                <CheckCircle2 size={12} className="text-gold shrink-0" /> {b}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-white/40 mt-5">
          Já tem conta?{' '}
          <Link to="/login" className="text-gold hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    </main>
  )
}
