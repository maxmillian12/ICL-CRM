"use client";

import { useState } from "react";
import {
  CheckCircle, XCircle, Clock, RefreshCw, ImageIcon, DollarSign,
  FileText, Megaphone, Plus, Loader2, AlertCircle, Paperclip, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLoader, TableLoader, ApiError } from "@/components/ui/loading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApprovals, mutations } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { cn, formatRelativeTime, getStatusColor, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getApiError } from "@/lib/api-client";

const TYPE_ICONS: Record<string, React.ElementType> = {
  creative: ImageIcon, campaign: Megaphone, budget: DollarSign,
  proposal: FileText, invoice: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  creative: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
  campaign: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  budget: "text-green-500 bg-green-50 dark:bg-green-900/20",
  proposal: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  invoice: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
};

// Reviewer notes dialog
function ReviewDialog({
  open, onClose, approval, action
}: {
  open: boolean;
  onClose: () => void;
  approval: Record<string, unknown> | null;
  action: "approved" | "rejected" | "revision";
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const actionConfig = {
    approved: { label: "Approve", color: "bg-green-500 hover:bg-green-600 text-white", icon: CheckCircle },
    rejected: { label: "Reject", color: "bg-destructive hover:bg-destructive/90 text-destructive-foreground", icon: XCircle },
    revision: { label: "Request Revision", color: "bg-amber-500 hover:bg-amber-600 text-white", icon: RefreshCw },
  };

  const cfg = actionConfig[action];

  const handleSubmit = async () => {
    if (!approval) return;
    setSaving(true);
    try {
      if (action === "approved") await mutations.approveApproval(approval.id as string, notes);
      else if (action === "rejected") await mutations.rejectApproval(approval.id as string, notes);
      else await mutations.requestRevision(approval.id as string, notes);

      const labels = { approved: "✅ Approved", rejected: "❌ Rejected", revision: "🔄 Revision requested" };
      toast.success(labels[action]);
      setNotes("");
      onClose();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <cfg.icon className="w-5 h-5" />
            {cfg.label}: {approval?.title as string}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">
              {action === "approved" ? "Approval Notes (optional)" : action === "rejected" ? "Reason for Rejection *" : "Revision Instructions *"}
            </Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={
                action === "approved" ? "Add any approval notes..." :
                action === "rejected" ? "Explain why this is being rejected..." :
                "Describe what needs to be revised..."
              }
              className="resize-none h-24"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || ((action === "rejected" || action === "revision") && !notes.trim())}
              className={cn("flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", cfg.color)}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <cfg.icon className="w-4 h-4" />}
              {saving ? "Saving..." : cfg.label}
            </button>
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// New Approval Dialog
function NewApprovalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", type: "creative", comments: "" });
  const [formError, setFormError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    setSaving(true); setFormError("");
    try {
      await mutations.createApproval(form);
      toast.success("Approval request submitted");
      setForm({ title: "", type: "creative", comments: "" });
      onClose();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Submit Approval Request</DialogTitle></DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}</div>}
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Campaign Visuals V2" />
          </div>
          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={form.type} onValueChange={v => v && setForm(p => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description / Notes</Label>
            <Textarea value={form.comments} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} placeholder="Describe what needs to be approved..." className="resize-none h-20" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit for Approval"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main approval card
function ApprovalCard({
  a, canAct, onAction
}: {
  a: Record<string, unknown>;
  canAct: boolean;
  onAction: (id: string, action: "approved" | "rejected" | "revision") => void;
}) {
  const Icon = TYPE_ICONS[a.type as string] ?? FileText;
  const colors = TYPE_COLORS[a.type as string] ?? "text-gray-500 bg-gray-50";
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await mutations.deleteApproval(a.id as string);
      toast.success("Approval deleted");
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <Card className={cn(
      "border-border transition-all",
      a.status === "pending" && "border-l-4 border-l-amber-400 shadow-sm"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", colors.split(" ").slice(1).join(" "))}>
            <Icon className={cn("w-5 h-5", colors.split(" ")[0])} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm">{a.title as string}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={cn("text-[10px] capitalize", TYPE_COLORS[a.type as string] ?? "")}>{a.type as string}</Badge>
                  <Badge className={cn("text-[10px] capitalize", getStatusColor(a.status as string))}>{a.status as string}</Badge>
                </div>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatRelativeTime(a.created_at as string)}</span>
            </div>

            {/* Description */}
            {Boolean(a.comments) && (
              <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <p className="line-clamp-2">{a.comments as string}</p>
              </div>
            )}

            {/* Reviewer notes (for reviewed items) */}
            {Boolean(a.reviewer_notes) && a.status !== "pending" && (
              <div className={cn(
                "mt-2 rounded-lg p-2 text-xs",
                a.status === "approved" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" :
                a.status === "rejected" ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" :
                "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
              )}>
                <span className="font-semibold">
                  {a.status === "approved" ? "✅ Approval notes:" : a.status === "rejected" ? "❌ Rejection reason:" : "🔄 Revision notes:"}
                </span>{" "}
                {a.reviewer_notes as string}
              </div>
            )}

            {/* Requester + Files */}
            <div className="flex items-center gap-2 mt-2">
              {Boolean(a.requested_by_name) && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{getInitials(a.requested_by_name as string)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">By {a.requested_by_name as string}</span>
                </div>
              )}
              {Array.isArray(a.files) && (a.files as string[]).length > 0 && (
                <div className="flex gap-1 ml-auto">
                  {(a.files as string[]).map(f => (
                    <span key={f} className="text-[10px] bg-muted px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-primary/10 transition-colors">
                      <Paperclip className="w-2.5 h-2.5" />{f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reviewed by */}
            {Boolean(a.approver_name) && a.status !== "pending" && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Reviewed by {a.approver_name as string}
                {Boolean(a.reviewed_at) && ` · ${formatRelativeTime(a.reviewed_at as string)}`}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons — only for pending items and authorized users */}
        {a.status === "pending" && canAct && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => onAction(a.id as string, "approved")}
              className="flex-1 h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />Approve
            </button>
            <button
              type="button"
              onClick={() => onAction(a.id as string, "revision")}
              className="flex-1 h-8 rounded-lg border border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />Revision
            </button>
            <button
              type="button"
              onClick={() => onAction(a.id as string, "rejected")}
              className="flex-1 h-8 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />Reject
            </button>
          </div>
        )}
      </CardContent>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Delete Approval" description={`Delete "${a.title}"?`}
        confirmLabel="Delete" onConfirm={handleDelete}
      />
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ApprovalsPage() {
  const { isAdmin, can } = useAuth();
  const [reviewState, setReviewState] = useState<{
    open: boolean;
    id: string | null;
    action: "approved" | "rejected" | "revision";
    approval: Record<string, unknown> | null;
  }>({ open: false, id: null, action: "approved", approval: null });
  const [showNew, setShowNew] = useState(false);

  const { data, loading, error, refetch } = useApprovals();
  const allApprovals = (data?.data ?? []) as Array<Record<string, unknown>>;

  const pending = allApprovals.filter(a => a.status === "pending");
  const reviewed = allApprovals.filter(a => a.status !== "pending");

  const handleAction = (id: string, action: "approved" | "rejected" | "revision") => {
    const approval = allApprovals.find(a => a.id === id);
    setReviewState({ open: true, id, action, approval: approval ?? null });
  };

  const canAct = isAdmin || can("approvals:manage");

  if (loading && !data) return <PageLoader message="Loading approvals..." />;
  if (error) return <div className="p-6"><ApiError error={error} onRetry={refetch} /></div>;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approvals</h1>
          <p className="text-muted-foreground text-sm">
            <span className="text-amber-600 font-semibold">{pending.length} pending</span>
            {" · "}{reviewed.length} reviewed
            {" · "}<span className="text-primary text-xs">auto-refreshes every 6s</span>
          </p>
        </div>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4 mr-2" />Request Approval
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: pending.length, icon: Clock, c: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
          { label: "Approved", value: allApprovals.filter(a => a.status === "approved").length, icon: CheckCircle, c: "text-green-500 bg-green-50 dark:bg-green-900/20" },
          { label: "Rejected", value: allApprovals.filter(a => a.status === "rejected").length, icon: XCircle, c: "text-red-500 bg-red-50 dark:bg-red-900/20" },
          { label: "Revision", value: allApprovals.filter(a => a.status === "revision").length, icon: RefreshCw, c: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.c.split(" ").slice(1).join(" "))}>
                <s.icon className={cn("w-4 h-4", s.c.split(" ")[0])} />
              </div>
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
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
              <button type="button" onClick={() => setShowNew(true)} className="text-xs text-primary hover:underline mt-2 block mx-auto">
                Submit a new approval request
              </button>
            </div>
          ) : pending.map(a => (
            <ApprovalCard key={a.id as string} a={a} canAct={canAct} onAction={handleAction} />
          ))}
        </TabsContent>

        <TabsContent value="reviewed" className="mt-4 space-y-3">
          {reviewed.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No reviewed approvals</p></div>
          ) : reviewed.map(a => (
            <ApprovalCard key={a.id as string} a={a} canAct={canAct} onAction={handleAction} />
          ))}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-3">
          {allApprovals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No approvals yet</p></div>
          ) : allApprovals.map(a => (
            <ApprovalCard key={a.id as string} a={a} canAct={canAct} onAction={handleAction} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Review Dialog (with notes) */}
      <ReviewDialog
        open={reviewState.open}
        onClose={() => setReviewState(s => ({ ...s, open: false }))}
        approval={reviewState.approval}
        action={reviewState.action}
      />

      {/* New Approval Dialog */}
      <NewApprovalDialog open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
