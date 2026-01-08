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
    const note = await prisma.note.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    const updated = await prisma.note.update({
      where: { id },
      data: {
        content: body.content !== undefined ? body.content : note.content,
        color: body.color !== undefined ? body.color : note.color,
        pinned: body.pinned !== undefined ? body.pinned : note.pinned,
        archived: body.archived !== undefined ? body.archived : note.archived,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update note:", error)
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
    const note = await prisma.note.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    await prisma.note.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
