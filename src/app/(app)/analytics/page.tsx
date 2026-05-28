"use client";

import { useState } from "react";
import { Download, TrendingUp, TrendingDown, BarChart2, PieChart as PieIcon, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { revenueData, campaignPerformanceData, leadConversionData, clients, projects } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

const teamProductivityData = [
  { name: "Kwame", tasks: 24, onTime: 22, score: 92 },
  { name: "Ama", tasks: 18, onTime: 15, score: 83 },
  { name: "Kofi", tasks: 31, onTime: 28, score: 90 },
  { name: "Abena", tasks: 15, onTime: 14, score: 93 },
  { name: "Yaw", tasks: 22, onTime: 19, score: 86 },
];

const clientRetentionData = [
  { month: "Jul", new: 3, churned: 1, total: 28 },
  { month: "Aug", new: 2, churned: 0, total: 30 },
  { month: "Sep", new: 4, churned: 1, total: 33 },
  { month: "Oct", new: 1, churned: 2, total: 32 },
  { month: "Nov", new: 3, churned: 0, total: 35 },
  { month: "Dec", new: 2, churned: 1, total: 36 },
];

const campaignROIData = [
  { campaign: "Hubtel Digital", spend: 28500, revenue: 85000, roi: 198 },
  { campaign: "MTN Rebrand", spend: 35000, revenue: 120000, roi: 243 },
  { campaign: "Stanbic Social", spend: 25000, revenue: 72000, roi: 188 },
  { campaign: "Accra Brew Influencer", spend: 2500, revenue: 9000, roi: 260 },
];

const radarData = [
  { subject: "Lead Conversion", A: 78 },
  { subject: "Client Retention", A: 94 },
  { subject: "Campaign ROI", A: 89 },
  { subject: "Task Completion", A: 85 },
  { subject: "Invoice Collection", A: 91 },
  { subject: "Team Productivity", A: 84 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("12m");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
          <p className="text-muted-foreground text-sm">Comprehensive performance insights for ICL</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => v && setPeriod(v as "3m" | "6m" | "1y")}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue Growth", value: "+12.5%", sub: "vs last year", positive: true },
          { label: "Lead Conversion", value: "15%", sub: "industry avg 12%", positive: true },
          { label: "Client Retention", value: "94%", sub: "target 90%", positive: true },
          { label: "Campaign ROI", value: "222%", sub: "avg across all campaigns", positive: true },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                {k.positive ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                <span className={cn("text-2xl font-bold", k.positive ? "text-green-600" : "text-red-500")}>{k.value}</span>
              </div>
              <p className="text-sm font-medium">{k.label}</p>
              <p className="text-xs text-muted-foreground">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Monthly Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#rev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" fill="url(#exp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Monthly Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Campaign ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={campaignROIData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="campaign" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
                    <Tooltip formatter={(v, name) => String(name) === "roi" ? `${v}%` : formatCurrency(Number(v))} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="roi" name="ROI %" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Revenue by Campaign Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={campaignPerformanceData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                      {campaignPerformanceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Lead Funnel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lead Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leadConversionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" name="Leads" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Team Productivity</CardTitle>
              <CardDescription className="text-xs">Tasks completed vs on-time delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={teamProductivityData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="tasks" name="Total Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="onTime" name="On Time" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Client Growth & Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={clientRetentionData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="new" name="New Clients" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="churned" name="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agency Performance Radar</CardTitle>
              <CardDescription className="text-xs">Overall performance across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(v) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
