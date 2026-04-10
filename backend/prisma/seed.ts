import { PrismaClient, CarCategory, Transmission, FuelType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const UNSPLASH_CARS = {
  suv: [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
    'https://images.unsplash.com/photo-1674742635568-0c89ab95b578?w=800&q=80',
  ],
  sedan: [
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
  ],
  esportivo: [
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
  ],
  economico: [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
    'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&q=80',
    'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800&q=80',
  ],
}

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar usuário demo anunciante
  const hashedPassword = await bcrypt.hash('senha123', 12)

  const owner = await prisma.user.upsert({
    where: { email: 'anunciante@autoshare.com' },
    update: {},
    create: {
      name: 'Carlos Mendonça',
      email: 'anunciante@autoshare.com',
      password: hashedPassword,
      phone: '(11) 99999-8888',
    },
  })

  const owner2 = await prisma.user.upsert({
    where: { email: 'premium@autoshare.com' },
    update: {},
    create: {
      name: 'Ana Rodrigues',
      email: 'premium@autoshare.com',
      password: hashedPassword,
      phone: '(21) 98888-7777',
    },
  })

  // Deletar carros existentes para re-seed limpo
  await prisma.car.deleteMany({})

  const cars = [
    // SUVs
    {
      ownerId: owner.id,
      name: 'Range Rover Sport 2023',
      brand: 'Land Rover',
      model: 'Range Rover Sport',
      year: 2023,
      category: CarCategory.SUV,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.GASOLINA,
      seats: 5,
      airConditioning: true,
      description: 'O Range Rover Sport 2023 é a combinação perfeita entre luxo e desempenho off-road. Interior em couro premium, sistema de som Meridian e teto panorâmico. Ideal para viagens longas com máximo conforto.',
      pricePerDay: 500,
      city: 'São Paulo',
      state: 'SP',
      images: UNSPLASH_CARS.suv,
      rating: 4.9,
      reviewCount: 47,
    },
    {
      ownerId: owner2.id,
      name: 'BMW X5 2022',
      brand: 'BMW',
      model: 'X5',
      year: 2022,
      category: CarCategory.SUV,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.GASOLINA,
      seats: 5,
      airConditioning: true,
      description: 'BMW X5 com pacote M Sport. Motor 3.0 turbo, 340cv, 0-100km/h em 5,5 segundos. Tela curva BMW iDrive, assistente de condução e câmera 360°.',
      pricePerDay: 420,
      city: 'Rio de Janeiro',
      state: 'RJ',
      images: [UNSPLASH_CARS.suv[1], UNSPLASH_CARS.suv[0], UNSPLASH_CARS.suv[2]],
      rating: 4.8,
      reviewCount: 32,
    },
    // Sedans
    {
      ownerId: owner.id,
      name: 'Mercedes-Benz C300 2023',
      brand: 'Mercedes-Benz',
      model: 'C300',
      year: 2023,
      category: CarCategory.SEDAN,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.GASOLINA,
      seats: 5,
      airConditioning: true,
      description: 'C300 com interior MBUX de última geração. Bancos em couro Nappa, piloto automático adaptativo e sistema de som Burmester. Elegância e tecnologia redefinidas.',
      pricePerDay: 380,
      city: 'São Paulo',
      state: 'SP',
      images: UNSPLASH_CARS.sedan,
      rating: 4.7,
      reviewCount: 61,
    },
    {
      ownerId: owner2.id,
      name: 'Audi A4 2022',
      brand: 'Audi',
      model: 'A4',
      year: 2022,
      category: CarCategory.SEDAN,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.GASOLINA,
      seats: 5,
      airConditioning: true,
      description: 'Audi A4 com pacote S-Line. Motor 2.0 TFSI de 190cv, Virtual Cockpit, MMI Navigation Plus e Audi Pre Sense City. Esportividade com sofisticação.',
      pricePerDay: 310,
      city: 'Curitiba',
      state: 'PR',
      images: [UNSPLASH_CARS.sedan[1], UNSPLASH_CARS.sedan[2], UNSPLASH_CARS.sedan[0]],
      rating: 4.6,
      reviewCount: 28,
    },
    {
      ownerId: owner.id,
      name: 'Toyota Camry Hybrid 2023',
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      category: CarCategory.SEDAN,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.HIBRIDO,
      seats: 5,
      airConditioning: true,
      description: 'Camry Hybrid com tecnologia de duplo motor. Consumo excepcional, interior espaçoso e sistema Toyota Safety Sense completo. Perfeito para executivos.',
      pricePerDay: 220,
      city: 'Brasília',
      state: 'DF',
      images: [UNSPLASH_CARS.sedan[2], UNSPLASH_CARS.sedan[0], UNSPLASH_CARS.sedan[1]],
      rating: 4.5,
      reviewCount: 19,
    },
    // Esportivos
    {
      ownerId: owner2.id,
      name: 'Porsche 911 Carrera 2022',
      brand: 'Porsche',
      model: '911 Carrera',
      year: 2022,
      category: CarCategory.ESPORTIVO,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.GASOLINA,
      seats: 2,
      airConditioning: true,
      description: 'O ícone absoluto dos carros esportivos. Motor boxer 6 cilindros, 385cv, PDK de 8 marchas. Experiência de condução única que poucos têm o privilégio de vivenciar.',
      pricePerDay: 500,
      city: 'São Paulo',
      state: 'SP',
      images: UNSPLASH_CARS.esportivo,
      rating: 5.0,
      reviewCount: 15,
    },
    {
      ownerId: owner.id,
      name: 'Ferrari California T',
      brand: 'Ferrari',
      model: 'California T',
      year: 2021,
      category: CarCategory.ESPORTIVO,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.GASOLINA,
      seats: 4,
      airConditioning: true,
      description: 'A Ferrari mais acessível, mas nada menos que extraordinária. V8 biturbo de 560cv, capota retrátil e som característico que arrepia. Uma experiência para vida toda.',
      pricePerDay: 500,
      city: 'Rio de Janeiro',
      state: 'RJ',
      images: [UNSPLASH_CARS.esportivo[1], UNSPLASH_CARS.esportivo[2], UNSPLASH_CARS.esportivo[0]],
      rating: 4.9,
      reviewCount: 8,
    },
    {
      ownerId: owner2.id,
      name: 'Chevrolet Corvette C8 2022',
      brand: 'Chevrolet',
      model: 'Corvette C8',
      year: 2022,
      category: CarCategory.ESPORTIVO,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.GASOLINA,
      seats: 2,
      airConditioning: true,
      description: 'O Corvette revolucionário com motor central V8 de 495cv. Design mid-engine inédito, interior de cockpit e performance que rivaliza com supercarros europeus.',
      pricePerDay: 450,
      city: 'Florianópolis',
      state: 'SC',
      images: [UNSPLASH_CARS.esportivo[2], UNSPLASH_CARS.esportivo[0], UNSPLASH_CARS.esportivo[1]],
      rating: 4.8,
      reviewCount: 22,
    },
    // Econômicos
    {
      ownerId: owner.id,
      name: 'Honda Civic 2023',
      brand: 'Honda',
      model: 'Civic',
      year: 2023,
      category: CarCategory.ECONOMICO,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.FLEX,
      seats: 5,
      airConditioning: true,
      description: 'Civic de 11ª geração com design completamente renovado. Motor 1.5 turbo de 173cv, Honda Sensing completo e grande espaço interno. Econômico e moderno.',
      pricePerDay: 130,
      city: 'Belo Horizonte',
      state: 'MG',
      images: UNSPLASH_CARS.economico,
      rating: 4.4,
      reviewCount: 89,
    },
    {
      ownerId: owner2.id,
      name: 'Volkswagen Polo 2023',
      brand: 'Volkswagen',
      model: 'Polo',
      year: 2023,
      category: CarCategory.ECONOMICO,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.FLEX,
      seats: 5,
      airConditioning: true,
      description: 'Polo TSI com motor 1.0 turbo de 116cv. Equipado com VW Play, câmera de ré e sensores de estacionamento. Compacto, eficiente e confiável para o dia a dia.',
      pricePerDay: 95,
      city: 'Porto Alegre',
      state: 'RS',
      images: [UNSPLASH_CARS.economico[1], UNSPLASH_CARS.economico[0], UNSPLASH_CARS.economico[2]],
      rating: 4.3,
      reviewCount: 114,
    },
    {
      ownerId: owner.id,
      name: 'Hyundai HB20 2023',
      brand: 'Hyundai',
      model: 'HB20',
      year: 2023,
      category: CarCategory.ECONOMICO,
      transmission: Transmission.MANUAL,
      fuel: FuelType.FLEX,
      seats: 5,
      airConditioning: true,
      description: 'HB20 com motor 1.0 flex de 80cv. Ideal para cidade com baixo consumo de combustível. Direção hidráulica, central multimídia e design moderno.',
      pricePerDay: 80,
      city: 'Salvador',
      state: 'BA',
      images: [UNSPLASH_CARS.economico[2], UNSPLASH_CARS.economico[1], UNSPLASH_CARS.economico[0]],
      rating: 4.1,
      reviewCount: 203,
    },
    {
      ownerId: owner2.id,
      name: 'Tesla Model 3 2023',
      brand: 'Tesla',
      model: 'Model 3',
      year: 2023,
      category: CarCategory.SEDAN,
      transmission: Transmission.AUTOMATICO,
      fuel: FuelType.ELETRICO,
      seats: 5,
      airConditioning: true,
      description: 'Model 3 Long Range com autonomia de 614km. Autopilot avançado, tela de 15,4", atualização over-the-air e aceleração de 0-100km/h em 4,4 segundos. O futuro hoje.',
      pricePerDay: 280,
      city: 'São Paulo',
      state: 'SP',
      images: [UNSPLASH_CARS.sedan[0], UNSPLASH_CARS.sedan[2], UNSPLASH_CARS.sedan[1]],
      rating: 4.7,
      reviewCount: 55,
    },
  ]

  for (const car of cars) {
    await prisma.car.create({ data: car })
  }

  console.log(`✅ ${cars.length} carros criados com sucesso!`)
  console.log(`👤 Usuários demo:`)
  console.log(`   Email: anunciante@autoshare.com | Senha: senha123`)
  console.log(`   Email: premium@autoshare.com     | Senha: senha123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
