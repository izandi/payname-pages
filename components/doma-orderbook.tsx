"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExternalLink, Activity, DollarSign, Clock, Loader2, RefreshCw } from "lucide-react"
import { useAccount } from "wagmi"
import { toast } from "sonner"

interface OrderbookData {
  domain: string
  bestBid: number | null
  bestAsk: number | null
  bids: Array<{ price: number; amount: number; total: number }>
  asks: Array<{ price: number; amount: number; total: number }>
  recentTrades: Array<{ price: number; amount: number; timestamp: string; type: "buy" | "sell" }>
  volume24h: number
  priceChange24h: number
  liquidity: number
  lastUpdated: string
}

interface DomaOrderbookProps {
  domain: string
}

export function DomaOrderbook({ domain }: DomaOrderbookProps) {
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

  const { address, isConnected } = useAccount()

  useEffect(() => {
    fetchOrderbookData()
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrderbookData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [domain])

  const fetchOrderbookData = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true)
    try {
      const response = await fetch(`/api/orderbook/${encodeURIComponent(domain)}`)
      const data = await response.json()
      setOrderbook(data)
    } catch (error) {
      console.error("Error fetching orderbook data:", error)
      toast.error("Failed to load orderbook data")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleMakeOffer = async () => {
    if (!isConnected || !offerAmount || Number.parseFloat(offerAmount) <= 0) {
      toast.error("Please connect wallet and enter a valid offer amount")
      return
    }

    setIsSubmittingOffer(true)
    try {
      const response = await fetch("/api/orderbook/offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          amount: Number.parseFloat(offerAmount),
          bidder: address,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        toast.success("Offer submitted successfully!")
        setOfferAmount("")
        await fetchOrderbookData()
      } else {
        toast.error(result.error || "Failed to submit offer")
      }
    } catch (error) {
      console.error("Error submitting offer:", error)
      toast.error("Failed to submit offer")
    } finally {
      setIsSubmittingOffer(false)
    }
  }

  const formatPrice = (price: number) => `${price.toFixed(3)} ETH`
  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (!orderbook) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Domain Trading</CardTitle>
          <CardDescription>No trading data available for {domain}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>This domain is not currently listed for trading</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Domain Trading
            </CardTitle>
            <CardDescription>Live market data for {domain}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => fetchOrderbookData(true)} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium">Best Bid</p>
            <p className="text-xl font-bold text-green-600">
              {orderbook.bestBid ? formatPrice(orderbook.bestBid) : "No bids"}
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 font-medium">Best Ask</p>
            <p className="text-xl font-bold text-red-600">
              {orderbook.bestAsk ? formatPrice(orderbook.bestAsk) : "No asks"}
            </p>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500">24h Volume</p>
            <p className="font-semibold">{orderbook.volume24h.toFixed(2)} ETH</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">24h Change</p>
            <p className={`font-semibold ${orderbook.priceChange24h >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatChange(orderbook.priceChange24h)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Liquidity</p>
            <p className="font-semibold">{orderbook.liquidity.toFixed(1)} ETH</p>
          </div>
        </div>

        {/* Orderbook Tabs */}
        <Tabs defaultValue="orderbook" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orderbook">Order Book</TabsTrigger>
            <TabsTrigger value="trades">Recent Trades</TabsTrigger>
          </TabsList>

          <TabsContent value="orderbook" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">Asks (Sellers)</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {orderbook.asks.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No asks</p>
                ) : (
                  orderbook.asks.slice(0, 5).map((ask, index) => (
                    <div key={index} className="flex justify-between text-xs bg-red-50 p-2 rounded">
                      <span className="text-red-600 font-mono">{formatPrice(ask.price)}</span>
                      <span className="text-gray-600">{ask.amount.toFixed(0)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t pt-2">
              <h4 className="text-sm font-medium text-green-600">Bids (Buyers)</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {orderbook.bids.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No bids</p>
                ) : (
                  orderbook.bids.slice(0, 5).map((bid, index) => (
                    <div key={index} className="flex justify-between text-xs bg-green-50 p-2 rounded">
                      <span className="text-green-600 font-mono">{formatPrice(bid.price)}</span>
                      <span className="text-gray-600">{bid.amount.toFixed(0)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trades" className="space-y-2">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {orderbook.recentTrades.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No recent trades</p>
              ) : (
                orderbook.recentTrades.map((trade, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
                    <span className={`font-mono ${trade.type === "buy" ? "text-green-600" : "text-red-600"}`}>
                      {formatPrice(trade.price)}
                    </span>
                    <span className="text-gray-600">{trade.amount.toFixed(0)}</span>
                    <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full bg-transparent" variant="outline" asChild>
            <a href={`https://doma.io/domain/${domain}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Doma Orderbook
            </a>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                Make Offer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Make Offer for {domain}</DialogTitle>
                <DialogDescription>
                  Submit a bid to purchase this domain. Your offer will be visible to the domain owner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Offer Amount (ETH)</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    step="0.001"
                    min="0"
                  />
                  {orderbook.bestBid && (
                    <p className="text-xs text-gray-500 mt-1">Current best bid: {formatPrice(orderbook.bestBid)}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleMakeOffer}
                    disabled={!isConnected || !offerAmount || isSubmittingOffer}
                    className="flex-1"
                  >
                    {isSubmittingOffer ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4 mr-2" />
                    )}
                    {isSubmittingOffer ? "Submitting..." : "Submit Offer"}
                  </Button>
                </div>

                {!isConnected && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">Connect your wallet to make an offer</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 border-t pt-3">
          <Clock className="h-3 w-3" />
          <span>Last updated: {new Date(orderbook.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
