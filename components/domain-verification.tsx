"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"

interface DomainVerificationProps {
  onVerified?: (domain: string, ownerAddress: string) => void
}

export function DomainVerification({ onVerified }: DomainVerificationProps) {
  const [domain, setDomain] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isOwner: boolean
    ownerAddress: string | null
    verified: boolean
    domain: string
  } | null>(null)

  const { address, isConnected } = useAccount()

  const handleVerifyDomain = async () => {
    if (!domain.trim() || !isConnected) return

    setIsVerifying(true)
    try {
      const response = await fetch(`/api/domain/${encodeURIComponent(domain)}/ownership`)
      const result = await response.json()

      // Check if connected wallet matches domain owner
      const isOwner = result.ownerAddress && address && result.ownerAddress.toLowerCase() === address.toLowerCase()

      const verificationData = {
        ...result,
        isOwner,
        verified: isOwner && result.verified,
      }

      setVerificationResult(verificationData)

      if (isOwner && onVerified) {
        onVerified(domain, result.ownerAddress)
      }
    } catch (error) {
      console.error("Domain verification failed:", error)
      setVerificationResult({
        isOwner: false,
        ownerAddress: null,
        verified: false,
        domain,
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Domain Verification
        </CardTitle>
        <CardDescription>Verify your domain ownership to create a payment page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Enter your domain (e.g., alice.eth, myname.crypto)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleVerifyDomain()}
            />
          </div>
          <Button onClick={handleVerifyDomain} disabled={!domain.trim() || !isConnected || isVerifying}>
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>
        </div>

        {!isConnected && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Please connect your wallet to verify domain ownership</p>
          </div>
        )}

        {verificationResult && (
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Verification Result</h4>
                {verificationResult.isOwner ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Owner
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Owner
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Domain:</span>
                  <span className="font-mono">{verificationResult.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner Address:</span>
                  <span className="font-mono text-xs">{verificationResult.ownerAddress || "Not found"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Address:</span>
                  <span className="font-mono text-xs">{address}</span>
                </div>
              </div>

              {verificationResult.isOwner && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    ✅ Domain ownership verified! You can now create a payment page for {verificationResult.domain}
                  </p>
                </div>
              )}

              {!verificationResult.isOwner && verificationResult.ownerAddress && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    ❌ This domain is owned by a different address. Please connect the correct wallet or verify a
                    different domain.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
