"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Flame, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { leads as initialLeads, users } from "@/lib/mock-data";
import { formatCurrency, getInitials, cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/lib/types";
import { toast } from "sonner";

const STAGES: { id: LeadStatus; label: string; color: string; accent: string }[] = [
  { id: "new", label: "New Lead", color: "border-blue-400", accent: "bg-blue-400" },
  { id: "contacted", label: "Contacted", color: "border-yellow-400", accent: "bg-yellow-400" },
  { id: "proposal_sent", label: "Proposal Sent", color: "border-purple-400", accent: "bg-purple-400" },
  { id: "negotiation", label: "Negotiation", color: "border-orange-400", accent: "bg-orange-400" },
  { id: "won", label: "Won", color: "border-green-400", accent: "bg-green-400" },
];

function LeadCard({ lead, onMove }: { lead: Lead; onMove: (id: string, status: LeadStatus) => void }) {
  const assignee = users.find(u => u.id === lead.assignedTo);
  const scoreColor = lead.score >= 80 ? "text-green-500" : lead.score >= 60 ? "text-yellow-500" : "text-red-400";

  return (
    <Card className="group cursor-grab hover:shadow-md transition-all duration-150 border-border">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-sm font-semibold truncate">{lead.company}</p>
            <p className="text-xs text-muted-foreground truncate">{lead.contact}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STAGES.filter(s => s.id !== lead.status).map(s => (
                <DropdownMenuItem key={s.id} onClick={() => onMove(lead.id, s.id)}>
                  Move to {s.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => onMove(lead.id, "lost" as LeadStatus)} className="text-red-500">
                Mark as Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-green-600">{formatCurrency(lead.budget)}</span>
          <div className={cn("flex items-center gap-0.5 text-xs font-semibold", scoreColor)}>
            <Flame className="w-3 h-3" />{lead.score}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {lead.tags.slice(0, 2).map(t => (
            <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t}</span>
          ))}
          <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground capitalize">{lead.source.replace("_", " ")}</span>
        </div>

        <div className="flex items-center justify-between">
          {assignee && (
            <div className="flex items-center gap-1.5">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-[7px] bg-primary/10 text-primary">{getInitials(assignee.name)}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-muted-foreground">{assignee.name.split(" ")[0]}</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">{lead.industry}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PipelinePage() {
  const [allLeads, setAllLeads] = useState<Lead[]>(initialLeads);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);

  const handleMove = (id: string, newStatus: LeadStatus) => {
    setAllLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    toast.success(`Lead moved to ${STAGES.find(s => s.id === newStatus)?.label ?? newStatus}`);
  };

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const handleDrop = (stage: LeadStatus) => {
    if (dragging) handleMove(dragging, stage);
    setDragging(null);
    setDragOver(null);
  };

  const totalValue = allLeads
    .filter(l => l.status !== "lost")
    .reduce((sum, l) => sum + l.budget, 0);
  const wonValue = allLeads.filter(l => l.status === "won").reduce((sum, l) => sum + l.budget, 0);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Pipeline value: <strong>{formatCurrency(totalValue)}</strong> · Won: <strong className="text-green-600">{formatCurrency(wonValue)}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <a href="/crm/leads">List View</a>
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />Add Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
        {STAGES.map((stage) => {
          const stageLeads = allLeads.filter(l => l.status === stage.id);
          const stageValue = stageLeads.reduce((s, l) => s + l.budget, 0);
          const isOver = dragOver === stage.id;

          return (
            <div
              key={stage.id}
              className={cn(
                "flex-shrink-0 w-72 flex flex-col rounded-xl border-2 transition-all",
                isOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-transparent"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Column Header */}
              <div className={cn("rounded-t-xl border-t-4 bg-muted/50 p-3", stage.color)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", stage.accent)} />
                    <span className="text-sm font-semibold">{stage.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stageLeads.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{formatCurrency(stageValue)}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 min-h-32 overflow-y-auto">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(dragging === lead.id && "opacity-40")}
                  >
                    <LeadCard lead={lead} onMove={handleMove} />
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-lg">
                    <p className="text-xs text-muted-foreground">Drop leads here</p>
                  </div>
                )}
              </div>

              {/* Add button */}
              <button className="m-2 p-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-xs text-muted-foreground flex items-center gap-1 transition-all">
                <Plus className="w-3 h-3" />Add lead
              </button>
            </div>
          );
        })}

        {/* Won column - separate */}
        <div className="flex-shrink-0 w-72 flex flex-col rounded-xl border-2 border-transparent">
          <div className="rounded-t-xl border-t-4 border-green-400 bg-green-50 dark:bg-green-900/20 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm font-semibold">Won 🎉</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {allLeads.filter(l => l.status === "won").length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium text-green-600">
              {formatCurrency(allLeads.filter(l => l.status === "won").reduce((s, l) => s + l.budget, 0))}
            </p>
          </div>
          <div className="flex-1 p-2 space-y-2 min-h-32 overflow-y-auto"
            onDragOver={(e) => { e.preventDefault(); setDragOver("won"); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop("won")}
          >
            {allLeads.filter(l => l.status === "won").map((lead) => (
              <div key={lead.id} draggable onDragStart={() => handleDragStart(lead.id)} onDragEnd={handleDragEnd}>
                <LeadCard lead={lead} onMove={handleMove} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
