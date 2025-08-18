"use client"

import { useState } from "react"
import { DomainVerification } from "@/components/domain-verification"
import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { Globe, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function VerifyPage() {
  const [verifiedDomain, setVerifiedDomain] = useState<string | null>(null)
  const router = useRouter()

  const handleDomainVerified = (domain: string, ownerAddress: string) => {
    setVerifiedDomain(domain)
    // TODO: Save verification to database
    console.log("Domain verified:", { domain, ownerAddress })
  }

  const handleCreatePage = () => {
    if (verifiedDomain) {
      router.push(`/dashboard?domain=${encodeURIComponent(verifiedDomain)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Payname Pages</h1>
          </Link>
          <WalletConnect />
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Verify Your Domain</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your wallet and verify domain ownership to create your payment page
          </p>
        </div>

        <DomainVerification onVerified={handleDomainVerified} />

        {verifiedDomain && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="p-6 bg-white border border-green-200 rounded-lg shadow-sm">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Domain Verified Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Your domain <span className="font-mono font-medium">{verifiedDomain}</span> is ready for setup
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleCreatePage} size="lg" className="gap-2">
                    Create Payment Page
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href={`/${verifiedDomain}`}>View Page</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
