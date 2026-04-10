import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import authRoutes from './routes/auth.routes'
import carRoutes from './routes/cars.routes'
import reservationRoutes from './routes/reservations.routes'

const app = express()
const PORT = process.env.PORT || 3001

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
}))

// Rate limiting mais restrito para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.' },
})

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Servir arquivos de upload estaticamente
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rotas
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/cars', carRoutes)
app.use('/api/reservations', reservationRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

// Error handler global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => {
  console.log(`🚀 AutoShare API rodando na porta ${PORT}`)
})

export default app
