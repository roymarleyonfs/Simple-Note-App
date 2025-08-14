'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { CollaborationIndicator } from './CollaborationIndicator'

interface NoteCardProps {
  note: {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const truncatedContent = note.content.length > 100 
    ? note.content.substring(0, 100) + '...' 
    : note.content

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-medium line-clamp-2">
            {note.title}
          </CardTitle>
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
