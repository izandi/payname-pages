"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, MessageSquare, Eye, TrendingUp, ExternalLink, Copy } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface DashboardOverviewProps {
  domain: string
}

interface OverviewStats {
  totalPayments: number
  totalAmount: string
  messageCount: number
  pageViews: number
  conversionRate: number
  recentActivity: Array<{
    type: "payment" | "message" | "view"
    amount?: number
    from?: string
    timestamp: string
  }>
}

export function DashboardOverview({ domain }: DashboardOverviewProps) {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOverviewStats()
  }, [domain])

  const fetchOverviewStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(domain)}/overview`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching overview stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyPageUrl = async () => {
    const url = `${window.location.origin}/${domain}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Page URL copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Failed to load overview data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your domain page</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href={`/${domain}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Page
            </Link>
          </Button>
          <Button variant="outline" onClick={copyPageUrl}>
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard?domain=${domain}&tab=customize`}>Customize Page</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">{stats.totalAmount} ETH received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messageCount}</div>
            <p className="text-xs text-muted-foreground">Verified messages received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pageViews}</div>
            <p className="text-xs text-muted-foreground">Total page visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Visitors who paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interactions with your page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === "payment" && <DollarSign className="h-4 w-4 text-green-600" />}
                    {activity.type === "message" && <MessageSquare className="h-4 w-4 text-blue-600" />}
                    {activity.type === "view" && <Eye className="h-4 w-4 text-gray-600" />}

                    <div>
                      <p className="text-sm font-medium">
                        {activity.type === "payment" && `Payment of ${activity.amount} ETH`}
                        {activity.type === "message" && "New message received"}
                        {activity.type === "view" && "Page viewed"}
                      </p>
                      {activity.from && <p className="text-xs text-gray-500 font-mono">{activity.from}</p>}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
