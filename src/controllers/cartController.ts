import { Request, Response } from 'express'
import prisma from '../config/prisma'

// ── GET CART ──
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    })
    return res.json(items)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── ADD TO CART ──
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { productId, quantity, size } = req.body

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'productId dan quantity wajib diisi' })
    }

    // Cek produk ada
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' })

    // Cek stok
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Stok tidak mencukupi' })
    }

    // Upsert cart item
    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId,
          productId,
          size: size || '',
        },
      },
      update: { quantity: { increment: quantity } },
      create: { userId, productId, quantity, size: size || null },
      include: { product: true },
    })

    return res.status(201).json(item)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── UPDATE QUANTITY ──
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { quantity } = req.body
    const id = Number(req.params.id)

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } })
      return res.json({ message: 'Item dihapus dari keranjang' })
    }

    const item = await prisma.cartItem.update({
      where: { id, userId },
      data: { quantity },
      include: { product: true },
    })
    return res.json(item)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── REMOVE FROM CART ──
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    await prisma.cartItem.delete({
      where: { id: Number(req.params.id), userId },
    })
    return res.json({ message: 'Item berhasil dihapus' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── CLEAR CART ──
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    await prisma.cartItem.deleteMany({ where: { userId } })
    return res.json({ message: 'Keranjang berhasil dikosongkan' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}