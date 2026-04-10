import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Fernanda Costa',
    role: 'Empresária · São Paulo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5,
    text: 'Aluguei um Range Rover para minha viagem de negócios e foi incrível. O processo foi simples, o carro estava impecável e o proprietário super atencioso. Definitivamente vou usar de novo.',
  },
  {
    name: 'Rafael Mendes',
    role: 'Engenheiro · Rio de Janeiro',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    rating: 5,
    text: 'Anunciei meu BMW no AutoShare e em menos de uma semana já tinha locações. A plataforma é super profissional e me deu toda segurança para alugar meu carro.',
  },
  {
    name: 'Juliana Santos',
    role: 'Advogada · Curitiba',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    text: 'A experiência de dirigir um Porsche por um final de semana a um preço acessível foi surreal. A plataforma é elegante, intuitiva e o suporte é excelente.',
  },
]

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-14">
        <p className="text-gold text-sm font-medium mb-2">DEPOIMENTOS</p>
        <h2 className="section-title mb-3">O que nossos usuários dizem</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Mais de 8.500 pessoas já viveram a experiência AutoShare.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map(({ name, role, avatar, rating, text }, i) => (
          <div key={i} className="card-dark p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-1">
                {Array.from({ length: rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-gold fill-gold" />
                ))}
              </div>
              <Quote size={20} className="text-gold/20" />
            </div>

            <p className="text-white/60 text-sm leading-relaxed flex-1">"{text}"</p>

            <div className="flex items-center gap-3 pt-2 border-t border-dark-border">
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/20"
              />
              <div>
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-white/40">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-12 rounded-2xl bg-dark-card border border-gold/20 p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05)_0%,transparent_70%)]" />
        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Pronto para uma experiência <span className="text-gold">premium?</span>
          </h3>
          <p className="text-white/40 mb-6 max-w-md mx-auto text-sm">
            Junte-se a milhares de usuários que já descobriram uma forma melhor de alugar e anunciar carros.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/cars" className="btn-gold text-sm">Encontrar um carro</a>
            <a href="/register" className="btn-outline text-sm">Anunciar meu carro</a>
          </div>
        </div>
      </div>
    </section>
  )
}
