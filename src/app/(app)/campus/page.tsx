"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Sparkles } from "lucide-react";
import {
  EVENT_CATEGORIES,
  fetchEvents,
  saveLocalEvents,
  type CampusEvent,
  type EventCategory,
} from "@/lib/events";
import { EventCard } from "@/components/events/EventCard";
import { EventDetailModal } from "@/components/events/EventDetailModal";
import { CreateEventModal } from "@/components/events/CreateEventModal";

export default function CampusPage() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [activeCategory, setActiveCategory] = useState<"All" | EventCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchEvents();
      setEvents(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = activeCategory === "All" || e.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [events, activeCategory, searchQuery]);

  function handleUpdateEvent(updated: CampusEvent) {
    const next = events.map((e) => (e.id === updated.id ? updated : e));
    setEvents(next);
    setSelectedEvent(updated);
    saveLocalEvents(next);
  }

  function handleCreateEvent(created: CampusEvent) {
    const next = [created, ...events];
    setEvents(next);
    saveLocalEvents(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Campus Events</h1>
            <span className="rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
              Community Verified
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Track hackathons, workshops, and verified venue & schedule changes in real time.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Post Event</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted group-focus-within:text-accent transition-colors" />
          <input
            type="search"
            placeholder="Search events by name, club, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border-subtle bg-surface-2/50 px-12 py-3.5 text-sm text-foreground transition-all duration-200 placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-4 focus:ring-accent-soft shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 shrink-0 ${
                activeCategory === cat
                  ? "bg-accent text-white shadow-md shadow-accent/20 scale-[1.02]"
                  : "bg-surface-2 border border-border-subtle text-muted hover:bg-surface-3 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-surface p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-base font-semibold text-foreground">No events found</h2>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            {searchQuery
              ? `No campus events matching "${searchQuery}". Try a different search term or category.`
              : "Be the first to post an event or club announcement for your campus!"}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post an Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdateEvent={handleUpdateEvent}
        />
      )}

      {/* Create Event Modal */}
      {isCreateOpen && (
        <CreateEventModal
          onClose={() => setIsCreateOpen(false)}
          onEventCreated={handleCreateEvent}
        />
      )}
    </div>
  );
}
