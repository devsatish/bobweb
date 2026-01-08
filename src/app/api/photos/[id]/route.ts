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
    const photo = await prisma.photo.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    const updated = await prisma.photo.update({
      where: { id },
      data: {
        caption: body.caption !== undefined ? body.caption : photo.caption,
        tags: body.tags !== undefined ? body.tags : photo.tags,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update photo:", error)
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
    const photo = await prisma.photo.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    await prisma.photo.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete photo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
