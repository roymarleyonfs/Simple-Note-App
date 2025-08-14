import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  })

  // Create some sample notes
  const notes = [
    {
      title: 'Welcome to Notes App',
      content: 'This is your first note! You can edit it, delete it, or create new ones.',
      userId: user.id,
      order: 0,
    },
    {
      title: 'Shopping List',
      content: '- Milk\n- Bread\n- Eggs\n- Coffee',
      userId: user.id,
      order: 1,
    },
    {
      title: 'Meeting Notes',
      content: 'Team standup at 9 AM\nDiscuss Q4 goals\nReview project timeline',
      userId: user.id,
      order: 2,
    },
  ]

  for (const note of notes) {
    await prisma.note.upsert({
      where: { 
        id: `${note.title.toLowerCase().replace(/\s+/g, '-')}-${user.id}` 
      },
      update: {},
      create: note,
    })
  }

  console.log('Database seeded successfully!')
  console.log('Demo user: demo@example.com')
  console.log('Password: demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
