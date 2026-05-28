"use client";

import { CheckCircle, XCircle, Clock, RefreshCw, ImageIcon, DollarSign, FileText, Megaphone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader } from "@/components/ui/loading";
import { cn, formatRelativeTime, getStatusColor, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

// Approvals page — shows pending approvals that require action
// Note: Approvals API endpoint to be connected; using local state for now
const SAMPLE_APPROVALS = [
  { id:"a1",title:"Campaign Visual Assets V2",type:"creative",status:"pending",requested_by:"Kofi Darko",created_at:new Date(Date.now()-3600000).toISOString(),comments:"Second iteration after client feedback. Colors adjusted as requested.",files:["visuals_v2.pdf","assets.zip"] },
  { id:"a2",title:"Campaign Budget Increase Request",type:"budget",status:"pending",requested_by:"Kwame Asante",created_at:new Date(Date.now()-7200000).toISOString(),comments:"Client wants to increase Google Ads spend by TZS 15,000,000",files:["budget_revision.xlsx"] },
  { id:"a3",title:"Influencer Partnership Contract",type:"proposal",status:"approved",requested_by:"Ama Boateng",created_at:new Date(Date.now()-86400000).toISOString(),comments:"Contracts for 5 micro-influencers. Approved.",files:["contracts.pdf"] },
  { id:"a4",title:"Q2 Campaign Invoice",type:"invoice",status:"pending",requested_by:"Abena Osei",created_at:new Date(Date.now()-1800000).toISOString(),comments:"Invoice for June campaign management",files:["invoice_q2.pdf"] },
];

const TYPE_ICONS: Record<string,React.ElementType> = { creative:ImageIcon,campaign:Megaphone,budget:DollarSign,proposal:FileText,invoice:FileText };
const TYPE_COLORS: Record<string,string> = {
  creative:"text-purple-500 bg-purple-50 dark:bg-purple-900/20",
  campaign:"text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  budget:"text-green-500 bg-green-50 dark:bg-green-900/20",
  proposal:"text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  invoice:"text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = React.useState(SAMPLE_APPROVALS);

  const handle = (id: string, status: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    const msgs: Record<string,string> = { approved:"✅ Approved!", rejected:"❌ Rejected", revision:"🔄 Revision requested" };
    toast.success(msgs[status]);
  };

  const pending = approvals.filter(a => a.status === "pending");
  const reviewed = approvals.filter(a => a.status !== "pending");

  const ApprovalCard = ({ a }: { a: typeof SAMPLE_APPROVALS[0] }) => {
    const Icon = TYPE_ICONS[a.type] ?? FileText;
    const colors = TYPE_COLORS[a.type] ?? "text-gray-500 bg-gray-50";
    return (
      <Card className={cn("border-border", a.status==="pending" && "border-l-4 border-l-amber-400")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",colors.split(" ").slice(1).join(" "))}><Icon className={cn("w-5 h-5",colors.split(" ")[0])}/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={cn("text-[10px] capitalize",getStatusColor(a.type))}>{a.type}</Badge>
                    <Badge className={cn("text-[10px] capitalize",getStatusColor(a.status))}>{a.status}</Badge>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{formatRelativeTime(a.created_at)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{a.comments}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">{getInitials(a.requested_by)}</div>
                <span className="text-xs text-muted-foreground">By {a.requested_by}</span>
                {a.files.length > 0 && (
                  <div className="flex gap-1 ml-auto">
                    {a.files.map(f=><span key={f} className="text-[10px] bg-muted px-2 py-0.5 rounded cursor-pointer hover:bg-primary/10">📎 {f}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
          {a.status==="pending" && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 h-8" onClick={()=>handle(a.id,"approved")}><CheckCircle className="w-3.5 h-3.5 mr-1.5"/>Approve</Button>
              <Button size="sm" variant="outline" className="flex-1 h-8 text-amber-500 border-amber-300 hover:bg-amber-50" onClick={()=>handle(a.id,"revision")}><RefreshCw className="w-3.5 h-3.5 mr-1.5"/>Revision</Button>
              <Button size="sm" variant="outline" className="flex-1 h-8 text-red-500 border-red-300 hover:bg-red-50" onClick={()=>handle(a.id,"rejected")}><XCircle className="w-3.5 h-3.5 mr-1.5"/>Reject</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-muted-foreground text-sm"><span className="text-amber-600 font-semibold">{pending.length} pending</span> · {reviewed.length} reviewed</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Pending",value:pending.length,icon:Clock,c:"text-amber-500 bg-amber-50 dark:bg-amber-900/20"},
          {label:"Approved",value:approvals.filter(a=>a.status==="approved").length,icon:CheckCircle,c:"text-green-500 bg-green-50 dark:bg-green-900/20"},
          {label:"Rejected",value:approvals.filter(a=>a.status==="rejected").length,icon:XCircle,c:"text-red-500 bg-red-50 dark:bg-red-900/20"},
          {label:"Revision",value:approvals.filter(a=>a.status==="revision").length,icon:RefreshCw,c:"text-blue-500 bg-blue-50 dark:bg-blue-900/20"},
        ].map(s=>(
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",s.c.split(" ").slice(1).join(" "))}><s.icon className={cn("w-4 h-4",s.c.split(" ")[0])}/></div>
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        ))}
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewed.length})</TabsTrigger>
          <TabsTrigger value="all">All ({approvals.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length===0 ? <div className="text-center py-16 text-muted-foreground"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60"/><p className="font-medium">All clear! No pending approvals.</p></div>
            : pending.map(a=><ApprovalCard key={a.id} a={a}/>)}
        </TabsContent>
        <TabsContent value="reviewed" className="mt-4 space-y-3">{reviewed.map(a=><ApprovalCard key={a.id} a={a}/>)}</TabsContent>
        <TabsContent value="all" className="mt-4 space-y-3">{approvals.map(a=><ApprovalCard key={a.id} a={a}/>)}</TabsContent>
      </Tabs>
    </div>
  );
}

// Need React for useState
import React from "react";
