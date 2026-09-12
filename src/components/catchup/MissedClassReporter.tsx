"use client";

import { Check, Clock, MapPin, User, X } from "lucide-react";
import type { ClassScheduleItem } from "@/lib/catchup";

export function MissedClassReporter({
  schedule,
  onStatusChange,
}: {
  schedule: ClassScheduleItem[];
  onStatusChange: (id: string, status: ClassScheduleItem["status"]) => void;
}) {
  return (
    <div className="rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-border-subtle/50 pb-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-foreground">Class Attendance Check</h2>
          <p className="text-sm font-medium text-muted mt-1">
            Report what you missed so PULSE can surface verified class recaps and assignments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {schedule.map((item) => {
          const isMissed = item.status === "missed";
          const isAttended = item.status === "attended";

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between ${
                isMissed
                  ? "border-warning/40 bg-warning/5 shadow-inner"
                  : isAttended
                    ? "border-success/30 bg-success/5 shadow-inner"
                    : "border-border-subtle bg-surface-2/40 hover:bg-surface-2 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {item.course}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      isMissed
                        ? "bg-warning/20 text-warning"
                        : isAttended
                          ? "bg-success/20 text-success"
                          : "bg-surface text-muted border border-border-subtle"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm font-medium text-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent shrink-0" aria-hidden />
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted shrink-0" aria-hidden />
                    <span>{item.room}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border-subtle/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Did you attend?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onStatusChange(item.id, "attended")}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                      isAttended
                        ? "bg-success text-white shadow-md shadow-success/20 scale-[1.02]"
                        : "bg-surface-3 text-foreground hover:bg-success/10 hover:text-success shadow-sm"
                    }`}
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    <span>Yes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStatusChange(item.id, "missed")}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                      isMissed
                        ? "bg-warning text-black shadow-md shadow-warning/20 scale-[1.02]"
                        : "bg-surface-3 text-foreground hover:bg-warning/10 hover:text-warning shadow-sm"
                    }`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    <span>Missed It</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
