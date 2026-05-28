"use client";

import { useState } from "react";
import { Search, Plus, MoreHorizontal, Flame, Mail, Phone, Upload, Download, Filter, Target, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { leadsApi, getApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatRelativeTime, getStatusColor, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value:"all",label:"All Leads" },
  { value:"new",label:"New" },
  { value:"contacted",label:"Contacted" },
  { value:"proposal_sent",label:"Proposal Sent" },
  { value:"negotiation",label:"Negotiation" },
  { value:"won",label:"Won" },
  { value:"lost",label:"Lost" },
];

const SOURCES = ["website","facebook","google_ads","whatsapp","referral","email","linkedin","other"];

export default function LeadsPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Record<string,unknown>|null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ company:"",contact_name:"",email:"",phone:"",industry:"",source:"referral",budget:"0",notes:"",status:"new" });

  const { data, loading, error, refetch } = useApi(
    () => leadsApi.list(status !== "all" ? { status } : {}).then(r => r.data), [status]
  );

  const leads = (data as {data?: unknown[]})?.data ?? [];
  const filtered = leads.filter((l: unknown) => {
    const lead = l as Record<string,unknown>;
    return !search || String(lead.company).toLowerCase().includes(search.toLowerCase())
      || String(lead.contact_name).toLowerCase().includes(search.toLowerCase());
  }) as Array<Record<string,unknown>>;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company) { setFormError("Company name is required"); return; }
    if (!form.contact_name) { setFormError("Contact name is required"); return; }
    setSaving(true); setFormError("");
    try {
      await leadsApi.create({ ...form, budget: Number(form.budget) });
      toast.success("Lead created successfully!");
      setShowNew(false);
      setForm({ company:"",contact_name:"",email:"",phone:"",industry:"",source:"referral",budget:"0",notes:"",status:"new" });
      refetch();
    } catch (err) {
      setFormError(getApiError(err));
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await leadsApi.update(id, { status: newStatus });
      toast.success(`Lead moved to ${newStatus.replace("_"," ")}`);
      refetch();
    } catch (err) { toast.error(getApiError(err)); }
  };

  const handleDelete = async (id: string) => {
    try {
      await leadsApi.delete(id);
      toast.success("Lead deleted");
      refetch();
    } catch (err) { toast.error(getApiError(err)); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">{leads.length} leads in database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("CSV import coming soon!")}>
            <Upload className="w-4 h-4 mr-2" />Import
          </Button>
          {can("leads:create") && (
            <Button size="sm" onClick={() => { setFormError(""); setShowNew(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Lead
            </Button>
          )}
        </div>
      </div>

      {/* Status pills */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {STATUS_OPTIONS.filter(s=>s.value!=="all").map(s => {
          const count = leads.filter((l: unknown) => (l as Record<string,unknown>).status === s.value).length;
          return (
            <button type="button" key={s.value} onClick={() => setStatus(s.value)}
              className={cn("p-3 rounded-xl border text-left transition-all",
                status === s.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search leads..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={v => v && setStatus(v)}>
          <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <a href="/crm/pipeline" className="inline-flex h-9 items-center px-3 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Kanban View</a>
      </div>

      {error ? <ApiError error={error} onRetry={refetch} /> : (
        <Card>
          {loading ? <TableLoader /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Company","Contact","Industry","Budget (TZS)","Source","Score","Status","Last Activity",""].map(c => (
                      <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(lead => (
                    <tr key={lead.id as string} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedLead(lead)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {getInitials(lead.company as string)}
                          </div>
                          <p className="font-medium">{lead.company as string}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{lead.contact_name as string}</p>
                        <p className="text-xs text-muted-foreground">{lead.email as string}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{lead.industry as string ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency((lead.budget as number) ?? 0)}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-muted px-2 py-1 rounded-full capitalize">{String(lead.source ?? "—").replace("_"," ")}</span></td>
                      <td className="px-4 py-3">
                        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit",
                          (lead.score as number) >= 80 ? "text-green-600 bg-green-50 dark:bg-green-900/20" :
                          (lead.score as number) >= 60 ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" :
                          "text-red-600 bg-red-50 dark:bg-red-900/20")}>
                          <Flame className="w-3 h-3" />{lead.score as number}
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge className={cn("text-[10px] capitalize",getStatusColor(lead.status as string))}>{String(lead.status).replace("_"," ")}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{lead.last_activity_at ? formatRelativeTime(lead.last_activity_at as string) : "—"}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none">
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedLead(lead)}>View Details</DropdownMenuItem>
                            {["contacted","proposal_sent","negotiation","won","lost"].map(s => (
                              <DropdownMenuItem key={s} onClick={() => handleStatusChange(lead.id as string, s)}>
                                Move to {s.replace("_"," ")}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            {can("leads:delete") && (
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(lead.id as string)}>Delete</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No leads found</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Lead detail */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {getInitials(selectedLead.company as string)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedLead.company as string}</DialogTitle>
                    <p className="text-muted-foreground text-sm">{selectedLead.industry as string} · {selectedLead.source as string}</p>
                  </div>
                  <Badge className={cn("ml-auto capitalize",getStatusColor(selectedLead.status as string))}>
                    {String(selectedLead.status).replace("_"," ")}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Contact</p><p className="font-medium">{selectedLead.contact_name as string}</p></div>
                <div><p className="text-xs text-muted-foreground">Budget</p><p className="text-lg font-bold text-green-600">{formatCurrency(selectedLead.budget as number)}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{selectedLead.email as string || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm">{selectedLead.phone as string || "—"}</p></div>
              </div>
              {selectedLead.notes && <div className="bg-muted/50 rounded-lg p-3 text-sm">{selectedLead.notes as string}</div>}
              <div className="flex gap-2">
                {["new","contacted","proposal_sent","negotiation","won","lost"].map(s => (
                  <Button key={s} size="sm" className="text-xs"
                    variant={selectedLead.status === s ? "default" : "outline"}
                    onClick={() => { handleStatusChange(selectedLead.id as string, s); setSelectedLead(null); }}>
                    {s.replace("_"," ")}
                  </Button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add lead */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key:"company",label:"Company Name *",ph:"e.g. CRDB Bank" },
                { key:"contact_name",label:"Contact Person *",ph:"Full name" },
                { key:"email",label:"Email",ph:"contact@company.co.tz" },
                { key:"phone",label:"Phone",ph:"+255 7XX XXX XXX" },
                { key:"industry",label:"Industry",ph:"e.g. Banking" },
                { key:"budget",label:"Budget (TZS)",ph:"0",type:"number" },
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input type={f.type ?? "text"} value={(form as Record<string,string>)[f.key]} placeholder={f.ph}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="h-9" />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs">Source</Label>
                <Select value={form.source} onValueChange={v => v && setForm(p => ({ ...p, source: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => v && setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.filter(s=>s.value!=="all").map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} placeholder="Add context about this lead..." className="resize-none h-20" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Create Lead"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
