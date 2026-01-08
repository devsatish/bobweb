"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Phone, Mail, MapPin, User, Trash2, Edit2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Contact {
  id: string
  name: string
  relation: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  image: string | null
}

interface ContactsAppProps {
  roomId: string
}

const RELATION_OPTIONS = [
  "Family",
  "Friend",
  "Work",
  "Doctor",
  "Emergency",
  "Other",
]

export function ContactsApp({ roomId }: ContactsAppProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts")
      if (res.ok) {
        const data = await res.json()
        setContacts(data)
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      relation: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    })
    setEditingContact(null)
  }

  const openNewContactDialog = () => {
    resetForm()
    setShowDialog(true)
  }

  const openEditContactDialog = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      relation: contact.relation || "",
      phone: contact.phone || "",
      email: contact.email || "",
      address: contact.address || "",
      notes: contact.notes || "",
    })
    setShowDialog(true)
  }

  const saveContact = async () => {
    if (!formData.name.trim()) return

    const contactData = {
      name: formData.name,
      relation: formData.relation || null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      notes: formData.notes || null,
    }

    try {
      if (editingContact) {
        const res = await fetch(`/api/contacts/${editingContact.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        })
        if (res.ok) {
          const updated = await res.json()
          setContacts(contacts.map(c => c.id === updated.id ? updated : c))
          if (selectedContact?.id === updated.id) {
            setSelectedContact(updated)
          }
        }
      } else {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        })
        if (res.ok) {
          const newContact = await res.json()
          setContacts([newContact, ...contacts])
        }
      }
      setShowDialog(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save contact:", error)
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setContacts(contacts.filter(c => c.id !== id))
        if (selectedContact?.id === id) {
          setSelectedContact(null)
        }
      }
    } catch (error) {
      console.error("Failed to delete contact:", error)
    }
  }

  const filteredContacts = contacts
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.relation?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  // Group contacts by first letter
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const letter = contact.name[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(contact)
    return acc
  }, {} as Record<string, Contact[]>)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Contact List */}
      <div className={cn(
        "w-full md:w-80 border-r flex flex-col",
        selectedContact && "hidden md:flex"
      )}>
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Add Contact Button */}
        <div className="p-4 border-b">
          <Button className="w-full" onClick={openNewContactDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-auto">
          {Object.keys(groupedContacts).sort().map(letter => (
            <div key={letter}>
              <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-500 sticky top-0">
                {letter}
              </div>
              {groupedContacts[letter].map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left",
                    selectedContact?.id === contact.id && "bg-cyan-50"
                  )}
                >
                  <Avatar>
                    <AvatarImage src={contact.image || undefined} />
                    <AvatarFallback className="bg-cyan-100 text-cyan-700">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{contact.name}</p>
                    {contact.relation && (
                      <p className="text-sm text-gray-500">{contact.relation}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? "No contacts found" : "No contacts yet"}
            </div>
          )}
        </div>
      </div>

      {/* Contact Detail */}
      {selectedContact ? (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-md mx-auto">
            {/* Back button for mobile */}
            <button
              onClick={() => setSelectedContact(null)}
              className="md:hidden mb-4 text-cyan-600 font-medium"
            >
              ← Back to contacts
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={selectedContact.image || undefined} />
                <AvatarFallback className="bg-cyan-100 text-cyan-700 text-2xl">
                  {getInitials(selectedContact.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{selectedContact.name}</h2>
              {selectedContact.relation && (
                <p className="text-gray-500">{selectedContact.relation}</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center gap-4 mb-6">
              {selectedContact.phone && (
                <a
                  href={`tel:${selectedContact.phone}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-xs">Call</span>
                </a>
              )}
              {selectedContact.email && (
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-xs">Email</span>
                </a>
              )}
              <button
                onClick={() => openEditContactDialog(selectedContact)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                <span className="text-xs">Edit</span>
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              {selectedContact.phone && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                </div>
              )}
              {selectedContact.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedContact.email}</p>
                  </div>
                </div>
              )}
              {selectedContact.address && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{selectedContact.address}</p>
                  </div>
                </div>
              )}
              {selectedContact.notes && (
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.notes}</p>
                </div>
              )}
            </div>

            {/* Delete */}
            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => deleteContact(selectedContact.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Contact
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Select a contact to view details</p>
          </div>
        </div>
      )}

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Contact" : "New Contact"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Relationship</label>
              <select
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select...</option>
                {RELATION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, city, state"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveContact}>
              {editingContact ? "Save" : "Add Contact"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
