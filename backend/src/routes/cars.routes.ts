import { Router, Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'

const VALID_CATEGORIES = ['SUV', 'SEDAN', 'ESPORTIVO', 'ECONOMICO', 'HATCH', 'PICKUP']
const VALID_TRANSMISSIONS = ['AUTOMATICO', 'MANUAL']
const VALID_FUELS = ['GASOLINA', 'DIESEL', 'ELETRICO', 'HIBRIDO', 'FLEX']
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { uploadImages } from '../middleware/upload.middleware'
import { parseCar, parseCars } from '../lib/parseImages'
import { citiesWithinRadius, getCityCoords } from '../lib/citiesCoords'

const router = Router()
const prisma = new PrismaClient()

// GET /api/cars — listagem com filtros
router.get('/', [
  query('city').optional().trim().escape(),
  query('category').optional(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('brand').optional().trim().escape(),
  query('minYear').optional().isInt({ min: 1990 }),
  query('maxYear').optional().isInt({ max: 2030 }),
  query('sortBy').optional().isIn(['price_asc', 'price_desc', 'rating', 'recent']),
  query('page').optional().isInt({ min: 1 }),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat({ min: 1 }),
], async (req: AuthRequest, res: Response): Promise<void> => {
  const { city, category, minPrice, maxPrice, brand, minYear, maxYear, sortBy, page = '1', lat, lng, radius } = req.query

  const PAGE_SIZE = 9
  const skip = (Number(page) - 1) * PAGE_SIZE

  const where: Record<string, unknown> = { isAvailable: true }

  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

  // Filtro por raio geográfico (lat/lng + radius em km)
  if (lat && lng && radius) {
    const nearbyCities = citiesWithinRadius(Number(lat), Number(lng), Number(radius))
    where.city = { in: nearbyCities }
  } else if (city) {
    // Filtro por cidade + raio opcional usando coordenadas da cidade
    const cityRadius = radius ? Number(radius) : 0
    const coords = getCityCoords(String(city))
    if (cityRadius > 0 && coords) {
      const nearbyCities = citiesWithinRadius(coords.lat, coords.lng, cityRadius)
      where.city = { in: nearbyCities }
    } else {
      const normalizedSearch = normalize(String(city))
      const allCities = await prisma.car.findMany({ select: { city: true }, distinct: ['city'] })
      const matching = allCities.map(c => c.city).filter(c => normalize(c).includes(normalizedSearch))
      where.city = matching.length > 0 ? { in: matching } : { in: [] }
    }
  }

  if (category) where.category = String(category).toUpperCase()
  if (brand) where.brand = { contains: String(brand) }
  if (minPrice || maxPrice) {
    where.pricePerDay = {
      ...(minPrice && { gte: Number(minPrice) }),
      ...(maxPrice && { lte: Number(maxPrice) }),
    }
  }
  if (minYear || maxYear) {
    where.year = {
      ...(minYear && { gte: Number(minYear) }),
      ...(maxYear && { lte: Number(maxYear) }),
    }
  }

  const orderBy: Record<string, string> =
    sortBy === 'price_asc' ? { pricePerDay: 'asc' } :
    sortBy === 'price_desc' ? { pricePerDay: 'desc' } :
    sortBy === 'rating' ? { rating: 'desc' } :
    { createdAt: 'desc' }

  try {
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy,
        skip,
        take: PAGE_SIZE,
        include: { owner: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.car.count({ where }),
    ])

    res.json({ cars: parseCars(cars), total, page: Number(page), pages: Math.ceil(total / PAGE_SIZE) })
  } catch {
    res.status(500).json({ error: 'Erro ao buscar carros.' })
  }
})

// GET /api/cars/cities — lista de cidades disponíveis para autocomplete
router.get('/cities', async (_req, res: Response): Promise<void> => {
  try {
    const result = await prisma.car.findMany({
      where: { isAvailable: true },
      select: { city: true, state: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    })
    res.json(result.map(r => ({ city: r.city, state: r.state })))
  } catch {
    res.status(500).json({ error: 'Erro ao buscar cidades.' })
  }
})

// GET /api/cars/featured — 6 carros em destaque (maior rating)
router.get('/featured', async (_req, res: Response): Promise<void> => {
  try {
    const cars = await prisma.car.findMany({
      where: { isAvailable: true },
      orderBy: { rating: 'desc' },
      take: 6,
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    })
    res.json(parseCars(cars))
  } catch {
    res.status(500).json({ error: 'Erro ao buscar carros em destaque.' })
  }
})

// GET /api/cars/my — carros do usuário autenticado
router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cars = await prisma.car.findMany({
      where: { ownerId: req.userId },
      include: { reservations: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(parseCars(cars))
  } catch {
    res.status(500).json({ error: 'Erro ao buscar seus carros.' })
  }
})

// GET /api/cars/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const car = await prisma.car.findUnique({
      where: { id: req.params.id },
      include: { owner: { select: { id: true, name: true, avatar: true, phone: true, createdAt: true } } },
    })

    if (!car) {
      res.status(404).json({ error: 'Carro não encontrado.' })
      return
    }

    res.json(parseCar(car))
  } catch {
    res.status(500).json({ error: 'Erro ao buscar carro.' })
  }
})

const carValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('brand').trim().isLength({ min: 1, max: 50 }),
  body('model').trim().isLength({ min: 1, max: 50 }),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
  body('category').isIn(VALID_CATEGORIES),
  body('transmission').isIn(VALID_TRANSMISSIONS),
  body('fuel').isIn(VALID_FUELS),
  body('seats').isInt({ min: 1, max: 15 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('pricePerDay').isFloat({ min: 1 }),
  body('city').trim().isLength({ min: 2, max: 100 }),
  body('state').trim().isLength({ min: 2, max: 2 }),
]

// POST /api/cars
router.post('/', authenticate, uploadImages.array('images', 5), carValidation, async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

  const files = req.files as Express.Multer.File[]
  const images = files?.map(f => `/uploads/${f.filename}`) ?? []

  try {
    const car = await prisma.car.create({
      data: {
        ...req.body,
        ownerId: req.userId!,
        year: Number(req.body.year),
        seats: Number(req.body.seats),
        pricePerDay: Number(req.body.pricePerDay),
        airConditioning: req.body.airConditioning === 'true',
        images: JSON.stringify(images),
      },
    })
    res.status(201).json(parseCar(car))
  } catch {
    res.status(500).json({ error: 'Erro ao cadastrar carro.' })
  }
})

// PUT /api/cars/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } })
    if (!car || car.ownerId !== req.userId) {
      res.status(403).json({ error: 'Sem permissão para editar este carro.' })
      return
    }

    const updated = await prisma.car.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar carro.' })
  }
})

// DELETE /api/cars/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } })
    if (!car || car.ownerId !== req.userId) {
      res.status(403).json({ error: 'Sem permissão para remover este carro.' })
      return
    }

    await prisma.car.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch {
    res.status(500).json({ error: 'Erro ao remover carro.' })
  }
})

export default router
