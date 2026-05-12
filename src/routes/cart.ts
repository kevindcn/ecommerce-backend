import { Router } from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/',           authenticate, getCart)
router.post('/',          authenticate, addToCart)
router.put('/:id',        authenticate, updateCartItem)
router.delete('/clear',   authenticate, clearCart)
router.delete('/:id',     authenticate, removeFromCart)

export default router