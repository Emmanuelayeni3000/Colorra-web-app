import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@colorra.app' },
    update: {},
    create: {
      email: 'demo@colorra.app',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  // Create some demo palettes
  const palettes = [
    {
      name: 'Ocean Breeze',
      description: 'Cool and refreshing ocean colors',
      colors: JSON.stringify(['#0077be', '#4da6ff', '#80ccff', '#b3e0ff', '#e6f3ff']),
      isFavorite: true,
      userId: user.id,
    },
    {
      name: 'Sunset Glow',
      description: 'Warm sunset inspired palette',
      colors: JSON.stringify(['#ff6b35', '#f7931e', '#ffdc00', '#c5d86d', '#6a994e']),
      isFavorite: false,
      userId: user.id,
    },
    {
      name: 'Forest Path',
      description: 'Natural greens and earth tones',
      colors: JSON.stringify(['#2d5016', '#4a7c59', '#6b9080', '#a4c3a2', '#e8f5e8']),
      isFavorite: true,
      userId: user.id,
    },
  ]

  for (const palette of palettes) {
    await prisma.palette.upsert({
      where: { id: palette.name }, // Using name as temp ID for upsert
      update: {},
      create: palette,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
