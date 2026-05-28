"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Users, Megaphone, Target, Clock,
  CheckCircle, DollarSign, AlertCircle, ArrowRight, Plus, Flame, Activity
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageLoader, TableLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { reportsApi, leadsApi, projectsApi, financeApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatCurrencyCompact, getStatusColor, getInitials, getPriorityColor, cn } from "@/lib/utils";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#ef4444"];

const CAMPAIGN_PIE = [
  { name: "Digital", value: 35 },
  { name: "Social Media", value: 25 },
  { name: "TV", value: 20 },
  { name: "Influencer", value: 12 },
  { name: "Outdoor", value: 8 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"3m"|"6m"|"1y">("1y");

  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } =
    useApi(() => reportsApi.dashboard().then(r => r.data), []);

  const { data: leadsRes, loading: leadsLoading } =
    useApi(() => leadsApi.list({ limit: "6" }).then(r => r.data), []);

  const { data: projectsRes, loading: projectsLoading } =
    useApi(() => projectsApi.list({ status: "active" }).then(r => r.data), []);

  const { data: revData, loading: revLoading } =
    useApi(() => reportsApi.revenue().then(r => r.data), []);

  const leads = (leadsRes as { data?: unknown[] })?.data ?? [];
  const projects = (projectsRes as { data?: unknown[] })?.data ?? [];
  const chartData = Array.isArray(revData) ? revData : [];

  const periodChart = period === "3m" ? chartData.slice(-3) : period === "6m" ? chartData.slice(-6) : chartData;

  const statCards = stats ? [
    { title:"Total Revenue YTD", value:formatCurrencyCompact((stats as Record<string,number>).totalRevenue), change:`+12.5%`, pos:true, icon:DollarSign, c:"text-emerald-500 bg-emerald-500/10", sub:"invoices paid" },
    { title:"Active Clients", value:String((stats as Record<string,number>).activeClients), change:"+3", pos:true, icon:Users, c:"text-blue-500 bg-blue-500/10", sub:"this quarter" },
    { title:"Active Campaigns", value:String((stats as Record<string,number>).activeCampaigns), change:"+5", pos:true, icon:Megaphone, c:"text-purple-500 bg-purple-500/10", sub:"running now" },
    { title:"Open Leads", value:String((stats as Record<string,number>).openLeads), change:"in pipeline", pos:true, icon:Target, c:"text-orange-500 bg-orange-500/10", sub:"to follow up" },
    { title:"Pending Approvals", value:String((stats as Record<string,number>).pendingApprovals), change:"Action needed", pos:false, icon:AlertCircle, c:"text-red-500 bg-red-500/10", sub:"awaiting review" },
    { title:"Team Productivity", value:`${(stats as Record<string,number>).teamProductivity}%`, change:"+4%", pos:true, icon:Activity, c:"text-teal-500 bg-teal-500/10", sub:"this month" },
  ] : [];

  if (statsLoading && !stats) return <PageLoader message="Loading dashboard..." />;
  if (statsError) return <div className="p-6"><ApiError error={statsError} onRetry={refetchStats} /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Good morning, {user?.name?.split(" ")[0] ?? "—"} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("en-TZ",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        <Link href="/projects" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" />New Project</Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsLoading ? <div className="col-span-6"><TableLoader cols={6} rows={1} /></div> : statCards.map(card => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.c.split(" ")[1])}>
                  <card.icon className={cn("w-4 h-4", card.c.split(" ")[0])} />
                </div>
                <span className={cn("text-xs font-medium flex items-center gap-0.5",
                  card.pos ? "text-emerald-600" : "text-red-500"
                )}>
                  {card.pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.title}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue Overview (TZS)</CardTitle>
                <CardDescription className="text-xs">Revenue from paid invoices</CardDescription>
              </div>
              <div className="flex gap-1">
                {(["3m","6m","1y"] as const).map(p => (
                  <Button key={p} variant={period===p?"default":"ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => setPeriod(p)}>
                    {p.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {revLoading ? <div className="h-64 flex items-center justify-center"><Activity className="w-8 h-8 animate-spin text-muted-foreground/30" /></div> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={periodChart} margin={{top:5,right:5,bottom:5,left:0}}>
                  <defs>
                    <linearGradient id="rev-g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{fontSize:11}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v => `${(Number(v)/1_000_000).toFixed(0)}M`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{borderRadius:"8px",fontSize:"12px"}} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:"12px"}} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#rev-g)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Campaign Mix</CardTitle>
            <CardDescription className="text-xs">Revenue by campaign type</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={CAMPAIGN_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {CAMPAIGN_PIE.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `${v}%`} contentStyle={{borderRadius:"8px",fontSize:"12px"}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {CAMPAIGN_PIE.map((item,i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS[i]}} />
                  <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                  <span className="text-xs font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects + Hot Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Projects</CardTitle>
              <Link href="/projects" className="h-7 text-xs">View all <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {projectsLoading ? <TableLoader rows={3} cols={2} /> :
              projects.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No active projects</p> :
              (projects as Array<Record<string,unknown>>).slice(0,4).map(p => (
                <div key={p.id as string}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-medium truncate">{p.name as string}</p>
                      <p className="text-xs text-muted-foreground">{p.client_name as string}</p>
                    </div>
                    <Badge className={cn("text-[10px] px-1.5 py-0", getStatusColor(p.status as string))}>
                      {p.status as string}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(p.progress as number) ?? 0} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground flex-shrink-0">{String(p.progress ?? 0)}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Budget: {formatCurrency(p.budget as number)} · Spent: {formatCurrency((p.spent as number) ?? 0)}
                  </p>
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Hot Leads</CardTitle>
              <Link href="/crm/leads" className="h-7 text-xs">View all <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {leadsLoading ? <TableLoader rows={4} cols={3} /> :
              leads.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No leads yet</p> :
              (leads as Array<Record<string,unknown>>)
                .filter(l => l.status !== "won" && l.status !== "lost")
                .sort((a,b) => (b.score as number)-(a.score as number))
                .slice(0,4).map(lead => (
                <div key={lead.id as string} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                    {getInitials(lead.company as string)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.company as string}</p>
                    <p className="text-xs text-muted-foreground">{lead.contact_name as string} · {lead.industry as string}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(lead.budget as number)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-xs font-medium text-orange-500">{lead.score as number}</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
