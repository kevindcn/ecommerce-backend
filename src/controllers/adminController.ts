import { Request, Response } from 'express'
import prisma from '../config/prisma'

// ── DASHBOARD ANALYTICS ──
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStock,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, items: true },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
    ])

    return res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      recentOrders,
      lowStock,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── PRODUCTS CRUD ──
export const adminGetProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return res.json(products)
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const adminCreateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, image, category, stock } = req.body
    if (!name || !price || !image || !category) {
      return res.status(400).json({ message: 'Field wajib: name, price, image, category' })
    }
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        image,
        category,
        stock: Number(stock) || 0,
      },
    })
    return res.status(201).json(product)
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const adminUpdateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, image, category, stock } = req.body
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        image,
        category,
        stock: Number(stock),
      },
    })
    return res.json(product)
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const adminDeleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } })
    return res.json({ message: 'Produk berhasil dihapus' })
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── ORDERS ──
export const adminGetOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
        payment: true,
      },
    })
    return res.json(orders)
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
    })
    return res.json(order)
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── USERS ──
export const adminGetUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    })
    return res.json(users)
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const adminUpdateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },  // ← tambah String()
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })
    return res.json(user)
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const adminDeleteUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.id) } })  // ← tambah String()
    return res.json({ message: 'User berhasil dihapus' })
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}