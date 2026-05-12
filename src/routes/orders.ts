import { Router } from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController'
import { authenticate, isAdmin } from '../middleware/auth'

const router = Router()

router.post('/',        authenticate, createOrder)
router.get('/my',       authenticate, getMyOrders)
router.get('/:id',      authenticate, getOrderById)
router.put('/:id',      authenticate, isAdmin, updateOrderStatus)

export default router