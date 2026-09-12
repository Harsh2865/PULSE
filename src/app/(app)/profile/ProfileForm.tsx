"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required.").max(120),
  course: z.string().trim().max(120),
  year: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(8)])
    .transform((v) => (v === "" ? null : v)),
  bio: z.string().trim().max(500),
});

type ProfileInput = {
  fullName: string;
  course: string;
  year: string;
  bio: string;
};

export function ProfileForm({ initial }: { initial: ProfileInput }) {
  const router = useRouter();
  const [values, setValues] = useState<ProfileInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProfileInput>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        course: parsed.data.course || null,
        year: parsed.data.year,
        bio: parsed.data.bio || null,
      })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);

    setSaving(false);
    if (error) {
      setError("Couldn’t save your profile. Please try again.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const field =
    "w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-2.5 text-sm text-foreground transition-all duration-200 placeholder:text-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft";
  const label = "block text-sm font-semibold text-foreground mb-2";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-sm">
      <div className="space-y-1.5">
        <label htmlFor="fullName" className={label}>
          Full name
        </label>
        <input
          id="fullName"
          className={field}
          value={values.fullName}
          onChange={(e) => set("fullName", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="course" className={label}>
            Course / program
          </label>
          <input
            id="course"
            className={field}
            placeholder="B.Tech CSE"
            value={values.course}
            onChange={(e) => set("course", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="year" className={label}>
            Year
          </label>
          <select
            id="year"
            className={field}
            value={values.year}
            onChange={(e) => set("year", e.target.value)}
          >
            <option value="">Not set</option>
            {[1, 2, 3, 4, 5].map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bio" className={label}>
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          className={field}
          placeholder="A line about you — what you’re studying or building."
          value={values.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-md shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
