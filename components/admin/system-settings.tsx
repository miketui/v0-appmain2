"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Shield, Bell, Users } from "lucide-react"

export function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: "Haus of Basquiat",
    siteDescription: "A community platform for ballroom culture enthusiasts",
    allowRegistration: true,
    requireApproval: true,
    enableNotifications: true,
    enableChat: true,
    maxFileSize: "10",
    allowedFileTypes: "jpg,png,gif,pdf,doc,docx",
    communityGuidelines: "Welcome to our community! Please be respectful and follow our guidelines...",
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    // Save settings logic here
    console.log("Saving settings:", settings)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-blue-300">Site Status</div>
            <div className="text-lg font-bold text-blue-400">Online</div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-green-300">Security</div>
            <div className="text-lg font-bold text-green-400">Secure</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-sm text-purple-300">Notifications</div>
            <div className="text-lg font-bold text-purple-400">Active</div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-sm text-orange-300">Community</div>
            <div className="text-lg font-bold text-orange-400">Growing</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-6">System Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange("siteName", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max File Size (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange("maxFileSize", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => handleSettingChange("allowRegistration", e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Allow New Registrations</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.requireApproval}
                    onChange={(e) => handleSettingChange("requireApproval", e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Require Admin Approval</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => handleSettingChange("enableNotifications", e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Enable Notifications</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.enableChat}
                    onChange={(e) => handleSettingChange("enableChat", e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Enable Chat System</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Community Guidelines</label>
            <textarea
              value={settings.communityGuidelines}
              onChange={(e) => handleSettingChange("communityGuidelines", e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-lg hover:from-purple-700 hover:to-amber-600 transition-all duration-200"
            >
              Save Settings
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
