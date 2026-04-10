import { Link } from 'react-router-dom'
import { Car, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                <Car size={16} className="text-black" />
              </div>
              <span className="text-xl font-bold">Auto<span className="text-gold">Share</span></span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              O marketplace de aluguel de carros do Brasil. Conectamos proprietários e motoristas com segurança e transparência.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-dark-surface border border-dark-border rounded-lg flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Plataforma</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/cars', label: 'Explorar carros' },
                { to: '/register', label: 'Anunciar meu carro' },
                { to: '/login', label: 'Fazer login' },
                { to: '/dashboard', label: 'Meu dashboard' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/50 hover:text-gold transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Segurança</h4>
            <ul className="space-y-2.5">
              {['Como funciona', 'Política de cancelamento', 'Seguro do veículo', 'Central de ajuda', 'Termos de uso'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/50 hover:text-gold transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-white/50">
                <Mail size={14} className="text-gold/60 shrink-0" />
                contato@autoshare.com.br
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/50">
                <Phone size={14} className="text-gold/60 shrink-0" />
                (11) 4000-1234
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/50">
                <MapPin size={14} className="text-gold/60 shrink-0" />
                São Paulo, SP — Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-gold mt-10 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} AutoShare. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/60 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white/60 transition-colors">Cookies</a>
            <a href="#" className="hover:text-white/60 transition-colors">LGPD</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
