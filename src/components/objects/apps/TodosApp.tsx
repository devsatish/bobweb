"use client"

import { useState, useEffect } from "react"
import { Plus, Check, Calendar, Flag, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns"

interface Todo {
  id: string
  title: string
  dueDate: string | null
  priority: number
  completed: boolean
  createdAt: string
}

interface TodosAppProps {
  roomId: string
}

const PRIORITY_LABELS = ["Low", "Medium", "High"]
const PRIORITY_COLORS = ["text-gray-400", "text-yellow-500", "text-red-500"]

export function TodosApp({ roomId }: TodosAppProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [newTodoDueDate, setNewTodoDueDate] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState(0)
  const [showCompleted, setShowCompleted] = useState(false)
  const [isAddingTodo, setIsAddingTodo] = useState(false)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos")
      if (res.ok) {
        const data = await res.json()
        setTodos(data)
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createTodo = async () => {
    if (!newTodoTitle.trim()) return

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTodoTitle,
          dueDate: newTodoDueDate ? new Date(newTodoDueDate).toISOString() : null,
          priority: newTodoPriority,
        }),
      })
      if (res.ok) {
        const newTodo = await res.json()
        setTodos([newTodo, ...todos])
        setNewTodoTitle("")
        setNewTodoDueDate("")
        setNewTodoPriority(0)
        setIsAddingTodo(false)
      }
    } catch (error) {
      console.error("Failed to create todo:", error)
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })
      if (res.ok) {
        const updated = await res.json()
        setTodos(todos.map(t => t.id === id ? updated : t))
      }
    } catch (error) {
      console.error("Failed to update todo:", error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setTodos(todos.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete todo:", error)
    }
  }

  const formatDueDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM d")
  }

  const activeTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  // Sort: overdue first, then by priority, then by due date
  const sortedActiveTodos = activeTodos.sort((a, b) => {
    const aOverdue = a.dueDate && isPast(parseISO(a.dueDate))
    const bOverdue = b.dueDate && isPast(parseISO(b.dueDate))
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
    if (a.priority !== b.priority) return b.priority - a.priority
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{activeTodos.length}</p>
          <p className="text-sm text-green-700">Active</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-600">{completedTodos.length}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="flex-1 bg-red-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">
            {activeTodos.filter(t => t.dueDate && isPast(parseISO(t.dueDate))).length}
          </p>
          <p className="text-sm text-red-700">Overdue</p>
        </div>
      </div>

      {/* Add Todo */}
      {isAddingTodo ? (
        <div className="bg-white border-2 border-green-200 rounded-xl p-4 mb-4">
          <Input
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="mb-3"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && createTodo()}
          />
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={newTodoDueDate}
                onChange={(e) => setNewTodoDueDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-gray-400" />
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(Number(e.target.value))}
                className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddingTodo(false)}>
              Cancel
            </Button>
            <Button onClick={createTodo}>
              Add Task
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full mb-4 border-dashed border-2"
          onClick={() => setIsAddingTodo(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a task
        </Button>
      )}

      {/* Active Todos */}
      <div className="space-y-2">
        {sortedActiveTodos.map((todo) => {
          const isOverdue = todo.dueDate && isPast(parseISO(todo.dueDate)) && !isToday(parseISO(todo.dueDate))
          return (
            <div
              key={todo.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl bg-white border transition-all hover:shadow-md",
                isOverdue && "border-red-200 bg-red-50"
              )}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) => toggleTodo(todo.id, checked as boolean)}
              />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  todo.completed && "line-through text-gray-400"
                )}>
                  {todo.title}
                </p>
                {todo.dueDate && (
                  <p className={cn(
                    "text-sm",
                    isOverdue ? "text-red-600" : "text-gray-500"
                  )}>
                    {formatDueDate(todo.dueDate)}
                  </p>
                )}
              </div>
              <Flag className={cn("w-4 h-4", PRIORITY_COLORS[todo.priority])} />
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {activeTodos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>All done! Add a new task to get started.</p>
        </div>
      )}

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="font-medium">Completed ({completedTodos.length})</span>
          </button>

          {showCompleted && (
            <div className="mt-2 space-y-2">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={(checked) => toggleTodo(todo.id, checked as boolean)}
                  />
                  <p className="flex-1 line-through text-gray-400 truncate">
                    {todo.title}
                  </p>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
