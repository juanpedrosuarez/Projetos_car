import { Link } from 'react-router-dom'
import { Star, MapPin, Fuel, Users, Zap } from 'lucide-react'

interface Car {
  id: string
  name: string
  brand: string
  year: number
  category: string
  transmission: string
  fuel: string
  seats: number
  pricePerDay: number | string
  rating: number
  reviewCount: number
  images: string[]
  city: string
  state: string
}

const FUEL_LABELS: Record<string, string> = {
  GASOLINA: 'Gasolina',
  DIESEL: 'Diesel',
  ELETRICO: 'Elétrico',
  HIBRIDO: 'Híbrido',
  FLEX: 'Flex',
}

const CATEGORY_LABELS: Record<string, string> = {
  SUV: 'SUV',
  SEDAN: 'Sedan',
  ESPORTIVO: 'Esportivo',
  ECONOMICO: 'Econômico',
  PICKUP: 'Pickup',
  HATCH: 'Hatch',
}

export default function CarCard({ car }: { car: Car }) {
  const price = typeof car.pricePerDay === 'string' ? parseFloat(car.pricePerDay) : car.pricePerDay
  const isElectric = car.fuel === 'ELETRICO'

  return (
    <Link to={`/cars/${car.id}`} className="card-dark group block">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={car.images[0] || `https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80`}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-dark/80 backdrop-blur-sm text-xs font-medium text-gold border border-gold/30 px-2.5 py-1 rounded-full">
          {CATEGORY_LABELS[car.category] || car.category}
        </span>

        {/* Electric badge */}
        {isElectric && (
          <span className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 px-2 py-1 rounded-full flex items-center gap-1">
            <Zap size={10} /> Elétrico
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-gold transition-colors line-clamp-1">
              {car.name}
            </h3>
            <p className="text-white/40 text-xs mt-0.5">{car.brand} · {car.year}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={13} className="text-gold fill-gold" />
            <span className="text-xs font-medium text-white">{car.rating.toFixed(1)}</span>
            <span className="text-xs text-white/30">({car.reviewCount})</span>
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs text-white/40">
            <Fuel size={11} /> {FUEL_LABELS[car.fuel] || car.fuel}
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-1 text-xs text-white/40">
            <Users size={11} /> {car.seats} lugares
          </span>
          <span className="text-white/20">·</span>
          <span className="text-xs text-white/40">{car.transmission === 'AUTOMATICO' ? 'Auto' : 'Manual'}</span>
        </div>

        <div className="divider-gold" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5">
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <MapPin size={11} /> {car.city}, {car.state}
          </div>
          <div className="text-right">
            <span className="text-gold font-bold text-base">
              R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-white/30 text-xs">/dia</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
