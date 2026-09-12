"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  CheckCircle,
  Clock,
  Edit3,
  ExternalLink,
  Flame,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import {
  calculateTeamMatchScore,
  CANDIDATES,
  INITIAL_PROJECTS,
  INITIAL_PROFILE_SKILLS,
  INITIAL_SWAPS,
  getLocalProjects,
  getLocalProfileSkills,
  getLocalSwaps,
  saveLocalProjects,
  saveLocalProfileSkills,
  saveLocalSwaps,
  type ProfileSkills,
  type Project,
  type SkillSwapMatch,
  type StudentCandidate,
} from "@/lib/connect";

export default function ConnectPage() {
  const [activeTab, setActiveTab] = useState<"teamup" | "skillswap">("teamup");
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [swaps, setSwaps] = useState<SkillSwapMatch[]>(INITIAL_SWAPS);
  const [profileSkills, setProfileSkills] = useState<ProfileSkills>(INITIAL_PROFILE_SKILLS);
  const [selectedNeededSkill, setSelectedNeededSkill] = useState<string>("UI/UX Designer");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const p = await (await import("@/lib/connect")).fetchProjects(supabase);
      setProjects(p);
      const s = await (await import("@/lib/connect")).fetchSwaps(supabase);
      setSwaps(s);
    }
    load();
    setProfileSkills(getLocalProfileSkills());
  }, []);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => {
        if (data.user) setCurrentUserId(data.user.id);
      });
    });
  }, []);

  const myProjects = projects.filter(p => p.created_by === "You" || p.created_by === "Student" || (currentUserId && p.created_by === currentUserId)); // simple fallback for now
  const activeProject = myProjects[0];
  const otherProjects = projects.filter(p => p.id !== activeProject?.id);

  // New project form state
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectType, setNewProjectType] = useState<Project["project_type"]>("Hackathon");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectSkill, setNewProjectSkill] = useState("");

  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [editTeachSkills, setEditTeachSkills] = useState("");
  const [editLearnSkills, setEditLearnSkills] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCandidateInvite(candId: string, candName: string) {
    if (!activeProject) {
      setFlashMessage("Create a project first to invite teammates.");
      setTimeout(() => setFlashMessage(null), 4000);
      return;
    }
    const next = projects.map((p) =>
      p.id === activeProject.id ? { ...p, requests_sent: [...(p.requests_sent || []), candId] } : p
    );
    setProjects(next);
    saveLocalProjects(next);
    setFlashMessage(`Teammate invite sent to ${candName}!`);
    setTimeout(() => setFlashMessage(null), 4000);
  }

  async function handleProjectRequest(projectId: string) {
    const next = projects.map((p) =>
      p.id === projectId ? { ...p, requests_sent: [...(p.requests_sent || []), "You"] } : p
    );
    setProjects(next);
    saveLocalProjects(next);
    setFlashMessage("Request to join project sent!");
    setTimeout(() => setFlashMessage(null), 4000);
  }

  async function handleDeleteProject(projectId: string) {
    const next = projects.filter((p) => p.id !== projectId);
    setProjects(next);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      await (await import("@/lib/connect")).deleteProject(supabase, projectId);
    } catch {}
    setFlashMessage("Project removed successfully.");
    setTimeout(() => setFlashMessage(null), 4000);
  }

  function handleRequestSwap(swapId: string) {
    const next = swaps.map((s) => (s.id === swapId ? { ...s, status: "requested" as const } : s));
    setSwaps(next);
    saveLocalSwaps(next);
    setFlashMessage("Swap request sent to student! We'll notify you when they accept.");
    setTimeout(() => setFlashMessage(null), 4000);
  }

  function handleRateSession(swapId: string, rating: number) {
    const next = swaps.map((s) => (s.id === swapId ? { ...s, rating } : s));
    setSwaps(next);
    saveLocalSwaps(next);
    setFlashMessage(`Rated ${rating} stars! Reputation updated.`);
    setTimeout(() => setFlashMessage(null), 4000);
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectSkill.trim()) return;

    setIsSubmitting(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in.");

      const newId = await (await import("@/lib/connect")).createProject(supabase, user.id, {
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        project_type: newProjectType,
        roles: [newProjectSkill.trim()]
      });

      const p = await (await import("@/lib/connect")).fetchProjects(supabase);
      setProjects(p);

      setSelectedNeededSkill(newProjectSkill.trim());
      setIsCreateProjectOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
      setNewProjectSkill("");
      setFlashMessage(`Project "${newProjectName}" published!`);
    } catch (e) {
      setFlashMessage("Failed to create project");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFlashMessage(null), 4000);
    }
  }

  function handleSaveSkills(e: React.FormEvent) {
    e.preventDefault();
    const teach = editTeachSkills.split(",").map(s => s.trim()).filter(Boolean);
    const learn = editLearnSkills.split(",").map(s => s.trim()).filter(Boolean);
    const updated = { teach, learn };
    setProfileSkills(updated);
    saveLocalProfileSkills(updated);
    setIsEditSkillsOpen(false);
    setFlashMessage("Exchange Profile updated!");
    setTimeout(() => setFlashMessage(null), 4000);
  }

  function openEditSkills() {
    setEditTeachSkills(profileSkills.teach.join(", "));
    setEditLearnSkills(profileSkills.learn.join(", "));
    setIsEditSkillsOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Connect Hub</h1>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
              Deterministic Matching
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Find compatible teammates for hackathons and swap skills with verified peers.
          </p>
        </div>

        {activeTab === "teamup" && (
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Post Project</span>
          </button>
        )}
      </div>

      {flashMessage && (
        <div
          role="status"
          className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-xs font-medium text-emerald-300"
        >
          {flashMessage}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex rounded-2xl border border-border-subtle bg-surface-2/50 p-1.5 max-w-sm shadow-inner">
        <button
          onClick={() => setActiveTab("teamup")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "teamup"
              ? "bg-accent text-white shadow-[0_0_15px_var(--color-accent-soft)]"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>TeamUp (Projects)</span>
        </button>
        <button
          onClick={() => setActiveTab("skillswap")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "skillswap"
              ? "bg-info text-white shadow-[0_0_15px_var(--color-info-soft)]"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>SkillSwap (P2P)</span>
        </button>
      </div>

      {/* TEAMUP TAB */}
      {activeTab === "teamup" && (
        <div className="space-y-6">
          {/* My Projects & Contextual Matching Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Active Project Card */}
            <div className="lg:col-span-1 rounded-2xl border border-border-subtle bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Your Active Project
                </span>
                {activeProject && (
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
                    {activeProject.project_type}
                  </span>
                )}
              </div>

              {activeProject ? (
                <>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold text-foreground">{activeProject.name}</h2>
                      <button
                        onClick={() => handleDeleteProject(activeProject.id)}
                        className="text-muted hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove Project"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {activeProject.description}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface-2/50 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Team Capacity:</span>
                      <span className="font-semibold text-foreground">
                        {activeProject.current_members} of {activeProject.total_needed} members
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{
                          width: `${(activeProject.current_members / activeProject.total_needed) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground block">
                      Missing Role:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.needed_roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedNeededSkill(role)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                            selectedNeededSkill === role
                              ? "bg-danger text-white shadow-md shadow-danger/20 scale-105"
                              : "bg-surface-2 text-muted hover:text-foreground hover:bg-surface-3"
                          }`}
                        >
                          🔴 {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-muted">
                  <p className="text-sm mb-4">You have no active projects.</p>
                  <button
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Post Project</span>
                  </button>
                </div>
              )}
            </div>

            {/* Contextual Matching Candidates */}
            <div className="lg:col-span-2 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-soft/20 via-surface to-surface p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Top Matching Candidates for {selectedNeededSkill}
                  </h3>
                  <p className="text-xs text-muted">
                    Deterministic score calculated from skills overlap (50%), availability (30%), and interests (20%).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CANDIDATES.map((cand) => {
                  const matchScore = calculateTeamMatchScore(selectedNeededSkill, cand);
                  return (
                    <div
                      key={cand.id}
                      className="group rounded-3xl border border-border-subtle bg-surface p-5 flex flex-col justify-between space-y-4 hover:border-accent/40 hover:shadow-lg transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-base font-bold tracking-tight text-foreground">{cand.name}</h4>
                            <p className="text-xs font-medium text-muted mt-0.5">
                              {cand.course} · Year {cand.year}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black tracking-wider shrink-0 shadow-inner ${
                              matchScore >= 90
                                ? "bg-success/15 text-success border border-success/30"
                                : matchScore >= 75
                                  ? "bg-accent-soft text-accent"
                                  : "bg-surface-2 text-muted"
                            }`}
                          >
                            {matchScore}% MATCH
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {cand.skills.map((s, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-surface-2 px-2.5 py-1 text-[10px] font-bold tracking-wide text-foreground border border-border-subtle"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 rounded-xl bg-surface-2/50 p-2.5 flex items-center justify-between text-xs text-muted">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock className="h-3.5 w-3.5 text-accent" />
                            {cand.available_hours_per_week} hrs/wk
                          </span>
                          <span className="font-bold flex items-center gap-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            {cand.reputation} Trust
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCandidateInvite(cand.id, cand.name)}
                        disabled={activeProject?.requests_sent?.includes(cand.id)}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all duration-200 ${
                          activeProject?.requests_sent?.includes(cand.id)
                            ? "border-border-subtle bg-surface-2 text-muted cursor-not-allowed"
                            : "border-border-subtle bg-surface text-foreground hover:bg-accent hover:text-white hover:border-accent hover:shadow-md"
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{activeProject?.requests_sent?.includes(cand.id) ? "Invite Sent" : "Invite to Team"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Discover Campus Projects */}
          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <h3 className="text-lg font-black tracking-tight text-foreground">Discover Student Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {otherProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="group rounded-3xl border border-border-subtle bg-surface p-6 flex flex-col justify-between space-y-5 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span className="text-accent">{proj.project_type}</span>
                      <span className="text-muted bg-surface-2 px-2 py-1 rounded-full">By {proj.created_by}</span>
                    </div>
                    <h4 className="text-xl font-bold tracking-tight text-foreground">{proj.name}</h4>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted font-bold mr-1">Looking for:</span>
                      {proj.needed_roles.map((r, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-danger/10 border border-danger/20 px-2.5 py-1 text-xs font-bold text-danger"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-xs">
                    <span className="font-semibold text-muted">
                      {proj.current_members}/{proj.total_needed} members filled
                    </span>
                    <button
                      type="button"
                      onClick={() => handleProjectRequest(proj.id)}
                      disabled={proj.requests_sent?.includes("You")}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                        proj.requests_sent?.includes("You")
                          ? "bg-surface-2 text-muted cursor-not-allowed"
                          : "bg-accent text-white shadow-md shadow-accent/20 hover:scale-105"
                      }`}
                    >
                      {proj.requests_sent?.includes("You") ? "Requested" : "Request to Join"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SKILLSWAP TAB */}
      {activeTab === "skillswap" && (
        <div className="space-y-6">
          {/* Student's Skill Profile Box */}
          <div className="relative overflow-hidden rounded-3xl border border-info/30 bg-surface p-6 sm:p-8 shadow-2xl shadow-info/5">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-info/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-info uppercase tracking-widest block">
                    Your Exchange Profile
                  </span>
                  <button
                    onClick={openEditSkills}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-info hover:bg-info/10 transition-colors border border-transparent hover:border-info/20"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Skills</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <p className="text-xs font-black tracking-tight text-foreground">I CAN TEACH</p>
                    <div className="flex flex-wrap gap-2">
                      {profileSkills.teach.map((s) => (
                        <span
                          key={s}
                          className="rounded-lg bg-success/15 border border-success/30 px-3 py-1.5 text-xs font-bold text-success shadow-inner"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs font-black tracking-tight text-foreground">I WANT TO LEARN</p>
                    <div className="flex flex-wrap gap-2">
                      {profileSkills.learn.map((s) => (
                        <span
                          key={s}
                          className="rounded-lg bg-info/15 border border-info/30 px-3 py-1.5 text-xs font-bold text-info shadow-inner"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reciprocal Matches Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Reciprocal Skill Matches</h3>
                <p className="text-xs text-muted">
                  Peer students who teach what you want to learn, and want to learn what you teach.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {swaps.map((swap) => {
                const isRequested = swap.status === "requested";
                const isCompleted = swap.status === "completed";

                return (
                    <div
                      key={swap.id}
                      className="group rounded-3xl border border-border-subtle bg-surface p-6 flex flex-col justify-between space-y-5 hover:border-info/40 hover:shadow-xl transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-lg font-bold tracking-tight text-foreground">
                              You ↔ {swap.partner_name}
                            </h4>
                            <span className="text-xs font-medium text-muted mt-1 inline-flex items-center gap-1">
                              <Star className="h-3 w-3 fill-muted" /> {swap.partner_trust}
                            </span>
                          </div>
                          <span className="rounded-full bg-info/15 border border-info/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-info shadow-inner shrink-0">
                            {swap.match_percentage}% MATCH
                          </span>
                        </div>

                        <div className="mt-5 space-y-3 rounded-2xl border border-border-subtle bg-surface-2/40 p-4 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted font-semibold">You Teach:</span>
                            <span className="font-bold text-success">
                              {swap.they_learn}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted font-semibold">They Teach:</span>
                            <span className="font-bold text-info">{swap.they_teach}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border-subtle pt-4 flex items-center justify-between text-xs">
                        {isCompleted ? (
                          <div className="flex items-center gap-2">
                            <span className="text-muted font-bold">Session Completed:</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  className="transition-transform hover:scale-110"
                                  onClick={() => handleRateSession(swap.id, star)}
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      (swap.rating ?? 5) >= star
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-surface-2 text-surface-2"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestSwap(swap.id)}
                            disabled={isRequested}
                            className={`inline-flex w-full justify-center items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                              isRequested
                                ? "bg-surface-2 text-muted border border-border-subtle cursor-not-allowed"
                                : "bg-info text-white shadow-md shadow-info/20 hover:scale-[1.02]"
                            }`}
                          >
                            {isRequested ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Swap Requested</span>
                              </>
                            ) : (
                              <>
                                <ArrowLeftRight className="h-4 w-4" />
                                <span>Request Swap</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateProjectOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-lg rounded-[2rem] border border-border-subtle bg-surface p-8 sm:p-10 space-y-6 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Post Student Project</h3>
                <button
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="rounded-full p-2 text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-5 text-sm mt-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2">
                    Project Name *
                  </label>
                  <input
                    required
                    className="w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    placeholder="e.g. HackPulse Autonomous Drone"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2">
                    Project Type
                  </label>
                  <select
                    className="w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none"
                    value={newProjectType}
                    onChange={(e) => setNewProjectType(e.target.value as Project["project_type"])}
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Course Project">Course Project</option>
                    <option value="Startup">Startup / Prototype</option>
                    <option value="Open Source">Open Source</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2">
                    Role / Skill Needed *
                  </label>
                  <input
                    required
                    className="w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    placeholder="e.g. UI/UX Designer / Python Backend"
                    value={newProjectSkill}
                    onChange={(e) => setNewProjectSkill(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2">
                    Brief Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                    placeholder="What is the goal of this project and what will the teammate do?"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectOpen(false)}
                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? "Publishing..." : "Publish Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Skills Modal */}
      {isEditSkillsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-lg rounded-[2rem] border border-border-subtle bg-surface p-8 sm:p-10 space-y-6 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-info/5 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Edit Exchange Profile</h3>
                <button
                  onClick={() => setIsEditSkillsOpen(false)}
                  className="rounded-full p-2 text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSkills} className="space-y-5 text-sm mt-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-success mb-2">
                    I CAN TEACH (comma separated)
                  </label>
                  <input
                    required
                    className="w-full rounded-xl border border-success/30 bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted/60 focus:border-success focus:ring-1 focus:ring-success transition-all"
                    placeholder="e.g. React, Java, Figma"
                    value={editTeachSkills}
                    onChange={(e) => setEditTeachSkills(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-info mb-2">
                    I WANT TO LEARN (comma separated)
                  </label>
                  <input
                    required
                    className="w-full rounded-xl border border-info/30 bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted/60 focus:border-info focus:ring-1 focus:ring-info transition-all"
                    placeholder="e.g. Python, Video Editing, System Design"
                    value={editLearnSkills}
                    onChange={(e) => setEditLearnSkills(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsEditSkillsOpen(false)}
                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-info px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-info/20 hover:bg-info/90 transition-all hover:scale-[1.02]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
