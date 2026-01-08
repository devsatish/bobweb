"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { ArrowLeft, Moon, Sun, Type, Eye, Zap, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/store/app-store"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { settings, updateSettings } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply settings to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    // Theme
    if (settings.theme === "dark") {
      root.classList.add("dark")
    } else if (settings.theme === "light") {
      root.classList.remove("dark")
    } else {
      // System preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    // High contrast
    root.classList.toggle("high-contrast", settings.highContrast)

    // Large text
    root.classList.toggle("large-text", settings.largeText)

    // Reduced motion
    root.classList.toggle("reduced-motion", settings.reducedMotion)
  }, [settings, mounted])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                {session?.user?.name?.[0] || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {session?.user?.name || "User"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Appearance
          </h3>

          {/* Theme */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Zap },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ theme: option.value as "light" | "dark" | "system" })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    settings.theme === option.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  )}
                >
                  <option.icon className={cn(
                    "w-6 h-6",
                    settings.theme === option.value
                      ? "text-blue-600"
                      : "text-gray-400"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    settings.theme === option.value
                      ? "text-blue-600"
                      : "text-gray-600 dark:text-gray-300"
                  )}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Accessibility Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Accessibility
          </h3>

          <div className="space-y-4">
            {/* High Contrast */}
            <ToggleSetting
              icon={Eye}
              label="High Contrast"
              description="Increase color contrast for better visibility"
              checked={settings.highContrast}
              onChange={(checked) => updateSettings({ highContrast: checked })}
            />

            {/* Large Text */}
            <ToggleSetting
              icon={Type}
              label="Large Text"
              description="Increase text size throughout the app"
              checked={settings.largeText}
              onChange={(checked) => updateSettings({ largeText: checked })}
            />

            {/* Reduced Motion */}
            <ToggleSetting
              icon={Zap}
              label="Reduced Motion"
              description="Minimize animations and transitions"
              checked={settings.reducedMotion}
              onChange={(checked) => updateSettings({ reducedMotion: checked })}
            />

            {/* Simplified Mode */}
            <ToggleSetting
              icon={Eye}
              label="Simplified Mode"
              description="Show fewer objects in each room"
              checked={settings.simplifiedMode}
              onChange={(checked) => updateSettings({ simplifiedMode: checked })}
            />
          </div>
        </section>

        {/* Sign Out */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </section>

        {/* Version Info */}
        <p className="text-center text-sm text-gray-400">
          BobWeb v1.0.0
        </p>
      </main>
    </div>
  )
}

interface ToggleSettingProps {
  icon: React.ElementType
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleSetting({ icon: Icon, label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div>
          <p className="font-medium text-gray-800 dark:text-white">{label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  )
}
