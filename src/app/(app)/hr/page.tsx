"use client";

import { useState } from "react";
import { Search, Plus, Users, TrendingUp, Award, Calendar, MoreHorizontal, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { employees, tasks } from "@/lib/mock-data";
import { formatDate, getStatusColor, getInitials, getRoleLabel, cn } from "@/lib/utils";
import type { Employee } from "@/lib/types";

const DEPT_COLORS: Record<string, string> = {
  Executive: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Client Services": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Sales: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Creative: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Finance: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Operations: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

function EmployeeCard({ employee, onClick }: { employee: Employee; onClick: () => void }) {
  const employeeTasks = tasks.filter(t => t.assignee === employee.id);
  const completedTasks = employeeTasks.filter(t => t.status === "done").length;
  const avgKPI = employee.kpis.length > 0
    ? employee.kpis.reduce((s, k) => s + Math.min((k.actual / k.target) * 100, 100), 0) / employee.kpis.length
    : 0;

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer group" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{employee.name}</h3>
              <p className="text-xs text-muted-foreground">{getRoleLabel(employee.role)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={cn("text-[10px]", getStatusColor(employee.status))}>{employee.status.replace("_", " ")}</Badge>
            <Badge className={cn("text-[10px]", DEPT_COLORS[employee.department])}>{employee.department}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Avg KPI Performance</span>
              <span className={cn("font-semibold", avgKPI >= 90 ? "text-green-600" : avgKPI >= 70 ? "text-yellow-600" : "text-red-500")}>
                {Math.round(avgKPI)}%
              </span>
            </div>
            <Progress value={avgKPI} className="h-1.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold">{employeeTasks.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Tasks</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-green-600">{completedTasks}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <a href={`mailto:${employee.email}`} className="text-muted-foreground hover:text-primary">
            <Mail className="w-4 h-4" />
          </a>
          <a href={`tel:${employee.phone}`} className="text-muted-foreground hover:text-primary">
            <Phone className="w-4 h-4" />
          </a>
          <span className="text-[10px] text-muted-foreground ml-auto">Since {formatDate(employee.startDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HRPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [deptFilter, setDeptFilter] = useState("all");

  const departments = ["all", ...Array.from(new Set(employees.map(e => e.department)))];
  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team & HR</h1>
          <p className="text-muted-foreground text-sm">{employees.length} team members · {employees.filter(e => e.status === "active").length} active</p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Member</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: employees.length, icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Departments", value: departments.length - 1, icon: Award, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
          { label: "Active Today", value: employees.filter(e => e.status === "active").length, icon: TrendingUp, color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
          { label: "On Leave", value: employees.filter(e => e.status === "on_leave").length, icon: Calendar, color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.color.split(" ").slice(1).join(" "))}>
                <s.icon className={cn("w-5 h-5", s.color.split(" ")[0])} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search team members..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {departments.map(d => (
            <Button key={d} variant={deptFilter === d ? "default" : "outline"} size="sm" className="capitalize" onClick={() => setDeptFilter(d)}>
              {d === "all" ? "All" : d}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(e => <EmployeeCard key={e.id} employee={e} onClick={() => setSelected(e)} />)}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">{getInitials(selected.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selected.name}</DialogTitle>
                    <p className="text-muted-foreground">{getRoleLabel(selected.role)} · {selected.department}</p>
                    <p className="text-xs text-muted-foreground">{selected.email} · {selected.phone}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-3">KPI Performance</p>
                  <div className="space-y-3">
                    {selected.kpis.map((kpi, i) => {
                      const pct = Math.min((kpi.actual / kpi.target) * 100, 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium">{kpi.name}</span>
                            <span className={cn("font-semibold", pct >= 100 ? "text-green-600" : pct >= 80 ? "text-yellow-600" : "text-red-500")}>
                              {kpi.actual}{kpi.unit} / {kpi.target}{kpi.unit}
                            </span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">View Profile</Button>
                <Button variant="outline" className="flex-1">Assign Task</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
