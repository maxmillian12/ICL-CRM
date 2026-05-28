"use client";

import { useState } from "react";
import { Plus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { leadsApi, getApiError } from "@/lib/api-client";
import { formatCurrency, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

type LeadStatus = "new"|"contacted"|"proposal_sent"|"negotiation"|"won"|"lost";
const STAGES: {id:LeadStatus;label:string;color:string;accent:string}[] = [
  {id:"new",label:"New Lead",color:"border-blue-400",accent:"bg-blue-400"},
  {id:"contacted",label:"Contacted",color:"border-yellow-400",accent:"bg-yellow-400"},
  {id:"proposal_sent",label:"Proposal Sent",color:"border-purple-400",accent:"bg-purple-400"},
  {id:"negotiation",label:"Negotiation",color:"border-orange-400",accent:"bg-orange-400"},
  {id:"won",label:"Won 🎉",color:"border-green-400",accent:"bg-green-400"},
];

export default function PipelinePage() {
  const [dragId, setDragId] = useState<string|null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatus|null>(null);
  const { data, loading, error, refetch } = useApi(() => leadsApi.list().then(r => r.data), []);
  const leads = (data as {data?: unknown[]})?.data ?? [] as Array<Record<string,unknown>>;

  const handleMove = async (id: string, status: LeadStatus) => {
    try {
      await leadsApi.update(id, { status });
      toast.success(`Lead moved to ${STAGES.find(s=>s.id===status)?.label ?? status}`);
      refetch();
    } catch (err) { toast.error(getApiError(err)); }
  };

  const totalValue = leads.filter((l:unknown)=>(l as Record<string,unknown>).status!=="lost").reduce((s: number,l)=>s+Number((l as Record<string,unknown>).budget||0),0);
  const wonValue = leads.filter((l:unknown)=>(l as Record<string,unknown>).status==="won").reduce((s: number,l)=>s+Number((l as Record<string,unknown>).budget||0),0);

  if (loading) return <div className="p-6"><TableLoader/></div>;
  if (error) return <div className="p-6"><ApiError error={error} onRetry={refetch}/></div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground text-sm">Pipeline: <strong>{formatCurrency(totalValue)}</strong> · Won: <strong className="text-green-600">{formatCurrency(wonValue)}</strong></p>
        </div>
        <div className="flex gap-2">
          <a href="/crm/leads" className="inline-flex h-7 items-center px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">List View</a>
          <Button size="sm" onClick={()=>toast.info("Use List View to add leads")}><Plus className="w-4 h-4 mr-2"/>Add Lead</Button>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
        {STAGES.map(stage => {
          const stageLeads = (leads as Array<Record<string,unknown>>).filter(l => l.status === stage.id);
          const stageValue = stageLeads.reduce((s: number,l)=>s+Number(l.budget||0),0);
          const isOver = dragOverStage === stage.id;
          return (
            <div key={stage.id}
              className={cn("flex-shrink-0 w-72 flex flex-col rounded-xl border-2 transition-all",isOver?"border-primary bg-primary/5 scale-[1.01]":"border-transparent")}
              onDragOver={e=>{e.preventDefault();setDragOverStage(stage.id);}}
              onDragLeave={()=>setDragOverStage(null)}
              onDrop={()=>{if(dragId)handleMove(dragId,stage.id);setDragId(null);setDragOverStage(null);}}
            >
              <div className={cn("rounded-t-xl border-t-4 bg-muted/50 p-3",stage.color)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className={cn("w-2 h-2 rounded-full",stage.accent)}/><span className="text-sm font-semibold">{stage.label}</span></div>
                  <Badge variant="secondary" className="text-xs">{stageLeads.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{formatCurrency(stageValue)}</p>
              </div>
              <div className="flex-1 p-2 space-y-2 min-h-32 overflow-y-auto">
                {stageLeads.map(lead => (
                  <div key={lead.id as string} draggable onDragStart={()=>setDragId(lead.id as string)} onDragEnd={()=>{setDragId(null);setDragOverStage(null);}} className={cn(dragId===lead.id&&"opacity-40")}>
                    <Card className="group cursor-grab hover:shadow-md transition-all border-border">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-sm font-semibold truncate">{lead.company as string}</p>
                            <p className="text-xs text-muted-foreground truncate">{lead.contact_name as string}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none">
                              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {STAGES.filter(s=>s.id!==stage.id).map(s=>(
                                <DropdownMenuItem key={s.id} onClick={()=>handleMove(lead.id as string,s.id)}>Move to {s.label}</DropdownMenuItem>
                              ))}
                              <DropdownMenuItem onClick={()=>handleMove(lead.id as string,"lost")} className="text-red-500">Mark as Lost</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-green-600">{formatCurrency(Number(lead.budget||0))}</span>
                          <div className={cn("flex items-center gap-0.5 text-xs font-semibold",Number(lead.score||0)>=80?"text-green-500":Number(lead.score||0)>=60?"text-yellow-500":"text-red-400")}>
                            <Flame className="w-3 h-3"/>{lead.score as number||0}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded capitalize">{String(lead.source||"").replace("_"," ")}</span>
                          <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{lead.industry as string||"—"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {stageLeads.length===0 && (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-lg">
                    <p className="text-xs text-muted-foreground">Drop leads here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
