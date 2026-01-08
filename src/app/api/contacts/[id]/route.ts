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
    const contact = await prisma.contact.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : contact.name,
        relation: body.relation !== undefined ? body.relation : contact.relation,
        phone: body.phone !== undefined ? body.phone : contact.phone,
        email: body.email !== undefined ? body.email : contact.email,
        address: body.address !== undefined ? body.address : contact.address,
        notes: body.notes !== undefined ? body.notes : contact.notes,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update contact:", error)
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
    const contact = await prisma.contact.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    await prisma.contact.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete contact:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
