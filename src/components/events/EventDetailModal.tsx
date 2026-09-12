"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquarePlus,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import {
  calculateEventReliability,
  type CampusEvent,
  type EventUpdate,
} from "@/lib/events";

export function EventDetailModal({
  event,
  onClose,
  onUpdateEvent,
}: {
  event: CampusEvent;
  onClose: () => void;
  onUpdateEvent: (updated: CampusEvent) => void;
}) {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [hasDisputed, setHasDisputed] = useState(false);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [updateType, setUpdateType] = useState<EventUpdate["update_type"]>("venue_change");
  const [updateContent, setUpdateContent] = useState("");

  const reliability = calculateEventReliability(event);

  async function handleConfirm() {
    if (hasConfirmed) return;
    const updated = {
      ...event,
      confirmations: event.confirmations + 1,
    };
    setHasConfirmed(true);
    if (hasDisputed) {
      updated.disputes = Math.max(0, updated.disputes - 1);
      setHasDisputed(false);
    }
    onUpdateEvent(updated);

    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("event_confirmations").insert({
          event_id: event.id,
          user_id: user.id,
          is_confirmed: true
        });
      }
    } catch (e) {}
  }

  function handleDispute() {
    if (hasDisputed) return;
    const updated = {
      ...event,
      disputes: event.disputes + 1,
    };
    setHasDisputed(true);
    if (hasConfirmed) {
      updated.confirmations = Math.max(0, updated.confirmations - 1);
      setHasConfirmed(false);
    }
    onUpdateEvent(updated);
  }

  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!updateContent.trim()) return;

    setIsSubmittingUpdate(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to post update.");

      const { data, error } = await supabase.from("event_updates").insert({
        event_id: event.id,
        user_id: user.id,
        update_type: updateType,
        content: updateContent.trim()
      }).select().single();

      if (!error && data) {
        const newUpdate: EventUpdate = {
          id: data.id,
          update_type: data.update_type as any,
          content: data.content,
          created_at: new Date(data.created_at).toLocaleDateString(),
          confirmations_count: 1, // self-confirm conceptually
        };

        const updated = {
          ...event,
          updates: [newUpdate, ...event.updates],
        };
        onUpdateEvent(updated);
        
        await supabase.from("event_confirmations").insert({
          event_id: event.id,
          update_id: data.id,
          user_id: user.id,
          is_confirmed: true
        });
      }
    } catch (e) {}

    setUpdateContent("");
    setIsAddingUpdate(false);
    setIsSubmittingUpdate(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-[2rem] border border-border-subtle bg-surface shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-background/80 p-2 text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {event.poster_url && (
          <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-surface-2">
            <img
              src={event.poster_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="rounded-full bg-accent/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent shadow-inner">
                {event.category}
              </span>
              <span className="rounded-full bg-success/15 border border-success/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-success shadow-inner">
                {event.status === "open" ? "Registration Open" : event.status}
              </span>
            </div>
            <h2 id="modal-title" className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {event.title}
            </h2>
            <p className="mt-2 text-sm font-bold text-muted uppercase tracking-wider">Organized by {event.organizer}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border-subtle bg-surface-2/50 p-5 text-sm shadow-inner">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent shrink-0" aria-hidden />
              <span className="font-semibold text-foreground">{event.event_date}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-accent shrink-0" aria-hidden />
              <span className="font-semibold text-foreground">{event.event_time}</span>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <MapPin className="h-5 w-5 text-accent shrink-0" aria-hidden />
              <span className="font-semibold text-foreground">{event.location}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Description</h3>
            <p className="text-sm leading-relaxed text-muted whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {event.registration_url && (
            <div className="flex items-center gap-3">
              <a
                href={event.registration_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 hover:opacity-90 transition-opacity"
              >
                <span>Register for Event</span>
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
          )}

          {/* Reliability & Community Verification Card */}
          <div className="rounded-2xl border border-border-subtle bg-surface-2/50 p-5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-success drop-shadow-[0_0_5px_var(--color-success)]" aria-hidden />
                <span className="text-sm font-bold tracking-wide text-foreground">
                  Event Reliability: {reliability}%
                </span>
              </div>
              <span className="text-xs font-medium text-muted">
                {event.confirmations} confirmed · {event.disputes} disputed
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full rounded-full bg-surface-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-success to-accent transition-all duration-1000 shadow-[0_0_8px_var(--color-success)]"
                style={{ width: `${reliability}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-muted font-bold">Is this event info accurate?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={hasConfirmed}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-200 font-bold ${
                    hasConfirmed
                      ? "bg-success/20 text-success"
                      : "bg-surface-3 hover:bg-surface-2 text-foreground shadow-sm"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" aria-hidden />
                  {hasConfirmed ? "Confirmed ✓" : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={handleDispute}
                  disabled={hasDisputed}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-200 font-bold ${
                    hasDisputed
                      ? "bg-danger/20 text-danger"
                      : "bg-surface-3 hover:bg-surface-2 text-foreground shadow-sm"
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" aria-hidden />
                  {hasDisputed ? "Reported" : "Report"}
                </button>
              </div>
            </div>
          </div>

          {/* Latest Updates Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Latest Updates</h3>
              <button
                type="button"
                onClick={() => setIsAddingUpdate(!isAddingUpdate)}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
                <span>Post an update</span>
              </button>
            </div>

            {isAddingUpdate && (
              <form
                onSubmit={handleAddUpdate}
                className="rounded-xl border border-accent/40 bg-accent-soft/30 p-4 space-y-3"
              >
                <div className="flex gap-2">
                  <select
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value as never)}
                    className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-foreground"
                  >
                    <option value="venue_change">Venue Changed</option>
                    <option value="time_change">Time Changed</option>
                    <option value="deadline_extended">Deadline Extended</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Venue changed from Block A to Block C..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUpdate(false)}
                    className="rounded-lg px-3 py-1 text-xs text-muted hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Publish Update
                  </button>
                </div>
              </form>
            )}

            {event.updates.length === 0 ? (
              <p className="text-xs text-muted italic">No updates posted yet for this event.</p>
            ) : (
              <ul className="space-y-2.5">
                {event.updates.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-2/50 p-3.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-accent capitalize">
                          {u.update_type.replace("_", " ")}
                        </span>
                        <span className="text-muted">{u.created_at}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-foreground">{u.content}</p>
                      <p className="mt-1 text-[11px] text-muted">
                        ✓ Confirmed by {u.confirmations_count} students
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
