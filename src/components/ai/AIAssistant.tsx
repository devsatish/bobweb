"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, Sparkles, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: string
  toolCalls?: ToolCall[]
  createdAt: Date
}

interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  status?: "pending" | "success" | "error"
  result?: string
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  roomName: string
}

const SUGGESTED_PROMPTS = [
  "What's on my schedule tomorrow?",
  "Create a reminder to call Mom",
  "Add 'Buy groceries' to my todo list",
  "Summarize my recent notes",
]

export function AIAssistant({ isOpen, onClose, roomId, roomName }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: messageText,
          context: {
            roomId,
            roomName,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === "session") {
                  setSessionId(data.sessionId)
                } else if (data.type === "content") {
                  assistantMessage.content += data.content
                  setMessages(prev =>
                    prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m)
                  )
                } else if (data.type === "tool_call") {
                  const toolCall: ToolCall = {
                    id: data.id,
                    name: data.name,
                    arguments: data.arguments,
                    status: "pending",
                  }
                  assistantMessage.toolCalls = [...(assistantMessage.toolCalls || []), toolCall]
                  setMessages(prev =>
                    prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m)
                  )
                } else if (data.type === "tool_result") {
                  if (assistantMessage.toolCalls) {
                    const idx = assistantMessage.toolCalls.findIndex(t => t.id === data.toolCallId)
                    if (idx !== -1) {
                      assistantMessage.toolCalls[idx].status = "success"
                      assistantMessage.toolCalls[idx].result = data.result
                      setMessages(prev =>
                        prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m)
                      )
                    }
                  }
                }
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        createdAt: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToolConfirm = async (toolCall: ToolCall) => {
    try {
      const response = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: toolCall.name,
          arguments: toolCall.arguments,
        }),
      })

      const result = await response.json()

      setMessages(prev => prev.map(m => {
        if (m.toolCalls) {
          return {
            ...m,
            toolCalls: m.toolCalls.map(t =>
              t.id === toolCall.id
                ? { ...t, status: "success" as const, result: result.message }
                : t
            ),
          }
        }
        return m
      }))
    } catch (error) {
      console.error("Tool execution error:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className={cn(
      "fixed bottom-0 right-0 z-40 w-full sm:w-96 h-[70vh] sm:h-[600px] sm:bottom-6 sm:right-6",
      "bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden",
      "animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-300"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">BobBot Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Hi! I'm BobBot</h3>
              <p className="text-sm text-gray-500">
                I can help you manage your tasks, calendar, and notes.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Try asking:</p>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="block w-full text-left px-3 py-2 text-sm rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2",
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Tool Calls */}
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.toolCalls.map((tool) => (
                        <div
                          key={tool.id}
                          className="bg-white/80 rounded-xl p-3 text-sm"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {tool.status === "pending" ? (
                              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            <span className="font-medium text-gray-700">
                              {formatToolName(tool.name)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs">
                            {formatToolArgs(tool.arguments)}
                          </p>
                          {tool.status === "pending" && (
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => handleToolConfirm(tool)}
                            >
                              Confirm
                            </Button>
                          )}
                          {tool.result && (
                            <p className="mt-2 text-green-700 text-xs">
                              {tool.result}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-1 opacity-60">
                    {format(message.createdAt, "h:mm a")}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function formatToolName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}

function formatToolArgs(args: Record<string, unknown>): string {
  return Object.entries(args)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ")
}
