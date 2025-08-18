import { type NextRequest, NextResponse } from "next/server"

// Mock offers storage - in production this would integrate with Doma contracts
const mockOffers: Array<{
  id: string
  domain: string
  amount: number
  bidder: string
  timestamp: string
  status: "active" | "accepted" | "rejected" | "expired"
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, amount, bidder } = body

    if (!domain || !amount || !bidder || amount <= 0) {
      return NextResponse.json({ error: "Invalid offer parameters" }, { status: 400 })
    }

    // TODO: In production, this would:
    // 1. Validate the bidder's wallet signature
    // 2. Check if bidder has sufficient funds
    // 3. Submit offer to Doma smart contracts
    // 4. Handle escrow if required
    // 5. Notify domain owner

    const newOffer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      domain: domain.toLowerCase(),
      amount: Number.parseFloat(amount.toString()),
      bidder: bidder.toLowerCase(),
      timestamp: new Date().toISOString(),
      status: "active" as const,
    }

    mockOffers.push(newOffer)

    // Mock delay to simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      offerId: newOffer.id,
      message: "Offer submitted successfully",
      offer: newOffer,
    })
  } catch (error) {
    console.error("Error submitting offer:", error)
    return NextResponse.json({ error: "Failed to submit offer" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get("domain")
    const bidder = searchParams.get("bidder")

    let filteredOffers = mockOffers

    if (domain) {
      filteredOffers = filteredOffers.filter((offer) => offer.domain === domain.toLowerCase())
    }

    if (bidder) {
      filteredOffers = filteredOffers.filter((offer) => offer.bidder === bidder.toLowerCase())
    }

    // Sort by timestamp (newest first)
    filteredOffers.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      offers: filteredOffers,
      total: filteredOffers.length,
    })
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}
