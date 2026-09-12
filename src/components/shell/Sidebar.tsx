"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { navSections } from "@/lib/nav";
import { PulseWordmark } from "@/components/shell/PulseWordmark";

export function Sidebar() {
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-subtle/50 bg-surface/60 backdrop-blur-xl px-4 py-6 lg:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between px-2 pb-6">
        {!isCollapsed && <PulseWordmark />}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <nav aria-label="Main navigation" className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden">
        {navSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'} text-sm font-medium transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-r from-accent/10 to-transparent text-accent shadow-[inset_1px_0_0_0_var(--color-accent)] border border-accent/10"
                          : "text-muted hover:bg-surface-2/50 hover:text-foreground hover:shadow-sm"
                      }`}
                    >
                      {active && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 -mt-2.5 h-5 w-1 rounded-r-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                      )}
                      {active && isCollapsed && (
                        <div className="absolute left-0 top-1/2 -mt-2 h-4 w-1 rounded-r-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                      )}
                      <item.icon 
                        className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 ${
                          active ? "scale-110" : "group-hover:scale-110"
                        }`} 
                        aria-hidden 
                      />
                      {!isCollapsed && <span className="flex-1 tracking-wide">{item.label}</span>}
                      {!isCollapsed && !item.live && (
                        <span className="rounded-md border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                          soon
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="pt-4 mt-4 border-t border-border-subtle space-y-2 pb-8">
        <Link
          href="/profile"
          className={`group flex items-center gap-3 rounded-xl ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'} text-sm font-medium text-muted transition-colors hover:bg-surface-2/50 hover:text-foreground`}
          title="Profile & settings"
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-info text-[10px] font-bold text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-background">
            K
          </div>
          {!isCollapsed && <span className="text-xs tracking-wide truncate">Profile & settings</span>}
        </Link>
      </div>
    </aside>
  );
}
