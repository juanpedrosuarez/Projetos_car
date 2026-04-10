import { Search, CalendarCheck, Car, ChevronRight } from 'lucide-react'

const steps = [
  {
    icon: <Search size={28} />,
    step: '01',
    title: 'Encontre o carro ideal',
    description: 'Explore centenas de veículos premium verificados. Use os filtros de cidade, categoria e preço para achar exatamente o que você precisa.',
  },
  {
    icon: <CalendarCheck size={28} />,
    step: '02',
    title: 'Reserve com segurança',
    description: 'Escolha as datas, confirme a disponibilidade no calendário e faça sua reserva em minutos. Pagamento seguro e garantido.',
  },
  {
    icon: <Car size={28} />,
    step: '03',
    title: 'Pegue as chaves e dirija',
    description: 'Encontre-se com o proprietário verificado, retire o carro e aproveite. Suporte disponível durante toda a locação.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-dark-card border-y border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-gold text-sm font-medium mb-2">SIMPLES E RÁPIDO</p>
          <h2 className="section-title mb-3">Como funciona</h2>
          <p className="text-white/40 max-w-md mx-auto text-sm">
            Em poucos passos você está dirigindo o carro dos seus sonhos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20" />

          {steps.map(({ icon, step, title, description }, i) => (
            <div key={i} className="relative flex flex-col items-center text-center p-6 group">
              {/* Icon circle */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-dark border border-dark-border flex items-center justify-center text-gold group-hover:border-gold/40 group-hover:bg-gold/5 transition-all duration-300 shadow-[0_0_30px_rgba(201,168,76,0)] group-hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]">
                  {icon}
                </div>
                <span className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {step}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{description}</p>

              {i < steps.length - 1 && (
                <ChevronRight size={16} className="text-gold/30 mt-4 md:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
