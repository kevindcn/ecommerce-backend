import { Router } from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController'
import { authenticate, isAdmin } from '../middleware/auth'

const router = Router()

router.get('/',        getProducts)
router.get('/:id',     getProductById)
router.post('/',       authenticate, isAdmin, createProduct)
router.put('/:id',     authenticate, isAdmin, updateProduct)
router.delete('/:id',  authenticate, isAdmin, deleteProduct)

export default router