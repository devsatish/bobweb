"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ObjectType } from "@/types"
import { CalendarApp } from "./apps/CalendarApp"
import { NotesApp } from "./apps/NotesApp"
import { TodosApp } from "./apps/TodosApp"
import { PhotosApp } from "./apps/PhotosApp"
import { ContactsApp } from "./apps/ContactsApp"

interface ObjectPanelProps {
  objectType: ObjectType
  roomId: string
  onClose: () => void
}

const appComponents: Record<ObjectType, React.ComponentType<{ roomId: string }>> = {
  calendar: CalendarApp,
  notes: NotesApp,
  todos: TodosApp,
  photos: PhotosApp,
  contacts: ContactsApp,
}

const appTitles: Record<ObjectType, string> = {
  calendar: "Calendar",
  notes: "Notes",
  todos: "To-Dos",
  photos: "Photos",
  contacts: "Contacts",
}

const appColors: Record<ObjectType, string> = {
  calendar: "from-blue-500 to-blue-600",
  notes: "from-yellow-500 to-orange-500",
  todos: "from-green-500 to-emerald-600",
  photos: "from-purple-500 to-pink-500",
  contacts: "from-cyan-500 to-blue-500",
}

export function ObjectPanel({ objectType, roomId, onClose }: ObjectPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation on mount
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  const AppComponent = appComponents[objectType]

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 bg-gradient-to-r",
          appColors[objectType]
        )}>
          <h2 className="text-xl font-bold text-white">
            {appTitles[objectType]}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-64px)] overflow-auto">
          <AppComponent roomId={roomId} />
        </div>
      </div>
    </>
  )
}
