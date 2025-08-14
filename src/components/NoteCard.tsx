'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Calendar, GripVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { CollaborationIndicator } from './CollaborationIndicator'

interface NoteCardProps {
  note: {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    order: number
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, noteId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, noteId: string) => void
  onDragEnter: () => void
  onDragLeave: () => void
  isDragging: boolean
  isDragOver: boolean
}

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onDragStart, 
  onDragOver, 
  onDrop,
  onDragEnter,
  onDragLeave,
  isDragging,
  isDragOver
}: NoteCardProps) {
  const truncatedContent = note.content.length > 100 
    ? note.content.substring(0, 100) + '...' 
    : note.content

  const handleDragStart = (e: React.DragEvent) => {
    // Small delay to prevent accidental drags
    setTimeout(() => {
      onDragStart(e, note.id)
    }, 100)
  }

  return (
    <Card 
      className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, note.id)}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <div 
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-medium line-clamp-2 flex-1">
              {note.title}
            </CardTitle>
          </div>
          <div className="flex gap-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(note.id)
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(note.id)
              }}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {truncatedContent}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </div>
          <CollaborationIndicator noteId={note.id} />
        </div>
      </CardContent>
    </Card>
  )
}
