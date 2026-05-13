import { Router } from 'express'
import { authenticate, isAdmin } from '../middleware/auth'
import {
  getDashboard,
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminGetOrders, adminUpdateOrderStatus,
  adminGetUsers, adminUpdateUserRole, adminDeleteUser,
} from '../controllers/adminController'

const router = Router()

// Semua route admin butuh login + role ADMIN
router.use(authenticate, isAdmin)

// Dashboard
router.get('/dashboard', getDashboard)

// Products
router.get('/products',        adminGetProducts)
router.post('/products',       adminCreateProduct)
router.put('/products/:id',    adminUpdateProduct)
router.delete('/products/:id', adminDeleteProduct)

// Orders
router.get('/orders',          adminGetOrders)
router.put('/orders/:id',      adminUpdateOrderStatus)

// Users
router.get('/users',           adminGetUsers)
router.put('/users/:id/role',  adminUpdateUserRole)
router.delete('/users/:id',    adminDeleteUser)

export default router