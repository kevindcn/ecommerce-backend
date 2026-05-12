import { Request, Response } from 'express'
import prisma from '../config/prisma'

// ── GET ALL PRODUCTS ──
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(products)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── GET PRODUCT BY ID ──
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    })
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' })
    return res.json(product)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── CREATE PRODUCT (admin) ──
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, image, category, stock } = req.body
    if (!name || !price || !image || !category) {
      return res.status(400).json({ message: 'Field wajib: name, price, image, category' })
    }
    const product = await prisma.product.create({
      data: { name, description, price, originalPrice, image, category, stock: stock || 0 },
    })
    return res.status(201).json(product)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── UPDATE PRODUCT (admin) ──
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    })
    return res.json(product)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── DELETE PRODUCT (admin) ──
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } })
    return res.json({ message: 'Produk berhasil dihapus' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}