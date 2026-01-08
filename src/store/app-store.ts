import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ObjectType, UserSettings, AIContext } from '@/types'

interface Room {
  id: string
  name: string
  background?: string
}

interface AppState {
  // Current state
  currentRoomId: string | null
  openObjectType: ObjectType | null
  isAIDrawerOpen: boolean
  aiContext: AIContext

  // Settings
  settings: UserSettings

  // Rooms cache
  rooms: Room[]

  // Actions
  setCurrentRoom: (roomId: string | null) => void
  setOpenObject: (objectType: ObjectType | null) => void
  toggleAIDrawer: () => void
  setAIDrawerOpen: (open: boolean) => void
  setAIContext: (context: Partial<AIContext>) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  setRooms: (rooms: Room[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentRoomId: null,
      openObjectType: null,
      isAIDrawerOpen: false,
      aiContext: {},
      settings: {
        theme: 'system',
        highContrast: false,
        largeText: false,
        simplifiedMode: false,
        reducedMotion: false,
      },
      rooms: [],

      // Actions
      setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

      setOpenObject: (objectType) => set((state) => ({
        openObjectType: objectType,
        aiContext: objectType
          ? { ...state.aiContext, objectType }
          : { ...state.aiContext, objectType: undefined },
      })),

      toggleAIDrawer: () => set((state) => ({ isAIDrawerOpen: !state.isAIDrawerOpen })),

      setAIDrawerOpen: (open) => set({ isAIDrawerOpen: open }),

      setAIContext: (context) => set((state) => ({
        aiContext: { ...state.aiContext, ...context },
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

      setRooms: (rooms) => set({ rooms }),
    }),
    {
      name: 'bobweb-storage',
      partialize: (state) => ({
        settings: state.settings,
        currentRoomId: state.currentRoomId,
      }),
    }
  )
)
