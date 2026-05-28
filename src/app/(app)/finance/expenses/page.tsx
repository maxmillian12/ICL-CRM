"use client";

import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { expenses, users, projects } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = ["Software", "Production", "Admin", "Entertainment", "Advertising", "Travel", "Office"];

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalApproved = expenses.filter(e => e.status === "approved").reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground text-sm">Approved: <strong className="text-green-600">{formatCurrency(totalApproved)}</strong> · Pending: <strong className="text-yellow-600">{formatCurrency(totalPending)}</strong></p>
        </div>
        <Button size="sm" onClick={() => toast.info("Expense form coming soon!")}>
          <Plus className="w-4 h-4 mr-2" />Submit Expense
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Approved", value: formatCurrency(totalApproved), icon: CheckCircle, color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
          { label: "Pending Review", value: formatCurrency(totalPending), icon: Clock, color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
          { label: "Rejected", value: formatCurrency(expenses.filter(e => e.status === "rejected").reduce((s, e) => s + e.amount, 0)), icon: XCircle, color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color.split(" ").slice(1).join(" "))}>
                <stat.icon className={cn("w-5 h-5", stat.color.split(" ")[0])} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {["all", "pending", "approved", "rejected"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" className="capitalize" onClick={() => setStatusFilter(s)}>
            {s}
          </Button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Description", "Category", "Amount", "Project", "Date", "Submitted By", "Status", ""].map(col => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(expense => {
                const submitter = users.find(u => u.id === expense.submittedBy);
                const project = expense.projectId ? projects.find(p => p.id === expense.projectId) : null;
                return (
                  <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{expense.description}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-muted px-2 py-1 rounded-full">{expense.category}</span></td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{project?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(expense.date)}</td>
                    <td className="px-4 py-3">
                      {submitter && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                            {getInitials(submitter.name)}
                          </div>
                          <span className="text-xs">{submitter.name.split(" ")[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-[10px] capitalize", getStatusColor(expense.status))}>{expense.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {expense.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 text-xs px-2 bg-green-500 hover:bg-green-600" onClick={() => toast.success("Expense approved!")}>✓</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-red-500" onClick={() => toast.error("Expense rejected")}>✗</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
