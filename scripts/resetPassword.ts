import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'kevin@test.com'    // ← email admin kamu
  const newPassword = 'admin123'     // ← password baru

  const hashed = await bcrypt.hash(newPassword, 10)

  const user = await prisma.user.updateMany({
    where: { email },
    data: { password: hashed }
  })

  console.log('Password berhasil direset:', user)
  console.log('Email:', email)
  console.log('Password baru:', newPassword)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())