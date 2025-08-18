"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wallet, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useAccount, useSignMessage } from "wagmi"
import { toast } from "sonner"

interface PayoutSettingsProps {
  domain: string
}

export function PayoutSettings({ domain }: PayoutSettingsProps) {
  const [payoutAddress, setPayoutAddress] = useState("")
  const [currentPayout, setCurrentPayout] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const { address } = useAccount()
  const { signMessage, isPending: isSigning } = useSignMessage()

  useEffect(() => {
    fetchCurrentPayout()
  }, [domain])

  const fetchCurrentPayout = async () => {
    try {
      const response = await fetch(`/api/domain/${encodeURIComponent(domain)}/payout`)
      if (response.ok) {
        const data = await response.json()
        setCurrentPayout(data.to)
        setPayoutAddress(data.to)
      }
    } catch (error) {
      console.error("Error fetching payout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePayout = async () => {
    if (!payoutAddress || !address) {
      toast.error("Please enter a valid payout address")
      return
    }

    setIsSaving(true)
    try {
      // Sign the payout change
      const message = `Set payout address for ${domain} to ${payoutAddress}`
      const signature = await signMessage({ message })

      const response = await fetch(`/api/domain/${encodeURIComponent(domain)}/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payoutAddress,
          signature,
          message,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        setCurrentPayout(payoutAddress)
        toast.success("Payout address updated successfully!")
      } else {
        toast.error(result.error || "Failed to update payout address")
      }
    } catch (error) {
      console.error("Error updating payout:", error)
      toast.error("Failed to update payout address")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payout settings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payout Configuration
          </CardTitle>
          <CardDescription>Set where payments to your domain should be sent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Payout Status */}
          {currentPayout && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Payout Configured</span>
              </div>
              <p className="text-sm text-green-700">Payments are currently sent to:</p>
              <p className="font-mono text-sm text-green-800 break-all">{currentPayout}</p>
            </div>
          )}

          {/* Payout Address Input */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Payout Address</label>
              <Input
                placeholder="0x..."
                value={payoutAddress}
                onChange={(e) => setPayoutAddress(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the Ethereum address where you want to receive payments
              </p>
            </div>

            <Button onClick={handleSavePayout} disabled={!payoutAddress || isSaving || isSigning} className="w-full">
              {isSigning || isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              {isSigning ? "Signing..." : isSaving ? "Saving..." : "Update Payout Address"}
            </Button>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Important</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Double-check the address before saving</li>
              <li>• This change requires a cryptographic signature</li>
              <li>• Payments will be sent directly to this address</li>
              <li>• Make sure you control this wallet</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payments received to your domain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock payment history */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">0.05 ETH</p>
                <p className="text-xs text-gray-500 font-mono">from 0x1234...5678</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">Confirmed</Badge>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">0.1 ETH</p>
                <p className="text-xs text-gray-500 font-mono">from 0xabcd...efgh</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">Confirmed</Badge>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No more payments to show</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
