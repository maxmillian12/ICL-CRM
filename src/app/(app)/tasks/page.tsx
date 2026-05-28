"use client";

import { useState } from "react";
import { Plus, CheckSquare, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { tasksApi, projectsApi, getApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { formatDate, getStatusColor, getPriorityColor, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";

type TaskStatus = "todo" | "in_progress" | "review" | "done";
const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id:"todo", label:"To Do", color:"border-gray-300" },
  { id:"in_progress", label:"In Progress", color:"border-blue-400" },
  { id:"review", label:"Review", color:"border-purple-400" },
  { id:"done", label:"Done", color:"border-green-400" },
];

export default function TasksPage() {
  const { user } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ title:"",project_id:"",due_date:"",priority:"medium",status:"todo" });
  const [dragging, setDragging] = useState<string|null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus|null>(null);

  const { data, loading, error, refetch } = useApi(() => tasksApi.list().then(r => r.data), []);
  const { data: projectsData } = useApi(() => projectsApi.list().then(r => r.data), []);
  const tasks = (data as {data?: unknown[]})?.data ?? [] as Array<Record<string,unknown>>;
  const projects = (projectsData as {data?: unknown[]})?.data ?? [];

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await tasksApi.update(id, { status });
      toast.success("Task updated");
      refetch();
    } catch (err) { toast.error(getApiError(err)); }
  };

  const handleDrop = (col: TaskStatus) => {
    if (dragging) { handleStatusChange(dragging, col); setDragging(null); setDragOverCol(null); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { setFormError("Task title is required"); return; }
    setSaving(true); setFormError("");
    try {
      await tasksApi.create({ ...form, assignee_id: user?.id });
      toast.success("Task created!");
      setShowNew(false); setForm({ title:"",project_id:"",due_date:"",priority:"medium",status:"todo" }); refetch();
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: unknown) => (t as Record<string,unknown>).status === "done").length;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">{doneTasks}/{totalTasks} completed · {tasks.filter((t:unknown)=>(t as Record<string,unknown>).status==="in_progress").length} in progress</p>
        </div>
        <Button size="sm" onClick={() => { setFormError(""); setShowNew(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Task
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {COLUMNS.map(col => {
          const count = tasks.filter((t:unknown)=>(t as Record<string,unknown>).status===col.id).length;
          return (
            <div key={col.id} className="bg-muted/50 rounded-xl p-3 border border-border">
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{col.label}</p>
            </div>
          );
        })}
      </div>

      {error ? <ApiError error={error} onRetry={refetch} /> : loading ? <TableLoader /> : (
        <div className="flex gap-4 overflow-x-auto flex-1">
          {COLUMNS.map(col => {
            const colTasks = (tasks as Array<Record<string,unknown>>).filter(t => t.status === col.id);
            return (
              <div key={col.id}
                className={cn("flex-shrink-0 w-72 flex flex-col rounded-xl transition-all", dragOverCol===col.id && "ring-2 ring-primary ring-offset-1")}
                onDragOver={e=>{e.preventDefault(); setDragOverCol(col.id);}}
                onDragLeave={()=>setDragOverCol(null)}
                onDrop={()=>handleDrop(col.id)}
              >
                <div className={cn("flex items-center justify-between p-3 rounded-t-xl border-t-4 bg-muted/50", col.color)}>
                  <span className="text-sm font-semibold">{col.label}</span>
                  <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
                </div>
                <div className="flex-1 p-2 space-y-2 min-h-24 overflow-y-auto">
                  {colTasks.map(task => {
                    const checklist = Array.isArray(task.checklist) ? task.checklist as Array<Record<string,unknown>> : [];
                    const done = checklist.filter(c => c.done).length;
                    return (
                      <Card key={task.id as string} className="group cursor-grab hover:shadow-sm transition-all border-border"
                        draggable onDragStart={()=>setDragging(task.id as string)} onDragEnd={()=>{setDragging(null);setDragOverCol(null);}}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2 mb-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", getPriorityColor(task.priority as string).replace("text-","bg-"))} />
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-medium leading-snug", task.status==="done" && "line-through text-muted-foreground")}>{task.title as string}</p>
                              {Boolean(task.project_name) && <p className="text-[10px] text-muted-foreground mt-0.5">{task.project_name as string}</p>}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none">
                                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {COLUMNS.filter(c=>c.id!==col.id).map(c => (
                                  <DropdownMenuItem key={c.id} onClick={()=>handleStatusChange(task.id as string, c.id)}>Move to {c.label}</DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {checklist.length > 0 && (
                            <div className="mb-2">
                              <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Checklist</span><span>{done}/{checklist.length}</span></div>
                              <Progress value={(done/checklist.length)*100} className="h-1" />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            {Boolean(task.assignee_name) && (
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                                {getInitials(task.assignee_name as string)}
                              </div>
                            )}
                            {Boolean(task.due_date) && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                                <Clock className="w-3 h-3" />{formatDate(task.due_date as string)}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-lg">
                      <p className="text-xs text-muted-foreground">Drop tasks here</p>
                    </div>
                  )}
                </div>
                <button type="button" className="m-2 p-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-xs text-muted-foreground flex items-center gap-1"
                  onClick={() => { setForm(p=>({...p,status:col.id})); setShowNew(true); }}>
                  <Plus className="w-3 h-3" />Add task
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}</div>}
            <div className="space-y-1"><Label className="text-xs">Task Title *</Label><Input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Design campaign visuals" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Project</Label>
                <Select value={form.project_id} onValueChange={v=>v&&setForm(p=>({...p,project_id:v}))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{(projects as Array<Record<string,unknown>>).map(pr=><SelectItem key={pr.id as string} value={pr.id as string}>{pr.name as string}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Select value={form.priority} onValueChange={v=>v&&setForm(p=>({...p,priority:v}))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{["low","medium","high","urgent"].map(v=><SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Due Date</Label><Input type="date" value={form.due_date} onChange={e=>setForm(p=>({...p,due_date:e.target.value}))} /></div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v=>v&&setForm(p=>({...p,status:v}))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{COLUMNS.map(c=><SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Saving...</>:"Create Task"}</Button>
              <Button type="button" variant="outline" onClick={()=>setShowNew(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
