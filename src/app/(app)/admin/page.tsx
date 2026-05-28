"use client";

import { useState } from "react";
import {
  Users, Shield, Database, AlertTriangle, Check, X,
  Plus, MoreHorizontal, Pencil, Trash2, KeyRound, ToggleLeft,
  ToggleRight, Building, Percent, Globe, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableLoader, ApiError } from "@/components/ui/loading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUsers, useDepartments, useSettings, mutations } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { getInitials, getRoleLabel, getRoleBadgeColor, cn } from "@/lib/utils";
import { ROLE_PERMISSIONS } from "@/lib/types";
import { toast } from "sonner";
import { getApiError } from "@/lib/api-client";

const ALL_ROLES = ["super_admin","admin","manager","sales_user","accounts_user","hr_user","support_user","marketing_user","operations_user"].map(v=>({value:v,label:getRoleLabel(v)}));
const DEPT_OPTIONS = ["administration","sales","accounts","hr","support","marketing","operations"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}));
const LOCKED_DEPTS = ["administration","sales","accounts","hr","support","marketing","operations"];

export default function AdminPage() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: deptsData, loading: deptsLoading, error: deptsError, refetch: refetchDepts } = useDepartments();
  const { data: settingsData, loading: settingsLoading } = useSettings();

  const allUsers = (usersData?.data ?? []) as Array<Record<string,unknown>>;
  const allDepts = (deptsData?.data ?? []) as Array<Record<string,unknown>>;
  const settings = (settingsData ?? {}) as Record<string,unknown>;

  const [userDialog, setUserDialog] = useState<{open:boolean;user?:Record<string,unknown>}>({open:false});
  const [deptDialog, setDeptDialog] = useState<{open:boolean;dept?:Record<string,unknown>}>({open:false});
  const [resetDialog, setResetDialog] = useState<{open:boolean;user?:Record<string,unknown>}>({open:false});
  const [deleteUser, setDeleteUser] = useState<Record<string,unknown>|null>(null);
  const [deleteDept, setDeleteDept] = useState<Record<string,unknown>|null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [userForm, setUserForm] = useState<Record<string,string>>({name:"",email:"",password:"",role:"sales_user",department_id:"sales",phone:""});
  const [deptForm, setDeptForm] = useState({name:"",description:""});

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) { setFormError("Name and email are required"); return; }
    if (!userDialog.user && !userForm.password) { setFormError("Password is required for new users"); return; }
    if (!userDialog.user && userForm.password.length < 6) { setFormError("Password must be at least 6 characters"); return; }
    setSaving(true); setFormError("");
    try {
      if (userDialog.user) {
        const payload: Record<string,unknown> = { name:userForm.name, email:userForm.email, role:userForm.role, department_id:userForm.department_id||null, phone:userForm.phone||null };
        if (userForm.password) payload.password = userForm.password;
        await mutations.updateUser(userDialog.user.id as string, payload);
        toast.success(`${userForm.name} updated`);
      } else {
        await mutations.createUser({ ...userForm, department_id: userForm.department_id||null, phone: userForm.phone||null });
        toast.success(`User ${userForm.name} created`);
      }
      setUserDialog({open:false});
    } catch (err) { setFormError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (user: Record<string,unknown>) => {
    if (user.role === "super_admin") { toast.error("Cannot change Super Admin status"); return; }
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await mutations.toggleUserStatus(user.id as string, newStatus);
      toast.success(`${user.name} ${newStatus === "active" ? "enabled" : "disabled"}`);
    } catch (err) { toast.error(getApiError(err)); }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    await mutations.deleteUser(deleteUser.id as string);
    toast.success("User deleted");
    setDeleteUser(null);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error("Min 6 characters"); return; }
    try {
      await mutations.resetPassword(resetDialog.user!.id as string, newPassword);
      toast.success("Password reset successfully");
      setResetDialog({open:false}); setNewPassword("");
    } catch (err) { toast.error(getApiError(err)); }
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name) { toast.error("Department name is required"); return; }
    setSaving(true);
    try {
      if (deptDialog.dept) {
        await mutations.updateDepartment(deptDialog.dept.id as string, deptForm);
        toast.success("Department updated");
      } else {
        await mutations.createDepartment(deptForm);
        toast.success(`"${deptForm.name}" department created`);
      }
      setDeptDialog({open:false});
    } catch (err) { toast.error(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDeleteDept = async () => {
    if (!deleteDept) return;
    try {
      await mutations.deleteDepartment(deleteDept.id as string);
      toast.success("Department deleted");
      setDeleteDept(null);
    } catch (err) { toast.error(getApiError(err)); setDeleteDept(null); }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Shield className="w-10 h-10 opacity-30"/>
        <p className="font-medium">Access Denied — Admin only</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Shield className="w-5 h-5 text-red-500"/></div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Users, departments, roles &amp; system · auto-syncing</p>
        </div>
        {isSuperAdmin && <Badge className="ml-auto bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertTriangle className="w-3 h-3 mr-1"/>Super Admin</Badge>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total Users",value:allUsers.length,icon:Users,c:"text-blue-500 bg-blue-50 dark:bg-blue-900/20"},
          {label:"Active Users",value:allUsers.filter(u=>u.status==="active").length,icon:Shield,c:"text-green-500 bg-green-50 dark:bg-green-900/20"},
          {label:"Departments",value:allDepts.length,icon:Building,c:"text-purple-500 bg-purple-50 dark:bg-purple-900/20"},
          {label:"Roles",value:ALL_ROLES.length,icon:Database,c:"text-orange-500 bg-orange-50 dark:bg-orange-900/20"},
        ].map(s=>(
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",s.c.split(" ").slice(1).join(" "))}><s.icon className={cn("w-4 h-4",s.c.split(" ")[0])}/></div>
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>

        {/* USERS */}
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">User Management</CardTitle>
                <Button size="sm" onClick={()=>{setUserForm({name:"",email:"",password:"",role:"sales_user",department_id:"sales",phone:""});setFormError("");setUserDialog({open:true});}}>
                  <Plus className="w-4 h-4 mr-1.5"/>Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {usersError ? <ApiError error={usersError} onRetry={refetchUsers}/> : usersLoading ? <TableLoader/> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    {["User","Role","Department","Status","Joined",""].map(c=>(
                      <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{c}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {allUsers.map(u=>(
                      <tr key={u.id as string} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(u.name as string)}</AvatarFallback></Avatar>
                            <div><p className="font-medium text-sm">{u.name as string}</p><p className="text-xs text-muted-foreground">{u.email as string}</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge className={cn("text-[10px]",getRoleBadgeColor(u.role as string))}>{getRoleLabel(u.role as string)}</Badge></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{u.department as string||"—"}</td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={()=>handleToggleStatus(u)} className="flex items-center gap-1.5 cursor-pointer">
                            {u.status==="active" ? <ToggleRight className="w-5 h-5 text-green-500"/> : <ToggleLeft className="w-5 h-5 text-muted-foreground"/>}
                            <span className={cn("text-xs font-medium capitalize",u.status==="active"?"text-green-600":"text-muted-foreground")}>{u.status as string}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{String(u.joined_at||"").slice(0,10)}</td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground focus-visible:outline-none">
                              <MoreHorizontal className="w-4 h-4"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={()=>{setUserForm({name:u.name as string,email:u.email as string,password:"",role:u.role as string,department_id:(u.department_id||"sales") as string,phone:(u.phone||"") as string});setFormError("");setUserDialog({open:true,user:u});}}>
                                <Pencil className="w-3.5 h-3.5 mr-2"/>Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={()=>setResetDialog({open:true,user:u})}>
                                <KeyRound className="w-3.5 h-3.5 mr-2"/>Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={()=>handleToggleStatus(u)}>
                                {u.status==="active"?<><ToggleLeft className="w-3.5 h-3.5 mr-2"/>Disable</>:<><ToggleRight className="w-3.5 h-3.5 mr-2"/>Enable</>}
                              </DropdownMenuItem>
                              {isSuperAdmin && (u.role as string)!=="super_admin" && (<>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={()=>setDeleteUser(u)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2"/>Delete</DropdownMenuItem>
                              </>)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEPARTMENTS */}
        <TabsContent value="departments" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Department Management</CardTitle>
                <Button size="sm" onClick={()=>{setDeptForm({name:"",description:""});setDeptDialog({open:true});}}>
                  <Plus className="w-4 h-4 mr-1.5"/>Add Department
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {deptsError ? <ApiError error={deptsError} onRetry={refetchDepts}/> : deptsLoading ? <TableLoader/> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">{["Department","Description","Members",""].map(c=><th key={c} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{c}</th>)}</tr></thead>
                  <tbody className="divide-y divide-border">
                    {allDepts.map(d=>{
                      const count = allUsers.filter(u=>u.department_id===d.id).length;
                      return (
                        <tr key={d.id as string} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{String(d.name||"?").charAt(0).toUpperCase()}</div>
                              <div><p className="font-medium">{d.name as string}</p>{LOCKED_DEPTS.includes(d.id as string)&&<span className="text-[10px] text-muted-foreground">Default</span>}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">{d.description as string||"—"}</td>
                          <td className="px-4 py-3"><Badge variant="secondary">{d.member_count as number||count}</Badge></td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground focus-visible:outline-none">
                                <MoreHorizontal className="w-4 h-4"/>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={()=>{setDeptForm({name:d.name as string,description:d.description as string||""});setDeptDialog({open:true,dept:d});}}>
                                  <Pencil className="w-3.5 h-3.5 mr-2"/>Edit
                                </DropdownMenuItem>
                                {(!LOCKED_DEPTS.includes(d.id as string))&&(<><DropdownMenuSeparator/>
                                  <DropdownMenuItem onClick={()=>setDeleteDept(d)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2"/>Delete</DropdownMenuItem>
                                </>)}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES */}
        <TabsContent value="roles" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ALL_ROLES.map(r=>{
              const perms: string[] = (ROLE_PERMISSIONS as Record<string,string[]>)[r.value]??[];
              const groups: Record<string,string[]> = {};
              perms.forEach(p=>{const[mod,action]=p.split(":");if(!groups[mod])groups[mod]=[];groups[mod].push(action);});
              const count = allUsers.filter(u=>u.role===r.value).length;
              return (
                <Card key={r.value}><CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div><Badge className={cn("text-[10px] mb-1",getRoleBadgeColor(r.value))}>{r.label}</Badge><p className="text-xs text-muted-foreground">{count} user{count!==1?"s":""}</p></div>
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {Object.entries(groups).map(([mod,actions])=>(
                      <div key={mod} className="flex items-start gap-2">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground w-20 flex-shrink-0 mt-0.5">{mod}</span>
                        <div className="flex flex-wrap gap-0.5">{actions.map(a=><span key={a} className="text-[10px] bg-muted px-1 py-0.5 rounded">{a}</span>)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent></Card>
              );
            })}
          </div>
        </TabsContent>

        {/* SYSTEM (Super Admin only) */}
        {isSuperAdmin && (
          <TabsContent value="system" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4"/>Regional Settings</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[{label:"Country",value:"Tanzania (TZ)"},{label:"Currency",value:"Tanzania Shilling (TZS)"},{label:"Timezone",value:"Africa/Dar_es_Salaam (UTC+3)"},{label:"VAT Rate",value:`${settings.vat_rate||18}%`},{label:"WHT Rate",value:`${settings.withholding_tax_rate||5}%`},{label:"Tax Authority",value:"TRA"}].map(s=>(
                  <div key={s.label} className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground">{s.label}</p>
                    <div className="h-9 px-3 rounded-lg border border-border bg-muted/50 flex items-center justify-between text-sm">
                      <span>{s.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Security Audit Log</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[{event:"Login",user:"Geofrey Maxmillian",ip:"41.75.x.x",time:"Just now",ok:true},{event:"User Created",user:"Geofrey Maxmillian",ip:"41.75.x.x",time:"5 min ago",ok:true},{event:"Failed Login",user:"Unknown",ip:"45.12.x.x",time:"2 hours ago",ok:false}].map((log,i)=>(
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border text-sm">
                      {log.ok?<Check className="w-4 h-4 text-green-500 flex-shrink-0"/>:<X className="w-4 h-4 text-red-500 flex-shrink-0"/>}
                      <span className="font-medium">{log.event}</span><span className="text-muted-foreground">{log.user}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{log.ip} · {log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* User Form Dialog */}
      <Dialog open={userDialog.open} onOpenChange={open=>!open&&setUserDialog({open:false})}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{userDialog.user?`Edit — ${userDialog.user.name}`:"Add New User"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4">
            {formError&&<div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertCircle className="w-4 h-4 flex-shrink-0"/>{formError}</div>}
            <div className="grid grid-cols-2 gap-4">
              {[{key:"name",label:"Full Name *",ph:"John Doe",type:"text"},{key:"email",label:"Email *",ph:"user@integrated.co.tz",type:"email"},{key:"password",label:userDialog.user?"New Password (optional)":"Password *",ph:"Min 6 characters",type:"password"},{key:"phone",label:"Phone",ph:"+255 7XX XXX XXX",type:"text"}].map(f=>(
                <div key={f.key} className="space-y-1.5"><Label className="text-xs">{f.label}</Label>
                  <Input type={f.type} value={userForm[f.key]||""} onChange={e=>setUserForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}/>
                </div>
              ))}
              <div className="space-y-1.5"><Label className="text-xs">Role *</Label>
                <Select value={userForm.role} onValueChange={v=>v&&setUserForm(p=>({...p,role:v}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{ALL_ROLES.map(r=><SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Department *</Label>
                <Select value={userForm.department_id} onValueChange={v=>v&&setUserForm(p=>({...p,department_id:v}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{DEPT_OPTIONS.map(d=><SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Saving...</>:(userDialog.user?"Save Changes":"Create User")}</Button>
              <Button type="button" variant="outline" onClick={()=>setUserDialog({open:false})}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dept Form Dialog */}
      <Dialog open={deptDialog.open} onOpenChange={open=>!open&&setDeptDialog({open:false})}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{deptDialog.dept?`Edit — ${deptDialog.dept.name}`:"Add Department"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveDept} className="space-y-4">
            <div className="space-y-1.5"><Label>Department Name *</Label><Input value={deptForm.name} onChange={e=>setDeptForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Design"/></div>
            <div className="space-y-1.5"><Label>Description</Label><Input value={deptForm.description} onChange={e=>setDeptForm(p=>({...p,description:e.target.value}))} placeholder="Brief description..."/></div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>{saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Saving...</>:(deptDialog.dept?"Save Changes":"Create Department")}</Button>
              <Button type="button" variant="outline" onClick={()=>setDeptDialog({open:false})}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialog.open} onOpenChange={open=>!open&&setResetDialog({open:false})}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reset Password — {resetDialog.user?.name as string}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>New Password (min 6 chars)</Label><Input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="••••••••"/></div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleResetPassword}>Reset Password</Button>
              <Button variant="outline" onClick={()=>setResetDialog({open:false})}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Deletes */}
      <ConfirmDialog open={!!deleteUser} onOpenChange={open=>!open&&setDeleteUser(null)} title="Delete User" description={`Delete "${deleteUser?.name}"? This cannot be undone.`} confirmLabel="Delete User" onConfirm={handleDeleteUser}/>
      <ConfirmDialog open={!!deleteDept} onOpenChange={open=>!open&&setDeleteDept(null)} title="Delete Department" description={`Delete "${deleteDept?.name}"? This cannot be undone.`} confirmLabel="Delete Department" onConfirm={handleDeleteDept}/>
    </div>
  );
}
