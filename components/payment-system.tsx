"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, Send, Copy, CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import QRCode from "qrcode"
import { toast } from "sonner"

interface PaymentSystemProps {
  domain: string
  payoutAddress: string
}

interface Token {
  symbol: string
  address: string
  decimals: number
  chainId: number
}

const SUPPORTED_TOKENS: Token[] = [
  { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", decimals: 18, chainId: 1 },
  { symbol: "USDC", address: "0xA0b86a33E6441b8C4505B4afDcA7aBB2B6B81221", decimals: 6, chainId: 1 },
  { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, chainId: 1 },
]

export function PaymentSystem({ domain, payoutAddress }: PaymentSystemProps) {
  const [amount, setAmount] = useState("0.01")
  const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [paymentUri, setPaymentUri] = useState<string>("")
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  const { address, isConnected } = useAccount()
  const { data: hash, sendTransaction, isPending: isSending } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Generate payment URI and QR code
  useEffect(() => {
    const generatePaymentData = async () => {
      if (!amount || Number.parseFloat(amount) <= 0) return

      setIsGeneratingQR(true)
      try {
        // EIP-681 format: ethereum:address@chainId/transfer?address=token&uint256=amount
        let uri: string

        if (selectedToken.symbol === "ETH") {
          // Native ETH payment
          const weiAmount = parseEther(amount).toString()
          uri = `ethereum:${payoutAddress}@${selectedToken.chainId}?value=${weiAmount}`
        } else {
          // ERC-20 token payment
          const tokenAmount = (Number.parseFloat(amount) * Math.pow(10, selectedToken.decimals)).toString()
          uri = `ethereum:${selectedToken.address}@${selectedToken.chainId}/transfer?address=${payoutAddress}&uint256=${tokenAmount}`
        }

        setPaymentUri(uri)

        // Generate QR code
        const qr = await QRCode.toDataURL(uri, {
          width: 256,
          margin: 2,
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
        })
        setQrCodeUrl(qr)
      } catch (error) {
        console.error("Error generating payment data:", error)
        toast.error("Failed to generate payment QR code")
      } finally {
        setIsGeneratingQR(false)
      }
    }

    generatePaymentData()
  }, [amount, selectedToken, payoutAddress])

  const handleSendPayment = async () => {
    if (!isConnected || !amount || Number.parseFloat(amount) <= 0) return

    try {
      if (selectedToken.symbol === "ETH") {
        // Send native ETH
        sendTransaction({
          to: payoutAddress as `0x${string}`,
          value: parseEther(amount),
        })
      } else {
        // TODO: Implement ERC-20 token transfers
        toast.error("ERC-20 token payments coming soon!")
      }
    } catch (error) {
      console.error("Payment failed:", error)
      toast.error("Payment failed. Please try again.")
    }
  }

  const copyPaymentUri = async () => {
    try {
      await navigator.clipboard.writeText(paymentUri)
      toast.success("Payment URI copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy payment URI")
    }
  }

  const presetAmounts = selectedToken.symbol === "ETH" ? ["0.01", "0.05", "0.1", "0.5"] : ["10", "25", "50", "100"]

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-blue-600" />
          Send Payment
        </CardTitle>
        <CardDescription>Send crypto payments directly to {domain}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.01"
                  step="0.001"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Token</label>
                <Select
                  value={selectedToken.symbol}
                  onValueChange={(value) => {
                    const token = SUPPORTED_TOKENS.find((t) => t.symbol === value)
                    if (token) setSelectedToken(token)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_TOKENS.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preset Amounts */}
            <div className="flex gap-2 flex-wrap">
              {presetAmounts.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(presetAmount)}
                  className="text-xs"
                >
                  {presetAmount} {selectedToken.symbol}
                </Button>
              ))}
            </div>

            {/* Payment Actions */}
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSendPayment}
                disabled={!isConnected || !amount || Number.parseFloat(amount) <= 0 || isSending || isConfirming}
              >
                {isSending || isConfirming ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSending ? "Sending..." : isConfirming ? "Confirming..." : "Send Payment"}
              </Button>

              {paymentUri && (
                <Button variant="outline" className="w-full bg-transparent" onClick={copyPaymentUri} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Payment Link
                </Button>
              )}
            </div>

            {/* Transaction Status */}
            {hash && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {isConfirmed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  <span className="text-sm font-medium">
                    {isConfirmed ? "Payment Confirmed!" : "Payment Processing..."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-mono">{hash}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open(`https://etherscan.io/tx/${hash}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {!isConnected && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">Connect your wallet to send payments directly</p>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 text-center">
              <QrCode className="h-6 w-6 text-gray-600 mb-2 mx-auto" />
              <p className="text-sm text-gray-600">Scan to Pay</p>
              <p className="text-xs text-gray-500 mt-1">
                {amount} {selectedToken.symbol} to {domain}
              </p>
            </div>

            <div className="relative">
              {isGeneratingQR ? (
                <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-gray-50">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : qrCodeUrl ? (
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="Payment QR Code"
                  className="w-48 h-48 border rounded-lg shadow-sm"
                />
              ) : (
                <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-gray-50">
                  <p className="text-sm text-gray-500 text-center">Enter amount to generate QR code</p>
                </div>
              )}
            </div>

            {qrCodeUrl && (
              <div className="mt-3 text-center">
                <Badge variant="secondary" className="text-xs">
                  EIP-681 Compatible
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Recipient</p>
              <p className="font-mono text-xs break-all">{payoutAddress}</p>
            </div>
            <div>
              <p className="text-gray-600">Network</p>
              <p className="font-medium">Ethereum Mainnet</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
