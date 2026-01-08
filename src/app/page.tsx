import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, StickyNote, CheckSquare, Image, MessageCircle, ArrowRight } from "lucide-react"

export default async function LandingPage() {
  const session = await auth()

  // If already logged in, redirect to home
  if (session?.user) {
    redirect("/home")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">BobWeb</span>
          </div>
          <Link
            href="/auth/signin"
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Your Friendly
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Home Desktop
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Navigate rooms, click objects, and let our AI assistant help you manage your life.
            Inspired by Microsoft Bob, built for today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Everything you need, in one place
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Home className="w-8 h-8" />}
              title="Room Navigation"
              description="Move between rooms like a real home. Living room for photos, office for work, kitchen for household tasks."
              color="from-orange-400 to-pink-500"
            />
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Calendar"
              description="Keep track of appointments, events, and important dates with our intuitive calendar."
              color="from-blue-400 to-indigo-500"
            />
            <FeatureCard
              icon={<StickyNote className="w-8 h-8" />}
              title="Sticky Notes"
              description="Colorful notes that stick around. Pin them to rooms or organize them in your collection."
              color="from-yellow-400 to-orange-500"
            />
            <FeatureCard
              icon={<CheckSquare className="w-8 h-8" />}
              title="To-Do Lists"
              description="Track tasks with due dates and priorities. Mark them complete and feel accomplished."
              color="from-green-400 to-emerald-500"
            />
            <FeatureCard
              icon={<Image className="w-8 h-8" />}
              title="Photos & Memories"
              description="Upload and organize your favorite photos. Tag them, caption them, remember them."
              color="from-purple-400 to-pink-500"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="AI Assistant"
              description="BobBot is here to help. Create notes, add todos, schedule events - just ask!"
              color="from-violet-400 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How it works
          </h2>
          <div className="space-y-8">
            <Step
              number={1}
              title="Sign in with your account"
              description="Use Google or Facebook to sign in. We create your personalized home automatically."
            />
            <Step
              number={2}
              title="Navigate to a room"
              description="Choose the Living Room, Office, or Kitchen. Each room has different tools and objects."
            />
            <Step
              number={3}
              title="Click on objects to use them"
              description="Click the calendar to manage events, sticky notes to write thoughts, or the todo list to track tasks."
            />
            <Step
              number={4}
              title="Let AI help you"
              description="Click the assistant button to chat with BobBot. It can create notes, add tasks, and answer questions."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to get organized?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join BobWeb today and experience a friendlier way to manage your digital life.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Start for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">BobWeb</span>
          </div>
          <p className="text-sm text-gray-500">
            Inspired by Microsoft Bob. Built with Next.js.
          </p>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

interface StepProps {
  number: number
  title: string
  description: string
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
