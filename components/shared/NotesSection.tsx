import { useState } from 'react'
import { Button, Input, Card } from '@/components/ui'
import { MessageSquare } from 'lucide-react'
import { ReactNode } from 'react'
import { formatDate } from '@/lib/utils/formatters'

interface Note {
  id: string
  body: string
  author?: {
    name: string
  }
  createdAt: string
}

interface NotesSectionProps {
  notes: Note[]
  onAddNote: (body: string) => void | Promise<void>
  isAdding?: boolean
  addButtonLabel?: string
  header?: ReactNode
}

export function NotesSection({
  notes,
  onAddNote,
  isAdding = false,
  addButtonLabel = 'Add Note',
  header,
}: NotesSectionProps) {
  const [noteBody, setNoteBody] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteBody.trim()) return

    await onAddNote(noteBody)
    setNoteBody('')
  }

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={24} className="text-blue-400" />
        <h2 className="text-xl font-semibold text-white">
          {header || 'Notes'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <Input
          label="Add a note"
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          placeholder="Enter your note..."
          className="mb-3"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={isAdding}
        >
          {isAdding ? 'Adding...' : addButtonLabel}
        </Button>
      </form>

      <div className="space-y-4">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{note.author?.name}</span>
                <span className="text-sm text-gray-400">
                  {formatDate(note.createdAt)}
                </span>
              </div>
              <p className="text-gray-300 break-words">{note.body}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">No notes yet</p>
        )}
      </div>
    </Card>
  )
}
