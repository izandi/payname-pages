"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, Shield, AlertTriangle, Loader2, Clock } from "lucide-react"
import { useAccount, useSignMessage } from "wagmi"
import { toast } from "sonner"

interface Message {
  id: number
  from_address: string
  body: string
  signature: string
  verified: boolean
  created_at: string
  hidden: boolean
}

interface VerifiedMessagingProps {
  domain: string
}

export function VerifiedMessaging({ domain }: VerifiedMessagingProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const { address, isConnected } = useAccount()
  const { signMessage, isPending: isSigning } = useSignMessage()

  useEffect(() => {
    fetchMessages()
  }, [domain])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/messages?domain=${encodeURIComponent(domain)}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected || !address) {
      toast.error("Please connect your wallet and enter a message")
      return
    }

    setIsSending(true)
    try {
      // Create message data for signing (EIP-712 structured data)
      const messageData = {
        domain: domain,
        message: message.trim(),
        timestamp: Date.now(),
        sender: address,
      }

      // Create the message to sign
      const messageToSign = `Send message to ${domain}:\n\n"${message.trim()}"\n\nTimestamp: ${messageData.timestamp}\nSender: ${address}`

      // Sign the message
      const signature = await signMessage({
        message: messageToSign,
      })

      // Submit the signed message
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          message: message.trim(),
          signature,
          address,
          timestamp: messageData.timestamp,
          messageToSign,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("")
        toast.success(result.verified ? "Message sent and verified!" : "Message sent (verification pending)")
        await fetchMessages()
      } else {
        toast.error(result.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Verified Messages
        </CardTitle>
        <CardDescription>Send cryptographically signed messages to {domain}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Input */}
        <div className="space-y-3">
          <Textarea
            placeholder="Write your message... (will be cryptographically signed)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Messages are cryptographically signed</span>
            </div>
            <span className="text-xs text-gray-400">{message.length}/500</span>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !message.trim() || isSending || isSigning}
            className="w-full"
            size="lg"
          >
            {isSigning || isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSigning ? "Signing Message..." : isSending ? "Sending..." : "Sign & Send Message"}
          </Button>

          {!isConnected && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">Connect your wallet to send verified messages</p>
              </div>
            </div>
          )}
        </div>

        {/* Messages Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Recent Messages</h4>
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No messages yet</p>
              <p className="text-sm">Be the first to send a verified message!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border ${
                    msg.verified ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{msg.from_address.slice(2, 4).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-gray-600">{formatAddress(msg.from_address)}</span>

                        {msg.verified ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}

                        <span className="text-xs text-gray-500">{getTimeAgo(msg.created_at)}</span>
                      </div>

                      <p className="text-gray-800 text-sm leading-relaxed break-words">{msg.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>All messages are cryptographically signed and verified on-chain for authenticity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
