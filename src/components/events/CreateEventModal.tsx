"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, Upload, X } from "lucide-react";
import { type CampusEvent, type EventCategory } from "@/lib/events";

export function CreateEventModal({
  onClose,
  onEventCreated,
}: {
  onClose: () => void;
  onEventCreated: (event: CampusEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("Hackathons");
  const [organizer, setOrganizer] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("10:00 AM");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !eventDate || !location.trim()) {
      setError("Please fill in the title, date, and location.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to post an event.");

      const { data, error: insertError } = await supabase.from("events").insert({
        creator_id: user.id,
        title: title.trim(),
        category,
        event_date: eventDate,
        event_time: eventTime || null,
        location: location.trim(),
        description: description.trim() || null,
        poster_url: posterUrl.trim() || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        registration_url: registrationUrl.trim() || null,
        status: "open"
      }).select().single();

      if (insertError || !data) throw new Error("Failed to post event.");

      const newEvent: CampusEvent = {
        id: data.id,
        title: data.title,
        category: data.category as EventCategory,
        organizer: user.user_metadata?.full_name || user.email?.split('@')[0] || "Campus Organizer",
        event_date: data.event_date,
        event_time: data.event_time ? data.event_time.slice(0, 5) : "10:00",
        location: data.location,
        description: data.description ?? "",
        poster_url: data.poster_url,
        registration_url: data.registration_url,
        status: "open",
        confirmations: 1,
        disputes: 0,
        interested_count: 1,
        updates: [],
        created_at: new Date(data.created_at).toLocaleDateString(),
      };

      onEventCreated(newEvent);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const field =
    "w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-2.5 text-sm text-foreground transition-all duration-200 placeholder:text-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft";
  const label = "block text-sm font-semibold text-foreground mb-2";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-event-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-3xl border border-border-subtle bg-surface shadow-2xl p-6 sm:p-8 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="create-event-title" className="text-2xl font-black tracking-tight text-foreground">
            Post Campus Event
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="title" className={label}>
              Event Title *
            </label>
            <input
              id="title"
              required
              className={field}
              placeholder="e.g. Hackathon 2026 / Web3 Bootcamp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="category" className={label}>
                Category *
              </label>
              <select
                id="category"
                className={field}
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
              >
                <option value="Hackathons">Hackathon</option>
                <option value="Workshops">Workshop</option>
                <option value="Competitions">Competition</option>
                <option value="Clubs">Club Orientation</option>
                <option value="Academic">Academic</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="organizer" className={label}>
                Club / Organizer
              </label>
              <input
                id="organizer"
                className={field}
                placeholder="e.g. Innovation Cell"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="date" className={label}>
                Event Date *
              </label>
              <input
                id="date"
                type="date"
                required
                className={field}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="time" className={label}>
                Event Time
              </label>
              <input
                id="time"
                className={field}
                placeholder="10:00 AM"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="location" className={label}>
              Location / Venue *
            </label>
            <input
              id="location"
              required
              className={field}
              placeholder="e.g. Block C Auditorium / Tech Lab 2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className={label}>
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className={field}
              placeholder="Provide agenda, prerequisites, prizes, or eligibility..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="poster" className={label}>
              Poster Image URL
            </label>
            <input
              id="poster"
              type="url"
              className={field}
              placeholder="https://... (image url for poster banner)"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
            />
            <p className="text-[11px] text-muted">Adding a poster increases your event reliability score by +20%.</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="regUrl" className={label}>
              Registration Link
            </label>
            <input
              id="regUrl"
              type="url"
              className={field}
              placeholder="https://forms.gle/... or https://devpost.com/..."
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white hover:scale-[1.02] hover:bg-accent-hover shadow-md shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? "Publishing..." : "Publish Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
