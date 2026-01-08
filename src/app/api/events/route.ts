import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const events = await prisma.calendarEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { start: "asc" },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const event = await prisma.calendarEvent.create({
      data: {
        userId: session.user.id,
        title: body.title,
        start: new Date(body.start),
        end: new Date(body.end),
        location: body.location || null,
        notes: body.notes || null,
        allDay: body.allDay || false,
        color: body.color || "#3b82f6",
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
