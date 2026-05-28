"use client";

import { useState } from "react";
import { Plus, CheckSquare, Clock, AlertCircle, ChevronDown, MoreHorizontal, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { tasks, users, projects } from "@/lib/mock-data";
import { formatDate, getStatusColor, getPriorityColor, getInitials, cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/types";
import { toast } from "sonner";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "border-gray-300" },
  { id: "in_progress", label: "In Progress", color: "border-blue-400" },
  { id: "review", label: "Review", color: "border-purple-400" },
  { id: "done", label: "Done", color: "border-green-400" },
];

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, s: TaskStatus) => void }) {
  const assignee = users.find(u => u.id === task.assignee);
  const project = projects.find(p => p.id === task.projectId);
  const completed = task.checklist.filter(c => c.done).length;
  const total = task.checklist.length;

  return (
    <Card className="group hover:shadow-sm transition-all border-border">
      <CardContent className="p-3">
        <div className="flex items-start gap-2 mb-2">
          <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", getPriorityColor(task.priority).replace("text-", "bg-"))} />
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium leading-snug", task.status === "done" && "line-through text-muted-foreground")}>
              {task.title}
            </p>
            {project && <p className="text-[10px] text-muted-foreground mt-0.5">{project.name}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0 hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {COLUMNS.filter(c => c.id !== task.status).map(c => (
                <DropdownMenuItem key={c.id} onClick={() => onStatusChange(task.id, c.id)}>
                  Move to {c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {total > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Checklist</span>
              <span>{completed}/{total}</span>
            </div>
            <Progress value={(completed / total) * 100} className="h-1" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {assignee && (
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{getInitials(assignee.name)}</AvatarFallback>
              </Avatar>
            )}
            <span className={cn("text-[10px] font-medium", getPriorityColor(task.priority))}>{task.priority}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
            {task.comments > 0 && <span>· {task.comments} 💬</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>(tasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setAllTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    toast.success("Task status updated");
  };

  const totalDone = allTasks.filter(t => t.status === "done").length;
  const totalTasks = allTasks.length;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            {totalDone}/{totalTasks} completed · {allTasks.filter(t => t.status === "in_progress").length} in progress
          </p>
        </div>
        <Button size="sm" onClick={() => toast.info("Add task form coming soon!")}>
          <Plus className="w-4 h-4 mr-2" />Add Task
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {COLUMNS.map(col => {
          const count = allTasks.filter(t => t.status === col.id).length;
          return (
            <div key={col.id} className="bg-muted/50 rounded-xl p-3 border border-border">
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{col.label}</p>
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto flex-1">
        {COLUMNS.map((col) => {
          const colTasks = allTasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className={cn(
                "flex-shrink-0 w-72 flex flex-col rounded-xl transition-all",
                dragOverCol === col.id && "ring-2 ring-primary ring-offset-1"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => {
                if (dragId) handleStatusChange(dragId, col.id);
                setDragId(null);
                setDragOverCol(null);
              }}
            >
              <div className={cn("flex items-center justify-between p-3 rounded-t-xl border-t-4 bg-muted/50", col.color)}>
                <span className="text-sm font-semibold">{col.label}</span>
                <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
              </div>

              <div className="flex-1 p-2 space-y-2 min-h-24 overflow-y-auto">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDragId(task.id)}
                    onDragEnd={() => { setDragId(null); setDragOverCol(null); }}
                    className={cn("cursor-grab active:cursor-grabbing", dragId === task.id && "opacity-40")}
                  >
                    <TaskCard task={task} onStatusChange={handleStatusChange} />
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-lg">
                    <p className="text-xs text-muted-foreground">Drop tasks here</p>
                  </div>
                )}
              </div>

              <button
                className="m-2 p-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-xs text-muted-foreground flex items-center gap-1 transition-colors"
                onClick={() => toast.info("Add task form coming soon!")}
              >
                <Plus className="w-3 h-3" />Add task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
