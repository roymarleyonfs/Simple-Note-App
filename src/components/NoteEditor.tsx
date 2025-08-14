'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, X, ArrowLeft } from 'lucide-react'

interface NoteEditorProps {
  note?: {
    id: string
    title: string
    content: string
  } | null
  onSave: (data: { title: string; content: string }) => void
  onCancel: () => void
  isEditing?: boolean
}

export function NoteEditor({ note, onSave, onCancel, isEditing = false }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note])

  const handleSave = async () => {
    if (!title.trim()) return
    
    setIsSaving(true)
    try {
      await onSave({ title: title.trim(), content: content.trim() })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (title || content) {
      if (confirm('Are you sure you want to discard your changes?')) {
        onCancel()
      }
    } else {
      onCancel()
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl">
            {isEditing ? 'Edit Note' : 'New Note'}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-8 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="h-8 px-3"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div>
          <Textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}
