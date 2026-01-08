"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, X, Tag, Upload, Image as ImageIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Photo {
  id: string
  url: string
  caption: string | null
  tags: string[]
  createdAt: string
}

interface PhotosAppProps {
  roomId: string
}

export function PhotosApp({ roomId }: PhotosAppProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const res = await fetch("/api/photos")
      if (res.ok) {
        const data = await res.json()
        setPhotos(data)
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    for (const file of Array.from(files)) {
      try {
        // For demo purposes, we'll use a data URL
        // In production, you'd upload to S3/storage
        const reader = new FileReader()
        reader.onloadend = async () => {
          const res = await fetch("/api/photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: reader.result as string,
              caption: file.name.replace(/\.[^/.]+$/, ""),
            }),
          })
          if (res.ok) {
            const newPhoto = await res.json()
            setPhotos(prev => [newPhoto, ...prev])
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Failed to upload photo:", error)
      }
    }

    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const updatePhoto = async (id: string, updates: Partial<Photo>) => {
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const updated = await res.json()
        setPhotos(photos.map(p => p.id === id ? updated : p))
        if (selectedPhoto?.id === id) {
          setSelectedPhoto(updated)
        }
      }
    } catch (error) {
      console.error("Failed to update photo:", error)
    }
  }

  const deletePhoto = async (id: string) => {
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== id))
        setSelectedPhoto(null)
      }
    } catch (error) {
      console.error("Failed to delete photo:", error)
    }
  }

  // Get all unique tags
  const allTags = Array.from(new Set(photos.flatMap(p => p.tags)))

  // Filter photos by tag
  const filteredPhotos = filterTag
    ? photos.filter(p => p.tags.includes(filterTag))
    : photos

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterTag(null)}
            className={cn(
              "px-3 py-1 rounded-full text-sm transition-colors",
              !filterTag ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                filterTag === tag ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <img
                src={photo.url}
                alt={photo.caption || "Photo"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {photo.caption && (
                    <p className="text-white text-sm truncate">{photo.caption}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">
            {filterTag ? "No photos with this tag" : "No photos yet"}
          </p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload your first photo
          </Button>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setSelectedPhoto(null)}
          />
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Image */}
            <div className="relative bg-black">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Photo"}
                className="max-h-[60vh] w-full object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Input
                    value={selectedPhoto.caption || ""}
                    onChange={(e) => setSelectedPhoto({ ...selectedPhoto, caption: e.target.value })}
                    onBlur={() => updatePhoto(selectedPhoto.id, { caption: selectedPhoto.caption })}
                    placeholder="Add a caption..."
                    className="text-lg font-medium border-none p-0 focus:ring-0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(selectedPhoto.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePhoto(selectedPhoto.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Tags */}
              <div className="mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {selectedPhoto.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          const newTags = selectedPhoto.tags.filter(t => t !== tag)
                          setSelectedPhoto({ ...selectedPhoto, tags: newTags })
                          updatePhoto(selectedPhoto.id, { tags: newTags })
                        }}
                        className="hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <AddTagInput
                    onAdd={(tag) => {
                      if (!selectedPhoto.tags.includes(tag)) {
                        const newTags = [...selectedPhoto.tags, tag]
                        setSelectedPhoto({ ...selectedPhoto, tags: newTags })
                        updatePhoto(selectedPhoto.id, { tags: newTags })
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddTagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim())
      setValue("")
    }
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-2 py-1 border-2 border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-purple-400 hover:text-purple-600 transition-colors"
      >
        + Add tag
      </button>
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      placeholder="Tag name..."
      className="px-2 py-1 border-2 border-purple-400 rounded-full text-sm focus:outline-none w-24"
      autoFocus
    />
  )
}
