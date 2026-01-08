import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notes = await prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Failed to fetch notes:", error)
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

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        content: body.content,
        color: body.color || "#fef08a",
        roomId: body.roomId || null,
        pinned: body.pinned || false,
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Failed to create note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
