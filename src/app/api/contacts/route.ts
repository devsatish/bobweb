import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contacts = await prisma.contact.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Failed to fetch contacts:", error)
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

    const contact = await prisma.contact.create({
      data: {
        userId: session.user.id,
        name: body.name,
        relation: body.relation || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Failed to create contact:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
