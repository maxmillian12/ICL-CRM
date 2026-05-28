"use client";

import { useState } from "react";
import { Search, Plus, Building2, Mail, Phone, MoreHorizontal, DollarSign, Star, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { clientsApi, getApiError } from "@/lib/api-client";
import { formatCurrency, formatDate, getStatusColor, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string,unknown>|null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ company:"",industry:"",tin:"",vrn:"",brn:"",address:"",city:"",region:"",country:"Tanzania",status:"active" });
  const [formError, setFormError] = useState("");

  const { data, loading, error, refetch } = useApi(() => clientsApi.list().then(r => r.data), []);
  const clients = (data as {data?: unknown[]})?.data ?? [];

  const filtered = clients.filter((c: unknown) => {
    const cl = c as Record<string,unknown>;
    return !search || String(cl.company).toLowerCase().includes(search.toLowerCase()) || String(cl.industry||"").toLowerCase().includes(search.toLowerCase());
  }) as Array<Record<string,unknown>>;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company) { setFormError("Company name is required"); return; }
    setSaving(true); setFormError("");
    try {
      await clientsApi.create(form);
      toast.success("Client created successfully!");
      setShowNew(false); setForm({ company:"",industry:"",tin:"",vrn:"",brn:"",address:"",city:"",region:"",country:"Tanzania",status:"active" });
      refetch();
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const totalRevenue = clients.reduce((s: number,c) => s + Number((c as Record<string,unknown>).total_revenue||0), 0);
  const retainerClients = clients.filter((c: unknown) => (c as Record<string,unknown>).retainer_value).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm">{clients.length} clients · {clients.filter((c:unknown)=>(c as Record<string,unknown>).status==="active").length} active</p>
        </div>
        <Button size="sm" onClick={() => { setFormError(""); setShowNew(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Client
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Clients", value:clients.length, icon:Building2, c:"text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
          { label:"Total Revenue", value:formatCurrency(totalRevenue), icon:DollarSign, c:"text-green-500 bg-green-50 dark:bg-green-900/20" },
          { label:"On Retainer", value:retainerClients, icon:Star, c:"text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
          { label:"Active", value:clients.filter((c:unknown)=>(c as Record<string,unknown>).status==="active").length, icon:FileText, c:"text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.c.split(" ").slice(1).join(" "))}>
                <s.icon className={cn("w-4 h-4", s.c.split(" ")[0])} />
              </div>
              <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search clients..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error ? <ApiError error={error} onRetry={refetch} /> : loading ? <TableLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => (
            <Card key={client.id as string} className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelected(client)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {getInitials(client.company as string)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.company as string}</h3>
                      <p className="text-xs text-muted-foreground">{client.industry as string || "—"}</p>
                    </div>
                  </div>
                  <Badge className={cn("text-[10px]", getStatusColor(client.status as string))}>{client.status as string}</Badge>
                </div>

                {/* Tanzania fields */}
                {(Boolean(client.tin) || Boolean(client.vrn)) && (
                  <div className="mb-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 space-y-0.5">
                    {Boolean(client.tin) && <p className="text-[10px] text-muted-foreground"><span className="font-semibold">TIN:</span> {String(client.tin)}</p>}
                    {Boolean(client.vrn) && <p className="text-[10px] text-muted-foreground"><span className="font-semibold">VRN:</span> {String(client.vrn)}</p>}
                    {Boolean(client.brn) && <p className="text-[10px] text-muted-foreground"><span className="font-semibold">BRN:</span> {String(client.brn)}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">Revenue</p>
                    <p className="text-xs font-bold text-green-600">{formatCurrency(Number(client.total_revenue||0))}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">Retainer</p>
                    <p className="text-xs font-bold">{client.retainer_value ? formatCurrency(Number(client.retainer_value)) : "Project-based"}</p>
                  </div>
                </div>

                {Boolean(client.account_manager_name) && (
                  <p className="text-[10px] text-muted-foreground">AM: {client.account_manager_name as string}</p>
                )}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No clients found</p>
            </div>
          )}
        </div>
      )}

      {/* Client Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    {getInitials(selected.company as string)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selected.company as string}</DialogTitle>
                    <p className="text-muted-foreground text-sm">{selected.industry as string || "—"}</p>
                  </div>
                  <Badge className={cn("ml-auto", getStatusColor(selected.status as string))}>{selected.status as string}</Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Total Revenue", value:formatCurrency(Number(selected.total_revenue||0)), color:"text-green-600" },
                  { label:"Monthly Retainer", value:selected.retainer_value ? formatCurrency(Number(selected.retainer_value)) : "N/A" },
                  { label:"Account Manager", value:String(selected.account_manager_name||"—") },
                ].map(s => (
                  <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className={cn("text-sm font-bold", s.color)}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {(selected.tin || selected.vrn || selected.brn) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-2">🇹🇿 Tanzania Tax Details</p>
                  <div className="grid grid-cols-3 gap-3">
                    {Boolean(selected.tin) && <div><p className="text-[10px] text-muted-foreground">TIN</p><p className="text-sm font-mono font-semibold">{selected.tin as string}</p></div>}
                    {Boolean(selected.vrn) && <div><p className="text-[10px] text-muted-foreground">VRN</p><p className="text-sm font-mono font-semibold">{selected.vrn as string}</p></div>}
                    {Boolean(selected.brn) && <div><p className="text-[10px] text-muted-foreground">BRN</p><p className="text-sm font-mono font-semibold">{selected.brn as string}</p></div>}
                  </div>
                  {Boolean(selected.address) && <p className="text-xs text-muted-foreground mt-2">📍 {[selected.address, selected.city, selected.region, selected.country].filter(Boolean).join(", ")}</p>}
                </div>
              )}

              {(Array.isArray(selected.contacts) && (selected.contacts as unknown[]).length > 0) && (
                <div>
                  <p className="font-semibold mb-2">Contacts</p>
                  <div className="space-y-2">
                    {(selected.contacts as Array<Record<string,unknown>>).map((c,i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <Avatar className="w-7 h-7"><AvatarFallback className="text-xs bg-muted">{getInitials(c.name as string)}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{c.name as string}</p>
                            {Boolean(c.is_primary) && <Badge variant="secondary" className="text-[10px] px-1.5">Primary</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{c.role as string}</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={`mailto:${c.email}`} className="text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" /></a>
                          <a href={`tel:${c.phone}`} className="text-muted-foreground hover:text-primary"><Phone className="w-4 h-4" /></a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { setSelected(null); toast.info("Create project from client coming soon!"); }}>Create Project</Button>
                <Button variant="outline" className="flex-1" onClick={() => { setSelected(null); toast.info("Invoice creation coming soon!"); }}>Create Invoice</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label className="text-xs">Company Name *</Label><Input value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} placeholder="e.g. CRDB Bank Plc" /></div>
              <div className="space-y-1"><Label className="text-xs">Industry</Label><Input value={form.industry} onChange={e=>setForm(p=>({...p,industry:e.target.value}))} placeholder="e.g. Banking" /></div>
              <div className="space-y-1"><Label className="text-xs">Country</Label><Input value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))} /></div>
              <div className="space-y-1"><Label className="text-xs">TIN</Label><Input value={form.tin} onChange={e=>setForm(p=>({...p,tin:e.target.value}))} placeholder="100-XXX-XXX" /></div>
              <div className="space-y-1"><Label className="text-xs">VRN</Label><Input value={form.vrn} onChange={e=>setForm(p=>({...p,vrn:e.target.value}))} placeholder="40-XXXXXX-X" /></div>
              <div className="space-y-1"><Label className="text-xs">BRN</Label><Input value={form.brn} onChange={e=>setForm(p=>({...p,brn:e.target.value}))} placeholder="YYYY/XXXXXX" /></div>
              <div className="space-y-1"><Label className="text-xs">City</Label><Input value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="Dar es Salaam" /></div>
              <div className="col-span-2 space-y-1"><Label className="text-xs">Address</Label><Input value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} placeholder="Plot X, Street Name" /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Create Client"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
