import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'kevin@test.com' // ← ganti dengan email kamu
  
  const user = await prisma.user.updateMany({
    where: { email },
    data: { role: 'ADMIN' }
  })
  
  console.log('Updated:', user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())