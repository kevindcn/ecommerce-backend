import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Hapus semua produk dulu
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()
  console.log('Data lama dihapus...')

  const products = [
    {
      name: 'Urban Classic Tee',
      description: 'Kaos premium dengan bahan cotton combed 30s',
      price: 189000, originalPrice: 250000,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      category: 'Apparel', stock: 50, rating: 4.8, reviews: 124,
    },
    {
      name: 'Street Cargo Pants',
      description: 'Celana cargo streetwear dengan banyak kantong',
      price: 459000, originalPrice: 599000,
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop',
      category: 'Apparel', stock: 30, rating: 4.6, reviews: 89,
    },
    {
      name: 'Minimal Hoodie',
      description: 'Hoodie oversized dengan design minimal',
      price: 389000, originalPrice: 450000,
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop',
      category: 'Apparel', stock: 25, rating: 4.9, reviews: 203,
    },
    {
      name: 'Runner Pro Sneakers',
      description: 'Sepatu lari dengan sol yang nyaman',
      price: 799000, originalPrice: 999000,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      category: 'Footwear', stock: 20, rating: 4.7, reviews: 156,
    },
    {
      name: 'Canvas Low Cut',
      description: 'Sepatu canvas klasik untuk sehari-hari',
      price: 459000, originalPrice: null,
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=500&fit=crop',
      category: 'Footwear', stock: 35, rating: 4.5, reviews: 78,
    },
    {
      name: 'Leather Crossbody Bag',
      description: 'Tas selempang kulit premium',
      price: 599000, originalPrice: 750000,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop',
      category: 'Accessories', stock: 15, rating: 4.8, reviews: 92,
    },
    {
      name: 'Snapback Cap',
      description: 'Topi snapback dengan logo emboss',
      price: 189000, originalPrice: null,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
      category: 'Accessories', stock: 40, rating: 4.4, reviews: 67,
    },
    {
      name: 'Slim Fit Chinos',
      description: 'Celana chinos slim fit untuk tampilan casual',
      price: 349000, originalPrice: 420000,
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=500&fit=crop',
      category: 'Apparel', stock: 28, rating: 4.6, reviews: 111,
    },
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log(`✅ Seeded ${products.length} products!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())