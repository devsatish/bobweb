import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { ROOM_CONFIGS, DEFAULT_SETTINGS } from "@/types"
import { v4 as uuid } from "uuid"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Create default rooms for new user
      const roomTypes = Object.keys(ROOM_CONFIGS) as (keyof typeof ROOM_CONFIGS)[]

      for (const roomType of roomTypes) {
        const config = ROOM_CONFIGS[roomType]
        const room = await prisma.room.create({
          data: {
            userId: user.id!,
            name: config.name,
            theme: 'default',
            background: config.background,
          }
        })

        // Create default objects for this room
        for (const obj of config.defaultObjects) {
          await prisma.objectInstance.create({
            data: {
              id: uuid(),
              roomId: room.id,
              type: obj.type,
              x: obj.position.x,
              y: obj.position.y,
              scale: obj.scale,
              zIndex: obj.zIndex,
              props: { label: obj.label, icon: obj.icon }
            }
          })
        }
      }

      // Set default settings
      await prisma.user.update({
        where: { id: user.id },
        data: { settings: DEFAULT_SETTINGS }
      })
    }
  }
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
