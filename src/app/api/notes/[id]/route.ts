import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Get note error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const note = await prisma.note.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title,
        content,
        updatedAt: new Date(),
      }
    })

    if (note.count === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const updatedNote = await prisma.note.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Update note error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const note = await prisma.note.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    })

    if (note.count === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
