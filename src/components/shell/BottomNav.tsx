"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavItems } from "@/lib/nav";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {mobileNavItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1 relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-all duration-200 ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {active && (
                  <div className="absolute top-0 h-0.5 w-8 rounded-b-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-fade-in" />
                )}
                <item.icon 
                  className={`h-[22px] w-[22px] transition-transform duration-200 ${
                    active ? "scale-110" : "group-hover:scale-110"
                  }`} 
                  aria-hidden 
                />
                <span className="tracking-wide">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
