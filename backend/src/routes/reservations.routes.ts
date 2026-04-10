import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'

const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { parseImages } from '../lib/parseImages'

function parseResImages<T extends { car?: { images: unknown } | null }>(r: T): T {
  if (!r.car) return r
  return { ...r, car: { ...r.car, images: parseImages(r.car.images) } }
}

const router = Router()
const prisma = new PrismaClient()

// POST /api/reservations — criar reserva
router.post('/', authenticate, [
  body('carId').isUUID().withMessage('ID do carro inválido.'),
  body('startDate').isISO8601().withMessage('Data de início inválida.'),
  body('endDate').isISO8601().withMessage('Data de fim inválida.'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

  const { carId, startDate, endDate } = req.body
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start >= end) {
    res.status(400).json({ error: 'Data de início deve ser anterior à data de fim.' })
    return
  }

  if (start < new Date()) {
    res.status(400).json({ error: 'Data de início não pode ser no passado.' })
    return
  }

  try {
    const car = await prisma.car.findUnique({ where: { id: carId } })
    if (!car || !car.isAvailable) {
      res.status(400).json({ error: 'Carro não disponível.' })
      return
    }

    if (car.ownerId === req.userId) {
      res.status(400).json({ error: 'Você não pode reservar seu próprio carro.' })
      return
    }

    // Verificar conflito de datas
    const conflict = await prisma.reservation.findFirst({
      where: {
        carId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    })

    if (conflict) {
      res.status(409).json({ error: 'Carro já reservado neste período.' })
      return
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = Number(car.pricePerDay) * days

    const reservation = await prisma.reservation.create({
      data: {
        carId,
        renterId: req.userId!,
        startDate: start,
        endDate: end,
        totalPrice,
        status: ReservationStatus.CONFIRMED,
      },
      include: {
        car: { select: { name: true, images: true, pricePerDay: true } },
      },
    })

    res.status(201).json(parseResImages(reservation))
  } catch {
    res.status(500).json({ error: 'Erro ao criar reserva.' })
  }
})

// GET /api/reservations/my — reservas do locatário
router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { renterId: req.userId },
      include: {
        car: { select: { name: true, brand: true, images: true, city: true, state: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(reservations.map(parseResImages))
  } catch {
    res.status(500).json({ error: 'Erro ao buscar reservas.' })
  }
})

// GET /api/reservations/received — reservas recebidas pelo anunciante
router.get('/received', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { car: { ownerId: req.userId } },
      include: {
        car: { select: { name: true, images: true } },
        renter: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(reservations.map(parseResImages))
  } catch {
    res.status(500).json({ error: 'Erro ao buscar reservas recebidas.' })
  }
})

// GET /api/reservations/car/:carId — datas ocupadas de um carro
router.get('/car/:carId', async (req, res: Response): Promise<void> => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        carId: req.params.carId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        endDate: { gte: new Date() },
      },
      select: { startDate: true, endDate: true },
    })
    res.json(reservations)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar disponibilidade.' })
  }
})

// PATCH /api/reservations/:id/cancel
router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } })

    if (!reservation || reservation.renterId !== req.userId) {
      res.status(403).json({ error: 'Sem permissão para cancelar esta reserva.' })
      return
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      res.status(400).json({ error: 'Reserva já cancelada.' })
      return
    }

    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: ReservationStatus.CANCELLED },
    })

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Erro ao cancelar reserva.' })
  }
})

export default router
