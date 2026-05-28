"use client";

import { useState } from "react";
import { Plus, Search, LayoutGrid, List, Calendar, MoreHorizontal, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { projects, tasks, users } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getInitials, cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

const CAMPAIGN_TYPES = [
  { value: "all", label: "All Types" },
  { value: "social_media", label: "Social Media" },
  { value: "tv", label: "TV" },
  { value: "radio", label: "Radio" },
  { value: "influencer", label: "Influencer" },
  { value: "branding", label: "Branding" },
  { value: "digital", label: "Digital" },
  { value: "outdoor", label: "Outdoor" },
  { value: "event", label: "Event" },
];

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const doneTasks = projectTasks.filter(t => t.status === "done").length;

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer group" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-sm truncate">{project.name}</h3>
              <Badge className={cn("text-[10px] capitalize flex-shrink-0", getPriorityColor(project.priority).replace("text-", "bg-").replace("-500", "-100") + " " + getPriorityColor(project.priority))}>
                {project.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{project.clientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[10px] capitalize", getStatusColor(project.status))}>{project.status.replace("_", " ")}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none"
              >
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Add Task</DropdownMenuItem>
                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium text-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-muted-foreground">Budget</p>
            <p className="font-semibold">{formatCurrency(project.budget)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-muted-foreground">Spent</p>
            <p className={cn("font-semibold", project.spent / project.budget > 0.85 ? "text-red-500" : "text-foreground")}>
              {formatCurrency(project.spent)}
            </p>
          </div>
        </div>

        <Separator className="mb-3" />

        <div className="flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {project.teamMembers.slice(0, 4).map((uid) => {
              const u = users.find(u => u.id === uid);
              return (
                <Avatar key={uid} className="w-6 h-6 border-2 border-background">
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{u ? getInitials(u.name) : "?"}</AvatarFallback>
                </Avatar>
              );
            })}
            {project.teamMembers.length > 4 && (
              <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] text-muted-foreground">
                +{project.teamMembers.length - 4}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(project.endDate)}</span>
            <span>{doneTasks}/{projectTasks.length} tasks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const statuses = ["planning", "active", "on_hold", "completed", "cancelled"];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects & Campaigns</h1>
          <p className="text-muted-foreground text-sm">{projects.length} total · {projects.filter(p => p.status === "active").length} active</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />New Project
        </Button>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...statuses].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {s === "all" ? `All (${projects.length})` : `${s.replace("_", " ")} (${projects.filter(p => p.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="Campaign type" />
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p)} />)}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No projects found</p>
          </div>
        )}
      </div>

      {/* Project Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (() => {
            const projectTasks = tasks.filter(t => t.projectId === selected.id);
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div>
                      <DialogTitle>{selected.name}</DialogTitle>
                      <p className="text-muted-foreground text-sm">{selected.clientName} · {selected.type.replace("_", " ")}</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Badge className={cn(getStatusColor(selected.priority), "capitalize")}>{selected.priority}</Badge>
                      <Badge className={cn(getStatusColor(selected.status), "capitalize")}>{selected.status}</Badge>
                    </div>
                  </div>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">{selected.description}</p>

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Budget", value: formatCurrency(selected.budget) },
                    { label: "Spent", value: formatCurrency(selected.spent) },
                    { label: "Remaining", value: formatCurrency(selected.budget - selected.spent) },
                    { label: "Progress", value: `${selected.progress}%` },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-sm font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <Progress value={selected.progress} className="h-2" />

                <div>
                  <p className="font-semibold mb-3">Tasks ({projectTasks.length})</p>
                  <div className="space-y-2">
                    {projectTasks.length > 0 ? projectTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                        <div className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          task.status === "done" ? "bg-green-500" : task.status === "in_progress" ? "bg-blue-500" : "bg-gray-300"
                        )} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("text-[10px] font-medium", getPriorityColor(task.priority))}>{task.priority}</span>
                            <span className="text-[10px] text-muted-foreground">Due {formatDate(task.dueDate)}</span>
                          </div>
                        </div>
                        <Badge className={cn("text-[10px]", getStatusColor(task.status))}>{task.status.replace("_", " ")}</Badge>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">Add Task</Button>
                  <Button variant="outline" className="flex-1">Gantt View</Button>
                  <Button variant="outline">Edit Project</Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
