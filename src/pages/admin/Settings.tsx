
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save } from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: "Majstri.com",
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    reviewModeration: false,
    welcomeMessage: "Welcome to Majstri.com - connecting you with skilled craftsmen!",
    supportEmail: "support@majstri.com"
  });

  const handleSave = () => {
    // Implementation for saving settings
    console.log("Saving settings:", settings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure platform settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic platform configuration options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({...settings, welcomeMessage: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Controls</CardTitle>
            <CardDescription>
              Enable or disable platform features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-500">
                  Temporarily disable the platform for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-gray-500">
                  Allow new users to register on the platform
                </p>
              </div>
              <Switch
                checked={settings.userRegistration}
                onCheckedChange={(checked) => setSettings({...settings, userRegistration: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Send automated email notifications to users
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Review Moderation</Label>
                <p className="text-sm text-gray-500">
                  Require admin approval for all reviews
                </p>
              </div>
              <Switch
                checked={settings.reviewModeration}
                onCheckedChange={(checked) => setSettings({...settings, reviewModeration: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
