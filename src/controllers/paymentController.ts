import { Request, Response } from 'express'
import prisma from '../config/prisma'
import { snap } from '../config/midtrans'
import { PaymentStatus, OrderStatus } from '@prisma/client'

export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { orderId, method } = req.body

    // Cari order milik user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } } },
    })
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' })

    // Buat transaksi Midtrans
    const transaction = await snap.createTransaction({
  transaction_details: {
    order_id: `ORDER-${orderId}-${Date.now()}`,
    gross_amount: order.totalAmount,
  },
  credit_card: {
    secure: true,
  },
  customer_details: {
    user_id: String(userId),
  },
  enabled_payments: [
    'credit_card',
    'bca_va',
    'bni_va',
    'bri_va',
    'mandiri_bill',
    'permata_va',
    'other_va',
    'gopay',
    'shopeepay',
    'indomaret',
    'alfamart',
    'qris',
  ],
} as any)

    // Simpan payment ke DB
    const payment = await prisma.payment.upsert({
      where: { orderId },
      update: { method: method || 'midtrans', status: 'PENDING', snapToken: transaction.token },
      create: {
        orderId,
        method: method || 'midtrans',
        amount: order.totalAmount,
        status: 'PENDING',
        snapToken: transaction.token,
      },
    })

    return res.status(201).json({
      message: 'Payment dibuat',
      snapToken: transaction.token,
      snapUrl: transaction.redirect_url,
      payment,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const notification = await (snap as any).transaction.notification(req.body)
    const { order_id, transaction_status, fraud_status } = notification

    // Ambil orderId dari format "ORDER-{id}-{timestamp}"
    const orderId = Number(order_id.split('-')[1])

  let status: PaymentStatus = PaymentStatus.PENDING
  if (transaction_status === 'settlement') status = PaymentStatus.SUCCESS
  else if (transaction_status === 'capture' && fraud_status === 'accept') status = PaymentStatus.SUCCESS
  else if (['deny', 'cancel', 'expire'].includes(transaction_status)) status = PaymentStatus.FAILED

    await prisma.payment.update({
  where: { orderId },
  data: { status },
})

   if (status === PaymentStatus.SUCCESS) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      })
    }

    return res.json({ message: 'Webhook OK' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Webhook error' })
  }
}