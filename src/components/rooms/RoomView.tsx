"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Settings, MessageCircle, Calendar, StickyNote, CheckSquare, Image, Users, ShoppingCart, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/app-store"
import type { ObjectType } from "@/types"
import { ObjectPanel } from "@/components/objects/ObjectPanel"
import { AIAssistant } from "@/components/ai/AIAssistant"

interface RoomObject {
  id: string
  type: string
  x: number
  y: number
  scale: number
  zIndex: number
  props: {
    label?: string
    icon?: string
  }
}

interface RoomViewProps {
  room: {
    id: string
    name: string
    background?: string
  }
  objects: RoomObject[]
}

const iconMap: Record<string, React.ReactNode> = {
  calendar: <Calendar className="w-8 h-8" />,
  "sticky-note": <StickyNote className="w-8 h-8" />,
  "check-square": <CheckSquare className="w-8 h-8" />,
  image: <Image className="w-8 h-8" />,
  users: <Users className="w-8 h-8" />,
  "shopping-cart": <ShoppingCart className="w-8 h-8" />,
  "book-open": <BookOpen className="w-8 h-8" />,
}

const colorMap: Record<string, string> = {
  calendar: "from-blue-400 to-blue-600",
  notes: "from-yellow-400 to-orange-500",
  todos: "from-green-400 to-emerald-600",
  photos: "from-purple-400 to-pink-500",
  contacts: "from-cyan-400 to-blue-500",
}

export function RoomView({ room, objects }: RoomViewProps) {
  const router = useRouter()
  const { openObjectType, setOpenObject, isAIDrawerOpen, setAIDrawerOpen, setAIContext } = useAppStore()
  const [hoveredObject, setHoveredObject] = useState<string | null>(null)

  const handleObjectClick = (obj: RoomObject) => {
    setOpenObject(obj.type as ObjectType)
    setAIContext({
      roomId: room.id,
      roomName: room.name,
      objectType: obj.type as ObjectType,
    })
  }

  const handleClosePanel = () => {
    setOpenObject(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 relative overflow-hidden">
      {/* Room Background */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <RoomBackground roomName={room.name} />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-4">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-xl shadow-md hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Home className="w-5 h-5 text-gray-700" />
          <span className="text-gray-700 font-medium">Home</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-800">{room.name}</h1>

        <button
          onClick={() => router.push("/settings")}
          className="p-2 bg-white/80 backdrop-blur rounded-xl shadow-md hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Settings className="w-5 h-5 text-gray-700" />
        </button>
      </header>

      {/* Objects Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {objects.map((obj) => (
          <button
            key={obj.id}
            onClick={() => handleObjectClick(obj)}
            onMouseEnter={() => setHoveredObject(obj.id)}
            onMouseLeave={() => setHoveredObject(null)}
            style={{
              left: `${obj.x}%`,
              top: `${obj.y}%`,
              transform: `scale(${obj.scale})`,
              zIndex: obj.zIndex,
            }}
            className={cn(
              "absolute pointer-events-auto",
              "w-24 h-24 rounded-2xl",
              "bg-gradient-to-br",
              colorMap[obj.type] || "from-gray-400 to-gray-600",
              "flex flex-col items-center justify-center gap-2",
              "text-white shadow-lg",
              "transition-all duration-300",
              "hover:scale-110 hover:shadow-2xl hover:-translate-y-1",
              "focus:outline-none focus:ring-4 focus:ring-white/50",
              hoveredObject === obj.id && "scale-110 -translate-y-1"
            )}
          >
            {iconMap[obj.props.icon || ""] || <div className="w-8 h-8" />}
            <span className="text-xs font-medium text-center px-1">
              {obj.props.label || obj.type}
            </span>
          </button>
        ))}
      </div>

      {/* AI Assistant Button */}
      <button
        onClick={() => setAIDrawerOpen(!isAIDrawerOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-30",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-violet-500 to-purple-600",
          "flex items-center justify-center",
          "text-white shadow-lg",
          "transition-all duration-300",
          "hover:scale-110 hover:shadow-2xl",
          "focus:outline-none focus:ring-4 focus:ring-purple-500/50",
          isAIDrawerOpen && "scale-110"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Object Panel */}
      {openObjectType && (
        <ObjectPanel
          objectType={openObjectType}
          roomId={room.id}
          onClose={handleClosePanel}
        />
      )}

      {/* AI Assistant Drawer */}
      <AIAssistant
        isOpen={isAIDrawerOpen}
        onClose={() => setAIDrawerOpen(false)}
        roomId={room.id}
        roomName={room.name}
      />
    </div>
  )
}

function RoomBackground({ roomName }: { roomName: string }) {
  // Simple SVG backgrounds for each room
  const backgrounds: Record<string, React.ReactNode> = {
    "Living Room": (
      <svg viewBox="0 0 800 400" className="w-full h-64 md:h-96">
        {/* Floor */}
        <rect x="0" y="300" width="800" height="100" fill="#d4a574" />
        {/* Wall */}
        <rect x="0" y="0" width="800" height="300" fill="#f5e6d3" />
        {/* Window */}
        <rect x="300" y="50" width="200" height="150" fill="#87ceeb" stroke="#8b7355" strokeWidth="8" />
        <line x1="400" y1="50" x2="400" y2="200" stroke="#8b7355" strokeWidth="4" />
        <line x1="300" y1="125" x2="500" y2="125" stroke="#8b7355" strokeWidth="4" />
        {/* Couch */}
        <rect x="100" y="220" width="250" height="80" rx="10" fill="#6b8e9f" />
        <rect x="100" y="200" width="250" height="30" rx="8" fill="#7aa3b5" />
        {/* Side table */}
        <rect x="380" y="260" width="60" height="40" fill="#8b7355" />
        {/* Lamp */}
        <rect x="400" y="200" width="20" height="60" fill="#8b7355" />
        <ellipse cx="410" cy="190" rx="30" ry="20" fill="#f4e4bc" />
        {/* Picture frame */}
        <rect x="550" y="80" width="100" height="80" fill="#8b7355" />
        <rect x="560" y="90" width="80" height="60" fill="#98d1a8" />
      </svg>
    ),
    "Office": (
      <svg viewBox="0 0 800 400" className="w-full h-64 md:h-96">
        {/* Floor */}
        <rect x="0" y="300" width="800" height="100" fill="#a0522d" />
        {/* Wall */}
        <rect x="0" y="0" width="800" height="300" fill="#e8dfd5" />
        {/* Desk */}
        <rect x="200" y="220" width="400" height="20" fill="#8b7355" />
        <rect x="220" y="240" width="30" height="60" fill="#8b7355" />
        <rect x="550" y="240" width="30" height="60" fill="#8b7355" />
        {/* Monitor */}
        <rect x="350" y="140" width="100" height="70" rx="5" fill="#333" />
        <rect x="355" y="145" width="90" height="55" fill="#4a90d9" />
        <rect x="390" y="210" width="20" height="10" fill="#333" />
        {/* Chair */}
        <ellipse cx="400" cy="280" rx="50" ry="20" fill="#4a4a4a" />
        <rect x="370" y="260" width="60" height="20" fill="#4a4a4a" />
        {/* Bookshelf */}
        <rect x="50" y="80" width="100" height="180" fill="#8b7355" />
        <rect x="55" y="90" width="90" height="40" fill="#f5e6d3" />
        <rect x="55" y="140" width="90" height="40" fill="#f5e6d3" />
        <rect x="55" y="190" width="90" height="40" fill="#f5e6d3" />
        {/* Books */}
        <rect x="60" y="95" width="15" height="30" fill="#e74c3c" />
        <rect x="78" y="100" width="12" height="25" fill="#3498db" />
        <rect x="93" y="95" width="18" height="30" fill="#2ecc71" />
        {/* Calendar on wall */}
        <rect x="650" y="60" width="80" height="100" fill="#fff" stroke="#333" strokeWidth="2" />
        <rect x="650" y="60" width="80" height="25" fill="#e74c3c" />
      </svg>
    ),
    "Kitchen": (
      <svg viewBox="0 0 800 400" className="w-full h-64 md:h-96">
        {/* Floor */}
        <pattern id="tiles" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="#f5f5f5" />
          <rect x="25" y="0" width="25" height="25" fill="#e0e0e0" />
          <rect x="0" y="25" width="25" height="25" fill="#e0e0e0" />
        </pattern>
        <rect x="0" y="300" width="800" height="100" fill="url(#tiles)" />
        {/* Wall */}
        <rect x="0" y="0" width="800" height="300" fill="#fff8e7" />
        {/* Cabinets */}
        <rect x="50" y="40" width="300" height="100" fill="#8b7355" />
        <rect x="60" y="50" width="130" height="80" fill="#a0845c" stroke="#6d5a3a" strokeWidth="2" />
        <rect x="210" y="50" width="130" height="80" fill="#a0845c" stroke="#6d5a3a" strokeWidth="2" />
        {/* Counter */}
        <rect x="50" y="200" width="350" height="100" fill="#f5f5f5" stroke="#ddd" strokeWidth="2" />
        <rect x="50" y="190" width="350" height="15" fill="#333" />
        {/* Stove */}
        <rect x="150" y="210" width="120" height="80" fill="#444" rx="5" />
        <circle cx="190" cy="240" r="20" fill="#222" stroke="#666" strokeWidth="2" />
        <circle cx="240" cy="240" r="20" fill="#222" stroke="#666" strokeWidth="2" />
        {/* Fridge */}
        <rect x="500" y="100" width="120" height="200" fill="#e0e0e0" rx="5" />
        <rect x="510" y="110" width="100" height="90" fill="#d0d0d0" rx="3" />
        <rect x="510" y="210" width="100" height="80" fill="#d0d0d0" rx="3" />
        <circle cx="600" cy="155" r="5" fill="#888" />
        <circle cx="600" cy="250" r="5" fill="#888" />
        {/* Window */}
        <rect x="650" y="50" width="100" height="100" fill="#87ceeb" stroke="#8b7355" strokeWidth="6" />
        {/* Plant */}
        <rect x="680" y="160" width="40" height="40" fill="#8b4513" />
        <ellipse cx="700" cy="145" rx="30" ry="25" fill="#228b22" />
      </svg>
    ),
  }

  return backgrounds[roomName] || backgrounds["Living Room"]
}
