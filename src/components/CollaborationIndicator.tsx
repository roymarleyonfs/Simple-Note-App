'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

interface CollaborationIndicatorProps {
  noteId: string
}

export function CollaborationIndicator({ noteId }: CollaborationIndicatorProps) {
  const [isCollaborating, setIsCollaborating] = useState(false)
  const [collaboratorCount, setCollaboratorCount] = useState(0)

  useEffect(() => {
    // Simulate collaboration activity
    const interval = setInterval(() => {
      // Randomly show collaboration indicators
      if (Math.random() > 0.7) {
        setIsCollaborating(true)
        setCollaboratorCount(Math.floor(Math.random() * 3) + 1)
        
        // Hide after a few seconds
        setTimeout(() => {
          setIsCollaborating(false)
          setCollaboratorCount(0)
        }, 3000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [noteId])

  if (!isCollaborating) return null

  return (
    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
      <Users className="h-3 w-3" />
      <span>{collaboratorCount} other user{collaboratorCount > 1 ? 's' : ''} editing</span>
    </div>
  )
}
