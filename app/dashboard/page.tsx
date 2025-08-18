"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Settings, BarChart3, MessageSquare, Wallet, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import { DashboardOverview } from "@/components/dashboard/overview"
import { PayoutSettings } from "@/components/dashboard/payout-settings"
import { MessageModeration } from "@/components/dashboard/message-moderation"
import { PageCustomization } from "@/components/dashboard/page-customization"
import { AnalyticsDashboard } from "@/components/dashboard/analytics"
import { useAccount } from "wagmi"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const domain = searchParams.get("domain") || ""
  const [activeTab, setActiveTab] = useState("overview")
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (domain && isConnected && address) {
      verifyOwnership()
    }
  }, [domain, isConnected, address])

  const verifyOwnership = async () => {
    try {
      const response = await fetch(`/api/domain/${encodeURIComponent(domain)}/ownership`)
      const data = await response.json()
      const ownershipVerified =
        data.ownerAddress && address && data.ownerAddress.toLowerCase() === address.toLowerCase()
      setIsOwner(ownershipVerified)
    } catch (error) {
      console.error("Error verifying ownership:", error)
      setIsOwner(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <Globe className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Domain Selected</h1>
          <p className="text-gray-600 mb-6">Please select a domain to manage</p>
          <Button asChild>
            <Link href="/verify">Verify Domain</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the dashboard</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying domain ownership...</p>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You are not the verified owner of {domain}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild>
              <Link href="/verify">Verify Different Domain</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${domain}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Page
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {domain.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{domain} Dashboard</h1>
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Owner
                  </Badge>
                </div>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payout" className="gap-2">
              <Wallet className="h-4 w-4" />
              Payout
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="customize" className="gap-2">
              <Settings className="h-4 w-4" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview domain={domain} />
          </TabsContent>

          <TabsContent value="payout">
            <PayoutSettings domain={domain} />
          </TabsContent>

          <TabsContent value="messages">
            <MessageModeration domain={domain} />
          </TabsContent>

          <TabsContent value="customize">
            <PageCustomization domain={domain} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard domain={domain} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
