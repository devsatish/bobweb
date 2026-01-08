import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const photos = await prisma.photo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error("Failed to fetch photos:", error)
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

    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        url: body.url,
        caption: body.caption || null,
        tags: body.tags || [],
      },
    })

    return NextResponse.json(photo)
  } catch (error) {
    console.error("Failed to create photo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
