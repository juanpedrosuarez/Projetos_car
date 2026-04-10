import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import fs from 'fs'
import path from 'path'

const router = Router()

const CSV_PATH = path.join(__dirname, '../../data/whatsapp_clicks.csv')
const BOM = '\uFEFF'
const CSV_HEADER = `${BOM}nome;numero;anunciante;anuncio;cliques\n`

interface Row {
  nome: string
  numero: string
  anunciante: string
  anuncio: string
  cliques: number
}

function ensureCSV() {
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, CSV_HEADER, 'utf8')
  }
}

function readCSV(): Row[] {
  ensureCSV()
  const content = fs.readFileSync(CSV_PATH, 'utf8')
  return content
    .split('\n')
    .slice(1) // pula cabeçalho
    .filter(line => line.trim())
    .map(line => {
      const [nome, numero, anunciante, anuncio, cliques] = line.split(';')
      return { nome, numero, anunciante, anuncio, cliques: Number(cliques) }
    })
}

function writeCSV(rows: Row[]) {
  const content =
    CSV_HEADER +
    rows.map(r => `${r.nome};${r.numero};${r.anunciante};${r.anuncio};${r.cliques}`).join('\n') +
    '\n'
  fs.writeFileSync(CSV_PATH, content, 'utf8')
}

// Soma cliques por anunciante a partir das linhas
function totalPorAnunciante(rows: Row[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.anunciante] = (acc[r.anunciante] ?? 0) + r.cliques
    return acc
  }, {})
}

// POST /api/analytics/whatsapp-click
router.post('/whatsapp-click', [
  body('nome').trim().isLength({ min: 1, max: 100 }),
  body('numero').trim().isLength({ min: 1, max: 20 }),
  body('anunciante').trim().isLength({ min: 1, max: 100 }),
  body('anuncio').trim().isLength({ min: 1, max: 150 }),
], (req, res: Response): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

  const { nome, numero, anunciante, anuncio } = req.body as Row

  try {
    const rows = readCSV()

    // Chave única: mesmo clicador + mesmo anunciante + mesmo anúncio
    const existing = rows.find(
      r => r.numero === numero && r.anunciante === anunciante && r.anuncio === anuncio
    )

    if (existing) {
      existing.cliques += 1
    } else {
      rows.push({ nome, numero, anunciante, anuncio, cliques: 1 })
    }

    writeCSV(rows)

    res.json({ ok: true, totalAnunciante: totalPorAnunciante(rows)[anunciante] })
  } catch (err) {
    console.error('Erro ao salvar clique:', err)
    res.status(500).json({ error: 'Erro ao registrar clique.' })
  }
})

// GET /api/analytics/whatsapp-clicks
router.get('/whatsapp-clicks', (_req, res: Response): void => {
  try {
    const rows = readCSV()
    res.json({
      detalhes: rows,
      totalPorAnunciante: totalPorAnunciante(rows),
    })
  } catch {
    res.status(500).json({ error: 'Erro ao ler dados.' })
  }
})

export default router
