'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { NoteCard } from '@/components/NoteCard'
import { NoteEditor } from '@/components/NoteEditor'
import { Plus, LogOut, User } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchNotes()
    }
  }, [status, router])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = () => {
    setEditingNote(null)
    setIsCreating(true)
    setShowEditor(true)
  }

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setEditingNote(note)
      setIsCreating(false)
      setShowEditor(true)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleSaveNote = async (data: { title: string; content: string }) => {
    try {
      if (isCreating) {
        // Create new note
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          const newNote = await response.json()
          setNotes([newNote, ...notes])
          setShowEditor(false)
          setIsCreating(false)
        }
      } else if (editingNote) {
        // Update existing note
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          const updatedNote = await response.json()
          setNotes(notes.map(note => 
            note.id === editingNote.id ? updatedNote : note
          ))
          setShowEditor(false)
          setEditingNote(null)
        }
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const handleCancel = () => {
    setShowEditor(false)
    setIsCreating(false)
    setEditingNote(null)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={handleCancel}
          isEditing={!isCreating}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                {session?.user?.name || session?.user?.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Notes ({notes.length})
          </h2>
          <Button onClick={handleCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first note to get started
            </p>
            <Button onClick={handleCreateNote}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
