import {
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Home,
  Radar,
  RefreshCcw,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  live: boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Home",
    items: [{ label: "Dashboard", href: "/dashboard", icon: Home, live: true }],
  },
  {
    title: "Do",
    items: [
      { label: "Deadline Radar", href: "/deadlines", icon: Radar, live: true },
      { label: "Study Planner", href: "/planner", icon: CalendarDays, live: true },
      { label: "Recovery Mode", href: "/recovery", icon: RefreshCcw, live: true },
    ],
  },
  {
    title: "Catch Up",
    items: [
      { label: "What Did I Miss?", href: "/catch-up", icon: GraduationCap, live: true },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "TeamUp & SkillSwap", href: "/connect", icon: Users, live: true },
    ],
  },
  {
    title: "Campus",
    items: [{ label: "Events", href: "/campus", icon: CalendarClock, live: true }],
  },
];

export const mobileNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, live: true },
  { label: "Radar", href: "/deadlines", icon: Radar, live: true },
  { label: "Catch Up", href: "/catch-up", icon: GraduationCap, live: true },
  { label: "Connect", href: "/connect", icon: Users, live: true },
  { label: "Profile", href: "/profile", icon: Sparkles, live: true },
];

export const comingSoonIcon = Wrench;
