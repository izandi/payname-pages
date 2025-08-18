import { type NextRequest, NextResponse } from "next/server"

// Mock orderbook data - in production this would come from Doma API/subgraph
const MOCK_ORDERBOOK_DATA = {
  "alice.eth": {
    domain: "alice.eth",
    bestBid: 2.5,
    bestAsk: 3.2,
    bids: [
      { price: 2.5, amount: 1, total: 2.5 },
      { price: 2.3, amount: 2, total: 4.6 },
      { price: 2.1, amount: 1, total: 2.1 },
      { price: 2.0, amount: 3, total: 6.0 },
      { price: 1.8, amount: 2, total: 3.6 },
    ],
    asks: [
      { price: 3.2, amount: 1, total: 3.2 },
      { price: 3.5, amount: 1, total: 3.5 },
      { price: 3.8, amount: 2, total: 7.6 },
      { price: 4.0, amount: 1, total: 4.0 },
      { price: 4.5, amount: 3, total: 13.5 },
    ],
    recentTrades: [
      { price: 2.8, amount: 1, timestamp: new Date(Date.now() - 300000).toISOString(), type: "buy" as const },
      { price: 2.7, amount: 2, timestamp: new Date(Date.now() - 600000).toISOString(), type: "sell" as const },
      { price: 2.9, amount: 1, timestamp: new Date(Date.now() - 900000).toISOString(), type: "buy" as const },
      { price: 2.6, amount: 1, timestamp: new Date(Date.now() - 1200000).toISOString(), type: "sell" as const },
    ],
    volume24h: 12.5,
    priceChange24h: 8.5,
    liquidity: 45.2,
    lastUpdated: new Date().toISOString(),
  },
  "bob.crypto": {
    domain: "bob.crypto",
    bestBid: 1.2,
    bestAsk: 1.8,
    bids: [
      { price: 1.2, amount: 2, total: 2.4 },
      { price: 1.1, amount: 1, total: 1.1 },
      { price: 1.0, amount: 3, total: 3.0 },
    ],
    asks: [
      { price: 1.8, amount: 1, total: 1.8 },
      { price: 2.0, amount: 2, total: 4.0 },
    ],
    recentTrades: [
      { price: 1.5, amount: 1, timestamp: new Date(Date.now() - 180000).toISOString(), type: "buy" as const },
    ],
    volume24h: 3.2,
    priceChange24h: -2.1,
    liquidity: 8.3,
    lastUpdated: new Date().toISOString(),
  },
}

export async function GET(request: NextRequest, { params }: { params: { domain: string } }) {
  try {
    const domainName = params.domain.toLowerCase()

    // TODO: Replace with actual Doma API integration
    // This would typically involve:
    // 1. Query Doma subgraph for orderbook data
    // 2. Fetch bids, asks, recent trades
    // 3. Calculate market statistics
    // 4. Return formatted data

    const orderbookData = MOCK_ORDERBOOK_DATA[domainName as keyof typeof MOCK_ORDERBOOK_DATA]

    if (!orderbookData) {
      return NextResponse.json(null)
    }

    return NextResponse.json(orderbookData)
  } catch (error) {
    console.error("Error fetching orderbook data:", error)
    return NextResponse.json({ error: "Failed to fetch orderbook data" }, { status: 500 })
  }
}
