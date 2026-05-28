"use client";

import { useState } from "react";
import { Search, Plus, MoreHorizontal, Flame, Target, AlertCircle, Loader2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLeads, mutations } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatRelativeTime, getStatusColor, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { getApiError } from "@/lib/api-client";

const STATUS_OPTIONS = ["all","new","contacted","proposal_sent","negotiation","won","lost"];
const SOURCES = ["website","facebook","google_ads","whatsapp","referral","email","linkedin","other"];

const emptyForm = { company:"",contact_name:"",email:"",phone:"",industry:"",source:"referral",budget:"0",notes:"",status:"new",score:"50" };

export default function LeadsPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Record<string,unknown>|null>(null);
  const [deleteLead, setDeleteLead] = useState<Record<string,unknown>|null>(null);
  const [selectedLead, setSelectedLead] = useState<Record<string,unknown>|null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const { data, loading, error, refetch } = useLeads(status !== "all" ? { status } : {});
  const leads = (data?.data ?? []) as Array<Record<string,unknown>>;
  const filtered = leads.filter(l => !search || String(l.company).toLowerCase().includes(search.toLowerCase()) || String(l.contact_name||"").toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm(emptyForm); setEditingLead(null); setFormError(""); setShowForm(true); };
  const openEdit = (lead: Record<string,unknown>) => {
    setForm({
      company: String(lead.company||""), contact_name: String(lead.contact_name||""),
      email: String(lead.email||""), phone: String(lead.phone||""),
      industry: String(lead.industry||""), source: String(lead.source||"other"),
      budget: String(lead.budget||0), notes: String(lead.notes||""),
      status: String(lead.status||"new"), score: String(lead.score||50),
    });
    setEditingLead(lead); setFormError(""); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim()) { setFormError("Company name is required"); return; }
    if (!form.contact_name.trim()) { setFormError("Contact name is required"); return; }
    if (form.budget && isNaN(Number(form.budget))) { setFormError("Budget must be a number"); return; }
    setSaving(true); setFormError("");
    try {
      const payload = { ...form, budget: Number(form.budget)||0, score: Number(form.score)||50 };
      if (editingLead) {
        await mutations.updateLead(editingLead.id as string, payload);
        toast.success(`Lead "${form.company}" updated`);
      } else {
        await mutations.createLead(payload);
        toast.success(`Lead "${form.company}" created`);
      }
      setShowForm(false);
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteLead) return;
    await mutations.deleteLead(deleteLead.id as string);
    toast.success(`Lead "${deleteLead.company}" deleted`);
    setDeleteLead(null);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await mutations.updateLead(id, { status: newStatus });
      toast.success(`Moved to ${newStatus.replace("_"," ")}`);
    } catch (err) { toast.error(getApiError(err)); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">{leads.length} total · auto-syncing</p>
        </div>
        {can("leads:create") && (
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2"/>Add Lead</Button>
        )}
      </div>

      {/* Status pills */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {STATUS_OPTIONS.map(s => {
          const count = s === "all" ? leads.length : leads.filter(l=>l.status===s).length;
          return (
            <button type="button" key={s} onClick={() => setStatus(s)}
              className={cn("p-2 rounded-xl border text-left transition-all",status===s?"border-primary bg-primary/5":"border-border hover:border-primary/50")}>
              <p className="text-lg font-bold">{count}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{s.replace("_"," ")}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input placeholder="Search leads..." className="pl-9 h-9" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <Select value={status} onValueChange={v=>v&&setStatus(v)}>
          <SelectTrigger className="h-9 w-44"><SelectValue/></SelectTrigger>
          <SelectContent>{STATUS_OPTIONS.map(s=><SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>)}</SelectContent>
        </Select>
        <a href="/crm/pipeline" className="inline-flex h-9 items-center px-3 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Kanban View</a>
      </div>

      {error ? <ApiError error={error} onRetry={refetch}/> : loading ? <TableLoader/> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Company","Contact","Budget (TZS)","Score","Status","Last Activity",""].map(c=>(
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{c}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lead => (
                  <tr key={lead.id as string} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedLead(lead)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{getInitials(lead.company as string)}</div>
                        <div><p className="font-medium">{lead.company as string}</p><p className="text-xs text-muted-foreground">{lead.industry as string||"—"}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><p className="font-medium">{lead.contact_name as string}</p><p className="text-xs text-muted-foreground">{lead.email as string||"—"}</p></td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(Number(lead.budget||0))}</td>
                    <td className="px-4 py-3">
                      <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit",
                        Number(lead.score||0)>=80?"text-green-600 bg-green-50 dark:bg-green-900/20":Number(lead.score||0)>=60?"text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20":"text-red-600 bg-red-50 dark:bg-red-900/20")}>
                        <Flame className="w-3 h-3"/>{lead.score as number||0}
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge className={cn("text-[10px] capitalize",getStatusColor(lead.status as string))}>{String(lead.status).replace("_"," ")}</Badge></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{lead.last_activity_at ? formatRelativeTime(lead.last_activity_at as string) : "—"}</td>
                    <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground focus-visible:outline-none">
                          <MoreHorizontal className="w-4 h-4"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(lead)}><Edit className="w-3.5 h-3.5 mr-2"/>Edit</DropdownMenuItem>
                          {["contacted","proposal_sent","negotiation","won"].map(s=>(
                            <DropdownMenuItem key={s} onClick={() => handleStatusChange(lead.id as string, s)} className="capitalize">Move to {s.replace("_"," ")}</DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator/>
                          {can("leads:delete") && (
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteLead(lead)}><Trash2 className="w-3.5 h-3.5 mr-2"/>Delete</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-40"/><p>No leads found</p>
                    {can("leads:create") && <button type="button" onClick={openCreate} className="text-xs text-primary hover:underline mt-1 block mx-auto">Add your first lead</button>}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLead ? `Edit — ${editingLead.company}` : "Add New Lead"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 flex-shrink-0"/>{formError}</div>}
            <div className="grid grid-cols-2 gap-3">
              {[{key:"company",label:"Company Name *",ph:"e.g. CRDB Bank"},{key:"contact_name",label:"Contact Person *",ph:"Full name"},
                {key:"email",label:"Email",ph:"contact@company.co.tz",type:"email"},{key:"phone",label:"Phone",ph:"+255 7XX XXX XXX"},
                {key:"industry",label:"Industry",ph:"e.g. Banking"},{key:"budget",label:"Budget (TZS)",ph:"0",type:"number"}].map(f=>(
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input type={f.type||"text"} value={(form as Record<string,string>)[f.key]} placeholder={f.ph}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="h-9"/>
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs">Source</Label>
                <Select value={form.source} onValueChange={v=>v&&setForm(p=>({...p,source:v}))}>
                  <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                  <SelectContent>{SOURCES.map(s=><SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v=>v&&setForm(p=>({...p,status:v}))}>
                  <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.filter(s=>s!=="all").map(s=><SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Add context..." className="resize-none h-20"/>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Saving...</>:(editingLead?"Save Changes":"Create Lead")}</Button>
              <Button type="button" variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteLead} onOpenChange={open=>!open&&setDeleteLead(null)}
        title="Delete Lead" description={`Are you sure you want to delete "${deleteLead?.company}"? This cannot be undone.`}
        confirmLabel="Delete Lead" onConfirm={handleDelete}
      />

      {/* Lead Detail */}
      <Dialog open={!!selectedLead} onOpenChange={()=>setSelectedLead(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedLead && (<>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">{getInitials(selectedLead.company as string)}</div>
                <div><DialogTitle className="text-xl">{selectedLead.company as string}</DialogTitle><p className="text-muted-foreground text-sm">{selectedLead.industry as string}</p></div>
                <Badge className={cn("ml-auto capitalize",getStatusColor(selectedLead.status as string))}>{String(selectedLead.status).replace("_"," ")}</Badge>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Contact</p><p className="font-medium">{selectedLead.contact_name as string}</p></div>
              <div><p className="text-xs text-muted-foreground">Budget</p><p className="text-lg font-bold text-green-600">{formatCurrency(Number(selectedLead.budget||0))}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{selectedLead.email as string||"—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm">{selectedLead.phone as string||"—"}</p></div>
            </div>
            {Boolean(selectedLead.notes) && <div className="bg-muted/50 rounded-lg p-3 text-sm">{selectedLead.notes as string}</div>}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={()=>{setSelectedLead(null);openEdit(selectedLead);}}><Edit className="w-4 h-4 mr-2"/>Edit Lead</Button>
              {can("leads:delete") && (
                <Button variant="outline" className="text-destructive border-destructive/30" onClick={()=>{setSelectedLead(null);setDeleteLead(selectedLead);}}><Trash2 className="w-4 h-4 mr-2"/>Delete</Button>
              )}
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
