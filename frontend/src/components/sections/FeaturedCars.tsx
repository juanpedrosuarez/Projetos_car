import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import CarCard from '../ui/CarCard'
import api from '../../lib/api'

interface Car {
  id: string
  name: string
  brand: string
  year: number
  category: string
  transmission: string
  fuel: string
  seats: number
  pricePerDay: number
  rating: number
  reviewCount: number
  images: string[]
  city: string
  state: string
}

export default function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/cars/featured')
      .then(({ data }) => setCars(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-gold text-sm font-medium mb-2">SELECIONADOS PARA VOCÊ</p>
          <h2 className="section-title">Carros em destaque</h2>
        </div>
        <Link
          to="/cars"
          className="hidden md:flex items-center gap-2 text-sm text-white/50 hover:text-gold transition-colors font-medium"
        >
          Ver todos <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-dark">
              <div className="aspect-[16/9] bg-dark-surface animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-dark-surface rounded animate-pulse w-3/4" />
                <div className="h-3 bg-dark-surface rounded animate-pulse w-1/2" />
                <div className="h-3 bg-dark-surface rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}

      <div className="mt-8 text-center md:hidden">
        <Link to="/cars" className="btn-outline inline-flex items-center gap-2 text-sm">
          Ver todos os carros <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}
