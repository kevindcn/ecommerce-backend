import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/orders'
import paymentRoutes from './routes/payment'
import adminRoutes from './routes/admin'

const app  = express()
const PORT = process.env.PORT || 5000
app.set('trust proxy', 1)
app.use('/api/admin', adminRoutes)

// ── Middleware global ──
app.use(helmet())
app.use(cors({
  origin: '*',
  credentials: false,
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