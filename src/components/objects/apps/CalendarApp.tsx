"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  location?: string
  notes?: string
  allDay: boolean
  color: string
}

interface CalendarAppProps {
  roomId: string
}

export function CalendarApp({ roomId }: CalendarAppProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  // Form state
  const [eventTitle, setEventTitle] = useState("")
  const [eventStart, setEventStart] = useState("")
  const [eventEnd, setEventEnd] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventNotes, setEventNotes] = useState("")
  const [eventAllDay, setEventAllDay] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events")
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad days to start week on Sunday
  const startDay = monthStart.getDay()
  const paddedDays = [...Array(startDay).fill(null), ...days]

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start)
      return isSameDay(eventDate, date)
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    resetForm()
    const dateStr = format(date, "yyyy-MM-dd")
    setEventStart(`${dateStr}T09:00`)
    setEventEnd(`${dateStr}T10:00`)
    setShowEventDialog(true)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingEvent(event)
    setEventTitle(event.title)
    setEventStart(event.start.slice(0, 16))
    setEventEnd(event.end.slice(0, 16))
    setEventLocation(event.location || "")
    setEventNotes(event.notes || "")
    setEventAllDay(event.allDay)
    setShowEventDialog(true)
  }

  const resetForm = () => {
    setEditingEvent(null)
    setEventTitle("")
    setEventStart("")
    setEventEnd("")
    setEventLocation("")
    setEventNotes("")
    setEventAllDay(false)
  }

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) return

    const eventData = {
      title: eventTitle,
      start: new Date(eventStart).toISOString(),
      end: new Date(eventEnd).toISOString(),
      location: eventLocation || null,
      notes: eventNotes || null,
      allDay: eventAllDay,
    }

    try {
      if (editingEvent) {
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        })
        if (res.ok) {
          const updated = await res.json()
          setEvents(events.map(e => e.id === updated.id ? updated : e))
        }
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        })
        if (res.ok) {
          const newEvent = await res.json()
          setEvents([...events, newEvent])
        }
      }
      setShowEventDialog(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save event:", error)
    }
  }

  const handleDeleteEvent = async () => {
    if (!editingEvent) return

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setEvents(events.filter(e => e.id !== editingEvent.id))
        setShowEventDialog(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to delete event:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <Button onClick={() => { resetForm(); setSelectedDate(new Date()); const today = format(new Date(), "yyyy-MM-dd"); setEventStart(`${today}T09:00`); setEventEnd(`${today}T10:00`); setShowEventDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {paddedDays.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : []
            const isToday = day && isSameDay(day, new Date())
            const isCurrentMonth = day && isSameMonth(day, currentDate)

            return (
              <button
                key={i}
                onClick={() => day && handleDateClick(day)}
                disabled={!day}
                className={cn(
                  "min-h-[100px] p-2 border-t border-l text-left transition-colors",
                  "hover:bg-blue-50 focus:outline-none focus:bg-blue-50",
                  !day && "bg-gray-50 cursor-default",
                  !isCurrentMonth && "text-gray-400"
                )}
              >
                {day && (
                  <>
                    <span className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                      isToday && "bg-blue-600 text-white font-bold"
                    )}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(event, e)}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate hover:bg-blue-200 cursor-pointer"
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {events
            .filter(e => new Date(e.start) >= new Date())
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 5)
            .map(event => (
              <div
                key={event.id}
                onClick={(e) => handleEventClick(event, e)}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="w-1 h-12 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(event.start), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          {events.filter(e => new Date(e.start) >= new Date()).length === 0 && (
            <p className="text-gray-500 text-center py-4">No upcoming events</p>
          )}
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Start</label>
                <Input
                  type="datetime-local"
                  value={eventStart}
                  onChange={(e) => setEventStart(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">End</label>
                <Input
                  type="datetime-local"
                  value={eventEnd}
                  onChange={(e) => setEventEnd(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Add location"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder="Add notes"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-between">
            {editingEvent && (
              <Button variant="destructive" onClick={handleDeleteEvent}>
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent}>
                {editingEvent ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
