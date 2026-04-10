import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Car, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
              <Car size={16} className="text-black" />
            </div>
            <span className="text-xl font-bold">
              Auto<span className="text-gold">Share</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/cars"
              className={`text-sm font-medium transition-colors hover:text-gold ${isActive('/cars') ? 'text-gold' : 'text-white/70'}`}
            >
              Explorar carros
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-gold ${isActive('/dashboard') ? 'text-gold' : 'text-white/70'}`}
              >
                Meus anúncios
              </Link>
            )}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-dark-surface border border-dark-border rounded-full flex items-center justify-center text-gold font-semibold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-white/50 hover:text-red-400 transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
                  Entrar
                </Link>
                <Link to="/register" className="btn-gold text-sm py-2 px-4">
                  Anunciar meu carro
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-card border-t border-dark-border px-4 py-4 space-y-3 animate-fade-in">
          <Link to="/cars" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-white/70 hover:text-white py-2">
            <Car size={16} /> Explorar carros
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-white/70 hover:text-white py-2">
                <LayoutDashboard size={16} /> Meus anúncios
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-400/80 hover:text-red-400 py-2 w-full">
                <LogOut size={16} /> Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-white/70 hover:text-white py-2">
                <User size={16} /> Entrar
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-gold block text-center text-sm py-2.5">
                Anunciar meu carro
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
