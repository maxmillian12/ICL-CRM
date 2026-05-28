"use client";

import { useState } from "react";
import { Plus, Search, Download, Send, FileText, Printer, CheckCircle, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useInvoices, useClients, useFinanceSummary, mutations } from "@/lib/hooks";
import { printInvoice } from "@/lib/pdf-utils";
import { useSettings } from "@/lib/hooks";
import { formatCurrency, formatDate, getStatusColor, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { getApiError } from "@/lib/api-client";

type InvoiceType = "invoice"|"proforma"|"quotation";
const TYPE_LABELS: Record<InvoiceType,string> = { invoice:"Invoice", proforma:"Proforma Invoice", quotation:"Quotation" };
const TYPE_COLORS: Record<InvoiceType,string> = {
  invoice:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  proforma:"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  quotation:"bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

interface InvoiceItem { description: string; quantity: number; rate: number; }
const emptyItem = (): InvoiceItem => ({ description: "", quantity: 1, rate: 0 });

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Record<string,unknown>|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteInv, setDeleteInv] = useState<Record<string,unknown>|null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formType, setFormType] = useState<InvoiceType>("invoice");
  const [formClientId, setFormClientId] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formTerms, setFormTerms] = useState("Payment due within 30 days. All amounts in TZS.");
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  const { data, loading, error, refetch } = useInvoices(
    typeFilter !== "all" && statusFilter !== "all" ? { type: typeFilter, status: statusFilter } :
    typeFilter !== "all" ? { type: typeFilter } :
    statusFilter !== "all" ? { status: statusFilter } : {}
  );
  const { data: clientsData } = useClients();
  const { data: settings } = useSettings();
  const { data: financeData } = useFinanceSummary();
  
  const invoices = (data?.data ?? []) as Array<Record<string,unknown>>;
  const clients = (clientsData?.data ?? []) as Array<Record<string,unknown>>;
  const fin = (financeData ?? {}) as Record<string,number>;
  const vatRate = Number((settings as Record<string,unknown>|null)?.vat_rate ?? 18);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return !search || String(inv.number||"").toLowerCase().includes(q) || String(inv.client_name||"").toLowerCase().includes(q);
  });

  const subtotal = items.reduce((s, it) => s + it.quantity * it.rate, 0);
  const vatAmount = Math.round(subtotal * vatRate / 100);
  const total = subtotal + vatAmount;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId) { setFormError("Please select a client"); return; }
    if (!formDueDate) { setFormError("Due date is required"); return; }
    if (items.some(it => !it.description || it.rate <= 0)) { setFormError("All line items must have a description and rate"); return; }
    setSaving(true); setFormError("");
    try {
      await mutations.createInvoice({
        type: formType, client_id: formClientId,
        items, issue_date: new Date().toISOString().split("T")[0],
        due_date: formDueDate, notes: formNotes, terms: formTerms,
      });
      toast.success(`${TYPE_LABELS[formType]} created successfully`);
      setShowCreate(false);
      setItems([emptyItem()]); setFormClientId(""); setFormDueDate(""); setFormNotes("");
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleMarkSent = async (id: string) => {
    try { await mutations.updateInvoiceStatus(id, "sent"); toast.success("Invoice sent"); setSelected(null); }
    catch (err) { toast.error(getApiError(err)); }
  };
  const handleMarkPaid = async (id: string) => {
    try { await mutations.updateInvoiceStatus(id, "paid", "Bank Transfer"); toast.success("Invoice marked as paid"); setSelected(null); }
    catch (err) { toast.error(getApiError(err)); }
  };
  const handleDelete = async () => {
    if (!deleteInv) return;
    await mutations.deleteInvoice(deleteInv.id as string);
    toast.success("Invoice deleted");
    setDeleteInv(null); setSelected(null);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices & Quotations</h1>
          <p className="text-muted-foreground text-sm">TZS · VAT {vatRate}% · TRA compliant · auto-syncing</p>
        </div>
        <Button size="sm" onClick={() => { setFormError(""); setShowCreate(true); }}><Plus className="w-4 h-4 mr-2"/>Create</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Revenue Collected", value:formatCurrency(fin.totalRevenue||0), sub:`VAT: ${formatCurrency(fin.vatCollected||0)}`, c:"text-green-500 bg-green-50 dark:bg-green-900/20" },
          { label:"Awaiting Payment", value:formatCurrency(fin.pendingRevenue||0), sub:`${invoices.filter(i=>i.status==="sent").length} sent`, c:"text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
          { label:"Overdue", value:formatCurrency(fin.overdueRevenue||0), sub:`${invoices.filter(i=>i.status==="overdue").length} overdue`, c:"text-red-500 bg-red-50 dark:bg-red-900/20" },
          { label:"VAT Collected (TRA)", value:formatCurrency(fin.vatCollected||0), sub:`@ ${vatRate}%`, c:"text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2",s.c.split(" ").slice(1).join(" "))}><FileText className={cn("w-4 h-4",s.c.split(" ")[0])}/></div>
              <p className="text-lg font-bold leading-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input placeholder="Search number or client..." className="pl-9 h-9" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1.5">
          {["all","invoice","proforma","quotation"].map(t=>(
            <button type="button" key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",typeFilter===t?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:border-primary/50")}>
              {t==="all"?"All":TYPE_LABELS[t as InvoiceType]||t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["all","draft","sent","paid","overdue"].map(s=>(
            <button type="button" key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",statusFilter===s?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:border-primary/50")}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {error ? <ApiError error={error} onRetry={refetch}/> : loading ? <TableLoader/> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Number","Type","Client","Subtotal","VAT (18%)","Total (TZS)","Due","Status",""].map(c=>(
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{c}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(inv => (
                  <tr key={inv.id as string} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelected(inv)}>
                    <td className="px-4 py-3"><span className="font-mono text-xs font-semibold text-primary">{inv.number as string}</span></td>
                    <td className="px-4 py-3"><Badge className={cn("text-[10px]",TYPE_COLORS[(inv.type as InvoiceType)||"invoice"])}>{TYPE_LABELS[(inv.type as InvoiceType)||"invoice"]}</Badge></td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{inv.client_name as string}</p>
                      {Boolean(inv.client_tin) && <p className="text-[10px] text-muted-foreground">TIN: {inv.client_tin as string}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatCurrency(Number(inv.subtotal||0))}</td>
                    <td className="px-4 py-3 text-orange-600 text-xs font-medium">{formatCurrency(Number(inv.vat_amount||0))}</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(Number(inv.total||0))}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inv.due_date ? formatDate(inv.due_date as string) : "—"}</td>
                    <td className="px-4 py-3"><Badge className={cn("text-[10px] capitalize",getStatusColor(inv.status as string))}>{inv.status as string}</Badge></td>
                    <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground focus-visible:outline-none">
                          <MoreHorizontal className="w-4 h-4"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelected(inv)}><FileText className="w-3.5 h-3.5 mr-2"/>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => printInvoice(inv, settings ?? {})}>
                            <Printer className="w-3.5 h-3.5 mr-2"/>Print / Export PDF
                          </DropdownMenuItem>
                          {inv.status === "draft" && <DropdownMenuItem onClick={() => handleMarkSent(inv.id as string)}><Send className="w-3.5 h-3.5 mr-2"/>Send</DropdownMenuItem>}
                          {(inv.status === "sent" || inv.status === "overdue") && (
                            <DropdownMenuItem onClick={() => handleMarkPaid(inv.id as string)} className="text-green-600"><CheckCircle className="w-3.5 h-3.5 mr-2"/>Mark Paid</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator/>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteInv(inv)}><Trash2 className="w-3.5 h-3.5 mr-2"/>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30"/><p>No documents found</p>
                    <button type="button" onClick={() => setShowCreate(true)} className="text-xs text-primary hover:underline mt-1 block mx-auto">Create your first invoice</button>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create {TYPE_LABELS[formType]}</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 flex-shrink-0"/>{formError}</div>}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Document Type *</Label>
                <Select value={formType} onValueChange={v=>v&&setFormType(v as InvoiceType)}>
                  <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="invoice">Invoice</SelectItem><SelectItem value="proforma">Proforma</SelectItem><SelectItem value="quotation">Quotation</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Client *</Label>
                <Select value={formClientId} onValueChange={v=>v&&setFormClientId(v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select client"/></SelectTrigger>
                  <SelectContent>{clients.map(c=><SelectItem key={c.id as string} value={c.id as string}>{c.company as string}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Due Date *</Label>
                <Input type="date" value={formDueDate} onChange={e=>setFormDueDate(e.target.value)} className="h-9"/>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold">Line Items</Label>
                <button type="button" onClick={() => setItems(p=>[...p,emptyItem()])} className="text-xs text-primary hover:underline">+ Add Item</button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="h-8 text-xs col-span-6" placeholder="Description" value={item.description} onChange={e=>setItems(p=>p.map((it,idx)=>idx===i?{...it,description:e.target.value}:it))}/>
                    <Input className="h-8 text-xs col-span-2" type="number" placeholder="Qty" value={item.quantity} onChange={e=>setItems(p=>p.map((it,idx)=>idx===i?{...it,quantity:Number(e.target.value)||1}:it))}/>
                    <Input className="h-8 text-xs col-span-3" type="number" placeholder="Rate (TZS)" value={item.rate||""} onChange={e=>setItems(p=>p.map((it,idx)=>idx===i?{...it,rate:Number(e.target.value)||0}:it))}/>
                    <button type="button" onClick={() => setItems(p=>p.filter((_,idx)=>idx!==i))} disabled={items.length===1} className="col-span-1 text-destructive hover:text-destructive/80 disabled:opacity-30 text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Summary */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Tax Summary</p>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal (Excl. VAT)</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm border-t border-border pt-2"><span className="text-orange-600 font-medium">VAT @ {vatRate}%</span><span className="font-bold text-orange-600">{formatCurrency(vatAmount)}</span></div>
              <Separator/>
              <div className="flex justify-between font-bold text-base"><span>Total (TZS)</span><span className="text-primary">{formatCurrency(total)}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Notes</Label><Input value={formNotes} onChange={e=>setFormNotes(e.target.value)} placeholder="Additional notes" className="h-9"/></div>
              <div className="space-y-1"><Label className="text-xs">Terms</Label><Input value={formTerms} onChange={e=>setFormTerms(e.target.value)} className="h-9"/></div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Creating...</>:`Create ${TYPE_LABELS[formType]}`}</Button>
              <Button type="button" variant="outline" onClick={()=>setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice View Dialog */}
      <Dialog open={!!selected} onOpenChange={()=>setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (<>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{TYPE_LABELS[(selected.type as InvoiceType)||"invoice"]} — {selected.number as string}</DialogTitle>
                <div className="flex gap-2">
                  {/* Print / PDF export */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printInvoice(selected, settings ?? {})}
                    title="Print or Save as PDF"
                  >
                    <Printer className="w-4 h-4 mr-1.5" />Print / PDF
                  </Button>
                  {selected.status==="draft" && <Button size="sm" onClick={()=>handleMarkSent(selected.id as string)}><Send className="w-4 h-4 mr-1.5"/>Send</Button>}
                  {(selected.status==="sent"||selected.status==="overdue") && (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={()=>handleMarkPaid(selected.id as string)}><CheckCircle className="w-4 h-4 mr-1.5"/>Mark Paid</Button>
                  )}
                  <Button size="sm" variant="outline" className="text-destructive" onClick={()=>{setSelected(null);setDeleteInv(selected);}}><Trash2 className="w-4 h-4"/></Button>
                </div>
              </div>
            </DialogHeader>
            <div className="bg-white dark:bg-card rounded-xl border border-border p-6 text-sm">
              <div className="flex justify-between mb-6">
                <div>
                  <p className="font-bold text-lg text-primary">Integrated Communication Limited</p>
                  <p className="text-xs text-muted-foreground mt-1">TIN: {(settings as Record<string,unknown>|null)?.company_tin as string}</p>
                  <p className="text-xs text-muted-foreground">VRN: {(settings as Record<string,unknown>|null)?.company_vrn as string}</p>
                </div>
                <div className="text-right">
                  <Badge className={cn("mb-1",TYPE_COLORS[(selected.type as InvoiceType)||"invoice"])}>{TYPE_LABELS[(selected.type as InvoiceType)||"invoice"]}</Badge>
                  <p className="text-xl font-bold">{selected.number as string}</p>
                  <p className="text-xs text-muted-foreground">Due: {selected.due_date ? formatDate(selected.due_date as string) : "—"}</p>
                  <Badge className={cn("mt-1",getStatusColor(selected.status as string))}>{selected.status as string}</Badge>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Bill To</p>
                <p className="font-semibold">{selected.client_name as string}</p>
                {Boolean(selected.client_tin) && <p className="text-xs text-muted-foreground">TIN: {selected.client_tin as string}</p>}
              </div>
              <table className="w-full text-xs mb-4">
                <thead><tr className="bg-muted/50"><th className="text-left p-2 font-semibold">Description</th><th className="text-center p-2 font-semibold">Qty</th><th className="text-right p-2 font-semibold">Rate</th><th className="text-right p-2 font-semibold">Amount</th></tr></thead>
                <tbody>
                  {((selected.items as Array<Record<string,unknown>>)||[]).map((item,i) => (
                    <tr key={i} className={i%2===0?"bg-white dark:bg-card":"bg-muted/20"}>
                      <td className="p-2">{item.description as string}</td>
                      <td className="p-2 text-center">{item.quantity as number}</td>
                      <td className="p-2 text-right">{formatCurrency(Number(item.rate||0))}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(Number(item.amount||0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(Number(selected.subtotal||0))}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-orange-600">VAT @ {selected.vat_rate as number}%</span><span className="font-bold text-orange-600">{formatCurrency(Number(selected.vat_amount||0))}</span></div>
                  <Separator/>
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatCurrency(Number(selected.total||0))}</span></div>
                </div>
              </div>
              {Boolean(selected.terms) && <div className="mt-4 bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">{selected.terms as string}</div>}
              <p className="mt-4 text-center text-[10px] text-muted-foreground">TRA-compliant · TIN: {(settings as Record<string,unknown>|null)?.company_tin as string} · All amounts in TZS</p>
            </div>
          </>)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog open={!!deleteInv} onOpenChange={open=>!open&&setDeleteInv(null)} title="Delete Invoice" description={`Delete "${deleteInv?.number}"? This cannot be undone.`} confirmLabel="Delete" onConfirm={handleDelete}/>
    </div>
  );
}
