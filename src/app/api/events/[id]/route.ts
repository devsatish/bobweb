import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const event = await prisma.calendarEvent.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : event.title,
        start: body.start !== undefined ? new Date(body.start) : event.start,
        end: body.end !== undefined ? new Date(body.end) : event.end,
        location: body.location !== undefined ? body.location : event.location,
        notes: body.notes !== undefined ? body.notes : event.notes,
        allDay: body.allDay !== undefined ? body.allDay : event.allDay,
        color: body.color !== undefined ? body.color : event.color,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const event = await prisma.calendarEvent.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    await prisma.calendarEvent.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
