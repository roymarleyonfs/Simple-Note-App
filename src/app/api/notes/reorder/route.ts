import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { noteId, newOrder } = await request.json()

    if (!noteId || typeof newOrder !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the current note and its order
    const currentNote = await prisma.note.findFirst({
      where: { id: noteId, userId: session.user.id },
      select: { order: true, pinned: true }
    })

    if (!currentNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const currentOrder = currentNote.order

    if (newOrder === currentOrder) {
      return NextResponse.json({ success: true })
    }

    // Use a transaction to update all affected notes
    await prisma.$transaction(async (tx) => {
      // Determine if we are reordering within pinned group or unpinned group
      const target = await tx.note.findFirst({
        where: { id: noteId },
        select: { pinned: true }
      })

      const isPinned = target?.pinned ?? false

      if (newOrder > currentOrder) {
        // Moving down: decrease order of notes between current and new position
        await tx.note.updateMany({
          where: {
            userId: session.user.id,
            pinned: isPinned,
            order: {
              gt: currentOrder,
              lte: newOrder
            }
          },
          data: {
            order: { decrement: 1 }
          }
        })
      } else {
        // Moving up: increase order of notes between new and current position
        await tx.note.updateMany({
          where: {
            userId: session.user.id,
            pinned: isPinned,
            order: {
              gte: newOrder,
              lt: currentOrder
            }
          },
          data: {
            order: { increment: 1 }
          }
        })
      }

      // Update the target note's order
      await tx.note.update({
        where: { id: noteId },
        data: { order: newOrder }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder notes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
