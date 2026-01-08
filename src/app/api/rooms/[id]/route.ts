import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const room = await prisma.room.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        objects: true,
      },
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error("Failed to fetch room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const room = await prisma.room.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Update object positions if provided
    if (body.objects) {
      for (const obj of body.objects) {
        await prisma.objectInstance.update({
          where: { id: obj.id },
          data: {
            x: obj.x,
            y: obj.y,
            scale: obj.scale,
            zIndex: obj.zIndex,
          },
        })
      }
    }

    const updated = await prisma.room.findFirst({
      where: { id },
      include: { objects: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
