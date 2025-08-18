import { type NextRequest, NextResponse } from "next/server"

// Mock Doma integration - in production this would query the actual Doma contracts/subgraph
const MOCK_DOMAIN_REGISTRY = {
  "alice.eth": "0x742d35Cc6634C0532925a3b8D0C9e3e0C0c0c0c0",
  "bob.crypto": "0x1234567890123456789012345678901234567890",
  "test.eth": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
}

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const domainName = params.name.toLowerCase()

    // TODO: Replace with actual Doma integration
    // This would typically involve:
    // 1. Query Doma subgraph or contract for domain ownership
    // 2. Check if domain exists in the registry
    // 3. Return owner address and verification status

    // Mock implementation
    const ownerAddress = MOCK_DOMAIN_REGISTRY[domainName as keyof typeof MOCK_DOMAIN_REGISTRY]

    const response = {
      domain: domainName,
      ownerAddress: ownerAddress || null,
      verified: !!ownerAddress,
      isOwner: false, // This will be determined on the client side
      source: "doma", // Indicates this came from Doma registry
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error checking domain ownership:", error)
    return NextResponse.json({ error: "Failed to check domain ownership" }, { status: 500 })
  }
}
