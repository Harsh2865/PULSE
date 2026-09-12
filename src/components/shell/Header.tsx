"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PulseWordmark } from "@/components/shell/PulseWordmark";

import { ThemeToggle } from "@/components/shell/ThemeToggle";

export function Header({ name }: { name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.replace("/login");
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-subtle bg-background/80 px-4 py-3 backdrop-blur-md lg:px-8">
      <div className="lg:hidden">
        <PulseWordmark />
      </div>
      <p className="hidden text-sm font-medium tracking-wide text-muted lg:block">
        <span className="bg-gradient-to-r from-accent to-info bg-clip-text text-transparent font-bold">Turn campus chaos</span> into your next move.
      </p>
      <div className="flex items-center gap-3 relative" ref={menuRef}>
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="group flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface py-1.5 pl-1.5 pr-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-accent/30 hover:bg-surface-2 hover:shadow-sm"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-xs font-bold text-white shadow-inner">
            {initials || <UserRound className="h-4 w-4" aria-hidden />}
          </span>
          <span className="hidden max-w-[120px] truncate sm:block tracking-wide">{name || "Student"}</span>
          <ChevronDown className="h-4 w-4 text-muted transition-transform group-aria-expanded:rotate-180" aria-hidden />
        </button>
        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 origin-top-right animate-scale-in overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-border-subtle bg-surface-2/30">
              <p className="text-xs font-medium text-foreground truncate">{name || "Student"}</p>
              <p className="text-[10px] text-muted tracking-wide uppercase mt-0.5">Verified Account</p>
            </div>
            <Link
              href="/profile"
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              <UserRound className="h-4 w-4" aria-hidden />
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
