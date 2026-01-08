export type ObjectType = 'calendar' | 'notes' | 'todos' | 'photos' | 'contacts'

export type RoomType = 'living-room' | 'office' | 'kitchen'

export interface Position {
  x: number
  y: number
}

export interface RoomObject {
  id: string
  type: ObjectType
  label: string
  icon: string
  position: Position
  scale: number
  zIndex: number
}

export interface RoomConfig {
  id: RoomType
  name: string
  description: string
  background: string
  defaultObjects: Omit<RoomObject, 'id'>[]
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  highContrast: boolean
  largeText: boolean
  simplifiedMode: boolean
  reducedMotion: boolean
}

export interface AIContext {
  roomId?: string
  roomName?: string
  objectType?: ObjectType
  selectedIds?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolCalls?: ToolCall[]
  toolResult?: unknown
  createdAt: Date
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  result: unknown
}

// Room configurations
export const ROOM_CONFIGS: Record<RoomType, RoomConfig> = {
  'living-room': {
    id: 'living-room',
    name: 'Living Room',
    description: 'Photos, Family, Messages, Memories',
    background: '/rooms/living-room.svg',
    defaultObjects: [
      { type: 'photos', label: 'Photos', icon: 'image', position: { x: 15, y: 30 }, scale: 1, zIndex: 1 },
      { type: 'contacts', label: 'Family', icon: 'users', position: { x: 70, y: 25 }, scale: 1, zIndex: 1 },
    ]
  },
  'office': {
    id: 'office',
    name: 'Office',
    description: 'Calendar, Notes, To-Dos, Documents',
    background: '/rooms/office.svg',
    defaultObjects: [
      { type: 'calendar', label: 'Calendar', icon: 'calendar', position: { x: 20, y: 20 }, scale: 1, zIndex: 1 },
      { type: 'notes', label: 'Notes', icon: 'sticky-note', position: { x: 60, y: 15 }, scale: 1, zIndex: 1 },
      { type: 'todos', label: 'To-Dos', icon: 'check-square', position: { x: 75, y: 50 }, scale: 1, zIndex: 1 },
    ]
  },
  'kitchen': {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Shopping list, Recipes, Household tasks',
    background: '/rooms/kitchen.svg',
    defaultObjects: [
      { type: 'todos', label: 'Shopping List', icon: 'shopping-cart', position: { x: 25, y: 35 }, scale: 1, zIndex: 1 },
      { type: 'notes', label: 'Recipes', icon: 'book-open', position: { x: 65, y: 25 }, scale: 1, zIndex: 1 },
    ]
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  highContrast: false,
  largeText: false,
  simplifiedMode: false,
  reducedMotion: false,
}
