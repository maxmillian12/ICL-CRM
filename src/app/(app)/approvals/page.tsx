"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, FileText, ImageIcon, DollarSign, Megaphone, MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { approvals, users } from "@/lib/mock-data";
import { formatRelativeTime, getStatusColor, getInitials, cn } from "@/lib/utils";
import type { ApprovalRequest } from "@/lib/types";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, React.ElementType> = {
  creative: ImageIcon,
  campaign: Megaphone,
  budget: DollarSign,
  proposal: FileText,
  invoice: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  creative: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
  campaign: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  budget: "text-green-500 bg-green-50 dark:bg-green-900/20",
  proposal: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  invoice: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
};

function ApprovalCard({ approval, onAction }: { approval: ApprovalRequest; onAction: (id: string, status: "approved" | "rejected" | "revision") => void }) {
  const requester = users.find(u => u.id === approval.requestedBy);
  const Icon = TYPE_ICONS[approval.type] ?? FileText;
  const colors = TYPE_COLORS[approval.type] ?? "text-gray-500 bg-gray-50";

  return (
    <Card className={cn("border-border hover:shadow-sm transition-all", approval.status === "pending" && "border-l-4 border-l-amber-400")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", colors.split(" ").slice(1).join(" "))}>
            <Icon className={cn("w-5 h-5", colors.split(" ")[0])} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm">{approval.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={cn("text-[10px] capitalize", getStatusColor(approval.type))}>{approval.type}</Badge>
                  <Badge className={cn("text-[10px] capitalize", getStatusColor(approval.status))}>{approval.status}</Badge>
                </div>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatRelativeTime(approval.createdAt)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{approval.comments}</p>
            <div className="flex items-center gap-2 mt-2">
              {requester && (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                    {getInitials(requester.name)}
                  </div>
                  <span className="text-xs text-muted-foreground">Requested by {requester.name}</span>
                </div>
              )}
              {approval.files.length > 0 && (
                <div className="flex gap-1 ml-auto">
                  {approval.files.map(f => (
                    <span key={f} className="text-[10px] bg-muted px-2 py-0.5 rounded cursor-pointer hover:bg-primary/10 transition-colors">
                      📎 {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {approval.status === "pending" && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 h-8" onClick={() => onAction(approval.id, "approved")}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />Approve
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-amber-500 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20" onClick={() => onAction(approval.id, "revision")}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Request Revision
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => onAction(approval.id, "rejected")}>
              <XCircle className="w-3.5 h-3.5 mr-1.5" />Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApprovalsPage() {
  const [allApprovals, setAllApprovals] = useState<ApprovalRequest[]>(approvals);

  const handleAction = (id: string, status: "approved" | "rejected" | "revision") => {
    setAllApprovals(prev => prev.map(a => a.id === id ? { ...a, status, reviewedAt: new Date().toISOString() } : a));
    const messages = { approved: "✅ Approved!", rejected: "❌ Rejected", revision: "🔄 Revision requested" };
    toast.success(messages[status]);
  };

  const pending = allApprovals.filter(a => a.status === "pending");
  const reviewed = allApprovals.filter(a => a.status !== "pending");

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-muted-foreground text-sm">
          <span className="text-amber-600 font-semibold">{pending.length} pending</span> · {reviewed.length} reviewed
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: pending.length, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20", icon: Clock },
          { label: "Approved", value: allApprovals.filter(a => a.status === "approved").length, color: "text-green-500 bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
          { label: "Rejected", value: allApprovals.filter(a => a.status === "rejected").length, color: "text-red-500 bg-red-50 dark:bg-red-900/20", icon: XCircle },
          { label: "Revision", value: allApprovals.filter(a => a.status === "revision").length, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20", icon: RefreshCw },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.color.split(" ").slice(1).join(" "))}>
                <s.icon className={cn("w-4 h-4", s.color.split(" ")[0])} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewed.length})</TabsTrigger>
          <TabsTrigger value="all">All ({allApprovals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60" />
              <p className="font-medium">All clear! No pending approvals.</p>
            </div>
          ) : (
            pending.map(a => <ApprovalCard key={a.id} approval={a} onAction={handleAction} />)
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="mt-4 space-y-3">
          {reviewed.map(a => <ApprovalCard key={a.id} approval={a} onAction={handleAction} />)}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-3">
          {allApprovals.map(a => <ApprovalCard key={a.id} approval={a} onAction={handleAction} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
