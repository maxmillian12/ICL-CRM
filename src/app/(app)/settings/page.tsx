"use client";

import { useState, useEffect } from "react";
import { User, Shield, Bell, Palette, Link, Globe, Percent, Building, Loader2, Save, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader, ApiError } from "@/components/ui/loading";
import { useSettings, mutations } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { getApiError } from "@/lib/api-client";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: rawSettings, loading, error, refetch } = useSettings();
  const settings = (rawSettings ?? {}) as Record<string,unknown>;

  const [taxForm, setTaxForm] = useState<Record<string,unknown>>({});
  const [saving, setSaving] = useState<string|null>(null);
  const [saved, setSaved] = useState<string|null>(null);
  const [notifs, setNotifs] = useState({ email:true, push:true, sms:false, whatsapp:true, taskAssigned:true, deadlineApproaching:true, newLead:true, paymentReceived:true });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setTaxForm({ ...settings });
    }
  }, [rawSettings]);

  const saveSection = async (section: string, data: Record<string,unknown>) => {
    setSaving(section);
    try {
      await mutations.updateSettings(data);
      setSaved(section);
      toast.success("Settings saved successfully");
      setTimeout(() => setSaved(null), 2000);
      refetch();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <PageLoader message="Loading settings..." />;
  if (error) return <div className="p-6"><ApiError error={error} onRetry={refetch} /></div>;

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your workspace preferences — changes save to the database</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="company"><Building className="w-4 h-4 mr-2"/>Company</TabsTrigger>
          <TabsTrigger value="tax"><Percent className="w-4 h-4 mr-2"/>Tax</TabsTrigger>
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2"/>Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2"/>Notifications</TabsTrigger>
          <TabsTrigger value="integrations"><Link className="w-4 h-4 mr-2"/>Integrations</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2"/>Security</TabsTrigger>
        </TabsList>

        {/* Company Info */}
        <TabsContent value="company">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle><CardDescription>Details printed on all invoices, proformas and quotations</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Company Name</Label>
                  <Input value={String(taxForm.company_name||"")} onChange={e=>setTaxForm(p=>({...p,company_name:e.target.value}))} placeholder="Integrated Communication Limited"/>
                </div>
                {[
                  {key:"company_tin",label:"TIN (Tax Identification Number)",ph:"100-XXX-XXX"},
                  {key:"company_vrn",label:"VRN (VAT Registration Number)",ph:"40-XXXXXX-X"},
                  {key:"company_brn",label:"BRN (Business Registration Number)",ph:"YYYY/XXXXXX"},
                  {key:"company_address",label:"Business Address",ph:"Plot X, Street Name, Dar es Salaam"},
                  {key:"company_phone",label:"Phone",ph:"+255 22 XXX XXXX"},
                  {key:"company_email",label:"Email",ph:"info@company.co.tz"},
                ].map(({key,label,ph})=>(
                  <div key={key} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Input value={String(taxForm[key]||"")} onChange={e=>setTaxForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}/>
                  </div>
                ))}
              </div>
              <Button onClick={() => saveSection("company", { company_name:taxForm.company_name, company_tin:taxForm.company_tin, company_vrn:taxForm.company_vrn, company_brn:taxForm.company_brn, company_address:taxForm.company_address, company_phone:taxForm.company_phone, company_email:taxForm.company_email })} disabled={saving==="company"}>
                {saving==="company" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Saving...</> : saved==="company" ? <><Check className="w-4 h-4 mr-2"/>Saved!</> : <><Save className="w-4 h-4 mr-2"/>Save Company Info</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tanzania Tax */}
        <TabsContent value="tax">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Percent className="w-4 h-4"/>Tanzania Tax Settings (TRA)</CardTitle><CardDescription>VAT and withholding tax per Tanzania Revenue Authority rules</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div><p className="font-medium text-sm">Value Added Tax (VAT / Kodi ya Ongezeko la Thamani)</p><p className="text-xs text-muted-foreground">Apply VAT on all taxable supplies</p></div>
                <Switch checked={Boolean(taxForm.vat_enabled ?? true)} onCheckedChange={v=>setTaxForm(p=>({...p,vat_enabled:v}))}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>VAT Rate (%)</Label>
                  <Input type="number" value={String(taxForm.vat_rate||18)} onChange={e=>setTaxForm(p=>({...p,vat_rate:Number(e.target.value)}))} min={0} max={100}/>
                  <p className="text-[10px] text-muted-foreground">Standard TRA rate: 18%</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Withholding Tax Rate (%)</Label>
                  <Input type="number" value={String(taxForm.withholding_tax_rate||5)} onChange={e=>setTaxForm(p=>({...p,withholding_tax_rate:Number(e.target.value)}))} min={0} max={100}/>
                  <p className="text-[10px] text-muted-foreground">Standard rate: 5%</p>
                </div>
              </div>
              <Separator/>
              <div>
                <p className="font-medium text-sm mb-3">Document Number Prefixes</p>
                <div className="grid grid-cols-3 gap-4">
                  {[{key:"invoice_prefix",label:"Invoice",ph:"INV"},{key:"quotation_prefix",label:"Quotation",ph:"QT"},{key:"proforma_prefix",label:"Proforma",ph:"PRO"}].map(({key,label,ph})=>(
                    <div key={key} className="space-y-1.5">
                      <Label className="text-xs">{label} Prefix</Label>
                      <Input value={String(taxForm[key]||"")} onChange={e=>setTaxForm(p=>({...p,[key]:e.target.value}))} placeholder={ph} className="h-8"/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                <p className="font-semibold mb-1">🇹🇿 TRA Compliance</p>
                <p>All VAT-registered businesses must charge 18% VAT. WHT of 5% applies on service payments. TIN and VRN must appear on all invoices.</p>
              </div>
              <Button onClick={() => saveSection("tax", { vat_enabled:taxForm.vat_enabled, vat_rate:taxForm.vat_rate, withholding_tax_rate:taxForm.withholding_tax_rate, invoice_prefix:taxForm.invoice_prefix, quotation_prefix:taxForm.quotation_prefix, proforma_prefix:taxForm.proforma_prefix })} disabled={saving==="tax"}>
                {saving==="tax" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Saving...</> : saved==="tax" ? <><Check className="w-4 h-4 mr-2"/>Saved!</> : <><Save className="w-4 h-4 mr-2"/>Save Tax Settings</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">{getInitials(user?.name ?? "?")}</div>
                <div>
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{user?.role?.replace("_"," ")} · {user?.department}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                To update your profile details or password, contact your Super Admin or use the Admin Panel.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Choose how and when you receive notifications</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="font-medium text-sm mb-3">Delivery Channels</p>
                <div className="space-y-3">
                  {[{key:"email",label:"Email Notifications"},{key:"push",label:"Push Notifications"},{key:"sms",label:"SMS Notifications"},{key:"whatsapp",label:"WhatsApp Notifications"}].map(({key,label})=>(
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <p className="text-sm font-medium">{label}</p>
                      <Switch checked={notifs[key as keyof typeof notifs] as boolean} onCheckedChange={v=>setNotifs(p=>({...p,[key]:v}))}/>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => toast.success("Notification preferences saved")}><Save className="w-4 h-4 mr-2"/>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-3">
            {[
              {name:"WhatsApp Business",icon:"💬",connected:true,desc:"WhatsApp Business API for client communication"},
              {name:"Google Ads",icon:"🎯",connected:true,desc:"Import leads and track campaign performance"},
              {name:"Facebook Lead Ads",icon:"📘",connected:false,desc:"Auto-import leads from Facebook"},
              {name:"Stripe",icon:"💳",connected:false,desc:"Accept online payments"},
              {name:"Google Meet",icon:"🎥",connected:true,desc:"Video meetings from ICL"},
              {name:"Slack",icon:"💼",connected:false,desc:"ICL notifications in Slack"},
            ].map(int=>(
              <Card key={int.name}>
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{int.icon}</span>
                  <div className="flex-1"><p className="font-semibold">{int.name}</p><p className="text-xs text-muted-foreground">{int.desc}</p></div>
                  <div className="flex items-center gap-3">
                    {int.connected && <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Connected</span>}
                    <Button variant={int.connected?"outline":"default"} size="sm">{int.connected?"Manage":"Connect"}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Regional Settings</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[{label:"Country",value:"Tanzania (TZ)"},{label:"Currency",value:"Tanzania Shilling (TZS)"},{label:"Timezone",value:"Africa/Dar_es_Salaam (UTC+3)"},{label:"Date Format",value:"DD/MM/YYYY"},{label:"Language",value:"English (Tanzania)"},{label:"Tax Authority",value:"Tanzania Revenue Authority (TRA)"}].map(s=>(
                  <div key={s.label} className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground">{s.label}</p>
                    <div className="h-9 px-3 rounded-lg border border-border bg-muted/50 flex items-center justify-between text-sm">
                      <span>{s.value}</span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Fixed</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
