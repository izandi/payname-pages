import { type NextRequest, NextResponse } from "next/server"

// Mock payout addresses - in production this would come from database
const MOCK_PAYOUTS = {
  "alice.eth": "0x742d35Cc6634C0532925a3b8D0C9e3e0C0c0c0c0",
  "bob.crypto": "0x1234567890123456789012345678901234567890",
  "test.eth": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
}

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const domainName = params.name.toLowerCase()

    // TODO: Query database for payout configuration
    const payoutAddress = MOCK_PAYOUTS[domainName as keyof typeof MOCK_PAYOUTS]

    if (!payoutAddress) {
      return NextResponse.json({ error: "Payout not configured for this domain" }, { status: 404 })
    }

    const response = {
      domain: domainName,
      to: payoutAddress,
      mode: "onchain",
      txHash: null, // Would contain setup transaction hash
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching payout configuration:", error)
    return NextResponse.json({ error: "Failed to fetch payout configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const domainName = params.name.toLowerCase()
    const body = await request.json()
    const { payoutAddress, signature } = body

    // TODO: Verify domain ownership and signature
    // TODO: Save payout configuration to database
    // TODO: Optionally call smart contract to set payout on-chain

    console.log("Setting payout for domain:", domainName, "to:", payoutAddress)

    return NextResponse.json({
      success: true,
      domain: domainName,
      payoutAddress,
      message: "Payout address updated successfully",
    })
  } catch (error) {
    console.error("Error setting payout configuration:", error)
    return NextResponse.json({ error: "Failed to set payout configuration" }, { status: 500 })
  }
}
