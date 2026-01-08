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
    const todo = await prisma.todo.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : todo.title,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : todo.dueDate,
        priority: body.priority !== undefined ? body.priority : todo.priority,
        completed: body.completed !== undefined ? body.completed : todo.completed,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update todo:", error)
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
    const todo = await prisma.todo.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    await prisma.todo.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
