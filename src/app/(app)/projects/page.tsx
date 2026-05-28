"use client";

import { useState } from "react";
import { Plus, Search, FolderKanban, MoreHorizontal, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { projectsApi, clientsApi, getApiError } from "@/lib/api-client";
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

const TYPES = ["social_media","tv","radio","influencer","branding","digital","outdoor","event"];
const STATUSES = ["planning","active","on_hold","completed","cancelled"];
const PRIORITIES = ["low","medium","high","urgent"];

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Record<string,unknown>|null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name:"",client_id:"",type:"digital",status:"planning",priority:"medium",description:"",start_date:"",end_date:"",budget:"0" });

  const { data, loading, error, refetch } = useApi(
    () => projectsApi.list(statusFilter !== "all" ? { status: statusFilter } : {}).then(r => r.data),
    [statusFilter]
  );
  const { data: clientsData } = useApi(() => clientsApi.list().then(r => r.data), []);
  const projects = (data as {data?: unknown[]})?.data ?? [];
  const clients = (clientsData as {data?: unknown[]})?.data ?? [];

  const filtered = projects.filter((p: unknown) => {
    const proj = p as Record<string,unknown>;
    return !search || String(proj.name).toLowerCase().includes(search.toLowerCase()) || String(proj.client_name||"").toLowerCase().includes(search.toLowerCase());
  }) as Array<Record<string,unknown>>;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type) { setFormError("Project name and type are required"); return; }
    setSaving(true); setFormError("");
    try {
      await projectsApi.create({ ...form, budget: Number(form.budget) });
      toast.success("Project created!");
      setShowNew(false); refetch();
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects & Campaigns</h1>
          <p className="text-muted-foreground text-sm">{projects.length} total · {projects.filter((p:unknown)=>(p as Record<string,unknown>).status==="active").length} active</p>
        </div>
        <Button size="sm" onClick={() => { setFormError(""); setShowNew(true); }}>
          <Plus className="w-4 h-4 mr-2" />New Project
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all",...STATUSES].map(s => (
          <button type="button" key={s} onClick={() => setStatusFilter(s)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            {s === "all" ? "All" : s.replace("_"," ")} {s !== "all" && `(${projects.filter((p:unknown)=>(p as Record<string,unknown>).status===s).length})`}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error ? <ApiError error={error} onRetry={refetch} /> : loading ? <TableLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card key={p.id as string} className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelected(p)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{p.name as string}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.client_name as string || "No client"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={cn("text-[10px] capitalize", getStatusColor(p.status as string))}>{String(p.status).replace("_"," ")}</Badge>
                    <span className={cn("text-[10px] font-medium capitalize", getPriorityColor(p.priority as string))}>{p.priority as string}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description as string || "No description"}</p>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span><span className="font-medium text-foreground">{p.progress as number || 0}%</span>
                  </div>
                  <Progress value={Number(p.progress)||0} className="h-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-semibold">{formatCurrency(Number(p.budget||0))}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-muted-foreground">Spent</p>
                    <p className={cn("font-semibold", Number(p.spent||0)/Number(p.budget||1) > 0.85 ? "text-red-500" : "")}>{formatCurrency(Number(p.spent||0))}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="capitalize">{String(p.type||"").replace("_"," ")}</span>
                  {Boolean(p.end_date) && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(p.end_date as string)}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No projects found</p>
            </div>
          )}
        </div>
      )}

      {/* Project detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div><DialogTitle>{selected.name as string}</DialogTitle><p className="text-muted-foreground text-sm">{selected.client_name as string || "No client"} · {String(selected.type||"").replace("_"," ")}</p></div>
                  <div className="ml-auto flex gap-2">
                    <Badge className={cn(getStatusColor(selected.priority as string),"capitalize")}>{selected.priority as string}</Badge>
                    <Badge className={cn(getStatusColor(selected.status as string),"capitalize")}>{String(selected.status).replace("_"," ")}</Badge>
                  </div>
                </div>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selected.description as string || "No description"}</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  {label:"Budget",value:formatCurrency(Number(selected.budget||0))},
                  {label:"Spent",value:formatCurrency(Number(selected.spent||0))},
                  {label:"Remaining",value:formatCurrency(Number(selected.budget||0)-Number(selected.spent||0))},
                  {label:"Progress",value:`${selected.progress||0}%`},
                ].map(s => (
                  <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <Progress value={Number(selected.progress)||0} className="h-2" />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { setSelected(null); toast.info("Add task coming soon!"); }}>Add Task</Button>
                <Button variant="outline" onClick={() => { setSelected(null); }}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New project */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label className="text-xs">Project Name *</Label><Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Q2 Digital Campaign" /></div>
              <div className="space-y-1">
                <Label className="text-xs">Client</Label>
                <Select value={form.client_id} onValueChange={v=>v&&setForm(p=>({...p,client_id:v}))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{(clients as Array<Record<string,unknown>>).map(c=><SelectItem key={c.id as string} value={c.id as string}>{c.company as string}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type *</Label>
                <Select value={form.type} onValueChange={v=>v&&setForm(p=>({...p,type:v}))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map(t=><SelectItem key={t} value={t} className="capitalize">{t.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Select value={form.priority} onValueChange={v=>v&&setForm(p=>({...p,priority:v}))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(t=><SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Budget (TZS)</Label><Input type="number" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))} /></div>
              <div className="space-y-1"><Label className="text-xs">Start Date</Label><Input type="date" value={form.start_date} onChange={e=>setForm(p=>({...p,start_date:e.target.value}))} /></div>
              <div className="space-y-1"><Label className="text-xs">End Date</Label><Input type="date" value={form.end_date} onChange={e=>setForm(p=>({...p,end_date:e.target.value}))} /></div>
              <div className="col-span-2 space-y-1"><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="resize-none h-20" /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Saving...</>:"Create Project"}</Button>
              <Button type="button" variant="outline" onClick={()=>setShowNew(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
