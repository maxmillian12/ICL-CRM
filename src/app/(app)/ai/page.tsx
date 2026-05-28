"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, FileText, Mail, Lightbulb, BarChart2, Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AI_TOOLS = [
  { id: "proposal", icon: FileText, label: "Proposal Generator", desc: "Generate professional client proposals in seconds", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  { id: "email", icon: Mail, label: "Email Writer", desc: "Write compelling client emails and follow-ups", color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
  { id: "campaign", icon: Lightbulb, label: "Campaign Ideas", desc: "Get creative campaign concepts for your clients", color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
  { id: "content", icon: Sparkles, label: "Content Generator", desc: "Generate social media posts and ad copy", color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
  { id: "report", icon: BarChart2, label: "Report Summarizer", desc: "Summarize campaign performance into insights", color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
];

const SAMPLE_OUTPUTS: Record<string, string> = {
  proposal: `# Digital Marketing Proposal

## For: GoldCoast Beverages Ltd
**Prepared by:** Integrated Communication Limited
**Date:** May 28, 2026

### Executive Summary
We propose a comprehensive 6-month digital marketing strategy designed to increase GoldCoast Beverages' brand awareness by 40% and drive a 25% increase in direct sales through targeted digital channels.

### Proposed Campaigns
1. **Social Media Campaign** (Facebook, Instagram, TikTok)
   - Daily content creation and community management
   - Influencer partnerships with 5 micro-influencers
   - Paid social media advertising

2. **Google Ads Campaign**
   - Search campaigns targeting key beverage keywords
   - Display remarketing

### Investment Summary
- Campaign Management: GHS 15,000/month
- Creative Production: GHS 5,000/month
- Ad Spend: GHS 10,000/month
- **Total: GHS 30,000/month**

### Expected ROI
Based on industry benchmarks and our track record, we project:
- 40% increase in brand awareness
- 25% uplift in sales
- 350% return on ad spend (ROAS)`,

  email: `Subject: Following up on our meeting — Digital Campaign Proposal

Dear Emmanuel,

I hope this message finds you well!

Following our conversation last week about GoldCoast Beverages' marketing objectives, I'm excited to share that we've developed a tailored proposal specifically designed to achieve your Q3 goals.

**What we've prepared:**
✅ A 6-month integrated digital campaign strategy
✅ Projected 40% increase in brand awareness
✅ Detailed budget breakdown with clear ROI milestones

I'd love to schedule a 30-minute call this week to walk you through our approach and answer any questions you might have.

**Suggested times:**
- Tuesday, June 3rd at 10:00 AM
- Wednesday, June 4th at 2:00 PM
- Thursday, June 5th at 11:00 AM

Looking forward to the opportunity to bring your brand to life digitally!

Best regards,
Sarah Mensah
Managing Director
Integrated Communication Limited`,

  campaign: `## Campaign Concept: "Ghana Rising" for GoldCoast Beverages

### Big Idea
Celebrate Ghanaian pride and culture through the lens of refreshment — positioning GoldCoast as the drink of champions, achievers, and everyday heroes.

### Campaign Pillars
1. **TV Spot** — 30-second spot featuring Ghanaian professionals conquering their day, fueled by GoldCoast
2. **Social Media Series** — "GoldCoast Moments" UGC campaign encouraging fans to share their wins
3. **Influencer Activation** — Partner with 3 rising Ghanaian athletes + 5 lifestyle micro-influencers
4. **Outdoor** — 20 strategic billboards in Accra, Kumasi, and Tema

### Creative Direction
- **Tone:** Energetic, proud, authentic
- **Colors:** Gold, deep green, warm earth tones
- **Music:** Afrobeats fusion by a local artist (partnership opportunity)
- **Hashtag:** #GoldCoastRising

### Timeline
- Pre-production: 2 weeks
- Campaign launch: Week 3
- Campaign duration: 8 weeks

### Estimated Budget: GHS 85,000`,
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", role: "assistant", content: "Hello! I'm your ICL AI assistant. I can help you write proposals, generate campaign ideas, draft emails, create content, and analyze performance. What would you like to work on today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleGenerate = async () => {
    if (!activeTool || !prompt) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setOutput(SAMPLE_OUTPUTS[activeTool] ?? "Generated content will appear here...");
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    await new Promise(r => setTimeout(r, 1200));
    const responses = [
      "Great idea! I can help you create that campaign. Let me generate some creative concepts for you. Based on current market trends and ICL's track record, here's what I'd recommend...",
      "Based on your current pipeline, Telecel Ghana (score: 90) and GoldCoast Beverages (score: 82) are your hottest leads. I'd prioritize following up with Telecel today.",
      "For the MTN rebranding project, I see you're at 30% completion. The most critical path items are the brand guidelines document and the TV spot concept. Want me to draft talking points for your next client meeting?",
      "I've analyzed your Q1 campaigns. Your digital campaigns are outperforming traditional media by 2.3x. I recommend allocating 60% of Q3 budget to digital channels.",
    ];
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responses[Math.floor(Math.random() * responses.length)]
    };
    setChatMessages(prev => [...prev, assistantMsg]);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground text-sm">Powered by advanced AI to supercharge your agency operations</p>
        </div>
        <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
          <Sparkles className="w-3 h-3 mr-1" />AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tools */}
        <div className="space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">AI Tools</h2>
          <div className="grid grid-cols-1 gap-3">
            {AI_TOOLS.map(tool => (
              <button
                key={tool.id}
                onClick={() => { setActiveTool(tool.id); setOutput(""); }}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  activeTool === tool.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", tool.color.split(" ").slice(1).join(" "))}>
                  <tool.icon className={cn("w-5 h-5", tool.color.split(" ")[0])} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{tool.label}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
                {activeTool === tool.id && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>

          {activeTool && (
            <div className="space-y-3">
              <Textarea
                placeholder={`Describe what you need... e.g., "Write a proposal for Telecel Ghana for a 6-month digital campaign with budget GHS 120,000"`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-24 resize-none"
              />
              <Button className="w-full" onClick={handleGenerate} disabled={loading || !prompt}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate</>}
              </Button>
            </div>
          )}

          {output && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Generated Output</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleGenerate()}>
                    <RefreshCw className="w-3 h-3 mr-1" />Regenerate
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={copyOutput}>
                    {copied ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{output}</pre>
            </div>
          )}
        </div>

        {/* AI Chat */}
        <div className="flex flex-col border border-border rounded-xl overflow-hidden" style={{ height: "600px" }}>
          <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">ICL AI Assistant</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map(msg => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                  msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : "S"}
                </div>
                <div className={cn(
                  "max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-muted text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleChat(); }}
                placeholder="Ask me anything about your agency..."
                className="h-9 text-sm"
              />
              <Button size="sm" className="h-9 px-3" onClick={handleChat} disabled={!chatInput.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
