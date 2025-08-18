"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Palette, Save, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface PageCustomizationProps {
  domain: string
}

interface PageSettings {
  title: string
  description: string
  theme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
  }
  ogImage?: string
}

export function PageCustomization({ domain }: PageCustomizationProps) {
  const [settings, setSettings] = useState<PageSettings>({
    title: domain,
    description: `Send payments and messages to ${domain}`,
    theme: {
      primaryColor: "#3b82f6",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPageSettings()
  }, [domain])

  const fetchPageSettings = async () => {
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(domain)}/settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, ...data })
      }
    } catch (error) {
      console.error("Error fetching page settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(domain)}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success("Page settings saved successfully!")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading page settings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Page Customization
          </CardTitle>
          <CardDescription>Customize the appearance and content of your domain page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="Enter page title"
              />
            </div>

            <div>
              <Label htmlFor="description">Page Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Enter page description"
                rows={3}
              />
            </div>
          </div>

          {/* Theme Colors */}
          <div className="space-y-4">
            <h4 className="font-medium">Theme Colors</h4>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.theme.primaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, primaryColor: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.theme.primaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, primaryColor: e.target.value },
                      })
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundColor">Background</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={settings.theme.backgroundColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, backgroundColor: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.theme.backgroundColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, backgroundColor: e.target.value },
                      })
                    }
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={settings.theme.textColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, textColor: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.theme.textColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, textColor: e.target.value },
                      })
                    }
                    placeholder="#1f2937"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            <Button variant="outline" asChild>
              <Link href={`/${domain}`}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Page
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How your page will look with current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg border-2 border-dashed"
            style={{
              backgroundColor: settings.theme.backgroundColor,
              color: settings.theme.textColor,
              borderColor: settings.theme.primaryColor + "40",
            }}
          >
            <h3 className="text-xl font-bold mb-2">{settings.title}</h3>
            <p className="text-sm opacity-80 mb-4">{settings.description}</p>
            <div
              className="inline-block px-4 py-2 rounded text-white text-sm"
              style={{ backgroundColor: settings.theme.primaryColor }}
            >
              Sample Button
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
