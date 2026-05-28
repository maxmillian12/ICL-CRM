"use client";
import { CalendarIcon } from "lucide-react";
export default function CalendarPage() {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
      <CalendarIcon className="w-12 h-12 opacity-30" />
      <p className="text-lg font-medium">Calendar View</p>
      <p className="text-sm">Full calendar with drag-and-drop scheduling coming soon</p>
    </div>
  );
}
