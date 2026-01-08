import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const todos = await prisma.todo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(todos)
  } catch (error) {
    console.error("Failed to fetch todos:", error)
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

    const todo = await prisma.todo.create({
      data: {
        userId: session.user.id,
        title: body.title,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        priority: body.priority || 0,
        completed: false,
      },
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error("Failed to create todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
