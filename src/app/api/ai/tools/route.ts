import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Allowed tools for security
const ALLOWED_TOOLS = [
  "create_note",
  "create_todo",
  "create_calendar_event",
  "get_upcoming_events",
  "get_todos",
]

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { toolName, arguments: args } = body

    // Validate tool name
    if (!ALLOWED_TOOLS.includes(toolName)) {
      return NextResponse.json({ error: "Invalid tool" }, { status: 400 })
    }

    // Execute tool
    let result: string
    let success = true

    try {
      switch (toolName) {
        case "create_note": {
          if (!args.content || typeof args.content !== "string") {
            throw new Error("Content is required")
          }
          const note = await prisma.note.create({
            data: {
              userId: session.user.id,
              content: args.content,
              color: "#fef08a",
            },
          })
          result = `Note created successfully!`
          break
        }

        case "create_todo": {
          if (!args.title || typeof args.title !== "string") {
            throw new Error("Title is required")
          }
          const todo = await prisma.todo.create({
            data: {
              userId: session.user.id,
              title: args.title,
              dueDate: args.dueDate ? new Date(args.dueDate) : null,
              priority: args.priority || 0,
            },
          })
          result = `To-do "${todo.title}" created!`
          break
        }

        case "create_calendar_event": {
          if (!args.title || !args.start || !args.end) {
            throw new Error("Title, start, and end are required")
          }
          const event = await prisma.calendarEvent.create({
            data: {
              userId: session.user.id,
              title: args.title,
              start: new Date(args.start),
              end: new Date(args.end),
              location: args.location || null,
            },
          })
          result = `Event "${event.title}" created!`
          break
        }

        case "get_upcoming_events": {
          const days = args.days || 7
          const endDate = new Date()
          endDate.setDate(endDate.getDate() + days)

          const events = await prisma.calendarEvent.findMany({
            where: {
              userId: session.user.id,
              start: { gte: new Date(), lte: endDate },
            },
            orderBy: { start: "asc" },
            take: 10,
          })

          result = events.length > 0
            ? `Found ${events.length} upcoming events`
            : "No upcoming events"
          break
        }

        case "get_todos": {
          const includeCompleted = args.includeCompleted || false

          const todos = await prisma.todo.findMany({
            where: {
              userId: session.user.id,
              completed: includeCompleted ? undefined : false,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          })

          result = todos.length > 0
            ? `Found ${todos.length} to-do items`
            : "No to-do items found"
          break
        }

        default:
          throw new Error("Unknown tool")
      }
    } catch (error) {
      success = false
      result = error instanceof Error ? error.message : "An error occurred"
    }

    return NextResponse.json({ success, message: result })
  } catch (error) {
    console.error("Tool execution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
