"use client";

import { useState } from "react";
import { Plus, Search, Download, Send, MoreHorizontal, CheckCircle, FileText, Printer, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invoices as initialInvoices, appSettings } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor, cn } from "@/lib/utils";
import type { Invoice, InvoiceType } from "@/lib/types";
import { toast } from "sonner";

const TYPE_LABELS: Record<InvoiceType, string> = { invoice:"Invoice", proforma:"Proforma Invoice", quotation:"Quotation" };
const TYPE_COLORS: Record<InvoiceType, string> = {
  invoice:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  proforma:"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  quotation:"bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

function InvoicePrintView({ inv }: { inv: Invoice }) {
  const s = appSettings;
  const wht = inv.withholdingTax ?? 0;
  return (
    <div className="bg-white text-gray-900 p-8 rounded-xl border border-border text-sm">
      {/* Company header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">{s.companyName}</h1>
          <p className="text-xs text-gray-500 mt-1">{s.companyAddress}</p>
          <p className="text-xs text-gray-500">{s.companyPhone} | {s.companyEmail}</p>
          <div className="mt-2 space-y-0.5 text-xs">
            <p><span className="font-semibold">TIN:</span> {s.companyTIN}</p>
            <p><span className="font-semibold">VRN:</span> {s.companyVRN}</p>
            <p><span className="font-semibold">BRN:</span> {s.companyBRN}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={cn("inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2", TYPE_COLORS[inv.type])}>
            {TYPE_LABELS[inv.type]}
          </div>
          <p className="text-2xl font-bold">{inv.number}</p>
          <p className="text-xs text-gray-500 mt-1">Issued: {formatDate(inv.issueDate)}</p>
          <p className="text-xs text-gray-500">Due: {formatDate(inv.dueDate)}</p>
          <Badge className={cn("mt-2 text-xs", getStatusColor(inv.status))}>{inv.status.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Bill To */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bill To</p>
        <p className="font-semibold">{inv.clientName}</p>
        {inv.clientTIN && <p className="text-xs text-gray-500 mt-0.5">TIN: {inv.clientTIN}</p>}
        {inv.clientVRN && <p className="text-xs text-gray-500">VRN: {inv.clientVRN}</p>}
      </div>

      {/* Line Items */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-3 py-2 font-semibold text-gray-600 rounded-tl-lg">Description</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Qty</th>
            <th className="text-right px-3 py-2 font-semibold text-gray-600">Rate (TZS)</th>
            <th className="text-right px-3 py-2 font-semibold text-gray-600 rounded-tr-lg">Amount (TZS)</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((item, i) => (
            <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
              <td className="px-3 py-2">{item.description}</td>
              <td className="px-3 py-2 text-center text-gray-600">{item.quantity}</td>
              <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(item.rate)}</td>
              <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tax Summary Box */}
      <div className="flex justify-end mb-6">
        <div className="w-80 bg-gray-50 rounded-xl p-4 space-y-2.5 border border-gray-200">
          <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Tax Summary</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal (Excl. VAT)</span>
            <span className="font-medium">{formatCurrency(inv.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
            <span className="text-orange-600 font-medium">VAT @ {inv.vatRate}%</span>
            <span className="font-bold text-orange-600">{formatCurrency(inv.vatAmount)}</span>
          </div>
          {wht > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-red-500">Less: WHT (5%)</span>
              <span className="text-red-500">({formatCurrency(wht)})</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>{wht > 0 ? "Net Payable" : "Total (TZS)"}</span>
            <span className="text-blue-700 text-lg">{formatCurrency(wht > 0 ? inv.total - wht : inv.total)}</span>
          </div>
        </div>
      </div>

      {inv.terms && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Terms & Conditions</p>
          <p className="text-xs text-gray-600">{inv.terms}</p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 text-center text-[10px] text-gray-400">
        <p>TRA-compliant {TYPE_LABELS[inv.type]} | TIN: {s.companyTIN} | VRN: {s.companyVRN} | All amounts in TZS</p>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Invoice | null>(null);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = !search || inv.number.toLowerCase().includes(q) || inv.clientName.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || inv.type === typeFilter;
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === "sent").reduce((s, i) => s + i.total, 0);
  const totalVAT = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.vatAmount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.total, 0);

  const markPaid = (id: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0] } : i));
    toast.success("Marked as paid"); setSelected(null);
  };
  const markSent = (id: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: "sent" as const } : i));
    toast.success("Invoice sent"); setSelected(null);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices & Quotations</h1>
          <p className="text-muted-foreground text-sm">
            Tanzania VAT @{appSettings.vatRate}% | TIN: {appSettings.companyTIN} | VRN: {appSettings.companyVRN}
          </p>
        </div>
        <Button size="sm" onClick={() => toast.info("New document form coming soon!")}>
          <Plus className="w-4 h-4 mr-1.5" />Create
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Revenue Collected", value:formatCurrency(totalRevenue), sub:`VAT: ${formatCurrency(totalVAT)}`, c:"text-green-500 bg-green-50 dark:bg-green-900/20" },
          { label:"Awaiting Payment", value:formatCurrency(totalPending), sub:`${invoices.filter(i=>i.status==="sent").length} sent`, c:"text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
          { label:"Overdue", value:formatCurrency(totalOverdue), sub:`${invoices.filter(i=>i.status==="overdue").length} overdue`, c:"text-red-500 bg-red-50 dark:bg-red-900/20" },
          { label:"VAT Collected (TRA)", value:formatCurrency(totalVAT), sub:`@ ${appSettings.vatRate}% rate`, c:"text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", s.c.split(" ").slice(1).join(" "))}>
                <FileText className={cn("w-4 h-4", s.c.split(" ")[0])} />
              </div>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search number or client..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {["all","invoice","proforma","quotation"].map(t => (
            <button type="button" key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",
                typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              )}>
              {t === "all" ? "All Types" : TYPE_LABELS[t as InvoiceType]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["all","draft","sent","paid","overdue"].map(s => (
            <button type="button" key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",
                statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              )}>
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Number","Type","Client","Subtotal","VAT (18%)","Total (TZS)","Due","Status",""].map(c => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelected(inv)}>
                  <td className="px-4 py-3"><span className="font-mono text-xs font-semibold text-primary">{inv.number}</span></td>
                  <td className="px-4 py-3"><Badge className={cn("text-[10px]", TYPE_COLORS[inv.type])}>{TYPE_LABELS[inv.type]}</Badge></td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.clientName}</p>
                    {inv.clientTIN && <p className="text-[10px] text-muted-foreground">TIN: {inv.clientTIN}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatCurrency(inv.subtotal)}</td>
                  <td className="px-4 py-3 text-orange-600 text-xs font-medium">{formatCurrency(inv.vatAmount)}</td>
                  <td className="px-4 py-3 font-bold">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3"><Badge className={cn("text-[10px] capitalize", getStatusColor(inv.status))}>{inv.status}</Badge></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelected(inv)}><FileText className="w-3.5 h-3.5 mr-2" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("PDF coming soon!")}><Download className="w-3.5 h-3.5 mr-2" />Download PDF</DropdownMenuItem>
                        {inv.status === "draft" && <DropdownMenuItem onClick={() => markSent(inv.id)}><Send className="w-3.5 h-3.5 mr-2" />Send</DropdownMenuItem>}
                        {(inv.status === "sent" || inv.status === "overdue") && (
                          <DropdownMenuItem onClick={() => markPaid(inv.id)} className="text-green-600"><CheckCircle className="w-3.5 h-3.5 mr-2" />Mark Paid</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { setInvoices(p => p.map(i => i.id === inv.id ? { ...i, status: "cancelled" as const } : i)); toast.success("Cancelled"); }}>Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No documents</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{TYPE_LABELS[selected.type]} — {selected.number}</DialogTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.info("Print coming soon!")}><Printer className="w-4 h-4 mr-1.5" />Print</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info("PDF coming soon!")}><Download className="w-4 h-4 mr-1.5" />PDF</Button>
                    {selected.status === "draft" && <Button size="sm" onClick={() => markSent(selected.id)}><Send className="w-4 h-4 mr-1.5" />Send</Button>}
                    {(selected.status === "sent" || selected.status === "overdue") && (
                      <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => markPaid(selected.id)}><CheckCircle className="w-4 h-4 mr-1.5" />Mark Paid</Button>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <InvoicePrintView inv={selected} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
