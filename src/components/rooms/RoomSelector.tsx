"use client"

import { useRouter } from "next/navigation"
import { Home, Briefcase, UtensilsCrossed, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomCard {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  hoverColor: string
}

const roomCards: RoomCard[] = [
  {
    id: "living-room",
    name: "Living Room",
    description: "Photos, Family, Messages",
    icon: <Home className="w-8 h-8" />,
    color: "from-orange-400 to-pink-500",
    hoverColor: "group-hover:from-orange-500 group-hover:to-pink-600",
  },
  {
    id: "office",
    name: "Office",
    description: "Calendar, Notes, To-Dos",
    icon: <Briefcase className="w-8 h-8" />,
    color: "from-blue-400 to-indigo-500",
    hoverColor: "group-hover:from-blue-500 group-hover:to-indigo-600",
  },
  {
    id: "kitchen",
    name: "Kitchen",
    description: "Shopping, Recipes, Tasks",
    icon: <UtensilsCrossed className="w-8 h-8" />,
    color: "from-green-400 to-teal-500",
    hoverColor: "group-hover:from-green-500 group-hover:to-teal-600",
  },
]

interface RoomSelectorProps {
  rooms: { id: string; name: string }[]
}

export function RoomSelector({ rooms }: RoomSelectorProps) {
  const router = useRouter()

  const handleRoomClick = (roomName: string) => {
    // Find room by name (matching with our static cards)
    const room = rooms.find(r => r.name.toLowerCase().replace(' ', '-') === roomName.toLowerCase().replace(' ', '-'))
    if (room) {
      router.push(`/rooms/${room.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Welcome Home
        </h1>
        <p className="text-lg text-gray-600">
          Choose a room to get started
        </p>
      </div>

      {/* Room Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {roomCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleRoomClick(card.name)}
            className={cn(
              "group relative overflow-hidden rounded-3xl p-6 text-left transition-all duration-300",
              "bg-gradient-to-br",
              card.color,
              card.hoverColor,
              "hover:scale-105 hover:shadow-2xl",
              "focus:outline-none focus:ring-4 focus:ring-white/50"
            )}
          >
            {/* Background decoration */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />

            {/* Content */}
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-white">
                {card.icon}
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {card.name}
              </h2>
              <p className="text-white/80 text-sm mb-4">
                {card.description}
              </p>

              <div className="flex items-center text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                Enter room
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Access Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Tip: Click on any room to explore. You can always come back here using the Home button.
        </p>
      </div>
    </div>
  )
}
