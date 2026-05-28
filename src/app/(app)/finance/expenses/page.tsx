"use client";

import { useState } from "react";
import { Plus, Search, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { financeApi, getApiError } from "@/lib/api-client";
import { formatCurrency, formatDate, getStatusColor, cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = ["Software","Production","Admin","Entertainment","Advertising","Travel","Office","Other"];

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ description:"",category:"Software",amount:"",date:new Date().toISOString().split("T")[0],notes:"" });

  const { data, loading, error, refetch } = useApi(() => financeApi.listExpenses().then(r => r.data), []);
  const expenses = (data as {data?: unknown[]})?.data ?? [] as Array<Record<string,unknown>>;

  const filtered = expenses.filter((e: unknown) => {
    const exp = e as Record<string,unknown>;
    const matchSearch = !search || String(exp.description||"").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || String(exp.status) === statusFilter;
    return matchSearch && matchStatus;
  }) as Array<Record<string,unknown>>;

  const totalApproved = expenses.filter((e: unknown)=>(e as Record<string,unknown>).status==="approved").reduce((s: number,e)=>s+Number((e as Record<string,unknown>).amount||0),0);
  const totalPending = expenses.filter((e: unknown)=>(e as Record<string,unknown>).status==="pending").reduce((s: number,e)=>s+Number((e as Record<string,unknown>).amount||0),0);

  const handleCreate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.description || !form.amount) { setFormError("Description and amount are required"); return; }
    setSaving(true); setFormError("");
    try {
      await financeApi.createExpense({ ...form, amount: Number(form.amount) });
      toast.success("Expense submitted!");
      setShowNew(false); setForm({ description:"",category:"Software",amount:"",date:new Date().toISOString().split("T")[0],notes:"" }); refetch();
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    try { await financeApi.approveExpense(id); toast.success("Expense approved"); refetch(); }
    catch (err) { toast.error(getApiError(err)); }
  };
  const handleReject = async (id: string) => {
    try { await financeApi.rejectExpense(id); toast.success("Expense rejected"); refetch(); }
    catch (err) { toast.error(getApiError(err)); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground text-sm">Approved: <strong className="text-green-600">{formatCurrency(totalApproved)}</strong> · Pending: <strong className="text-yellow-600">{formatCurrency(totalPending)}</strong></p>
        </div>
        <Button size="sm" onClick={() => { setFormError(""); setShowNew(true); }}>
          <Plus className="w-4 h-4 mr-2" />Submit Expense
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {label:"Approved",value:formatCurrency(totalApproved),icon:CheckCircle,c:"text-green-500 bg-green-50 dark:bg-green-900/20"},
          {label:"Pending",value:formatCurrency(totalPending),icon:Clock,c:"text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"},
          {label:"Rejected",value:formatCurrency(expenses.filter((e: unknown)=>(e as Record<string,unknown>).status==="rejected").reduce((s: number,e)=>s+Number((e as Record<string,unknown>).amount||0),0)),icon:XCircle,c:"text-red-500 bg-red-50 dark:bg-red-900/20"},
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",s.c.split(" ").slice(1).join(" "))}><s.icon className={cn("w-4 h-4",s.c.split(" ")[0])}/></div>
            <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-9 h-9" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {["all","pending","approved","rejected"].map(s => (
          <Button key={s} variant={statusFilter===s?"default":"outline"} size="sm" className="capitalize" onClick={()=>setStatusFilter(s)}>{s}</Button>
        ))}
      </div>

      {error ? <ApiError error={error} onRetry={refetch} /> : loading ? <TableLoader /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Description","Category","Amount (TZS)","Date","Submitted By","Status",""].map(c=>(
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{c}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(exp => (
                  <tr key={exp.id as string} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{exp.description as string}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-muted px-2 py-1 rounded-full">{exp.category as string}</span></td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(Number(exp.amount||0))}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{exp.date ? formatDate(exp.date as string) : "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{exp.submitted_by_name as string || "—"}</td>
                    <td className="px-4 py-3"><Badge className={cn("text-[10px] capitalize",getStatusColor(exp.status as string))}>{exp.status as string}</Badge></td>
                    <td className="px-4 py-3">
                      {exp.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 text-xs px-2 bg-green-500 hover:bg-green-600" onClick={()=>handleApprove(exp.id as string)}>✓</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-red-500" onClick={()=>handleReject(exp.id as string)}>✗</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground text-sm">No expenses found</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Submit Expense</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}</div>}
            <div className="space-y-1"><Label className="text-xs">Description *</Label><Input value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="e.g. Adobe Creative Suite" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v=>v&&setForm(p=>({...p,category:v}))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Amount (TZS) *</Label><Input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="0" /></div>
              <div className="col-span-2 space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
              <div className="col-span-2 space-y-1"><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Optional notes" /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Submitting...</>:"Submit Expense"}</Button>
              <Button type="button" variant="outline" onClick={()=>setShowNew(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
