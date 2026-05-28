"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Hash, Plus, Smile, Paperclip, Phone, Video, Search, MoreHorizontal, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { getInitials, formatRelativeTime, cn } from "@/lib/utils";
import { toast } from "sonner";
import { tokenStorage } from "@/lib/api-client";

interface LocalMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface Channel { id: string; name: string; type: "channel"|"dm"; unread?: number; }

const DEFAULT_CHANNELS: Channel[] = [
  { id: "ch_general", name: "general", type: "channel", unread: 0 },
  { id: "ch_campaigns", name: "campaigns", type: "channel", unread: 0 },
  { id: "ch_marketing", name: "marketing-team", type: "channel", unread: 0 },
  { id: "ch_accounts", name: "accounts", type: "channel", unread: 0 },
];

export default function CommunicationPage() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<Channel>(DEFAULT_CHANNELS[0]);
  const [messages, setMessages] = useState<LocalMessage[]>([
    { id:"m1", senderId:"system", senderName:"System", content:"Welcome to #general! This is the start of the conversation.", timestamp: new Date(Date.now()-3600000).toISOString() },
    { id:"m2", senderId:"u_geofrey", senderName:"Geofrey Maxmillian", content:"Good morning team! Let's have a productive day.", timestamp: new Date(Date.now()-1800000).toISOString() },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const msg: LocalMessage = {
      id: `m_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
    setSending(false);
    // In production: send to WebSocket or API
    // await fetch('/api/messages', { method: 'POST', body: JSON.stringify({ channel_id: activeChannel.id, content: msg.content }), headers: { 'Authorization': `Bearer ${tokenStorage.get()}`, 'Content-Type': 'application/json' } });
  };

  const channelGroups = [
    { label: "Channels", channels: DEFAULT_CHANNELS.filter(c => c.type === "channel") },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-muted/20 flex-shrink-0">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/>
            <Input placeholder="Search..." className="pl-8 h-8 text-xs bg-background"/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {channelGroups.map(group => (
            <div key={group.label} className="mb-4">
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</p>
                <button type="button" aria-label="Add channel"><Plus className="w-3 h-3 text-muted-foreground"/></button>
              </div>
              {group.channels.map(ch => (
                <button type="button" key={ch.id} onClick={() => setActiveChannel(ch)} className={cn("w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors mb-0.5",
                  activeChannel.id===ch.id?"bg-primary text-primary-foreground":"hover:bg-muted text-muted-foreground hover:text-foreground")}>
                  <Hash className="w-3.5 h-3.5 flex-shrink-0"/>
                  <span className="text-xs font-medium truncate flex-1">{ch.name}</span>
                  {ch.unread && ch.unread > 0 && (
                    <Badge className={cn("text-[9px] min-w-4 h-4 px-1",activeChannel.id===ch.id?"bg-white text-primary":"bg-primary text-white")}>{ch.unread}</Badge>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"/>
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">{getInitials(user?.name ?? "?")}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{user?.name?.split(" ")[0]}</span>
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-muted-foreground"/>
            <div>
              <span className="font-semibold text-sm">{activeChannel.name}</span>
              <span className="text-xs text-muted-foreground ml-2">Team channel</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Start voice call" onClick={()=>toast.info("Voice call coming soon")} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><Phone className="w-4 h-4"/></button>
            <button type="button" aria-label="Start video call" onClick={()=>toast.info("Video call coming soon")} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><Video className="w-4 h-4"/></button>
            <button type="button" aria-label="Members" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><Users className="w-4 h-4"/></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1 inline-block">Today</p>
          </div>
          {messages.map((msg, i) => {
            const isOwn = msg.senderId === user?.id;
            const prevMsg = messages[i-1];
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
            return (
              <div key={msg.id} className={cn("flex gap-3 group", isOwn && "flex-row-reverse")}>
                {showAvatar ? (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(msg.senderName)}</AvatarFallback>
                  </Avatar>
                ) : <div className="w-8 flex-shrink-0"/>}
                <div className={cn("max-w-[65%]", isOwn && "items-end flex flex-col")}>
                  {showAvatar && (
                    <div className={cn("flex items-baseline gap-2 mb-1", isOwn && "flex-row-reverse")}>
                      <span className="text-xs font-semibold">{isOwn ? "You" : msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatRelativeTime(msg.timestamp)}</span>
                    </div>
                  )}
                  <div className={cn("px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm")}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 border border-border focus-within:border-primary/50 transition-colors">
            <button type="button" aria-label="Attach file" className="text-muted-foreground hover:text-foreground"><Paperclip className="w-4 h-4"/></button>
            <Input value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}}
              placeholder={`Message #${activeChannel.name}`} className="border-0 bg-transparent h-7 text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"/>
            <button type="button" aria-label="Add emoji" className="text-muted-foreground hover:text-foreground"><Smile className="w-4 h-4"/></button>
            <button type="button" onClick={handleSend} disabled={!newMessage.trim()||sending} aria-label="Send message"
              className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
