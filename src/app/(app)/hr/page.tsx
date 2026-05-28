"use client";

import { useState } from "react";
import { Search, Users, TrendingUp, Award, Calendar, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { hrApi } from "@/lib/api-client";
import { getInitials, getRoleLabel, getStatusColor, cn } from "@/lib/utils";

export default function HRPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const { data, loading, error, refetch } = useApi(() => hrApi.listEmployees().then(r => r.data), []);
  const employees = (data as {data?: unknown[]})?.data ?? [] as Array<Record<string,unknown>>;

  const departments = ["all", ...Array.from(new Set(employees.map((e: unknown) => String((e as Record<string,unknown>).department||""))))].filter(Boolean);
  const filtered = employees.filter((e: unknown) => {
    const emp = e as Record<string,unknown>;
    const matchSearch = !search || String(emp.name||"").toLowerCase().includes(search.toLowerCase()) || String(emp.department||"").toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || String(emp.department||"") === deptFilter;
    return matchSearch && matchDept;
  }) as Array<Record<string,unknown>>;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team & HR</h1>
          <p className="text-muted-foreground text-sm">{employees.length} team members · {employees.filter((e:unknown)=>(e as Record<string,unknown>).status==="active").length} active</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total Staff",value:employees.length,icon:Users,c:"text-blue-500 bg-blue-50 dark:bg-blue-900/20"},
          {label:"Departments",value:departments.length-1,icon:Award,c:"text-purple-500 bg-purple-50 dark:bg-purple-900/20"},
          {label:"Active",value:employees.filter((e:unknown)=>(e as Record<string,unknown>).status==="active").length,icon:TrendingUp,c:"text-green-500 bg-green-50 dark:bg-green-900/20"},
          {label:"On Leave",value:employees.filter((e:unknown)=>(e as Record<string,unknown>).status==="on_leave").length,icon:Calendar,c:"text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"},
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",s.c.split(" ").slice(1).join(" "))}><s.icon className={cn("w-4 h-4",s.c.split(" ")[0])}/></div>
            <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search team..." className="pl-9 h-9" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {departments.map(d => (
            <Button key={d} variant={deptFilter===d?"default":"outline"} size="sm" className="capitalize" onClick={()=>setDeptFilter(d)}>{d==="all"?"All":d}</Button>
          ))}
        </div>
      </div>
      {error ? <ApiError error={error} onRetry={refetch} /> : loading ? <TableLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <Card key={emp.id as string} className="hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12"><AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">{getInitials(emp.name as string)}</AvatarFallback></Avatar>
                    <div>
                      <h3 className="font-semibold">{emp.name as string}</h3>
                      <p className="text-xs text-muted-foreground">{getRoleLabel(emp.role as string)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={cn("text-[10px]",getStatusColor(emp.status as string))}>{String(emp.status||"").replace("_"," ")}</Badge>
                    {Boolean(emp.department) && <span className="text-[10px] bg-muted px-2 py-0.5 rounded">{emp.department as string}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <a href={`mailto:${emp.email}`} className="text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" /></a>
                  {Boolean(emp.phone) && <a href={`tel:${emp.phone}`} className="text-muted-foreground hover:text-primary"><Phone className="w-4 h-4" /></a>}
                  <span className="text-[10px] text-muted-foreground ml-auto">{emp.email as string}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No team members found</p></div>}
        </div>
      )}
    </div>
  );
}
