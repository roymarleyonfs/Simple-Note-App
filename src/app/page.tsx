'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { NoteEditor } from '@/components/NoteEditor'
import { Plus, LogOut, User, Edit, Trash2, Share2, Search, Upload, Settings, GripVertical, Pin, PinOff } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  order: number
  pinned?: boolean
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'custom' | 'updated'>('custom')

  // Drag and drop state (left list)
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const [reorderError, setReorderError] = useState<string | null>(null)

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
        if (selectedNoteId === noteId) {
          setSelectedNoteId(null)
        }
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
          setSelectedNoteId(newNote.id)
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
          setSelectedNoteId(updatedNote.id)
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

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId)
    setShowEditor(false)
    setEditingNote(null)
  }

  const selectedNote = selectedNoteId
    ? notes.find(n => n.id === selectedNoteId) || null
    : null

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt as unknown as string).getTime() - new Date(a.updatedAt as unknown as string).getTime())
    .slice(0, 5)

  // Derived list for left pane based on sort selection
  const pinnedNotes = notes.filter(n => n.pinned)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const unpinnedNotes = notes.filter(n => !n.pinned)
    .sort((a, b) => sortBy === 'custom'
      ? (a.order ?? 0) - (b.order ?? 0)
      : new Date(b.updatedAt as unknown as string).getTime() - new Date(a.updatedAt as unknown as string).getTime())
  const displayNotes = [...pinnedNotes, ...unpinnedNotes]

  // Drag and drop handlers for left list
  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedNoteId(noteId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetNoteId: string) => {
    e.preventDefault()

    if (!draggedNoteId || draggedNoteId === targetNoteId) {
      setDraggedNoteId(null)
      setDragOverNoteId(null)
      return
    }

    const draggedNote = notes.find(n => n.id === draggedNoteId)
    const targetNote = notes.find(n => n.id === targetNoteId)

    if (!draggedNote || !targetNote) {
      setDraggedNoteId(null)
      setDragOverNoteId(null)
      return
    }

    // Prevent cross-group reordering between pinned and unpinned
    if ((draggedNote.pinned ?? false) !== (targetNote.pinned ?? false)) {
      setDraggedNoteId(null)
      setDragOverNoteId(null)
      return
    }

    setIsReordering(true)
    setReorderError(null)
    try {
      const response = await fetch('/api/notes/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: draggedNote.id,
          newOrder: targetNote.order
        })
      })

      if (response.ok) {
        await fetchNotes()
        // Switch to custom after any manual reorder
        setSortBy('custom')
      } else {
        const errorData = await response.json()
        setReorderError(errorData.error || 'Failed to reorder note')
      }
    } catch (error) {
      console.error('Failed to reorder note:', error)
      setReorderError('Network error occurred while reordering')
    } finally {
      setIsReordering(false)
    }

    setDraggedNoteId(null)
    setDragOverNoteId(null)
  }

  const handleDragEnter = (noteId: string) => {
    if (draggedNoteId && draggedNoteId !== noteId) {
      setDragOverNoteId(noteId)
    }
  }

  const handleDragLeave = () => {
    setDragOverNoteId(null)
  }

  const togglePin = async (noteId: string, pin: boolean) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: pin })
      })
      if (response.ok) {
        await fetchNotes()
      }
    } catch (e) {
      console.error('Failed to toggle pin', e)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">ToDoDoo - Notes Dashboard</h1>
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

      {/* Split Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Pane */}
          <aside className="w-80 shrink-0">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-700">Notes</h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Sort By</label>
                  <select
                    className="text-xs border rounded px-2 py-1 bg-white"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'custom' | 'updated')}
                    aria-label="Sort notes by"
                  >
                    <option value="custom">Custom</option>
                    <option value="updated">Last Updated</option>
                  </select>
                </div>
              </div>

              {/* Notes list */}
              <div className="max-h-[360px] overflow-auto">
                {displayNotes.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No notes yet</div>
                ) : (
                  <ul className="divide-y">
                    {displayNotes.map((note) => {
                      const isActive = selectedNoteId === note.id
                      return (
                        <li
                          key={note.id}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''} ${dragOverNoteId === note.id ? 'ring-1 ring-blue-300' : ''}`}
                          onClick={() => handleSelectNote(note.id)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, note.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, note.id)}
                          onDragEnter={() => handleDragEnter(note.id)}
                          onDragLeave={handleDragLeave}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <span className="text-gray-400">
                                <GripVertical className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                  {note.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {note.content}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {note.pinned ? (
                                <button
                                  className="text-yellow-600 hover:text-yellow-700 p-1"
                                  onClick={(e) => { e.stopPropagation(); togglePin(note.id, false) }}
                                  aria-label="Unpin note"
                                >
                                  <Pin className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                  onClick={(e) => { e.stopPropagation(); togglePin(note.id, true) }}
                                  aria-label="Pin note"
                                >
                                  <PinOff className="h-4 w-4" />
                                </button>
                              )}
                              {isActive && <span className="text-xs text-blue-600">*</span>}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="px-4 py-2 text-[11px] text-gray-500 border-t">
                {isReordering ? 'Reordering…' : 'Drag and drop notes to reorder. Reordering switches Sort By to “Custom”.'}
              </div>

              <div className="px-4 py-3 border-t">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Note History</h3>
                {recentNotes.length === 0 ? (
                  <div className="text-xs text-gray-500">No recent activity</div>
                ) : (
                  <ul className="space-y-2">
                    {recentNotes.map((n) => (
                      <li key={n.id} className="text-xs text-gray-600">
                        <span className="text-gray-500">[{
                          new Date(n.updatedAt as unknown as string).toLocaleString()
                        }]</span>{' '}
                        <span className="font-medium">{n.title}</span>
                        {n.content ? ` - "${n.content.substring(0, 24)}${n.content.length > 24 ? '…' : ''}"` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="px-4 py-3 border-t">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCreateNote}>
                    <Plus className="h-4 w-4 mr-2" /> New Note
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Search not implemented yet')}>
                    <Search className="h-4 w-4 mr-2" /> Search Notes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Import not implemented yet')}>
                    <Upload className="h-4 w-4 mr-2" /> Import Notes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Settings not implemented yet')}>
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Pane */}
          <section className="flex-1">
            <div className="bg-white border rounded-lg min-h-[560px] p-6">
              {reorderError && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
                  {reorderError}
                </div>
              )}
              {!showEditor && !selectedNote ? (
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h2>
                    <div className="flex items-center gap-3">
                      <Button size="sm" onClick={handleCreateNote}>
                        <Plus className="h-4 w-4 mr-2" /> New Note
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => alert('Search not implemented yet')}>
                        <Search className="h-4 w-4 mr-2" /> Search Notes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => alert('Import not implemented yet')}>
                        <Upload className="h-4 w-4 mr-2" /> Import Notes
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 grid place-items-center text-center text-gray-600">
                    <div>
                      <div className="text-sm mb-2">( Empty State )</div>
                      <p className="text-sm">You don't have any active notes selected.</p>
                      <p className="text-sm">Use "Quick Actions" or select from "Recent Notes".</p>
                    </div>
                  </div>
                </div>
              ) : showEditor ? (
                <NoteEditor
                  note={editingNote}
                  onSave={handleSaveNote}
                  onCancel={handleCancel}
                  isEditing={!isCreating}
                />
              ) : selectedNote ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">{selectedNote.title}</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditNote(selectedNote.id)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteNote(selectedNote.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => alert('Share not implemented yet')}>
                        <Share2 className="h-4 w-4 mr-2" /> Share
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Last Edited: {new Date(selectedNote.updatedAt as unknown as string).toLocaleString()}
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800">
                    {selectedNote.content}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
