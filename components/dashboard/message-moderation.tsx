"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Shield, Ban, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: number
  from_address: string
  body: string
  verified: boolean
  created_at: string
  hidden: boolean
}

interface MessageModerationProps {
  domain: string
}

export function MessageModeration({ domain }: MessageModerationProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mutedAddresses, setMutedAddresses] = useState<string[]>([])

  useEffect(() => {
    fetchMessages()
    fetchMutedAddresses()
  }, [domain])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(domain)}/messages`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMutedAddresses = async () => {
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(domain)}/muted`)
      const data = await response.json()
      setMutedAddresses(data.addresses || [])
    } catch (error) {
      console.error("Error fetching muted addresses:", error)
    }
  }

  const handleHideMessage = async (messageId: number) => {
    try {
      const response = await fetch(`/api/dashboard/messages/${messageId}/hide`, {
        method: "POST",
      })

      if (response.ok) {
        setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, hidden: true } : msg)))
        toast.success("Message hidden")
      } else {
        toast.error("Failed to hide message")
      }
    } catch (error) {
      console.error("Error hiding message:", error)
      toast.error("Failed to hide message")
    }
  }

  const handleShowMessage = async (messageId: number) => {
    try {
      const response = await fetch(`/api/dashboard/messages/${messageId}/show`, {
        method: "POST",
      })

      if (response.ok) {
        setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, hidden: false } : msg)))
        toast.success("Message shown")
      } else {
        toast.error("Failed to show message")
      }
    } catch (error) {
      console.error("Error showing message:", error)
      toast.error("Failed to show message")
    }
  }

  const handleMuteAddress = async (address: string) => {
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(domain)}/mute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      if (response.ok) {
        setMutedAddresses([...mutedAddresses, address])
        toast.success("Address muted")
      } else {
        toast.error("Failed to mute address")
      }
    } catch (error) {
      console.error("Error muting address:", error)
      toast.error("Failed to mute address")
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading messages...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Moderation
          </CardTitle>
          <CardDescription>Manage messages and moderate content on your domain page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    message.hidden ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.from_address.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-gray-600">{formatAddress(message.from_address)}</span>

                        {message.verified ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Unverified
                          </Badge>
                        )}

                        {message.hidden && (
                          <Badge variant="destructive" className="text-xs">
                            Hidden
                          </Badge>
                        )}

                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 mb-3">{message.body}</p>

                      <div className="flex gap-2">
                        {message.hidden ? (
                          <Button size="sm" variant="outline" onClick={() => handleShowMessage(message.id)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Show
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleHideMessage(message.id)}>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hide
                          </Button>
                        )}

                        {!mutedAddresses.includes(message.from_address) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleMuteAddress(message.from_address)}
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Mute Address
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Muted Addresses */}
      {mutedAddresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Muted Addresses</CardTitle>
            <CardDescription>Addresses that are blocked from sending messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mutedAddresses.map((address) => (
                <div key={address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm">{formatAddress(address)}</span>
                  <Button size="sm" variant="outline">
                    Unmute
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
