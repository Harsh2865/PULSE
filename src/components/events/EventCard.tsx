"use client";

import { Calendar, CheckCircle, Clock, MapPin, ShieldCheck, Users } from "lucide-react";
import { calculateEventReliability, type CampusEvent } from "@/lib/events";

export function EventCard({
  event,
  onClick,
}: {
  event: CampusEvent;
  onClick: () => void;
}) {
  const reliability = calculateEventReliability(event);
  const isHighReliability = reliability >= 85;

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle bg-surface transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 cursor-pointer text-left"
    >
      <div>
        {event.poster_url && (
          <div className="relative h-44 w-full overflow-hidden bg-surface-2">
            <img
              src={event.poster_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="rounded-full bg-background/80 backdrop-blur px-2.5 py-1 text-xs font-medium text-accent">
                {event.category}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur ${
                  event.status === "open"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-surface-2/80 text-muted"
                }`}
              >
                {event.status === "open" ? "Registration Open" : event.status}
              </span>
            </div>
          </div>
        )}

        <div className="p-6">
          {!event.poster_url && (
            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-full bg-accent/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent shadow-inner">
                {event.category}
              </span>
              <span className="rounded-full bg-success/15 border border-success/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-success shadow-inner">
                {event.status === "open" ? "Registration Open" : event.status}
              </span>
            </div>
          )}

          <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-2 group-hover:text-accent transition-colors">
            {event.title}
          </h2>

          <p className="mt-1.5 text-xs font-bold text-muted uppercase tracking-wider">{event.organizer}</p>

          <p className="mt-3 text-sm text-muted line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-4 space-y-1.5 border-t border-border-subtle pt-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden />
              <span>{event.event_date}</span>
              <span className="text-border-subtle">·</span>
              <Clock className="h-3.5 w-3.5 text-muted shrink-0" aria-hidden />
              <span>{event.event_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border-subtle bg-surface-2/60 px-6 py-4 flex items-center justify-between text-xs backdrop-blur">
        <div className="flex items-center gap-1.5" title={`Reliability Score: ${reliability}%`}>
          <ShieldCheck
            className={`h-4 w-4 ${isHighReliability ? "text-success drop-shadow-[0_0_5px_var(--color-success)]" : "text-amber-400"}`}
            aria-hidden
          />
          <span className="font-bold tracking-wide text-foreground">{reliability}% Reliability</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted font-medium">
          <Users className="h-4 w-4" aria-hidden />
          <span>{event.interested_count} interested</span>
        </div>
      </div>
    </article>
  );
}
