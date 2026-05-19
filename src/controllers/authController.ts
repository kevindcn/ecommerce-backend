import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma'

const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
}

// ── REGISTER ──
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' })
    }

    // Cek email sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar' })
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    // Buat user
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    })

    const token = generateToken(user.id, user.role)

    return res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── LOGIN ──
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' })
    }

    // Cari user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    // Cek password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    const token = generateToken(user.id, user.role)

    return res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// ── GET PROFILE ──
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true },
    })
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })
    return res.json(user)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}