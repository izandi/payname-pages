import { type NextRequest, NextResponse } from "next/server"
import { verifyMessage } from "viem"

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5 // 5 messages per minute per address

function checkRateLimit(address: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(address)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(address, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  userLimit.count++
  return true
}

// Mock database - in production, use actual database
const mockMessages: Array<{
  id: number
  domain: string
  from_address: string
  body: string
  signature: string
  verified: boolean
  created_at: string
  hidden: boolean
  timestamp: number
}> = [
  {
    id: 1,
    domain: "alice.eth",
    from_address: "0x742d35Cc6634C0532925a3b8D0C9e3e0C0c0c0c0",
    body: "Great project! Keep building amazing things!",
    signature: "0x...",
    verified: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    hidden: false,
    timestamp: Date.now() - 3600000,
  },
  {
    id: 2,
    domain: "alice.eth",
    from_address: "0x1234567890123456789012345678901234567890",
    body: "Love the concept of verified messaging on domains!",
    signature: "0x...",
    verified: true,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    hidden: false,
    timestamp: Date.now() - 1800000,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get("domain")

    if (!domain) {
      return NextResponse.json({ error: "Domain parameter required" }, { status: 400 })
    }

    // Filter messages by domain and exclude hidden ones
    const domainMessages = mockMessages
      .filter((msg) => msg.domain.toLowerCase() === domain.toLowerCase() && !msg.hidden)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      messages: domainMessages,
      total: domainMessages.length,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, message, signature, address, timestamp, messageToSign } = body

    if (!domain || !message || !signature || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Rate limiting
    if (!checkRateLimit(address)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before sending another message." },
        { status: 429 },
      )
    }

    // Verify the signature
    let isValid = false
    try {
      isValid = await verifyMessage({
        address: address as `0x${string}`,
        message: messageToSign,
        signature: signature as `0x${string}`,
      })
    } catch (error) {
      console.error("Signature verification failed:", error)
      isValid = false
    }

    // Additional validation: check timestamp is recent (within 5 minutes)
    const now = Date.now()
    const messageAge = now - timestamp
    const maxAge = 5 * 60 * 1000 // 5 minutes

    if (messageAge > maxAge) {
      return NextResponse.json({ error: "Message timestamp is too old. Please try again." }, { status: 400 })
    }

    // Create new message
    const newMessage = {
      id: mockMessages.length + 1,
      domain: domain.toLowerCase(),
      from_address: address.toLowerCase(),
      body: message.trim(),
      signature,
      verified: isValid,
      created_at: new Date().toISOString(),
      hidden: false,
      timestamp,
    }

    // Add to mock database
    mockMessages.push(newMessage)

    // TODO: In production:
    // 1. Save to actual database
    // 2. Implement proper spam detection
    // 3. Add content moderation
    // 4. Send notifications to domain owner

    return NextResponse.json({
      success: true,
      verified: isValid,
      messageId: newMessage.id,
      message: isValid ? "Message sent and verified successfully!" : "Message sent but signature verification failed",
    })
  } catch (error) {
    console.error("Error submitting message:", error)
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 })
  }
}
