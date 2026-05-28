"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Hash, MessageCircle, Plus, Smile, Paperclip, Phone, Video, Search, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { channels, messages as initialMessages, users, currentUser } from "@/lib/mock-data";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";
import type { Message, Channel } from "@/lib/types";
import { toast } from "sonner";

export default function CommunicationPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>(channels[0]);
  const [allMessages, setAllMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelMessages = allMessages;

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: newMessage,
      type: "text",
      timestamp: new Date().toISOString(),
      isRead: true,
    };
    setAllMessages(prev => [...prev, msg]);
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const channelGroups = [
    { label: "Channels", channels: channels.filter(c => c.type === "channel") },
    { label: "Direct Messages", channels: channels.filter(c => c.type === "dm") },
  ];

  const activeUser = activeChannel.type === "dm"
    ? users.find(u => activeChannel.members.find(m => m !== currentUser.id) === u.id)
    : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-muted/20 flex-shrink-0">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 h-8 text-xs bg-background" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {channelGroups.map(group => (
            <div key={group.label} className="mb-4">
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</p>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Plus className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
              {group.channels.map(ch => {
                const otherUser = ch.type === "dm" ? users.find(u => ch.members.find(m => m !== currentUser.id) === u.id) : null;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors",
                      activeChannel.id === ch.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {ch.type === "channel" ? (
                      <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary flex-shrink-0">
                        {otherUser ? getInitials(otherUser.name) : "?"}
                      </div>
                    )}
                    <span className="text-xs font-medium truncate flex-1">{ch.name}</span>
                    {ch.unreadCount > 0 && (
                      <Badge className={cn(
                        "text-[9px] min-w-4 h-4 px-1 flex-shrink-0",
                        activeChannel.id === ch.id ? "bg-white text-primary" : "bg-primary text-white"
                      )}>
                        {ch.unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{currentUser.name.split(" ")[0]}</span>
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeChannel.type === "channel" ? (
              <>
                <Hash className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="font-semibold text-sm">{activeChannel.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{activeChannel.members.length} members</span>
                </div>
              </>
            ) : (
              <>
                {activeUser && (
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(activeUser.name)}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <span className="font-semibold text-sm">{activeChannel.name}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Voice call coming soon!")}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Video call coming soon!")}>
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Users className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1 inline-block">Today</p>
          </div>

          {channelMessages.map((msg, i) => {
            const isOwn = msg.senderId === currentUser.id;
            const prevMsg = channelMessages[i - 1];
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

            return (
              <div key={msg.id} className={cn("flex gap-3 group", isOwn && "flex-row-reverse")}>
                {showAvatar ? (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(msg.senderName)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 flex-shrink-0" />
                )}
                <div className={cn("max-w-[65%]", isOwn && "items-end flex flex-col")}>
                  {showAvatar && (
                    <div className={cn("flex items-baseline gap-2 mb-1", isOwn && "flex-row-reverse")}>
                      <span className="text-xs font-semibold">{isOwn ? "You" : msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatRelativeTime(msg.timestamp)}</span>
                    </div>
                  )}
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 border border-border focus-within:border-primary/50 transition-colors">
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Message #${activeChannel.name}`}
              className="border-0 bg-transparent h-7 text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={handleSend}
              disabled={!newMessage.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
