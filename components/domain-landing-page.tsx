"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Shield } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { PaymentSystem } from "@/components/payment-system"
import { VerifiedMessaging } from "@/components/verified-messaging"
import { DomaOrderbook } from "@/components/doma-orderbook"

interface DomainLandingPageProps {
  domain: string
}

export default function DomainLandingPage({ domain }: DomainLandingPageProps) {
  const [payoutAddress, setPayoutAddress] = useState<string>("")

  useEffect(() => {
    // Fetch payout configuration
    const fetchPayout = async () => {
      try {
        const response = await fetch(`/api/domain/${encodeURIComponent(domain)}/payout`)
        if (response.ok) {
          const data = await response.json()
          setPayoutAddress(data.to)
        }
      } catch (error) {
        console.error("Error fetching payout:", error)
      }
    }

    fetchPayout()
  }, [domain])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {domain.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{domain}</h1>
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Verified Owner
              </Badge>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Section */}
            {payoutAddress && <PaymentSystem domain={domain} payoutAddress={payoutAddress} />}

            <VerifiedMessaging domain={domain} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Domain Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Domain Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Domain</p>
                  <p className="font-mono">{domain}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-mono text-xs">0x742d...c0c0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant="secondary">Verified</Badge>
                </div>
              </CardContent>
            </Card>

            <DomaOrderbook domain={domain} />

            {/* Chat Widget */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Direct Chat</CardTitle>
                <CardDescription>Chat directly with the domain owner</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat (XMTP)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
