"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider)
    await signIn(provider, { callbackUrl: "/home" })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-14 h-14 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">BobWeb</h1>
          <p className="text-blue-700 text-lg">Your friendly home desktop</p>
        </div>

        {/* Sign-in Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            Welcome! Sign in to get started
          </h2>

          <div className="space-y-4">
            <button
              onClick={() => handleSignIn("google")}
              disabled={isLoading !== null}
              className={cn(
                "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium transition-all hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isLoading === "google" && "opacity-70 cursor-wait"
              )}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading === "google" ? "Signing in..." : "Continue with Google"}
            </button>

            <button
              onClick={() => handleSignIn("facebook")}
              disabled={isLoading !== null}
              className={cn(
                "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium transition-all hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isLoading === "facebook" && "opacity-70 cursor-wait"
              )}
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {isLoading === "facebook" ? "Signing in..." : "Continue with Facebook"}
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 rounded-xl p-4">
            <div className="text-2xl mb-1">🏠</div>
            <p className="text-sm text-blue-800 font-medium">Room Navigation</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <div className="text-2xl mb-1">📝</div>
            <p className="text-sm text-blue-800 font-medium">Notes & Tasks</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <div className="text-2xl mb-1">🤖</div>
            <p className="text-sm text-blue-800 font-medium">AI Assistant</p>
          </div>
        </div>
      </div>
    </div>
  )
}
