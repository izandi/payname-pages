import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { domain: string } }) {
  try {
    const domainName = params.domain.toLowerCase()

    // Mock overview data - in production this would come from database
    const overviewData = {
      totalPayments: 23,
      totalAmount: "2.45",
      messageCount: 12,
      pageViews: 1234,
      conversionRate: 5.1,
      recentActivity: [
        {
          type: "payment",
          amount: 0.05,
          from: "0x1234567890123456789012345678901234567890",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          type: "message",
          from: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          type: "view",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
        },
      ],
    }

    return NextResponse.json(overviewData)
  } catch (error) {
    console.error("Error fetching overview data:", error)
    return NextResponse.json({ error: "Failed to fetch overview data" }, { status: 500 })
  }
}
