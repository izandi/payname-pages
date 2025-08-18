"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react"

interface AnalyticsDashboardProps {
  domain: string
}

export function AnalyticsDashboard({ domain }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState({
    pageViews: { current: 1234, change: 12.5 },
    uniqueVisitors: { current: 456, change: 8.3 },
    totalPayments: { current: 23, change: 15.2 },
    conversionRate: { current: 5.1, change: -2.1 },
  })

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pageViews.current.toLocaleString()}</div>
            <p className={`text-xs ${analytics.pageViews.change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {analytics.pageViews.change >= 0 ? "+" : ""}
              {analytics.pageViews.change}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueVisitors.current.toLocaleString()}</div>
            <p className={`text-xs ${analytics.uniqueVisitors.change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {analytics.uniqueVisitors.change >= 0 ? "+" : ""}
              {analytics.uniqueVisitors.change}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPayments.current}</div>
            <p className={`text-xs ${analytics.totalPayments.change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {analytics.totalPayments.change >= 0 ? "+" : ""}
              {analytics.totalPayments.change}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.current}%</div>
            <p className={`text-xs ${analytics.conversionRate.change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {analytics.conversionRate.change >= 0 ? "+" : ""}
              {analytics.conversionRate.change}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
          <CardDescription>Page views and visitor trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Analytics charts coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
