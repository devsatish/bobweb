import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import OpenAI from "openai"
import { v4 as uuid } from "uuid"

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

const SYSTEM_PROMPT = `You are BobBot, a friendly AI assistant in BobWeb - a visual home desktop app inspired by Microsoft Bob.

Your personality:
- Friendly, helpful, and patient
- Use simple language that's easy to understand
- Be encouraging and supportive

You can help users with:
- Managing their calendar events
- Creating and organizing notes
- Managing their to-do lists
- Answering questions about their schedule and tasks

When users ask you to create things, use the appropriate tool. Always confirm with users before taking actions.

Available tools:
- create_note: Create a new note
- create_todo: Create a new to-do item
- create_calendar_event: Create a new calendar event
- get_upcoming_events: Get upcoming calendar events
- get_todos: Get the user's to-do items

Current context will be provided about which room the user is in.`

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_note",
      description: "Create a new note for the user",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The content of the note",
          },
        },
        required: ["content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_todo",
      description: "Create a new to-do item for the user",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the to-do item",
          },
          dueDate: {
            type: "string",
            description: "The due date in ISO format (optional)",
          },
          priority: {
            type: "number",
            description: "Priority level: 0=low, 1=medium, 2=high",
            enum: [0, 1, 2],
          },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_calendar_event",
      description: "Create a new calendar event for the user",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the event",
          },
          start: {
            type: "string",
            description: "Start date/time in ISO format",
          },
          end: {
            type: "string",
            description: "End date/time in ISO format",
          },
          location: {
            type: "string",
            description: "Location of the event (optional)",
          },
        },
        required: ["title", "start", "end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_upcoming_events",
      description: "Get the user's upcoming calendar events",
      parameters: {
        type: "object",
        properties: {
          days: {
            type: "number",
            description: "Number of days to look ahead (default 7)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_todos",
      description: "Get the user's to-do items",
      parameters: {
        type: "object",
        properties: {
          includeCompleted: {
            type: "boolean",
            description: "Include completed items (default false)",
          },
        },
      },
    },
  },
]

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message, context, sessionId } = body

    // Get or create chat session
    let chatSession
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: session.user.id },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
      })
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 50),
        },
        include: { messages: true },
      })
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "user",
        content: message,
      },
    })

    // Build messages for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ]

    // Add context
    if (context) {
      messages.push({
        role: "system",
        content: `Current context: User is in the ${context.roomName || "Home"} room.`,
      })
    }

    // Add conversation history
    for (const msg of chatSession.messages) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    }

    // Add current message
    messages.push({ role: "user", content: message })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send session ID
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "session", sessionId: chatSession.id })}\n\n`)
          )

          const openai = getOpenAIClient()
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            tools,
            stream: true,
          })

          let fullContent = ""
          const toolCalls: Record<string, { name: string; arguments: string }> = {}

          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta

            // Handle content
            if (delta?.content) {
              fullContent += delta.content
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "content", content: delta.content })}\n\n`)
              )
            }

            // Handle tool calls
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const id = tc.id || Object.keys(toolCalls)[tc.index!] || uuid()
                if (!toolCalls[id]) {
                  toolCalls[id] = { name: tc.function?.name || "", arguments: "" }
                }
                if (tc.function?.name) {
                  toolCalls[id].name = tc.function.name
                }
                if (tc.function?.arguments) {
                  toolCalls[id].arguments += tc.function.arguments
                }
              }
            }
          }

          // Process tool calls
          for (const [id, tc] of Object.entries(toolCalls)) {
            if (tc.name && tc.arguments) {
              try {
                const args = JSON.parse(tc.arguments)
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: "tool_call",
                    id,
                    name: tc.name,
                    arguments: args
                  })}\n\n`)
                )

                // Execute tool
                const result = await executeToolCall(session.user.id, tc.name, args)
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: "tool_result",
                    toolCallId: id,
                    result
                  })}\n\n`)
                )
              } catch (e) {
                console.error("Tool call error:", e)
              }
            }
          }

          // Save assistant message
          if (fullContent) {
            await prisma.chatMessage.create({
              data: {
                sessionId: chatSession.id,
                role: "assistant",
                content: fullContent,
                toolCalls: Object.keys(toolCalls).length > 0 ? toolCalls : undefined,
              },
            })
          }

          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function executeToolCall(
  userId: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    case "create_note": {
      const note = await prisma.note.create({
        data: {
          userId,
          content: args.content as string,
          color: "#fef08a",
        },
      })
      return `Created note: "${(args.content as string).slice(0, 50)}..."`
    }

    case "create_todo": {
      const todo = await prisma.todo.create({
        data: {
          userId,
          title: args.title as string,
          dueDate: args.dueDate ? new Date(args.dueDate as string) : null,
          priority: (args.priority as number) || 0,
        },
      })
      return `Created to-do: "${todo.title}"`
    }

    case "create_calendar_event": {
      const event = await prisma.calendarEvent.create({
        data: {
          userId,
          title: args.title as string,
          start: new Date(args.start as string),
          end: new Date(args.end as string),
          location: (args.location as string) || null,
        },
      })
      return `Created event: "${event.title}"`
    }

    case "get_upcoming_events": {
      const days = (args.days as number) || 7
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + days)

      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          start: { gte: new Date(), lte: endDate },
        },
        orderBy: { start: "asc" },
        take: 10,
      })

      if (events.length === 0) {
        return "No upcoming events in the next " + days + " days."
      }

      return events
        .map(e => `- ${e.title} on ${e.start.toLocaleDateString()}`)
        .join("\n")
    }

    case "get_todos": {
      const includeCompleted = args.includeCompleted as boolean

      const todos = await prisma.todo.findMany({
        where: {
          userId,
          completed: includeCompleted ? undefined : false,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })

      if (todos.length === 0) {
        return "No to-do items found."
      }

      return todos
        .map(t => `- ${t.completed ? "✓" : "○"} ${t.title}`)
        .join("\n")
    }

    default:
      return "Unknown tool"
  }
}
