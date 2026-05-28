"use client";

import { useState } from "react";
import { User, Shield, Bell, Palette, Link, Globe, Database, Key, ChevronRight, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@/lib/mock-data";
import { getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true, push: true, sms: false, whatsapp: true,
    taskAssigned: true, deadlineApproaching: true, newLead: true,
    paymentReceived: true, approvalRequired: true, campaignUpdates: false,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and workspace preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2" />Appearance</TabsTrigger>
          <TabsTrigger value="integrations"><Link className="w-4 h-4 mr-2" />Integrations</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input defaultValue="Sarah" />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input defaultValue="Mensah" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue={currentUser.email} type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input defaultValue="+233 24 000 0001" />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input defaultValue="Executive" />
                </div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select defaultValue="gmt">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmt">GMT+0 (Accra)</SelectItem>
                      <SelectItem value="gmt1">GMT+1</SelectItem>
                      <SelectItem value="gmt3">GMT+3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="font-medium text-sm mb-3">Delivery Channels</p>
                <div className="space-y-3">
                  {[
                    { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                    { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                    { key: "sms", label: "SMS Notifications", desc: "Text message alerts for critical events" },
                    { key: "whatsapp", label: "WhatsApp Notifications", desc: "WhatsApp messages for urgent updates" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={notifications[key as keyof typeof notifications] as boolean}
                        onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium text-sm mb-3">Notification Events</p>
                <div className="space-y-3">
                  {[
                    { key: "taskAssigned", label: "Task Assigned", desc: "When a task is assigned to you" },
                    { key: "deadlineApproaching", label: "Deadline Approaching", desc: "24 hours before a deadline" },
                    { key: "newLead", label: "New Lead", desc: "When a new lead is captured" },
                    { key: "paymentReceived", label: "Payment Received", desc: "Invoice payment confirmation" },
                    { key: "approvalRequired", label: "Approval Required", desc: "When your approval is needed" },
                    { key: "campaignUpdates", label: "Campaign Updates", desc: "Campaign status changes" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={notifications[key as keyof typeof notifications] as boolean}
                        onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Preferences</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="font-medium text-sm mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {["Light", "Dark", "System"].map(t => (
                    <button key={t} className={cn(
                      "p-4 rounded-xl border-2 text-sm font-medium transition-all",
                      t === "Light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}>
                      {t === "Light" ? "☀️" : t === "Dark" ? "🌙" : "💻"} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-sm mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"].map(c => (
                    <button key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110" style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-sm mb-3">Sidebar Position</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-xl border-2 border-primary bg-primary/5 text-sm font-medium">⬅ Left (Default)</button>
                  <button className="p-4 rounded-xl border-2 border-border text-sm font-medium hover:border-primary/40">➡ Right</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="space-y-4">
            {[
              { name: "WhatsApp Business", desc: "Connect your WhatsApp Business account for client communication", icon: "💬", connected: true },
              { name: "Google Ads", desc: "Import leads and track campaign performance from Google Ads", icon: "🎯", connected: true },
              { name: "Facebook Lead Ads", desc: "Automatically import leads from Facebook Lead Ads", icon: "📘", connected: false },
              { name: "Stripe", desc: "Accept online payments and sync payment status", icon: "💳", connected: false },
              { name: "Google Meet", desc: "Schedule and join video meetings directly from ICL", icon: "🎥", connected: true },
              { name: "Mailchimp", desc: "Sync contacts and run email campaigns", icon: "📧", connected: false },
              { name: "Slack", desc: "Get ICL notifications in your Slack workspace", icon: "💼", connected: false },
            ].map(int => (
              <Card key={int.name}>
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{int.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{int.name}</p>
                    <p className="text-xs text-muted-foreground">{int.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {int.connected && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</Badge>}
                    <Button variant={int.connected ? "outline" : "default"} size="sm">
                      {int.connected ? "Manage" : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button onClick={() => toast.success("Password updated!")}>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Authenticator App</p>
                    <p className="text-xs text-muted-foreground">Use an authenticator app to generate one-time codes</p>
                  </div>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {[
                  { device: "MacBook Pro — Chrome", location: "Accra, Ghana", time: "Now", current: true },
                  { device: "iPhone 15 — Safari", location: "Accra, Ghana", time: "2 hours ago", current: false },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{session.device}</p>
                        {session.current && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{session.location} · {session.time}</p>
                    </div>
                    {!session.current && <Button variant="ghost" size="sm" className="text-red-500 text-xs">Sign Out</Button>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
