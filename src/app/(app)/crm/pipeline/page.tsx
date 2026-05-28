"use client";

import { useState } from "react";
import { Plus, Flame, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useLeads, mutations } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { getApiError } from "@/lib/api-client";

type LeadStatus = "new"|"contacted"|"proposal_sent"|"negotiation"|"won"|"lost";

const STAGES: { id: LeadStatus; label: string; color: string; accent: string }[] = [
  { id:"new", label:"New Lead", color:"border-blue-400", accent:"bg-blue-400" },
  { id:"contacted", label:"Contacted", color:"border-yellow-400", accent:"bg-yellow-400" },
  { id:"proposal_sent", label:"Proposal Sent", color:"border-purple-400", accent:"bg-purple-400" },
  { id:"negotiation", label:"Negotiation", color:"border-orange-400", accent:"bg-orange-400" },
  { id:"won", label:"Won 🎉", color:"border-green-400", accent:"bg-green-400" },
];

const SOURCES = ["website","facebook","google_ads","whatsapp","referral","email","linkedin","other"];
const emptyForm = { company:"",contact_name:"",email:"",phone:"",industry:"",source:"referral",budget:"0",notes:"",status:"new" };

export default function PipelinePage() {
  const { can } = useAuth();
  const [dragId, setDragId] = useState<string|null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatus|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<string>("new");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const { data, loading, error, refetch } = useLeads();
  const leads = (data?.data ?? []) as Array<Record<string, unknown>>;

  const handleMove = async (id: string, status: LeadStatus) => {
    try {
      await mutations.updateLead(id, { status });
      toast.success(`Lead moved to ${STAGES.find(s=>s.id===status)?.label ?? status}`);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const openCreate = (status: string = "new") => {
    setDefaultStatus(status);
    setForm({ ...emptyForm, status });
    setFormError("");
    setShowCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim()) { setFormError("Company name is required"); return; }
    if (!form.contact_name.trim()) { setFormError("Contact name is required"); return; }
    setSaving(true); setFormError("");
    try {
      await mutations.createLead({ ...form, budget: Number(form.budget)||0 });
      toast.success(`Lead "${form.company}" added to pipeline`);
      setShowCreate(false);
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const totalValue = leads.filter(l=>l.status!=="lost").reduce((s,l)=>s+Number(l.budget||0),0);
  const wonValue = leads.filter(l=>l.status==="won").reduce((s,l)=>s+Number(l.budget||0),0);

  if (loading && !data) return <div className="p-6"><TableLoader /></div>;
  if (error) return <div className="p-6"><ApiError error={error} onRetry={refetch} /></div>;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Pipeline: <strong>{formatCurrency(totalValue)}</strong>
            {" · "}Won: <strong className="text-green-600">{formatCurrency(wonValue)}</strong>
            {" · "}<span className="text-primary text-xs">auto-syncing every 8s</span>
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/crm/leads" className="inline-flex h-7 items-center px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">List View</a>
          {can("leads:create") && (
            <Button size="sm" onClick={() => openCreate()}>
              <Plus className="w-4 h-4 mr-2" />Add Lead
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.status === stage.id);
          const stageValue = stageLeads.reduce((s,l)=>s+Number(l.budget||0),0);
          const isOver = dragOverStage === stage.id;

          return (
            <div key={stage.id}
              className={cn(
                "flex-shrink-0 w-72 flex flex-col rounded-xl border-2 transition-all",
                isOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-transparent"
              )}
              onDragOver={e=>{e.preventDefault();setDragOverStage(stage.id);}}
              onDragLeave={()=>setDragOverStage(null)}
              onDrop={()=>{if(dragId){handleMove(dragId,stage.id);setDragId(null);setDragOverStage(null);}}}
            >
              {/* Column Header */}
              <div className={cn("rounded-t-xl border-t-4 bg-muted/50 p-3", stage.color)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", stage.accent)} />
                    <span className="text-sm font-semibold">{stage.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{stageLeads.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{formatCurrency(stageValue)}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 min-h-32 overflow-y-auto">
                {stageLeads.map(lead => (
                  <div
                    key={lead.id as string}
                    draggable
                    onDragStart={() => setDragId(lead.id as string)}
                    onDragEnd={() => { setDragId(null); setDragOverStage(null); }}
                    className={cn("cursor-grab active:cursor-grabbing", dragId===lead.id && "opacity-40")}
                  >
                    <Card className="group hover:shadow-md transition-all border-border">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-sm font-semibold truncate">{lead.company as string}</p>
                            <p className="text-xs text-muted-foreground truncate">{lead.contact_name as string}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none transition-opacity">
                              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {STAGES.filter(s=>s.id!==stage.id).map(s=>(
                                <DropdownMenuItem key={s.id} onClick={()=>handleMove(lead.id as string,s.id)}>
                                  Move to {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-green-600">{formatCurrency(Number(lead.budget||0))}</span>
                          <div className={cn("flex items-center gap-0.5 text-xs font-semibold",
                            Number(lead.score||0)>=80?"text-green-500":Number(lead.score||0)>=60?"text-yellow-500":"text-red-400")}>
                            <Flame className="w-3 h-3"/>{lead.score as number||0}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded capitalize">
                            {String(lead.source||"").replace("_"," ")}
                          </span>
                          {Boolean(lead.industry) && (
                            <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{lead.industry as string}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-lg">
                    <p className="text-xs text-muted-foreground">Drop leads here</p>
                  </div>
                )}
              </div>

              {/* Add to this column */}
              {can("leads:create") && (
                <button
                  type="button"
                  onClick={() => openCreate(stage.id)}
                  className="m-2 p-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-xs text-muted-foreground flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />Add lead
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Lead Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Lead to Pipeline</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key:"company", label:"Company Name *", ph:"e.g. CRDB Bank" },
                { key:"contact_name", label:"Contact Person *", ph:"Full name" },
                { key:"email", label:"Email", ph:"contact@company.co.tz", type:"email" },
                { key:"phone", label:"Phone", ph:"+255 7XX XXX XXX" },
                { key:"industry", label:"Industry", ph:"e.g. Banking" },
                { key:"budget", label:"Budget (TZS)", ph:"0", type:"number" },
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    type={f.type ?? "text"}
                    value={(form as Record<string,string>)[f.key]}
                    placeholder={f.ph}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="h-9"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs">Source</Label>
                <Select value={form.source} onValueChange={v => v && setForm(p => ({ ...p, source: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stage</Label>
                <Select value={form.status} onValueChange={v => v && setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Add context about this lead..."
                className="resize-none h-16"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : "Add to Pipeline"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
