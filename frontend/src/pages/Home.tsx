import Hero from '../components/sections/Hero'
import FeaturedCars from '../components/sections/FeaturedCars'
import HowItWorks from '../components/sections/HowItWorks'
import Testimonials from '../components/sections/Testimonials'

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedCars />
      <HowItWorks />
      <Testimonials />
    </main>
  )
}
