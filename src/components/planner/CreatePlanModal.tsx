"use client";

import { useState } from "react";
import { Plus, X, Trash2, Calendar, Clock, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createNewExamPlan, type TopicDifficulty, type TopicImportance } from "@/lib/planner";

type TopicInput = {
  id: string;
  name: string;
  difficulty: TopicDifficulty;
  importance: TopicImportance;
  confidence: number;
  estimated_minutes: number;
};

export function CreatePlanModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(120);
  
  const [topics, setTopics] = useState<TopicInput[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      difficulty: "medium",
      importance: "medium",
      confidence: 50,
      estimated_minutes: 60,
    }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    setTopics([
      ...topics,
      {
        id: crypto.randomUUID(),
        name: "",
        difficulty: "medium",
        importance: "medium",
        confidence: 50,
        estimated_minutes: 60,
      }
    ]);
  };

  const handleRemoveTopic = (id: string) => {
    setTopics(topics.filter(t => t.id !== id));
  };

  const handleTopicChange = (id: string, field: keyof TopicInput, value: any) => {
    setTopics(topics.map(t => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !examDate) {
      setError("Exam Subject and Date are required.");
      return;
    }
    if (dailyMinutes <= 0) {
      setError("Daily study capacity must be greater than 0.");
      return;
    }
    if (topics.length === 0) {
      setError("At least one topic is required.");
      return;
    }
    if (topics.some(t => !t.name.trim() || t.estimated_minutes <= 0)) {
      setError("All topics must have a name and estimated minutes greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const plan = await createNewExamPlan(
        supabase,
        user.id,
        subject.trim(),
        examDate,
        dailyMinutes,
        topics.map(t => ({
          name: t.name.trim(),
          difficulty: t.difficulty,
          importance: t.importance,
          confidence: t.confidence,
          estimated_minutes: t.estimated_minutes
        }))
      );

      if (!plan) {
        throw new Error("Failed to create plan. Please verify the syllabus_topics RLS policy is configured.");
      }

      setSubject("");
      setExamDate("");
      setDailyMinutes(120);
      setTopics([
        {
          id: crypto.randomUUID(),
          name: "",
          difficulty: "medium",
          importance: "medium",
          confidence: 50,
          estimated_minutes: 60,
        }
      ]);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border-subtle bg-surface shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-surface/80 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent/10 p-2">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-black text-foreground">Create Study Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm font-bold text-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Exam Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures"
                className="w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Exam Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-2 pl-11 pr-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Daily Study Capacity (minutes) *
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-2 pl-11 pr-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Syllabus Topics</h3>
                <p className="text-xs text-muted">Add the topics you need to study for this exam.</p>
              </div>
              <button
                type="button"
                onClick={handleAddTopic}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-2 px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                <Plus className="h-4 w-4" />
                Add Topic
              </button>
            </div>

            <div className="space-y-4">
              {topics.map((topic, index) => (
                <div key={topic.id} className="relative rounded-2xl border border-border-subtle bg-surface-2/50 p-4 pt-8">
                  {topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic.id)}
                      className="absolute right-3 top-3 text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <span className="absolute left-4 top-3 text-[10px] font-black text-muted tracking-widest uppercase">
                    Topic {index + 1}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <input
                        type="text"
                        placeholder="Topic Name"
                        value={topic.name}
                        onChange={(e) => handleTopicChange(topic.id, "name", e.target.value)}
                        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Difficulty</label>
                      <select
                        value={topic.difficulty}
                        onChange={(e) => handleTopicChange(topic.id, "difficulty", e.target.value)}
                        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Importance</label>
                      <select
                        value={topic.importance}
                        onChange={(e) => handleTopicChange(topic.id, "importance", e.target.value)}
                        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Est. Time (min)</label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={topic.estimated_minutes}
                        onChange={(e) => handleTopicChange(topic.id, "estimated_minutes", parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex justify-between">
                        <span>Confidence</span>
                        <span className="text-accent">{topic.confidence}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={topic.confidence}
                        onChange={(e) => handleTopicChange(topic.id, "confidence", parseInt(e.target.value))}
                        className="w-full accent-accent h-2 bg-surface rounded-full cursor-pointer appearance-none outline-none border border-border-subtle mt-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border-subtle bg-surface/80 pt-6 backdrop-blur-md pb-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-muted transition-colors hover:text-foreground"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-accent/90 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Creating Plan..." : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
