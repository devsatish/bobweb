import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { RoomView } from "@/components/rooms/RoomView"

interface RoomPageProps {
  params: Promise<{ roomId: string }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const { roomId } = await params

  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      userId: session.user.id,
    },
    include: {
      objects: true,
    },
  })

  if (!room) {
    notFound()
  }

  // Transform objects to match expected format
  const objects = room.objects.map((obj) => ({
    id: obj.id,
    type: obj.type,
    x: obj.x,
    y: obj.y,
    scale: obj.scale,
    zIndex: obj.zIndex,
    props: (obj.props as { label?: string; icon?: string }) || {},
  }))

  return (
    <RoomView
      room={{
        id: room.id,
        name: room.name,
        background: room.background || undefined,
      }}
      objects={objects}
    />
  )
}
