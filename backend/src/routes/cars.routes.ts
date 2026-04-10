import { Router, Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { PrismaClient, CarCategory, Transmission, FuelType } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { uploadImages } from '../middleware/upload.middleware'

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
], async (req: AuthRequest, res: Response): Promise<void> => {
  const { city, category, minPrice, maxPrice, brand, minYear, maxYear, sortBy, page = '1' } = req.query

  const PAGE_SIZE = 9
  const skip = (Number(page) - 1) * PAGE_SIZE

  const where: Record<string, unknown> = { isAvailable: true }

  if (city) where.city = { contains: String(city), mode: 'insensitive' }
  if (category) where.category = String(category).toUpperCase() as CarCategory
  if (brand) where.brand = { contains: String(brand), mode: 'insensitive' }
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

    res.json({ cars, total, page: Number(page), pages: Math.ceil(total / PAGE_SIZE) })
  } catch {
    res.status(500).json({ error: 'Erro ao buscar carros.' })
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
    res.json(cars)
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
    res.json(cars)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar seus carros.' })
  }
})

// GET /api/cars/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const car = await prisma.car.findUnique({
      where: { id: req.params.id },
      include: { owner: { select: { id: true, name: true, avatar: true, createdAt: true } } },
    })

    if (!car) {
      res.status(404).json({ error: 'Carro não encontrado.' })
      return
    }

    res.json(car)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar carro.' })
  }
})

const carValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('brand').trim().isLength({ min: 1, max: 50 }),
  body('model').trim().isLength({ min: 1, max: 50 }),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
  body('category').isIn(Object.values(CarCategory)),
  body('transmission').isIn(Object.values(Transmission)),
  body('fuel').isIn(Object.values(FuelType)),
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
        images,
      },
    })
    res.status(201).json(car)
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
