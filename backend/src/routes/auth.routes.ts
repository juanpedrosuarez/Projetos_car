import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'

const router = Router()
const prisma = new PrismaClient()

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres.'),
  body('phone').optional().trim().isLength({ max: 20 }),
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password').notEmpty().withMessage('Senha obrigatória.'),
]

// POST /api/auth/register
router.post('/register', registerValidation, async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

  const { name, email, password, phone } = req.body

  try {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      res.status(409).json({ error: 'E-mail já cadastrado.' })
      return
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone },
      select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true },
    })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({ user, token })
  } catch {
    res.status(500).json({ error: 'Erro ao criar conta.' })
  }
})

// POST /api/auth/login
router.post('/login', loginValidation, async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas.' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ error: 'Credenciais inválidas.' })
      return
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user
    res.json({ user: userWithoutPassword, token })
  } catch {
    res.status(500).json({ error: 'Erro ao fazer login.' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true },
    })

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' })
      return
    }

    res.json(user)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar perfil.' })
  }
})

export default router
