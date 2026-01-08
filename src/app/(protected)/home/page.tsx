import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { RoomSelector } from "@/components/rooms/RoomSelector"

export default async function HomePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const rooms = await prisma.room.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  })

  return <RoomSelector rooms={rooms} />
}
