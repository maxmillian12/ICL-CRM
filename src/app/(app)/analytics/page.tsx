"use client";

import { useState } from "react";
import { Download, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { PageLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { reportsApi, leadsApi, financeApi } from "@/lib/api-client";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

const COLORS = ["#00AAEE","#10b981","#FFD600","#E91E63","#4CAF50","#f59e0b"];

const CAMPAIGN_PIE = [
  {name:"Digital",value:35},{name:"Social Media",value:25},{name:"TV",value:20},{name:"Influencer",value:12},{name:"Outdoor",value:8}
];

const RADAR_DATA = [
  {subject:"Lead Conversion",A:78},{subject:"Client Retention",A:94},{subject:"Campaign ROI",A:89},
  {subject:"Task Completion",A:85},{subject:"Invoice Collection",A:91},{subject:"Team Productivity",A:84},
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"3m"|"6m"|"1y">("1y");

  const { data: revenueData, loading: revLoading, error: revError, refetch: refetchRev } =
    useApi(() => reportsApi.revenue().then(r => r.data), []);
  const { data: dashData } =
    useApi(() => reportsApi.dashboard().then(r => r.data), []);
  const { data: leadsData } =
    useApi(() => leadsApi.list().then(r => r.data), []);
  const { data: financeData } =
    useApi(() => financeApi.summary().then(r => r.data), []);

  const chartData = Array.isArray(revenueData) ? revenueData : [];
  const periodChart = period==="3m" ? chartData.slice(-3) : period==="6m" ? chartData.slice(-6) : chartData;
  const dash = dashData as Record<string,number> || {};
  const fin = financeData as Record<string,number> || {};
  const leads = (leadsData as {data?:unknown[]})?.data ?? [];
  const funnel = [
    {stage:"New Leads",count:leads.filter((l:unknown)=>(l as Record<string,unknown>).status==="new").length},
    {stage:"Contacted",count:leads.filter((l:unknown)=>(l as Record<string,unknown>).status==="contacted").length},
    {stage:"Proposal",count:leads.filter((l:unknown)=>(l as Record<string,unknown>).status==="proposal_sent").length},
    {stage:"Negotiation",count:leads.filter((l:unknown)=>(l as Record<string,unknown>).status==="negotiation").length},
    {stage:"Won",count:leads.filter((l:unknown)=>(l as Record<string,unknown>).status==="won").length},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
          <p className="text-muted-foreground text-sm">Live performance insights for ICL</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={v=>v&&setPeriod(v as "3m"|"6m"|"1y")}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.info("PDF export coming soon!")}>
            <Download className="w-4 h-4 mr-2" />Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Revenue Collected",value:formatCurrency(fin.totalRevenue||0),sub:"paid invoices",pos:true},
          {label:"Pending Revenue",value:formatCurrency(fin.pendingRevenue||0),sub:"sent invoices",pos:true},
          {label:"VAT Collected (TRA)",value:formatCurrency(fin.vatCollected||0),sub:"@ 18% rate",pos:true},
          {label:"Active Leads",value:String(dash.openLeads||0),sub:"in pipeline",pos:true},
        ].map(k=>(
          <Card key={k.label}><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold">{k.value}</span>
            </div>
            <p className="text-sm font-medium">{k.label}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Monthly Revenue (TZS)</CardTitle></CardHeader>
              <CardContent>
                {revLoading ? <div className="h-64 flex items-center justify-center"><Activity className="w-8 h-8 animate-spin text-muted-foreground/30" /></div> :
                revError ? <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet. Create invoices to see data.</p> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={periodChart}>
                      <defs>
                        <linearGradient id="rev-g" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00AAEE" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00AAEE" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3}/>
                      <XAxis dataKey="month" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                      <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>`${(Number(v)/1_000_000).toFixed(0)}M`}/>
                      <Tooltip formatter={(v)=>formatCurrency(Number(v))} contentStyle={{borderRadius:"8px",fontSize:"12px"}}/>
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#00AAEE" fill="url(#rev-g)" strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Lead Conversion Funnel</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={funnel} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3}/>
                    <XAxis type="number" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                    <YAxis type="category" dataKey="stage" tick={{fontSize:11}} tickLine={false} axisLine={false} width={90}/>
                    <Tooltip contentStyle={{borderRadius:"8px",fontSize:"12px"}}/>
                    <Bar dataKey="count" name="Leads" fill="#00AAEE" radius={[0,4,4,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Revenue by Campaign Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={CAMPAIGN_PIE} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                      {CAMPAIGN_PIE.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip formatter={v=>`${v}%`} contentStyle={{borderRadius:"8px",fontSize:"12px"}}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:"11px"}}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agency Performance Radar</CardTitle>
              <CardDescription className="text-xs">Overall performance across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid/>
                  <PolarAngleAxis dataKey="subject" tick={{fontSize:11}}/>
                  <Radar name="Performance" dataKey="A" stroke="#00AAEE" fill="#00AAEE" fillOpacity={0.2} strokeWidth={2}/>
                  <Tooltip contentStyle={{borderRadius:"8px",fontSize:"12px"}} formatter={v=>`${v}%`}/>
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
