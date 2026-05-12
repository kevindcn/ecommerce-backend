import { Router } from 'express'
import { createPayment, handleWebhook } from '../controllers/paymentController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/',         authenticate, createPayment)
router.post('/webhook',  handleWebhook)

export default router