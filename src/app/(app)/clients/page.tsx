"use client";

import { useState } from "react";
import { Search, Plus, Building2, Mail, Phone, Star, MoreHorizontal, ArrowRight, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { clients, users, projects, invoices } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor, getInitials, cn } from "@/lib/utils";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = clients.filter(c =>
    !search ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const getAccountManager = (id: string) => users.find(u => u.id === id);
  const getClientProjects = (id: string) => projects.filter(p => p.clientId === id);
  const getClientInvoices = (id: string) => invoices.filter(inv => inv.clientId === id);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm">{clients.length} clients · {clients.filter(c => c.status === "active").length} active</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />Add Client
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: clients.length.toString(), icon: Building2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Total Revenue", value: formatCurrency(clients.reduce((s, c) => s + c.totalRevenue, 0)), icon: DollarSign, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "On Retainer", value: clients.filter(c => c.retainerValue).length.toString(), icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
          { label: "Pending Invoices", value: formatCurrency(invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.total, 0)), icon: FileText, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search clients..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client) => {
          const am = getAccountManager(client.accountManager);
          const clientProjects = getClientProjects(client.id);
          const activeProjects = clientProjects.filter(p => p.status === "active").length;

          return (
            <Card key={client.id} className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelected(client)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {getInitials(client.company)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.company}</h3>
                      <p className="text-xs text-muted-foreground">{client.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-[10px]", getStatusColor(client.status))}>{client.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                        <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                        <DropdownMenuItem>View Projects</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(client.totalRevenue)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Monthly Retainer</p>
                    <p className="text-sm font-bold">{client.retainerValue ? formatCurrency(client.retainerValue) : "Project-based"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{activeProjects} active project{activeProjects !== 1 ? "s" : ""}</span>
                  <span>{client.contacts.length} contact{client.contacts.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Tanzania tax fields */}
                {(client.tin || client.vrn) && (
                  <div className="mb-3 p-2 rounded-lg bg-muted/40 border border-border space-y-0.5">
                    {client.tin && <p className="text-[10px] text-muted-foreground"><span className="font-semibold">TIN:</span> {client.tin}</p>}
                    {client.vrn && <p className="text-[10px] text-muted-foreground"><span className="font-semibold">VRN:</span> {client.vrn}</p>}
                    {client.brn && <p className="text-[10px] text-muted-foreground"><span className="font-semibold">BRN:</span> {client.brn}</p>}
                  </div>
                )}

                {client.contractEnd && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Contract</span>
                      <span>Until {formatDate(client.contractEnd)}</span>
                    </div>
                  </div>
                )}

                <Separator className="mb-3" />
                <div className="flex items-center gap-2">
                  {am && (
                    <div className="flex items-center gap-1.5 flex-1">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{getInitials(am.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{am.name}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {client.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Client Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (() => {
            const am = getAccountManager(selected.accountManager);
            const clientProjects = getClientProjects(selected.id);
            const clientInvoices = getClientInvoices(selected.id);
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      {getInitials(selected.company)}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selected.company}</DialogTitle>
                      <p className="text-muted-foreground text-sm">{selected.industry}</p>
                    </div>
                    <Badge className={cn("ml-auto", getStatusColor(selected.status))}>{selected.status}</Badge>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Revenue", value: formatCurrency(selected.totalRevenue), color: "text-green-600" },
                    { label: "Monthly Retainer", value: selected.retainerValue ? formatCurrency(selected.retainerValue) : "N/A" },
                    { label: "Active Projects", value: clientProjects.filter(p => p.status === "active").length.toString() },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tanzania compliance fields */}
                {(selected.tin || selected.vrn || selected.brn) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-2">🇹🇿 Tanzania Tax Details</p>
                    <div className="grid grid-cols-3 gap-3">
                      {selected.tin && <div><p className="text-[10px] text-muted-foreground">TIN</p><p className="text-sm font-mono font-semibold">{selected.tin}</p></div>}
                      {selected.vrn && <div><p className="text-[10px] text-muted-foreground">VRN (VAT)</p><p className="text-sm font-mono font-semibold">{selected.vrn}</p></div>}
                      {selected.brn && <div><p className="text-[10px] text-muted-foreground">BRN</p><p className="text-sm font-mono font-semibold">{selected.brn}</p></div>}
                    </div>
                    {selected.address && <p className="text-xs text-muted-foreground mt-2">📍 {[selected.address, selected.city, selected.region, selected.country].filter(Boolean).join(", ")}</p>}
                  </div>
                )}

                <div>
                  <p className="font-semibold mb-3">Contacts</p>
                  <div className="space-y-2">
                    {selected.contacts.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-muted">{getInitials(c.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{c.name}</p>
                            {c.isPrimary && <Badge variant="secondary" className="text-[10px] px-1.5">Primary</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{c.role}</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={`mailto:${c.email}`} className="text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" /></a>
                          <a href={`tel:${c.phone}`} className="text-muted-foreground hover:text-primary"><Phone className="w-4 h-4" /></a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-3">Projects ({clientProjects.length})</p>
                  <div className="space-y-2">
                    {clientProjects.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{p.type.replace("_", " ")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={p.progress} className="w-16 h-1.5" />
                          <span className="text-xs">{p.progress}%</span>
                          <Badge className={cn("text-[10px]", getStatusColor(p.status))}>{p.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">Create Project</Button>
                  <Button variant="outline" className="flex-1">Create Invoice</Button>
                  <Button variant="outline">Client Portal</Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
