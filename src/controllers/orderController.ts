import { Request, Response } from 'express'
import prisma from '../config/prisma'

// ── CREATE ORDER ──
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const {
      items,
      shippingAddress,
      shippingCity,
      shippingProvince,
      shippingZip,
      phone,
      notes,
      courier,
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items tidak boleh kosong' })
    }

    // Hitung total
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })
      if (!product) {
        return res.status(404).json({ message: `Produk ${item.productId} tidak ditemukan` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stok ${product.name} tidak mencukupi` })
      }
      totalAmount += product.price * item.quantity
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        size: item.size || null,
      })
    }

    // Buat order + kurangi stok
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress,
          shippingCity,
          shippingProvince,
          shippingZip,
          phone,
          notes,
          courier,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      })

      // Kurangi stok tiap produk
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Kosongkan cart
      await tx.cartItem.deleteMany({ where: { userId } })

      return newOrder
    })

    return res.status(201).json(order)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── GET MY ORDERS ──
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(orders)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── GET ORDER BY ID ──
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const order = await prisma.order.findFirst({
      where: { id: Number(req.params.id), userId },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    })
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' })
    return res.json(order)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── UPDATE ORDER STATUS (admin) ──
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
    })
    return res.json(order)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}