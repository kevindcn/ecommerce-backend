import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/orders'
import paymentRoutes from './routes/payment'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware global ──
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// ── Routes ──
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart',     cartRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/payments', paymentRoutes)

// ── Health check ──
app.get('/', (_, res) => res.json({ status: 'Austin & Co API running 🚀' }))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))