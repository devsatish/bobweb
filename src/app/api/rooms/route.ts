import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rooms = await prisma.room.findMany({
      where: { userId: session.user.id },
      include: {
        objects: true,
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Failed to fetch rooms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
