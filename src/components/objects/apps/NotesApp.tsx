"use client"

import { useState, useEffect } from "react"
import { Plus, Pin, Archive, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Note {
  id: string
  content: string
  color: string
  pinned: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

const NOTE_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Pink", value: "#fecdd3" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Purple", value: "#ddd6fe" },
  { name: "Orange", value: "#fed7aa" },
]

interface NotesAppProps {
  roomId: string
}

export function NotesApp({ roomId }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteColor, setNewNoteColor] = useState(NOTE_COLORS[0].value)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes")
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNote = async () => {
    if (!newNoteContent.trim()) return

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newNoteContent,
          color: newNoteColor,
          roomId,
        }),
      })
      if (res.ok) {
        const newNote = await res.json()
        setNotes([newNote, ...notes])
        setNewNoteContent("")
        setNewNoteColor(NOTE_COLORS[0].value)
        setIsCreating(false)
      }
    } catch (error) {
      console.error("Failed to create note:", error)
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const updated = await res.json()
        setNotes(notes.map(n => n.id === id ? updated : n))
        if (editingNote?.id === id) {
          setEditingNote(updated)
        }
      }
    } catch (error) {
      console.error("Failed to update note:", error)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id))
        if (editingNote?.id === id) {
          setEditingNote(null)
        }
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  const filteredNotes = notes
    .filter(note => showArchived ? note.archived : !note.archived)
    .filter(note => note.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="w-4 h-4 mr-2" />
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Create Note */}
      {isCreating && (
        <div
          className="mb-6 rounded-2xl p-4 shadow-lg"
          style={{ backgroundColor: newNoteColor }}
        >
          <Textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note..."
            className="bg-transparent border-none resize-none focus:ring-0 text-gray-800 placeholder:text-gray-500"
            rows={4}
            autoFocus
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/10">
            <div className="flex gap-2">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewNoteColor(color.value)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform",
                    newNoteColor === color.value && "ring-2 ring-offset-2 ring-gray-600 scale-110"
                  )}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setNewNoteContent(""); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={createNote}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => setEditingNote(note)}
            className={cn(
              "relative rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
              note.pinned && "ring-2 ring-yellow-500"
            )}
            style={{ backgroundColor: note.color }}
          >
            {note.pinned && (
              <Pin className="absolute top-2 right-2 w-4 h-4 text-yellow-600 fill-yellow-600" />
            )}
            <p className="text-gray-800 whitespace-pre-wrap line-clamp-6">
              {note.content}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              {format(new Date(note.updatedAt), "MMM d, yyyy")}
            </p>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? "No notes found" : showArchived ? "No archived notes" : "No notes yet. Create your first note!"}
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setEditingNote(null)}
          />
          <div
            className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: editingNote.color }}
          >
            <Textarea
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              className="bg-transparent border-none resize-none focus:ring-0 text-gray-800 text-lg"
              rows={8}
              autoFocus
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/10">
              <div className="flex gap-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setEditingNote({ ...editingNote, color: color.value })
                      updateNote(editingNote.id, { color: color.value })
                    }}
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform",
                      editingNote.color === color.value && "ring-2 ring-offset-2 ring-gray-600 scale-110"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    updateNote(editingNote.id, { pinned: !editingNote.pinned })
                  }}
                  className={editingNote.pinned ? "text-yellow-600" : ""}
                >
                  <Pin className={cn("w-4 h-4", editingNote.pinned && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    updateNote(editingNote.id, { archived: !editingNote.archived })
                    setEditingNote(null)
                  }}
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNote(editingNote.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                updateNote(editingNote.id, { content: editingNote.content })
                setEditingNote(null)
              }}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
