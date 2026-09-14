# PULSE

> **Turn campus chaos into your next move.**

PULSE is a student-focused campus productivity and collaboration platform that brings academic planning, deadlines, recovery, campus events, hackathons, projects, and peer collaboration into one connected workspace.

Students don't just have assignments.

They have exams, deadlines, missed classes, hackathons, projects, teammates, changing schedules, and days when everything becomes overwhelming.

PULSE is built around one simple idea:

> **Students should spend less time figuring out what to do next and more time actually doing it.**

---

## 🚀 Links

### Live Project

[Open PULSE](https://pulse-six-phi.vercel.app/)

### GitHub Repository

[github.com/Harsh2865/PULSE](https://github.com/Harsh2865/PULSE)

### Demo Video

[Watch the 3-minute PULSE demo](https://youtu.be/VnnMx-12ATw)

### Vercel Deployment

[View deployment on Vercel](https://vercel.com/harsh-b659/pulse/135Y2jku7RxF9x756UxjCjJfKUuq)

---

# 🎯 The Problem

College productivity is fragmented.

A student might have:

- An exam approaching
- Multiple assignments due
- A hackathon this weekend
- A project that needs another teammate
- Classes they missed
- A study plan that needs adjusting
- A schedule that suddenly becomes impossible to manage

Usually, these problems are handled using completely different tools.

Calendars handle dates.

Task managers handle tasks.

WhatsApp groups handle teammates.

College portals handle academics.

Event groups handle hackathons.

And students are left connecting everything themselves.

### PULSE brings these workflows together.

Instead of asking:

> "Where do I find this information?"

PULSE focuses on:

> **"Given everything happening around me, what should I do next?"**

---

# ✨ Features

## 📊 Dashboard

The Dashboard acts as the student's central campus command center.

It provides a quick overview of the student's academic and campus activity so they can understand what needs attention without jumping between multiple tools.

### Goal

Turn scattered information into a clear starting point.

---

# ⏰ Deadline Radar

Deadline Radar helps students keep track of important academic deadlines.

Students can see what is coming up and identify deadlines that require attention.

### Why it matters

Deadlines are easy to miss when they are spread across different subjects and platforms.

Deadline Radar makes upcoming work visible and actionable.

---

# 📚 Study Planner

The Study Planner helps students organize preparation around their academic workload.

Students can create and manage study plans instead of manually deciding what to study every day.

The planner is designed around realistic planning rather than simply filling every available hour.

### Design principle

A study plan should adapt to a student's life.

If something changes, the plan should not become another source of stress.

---

# 🔄 Recovery Mode

Sometimes the problem isn't planning.

It's being behind.

Recovery Mode is designed for students who have fallen behind on their academic workload.

Instead of assuming everything can simply be completed according to the original schedule, Recovery Mode focuses on helping students regain control.

### The idea

> **A bad week shouldn't become a bad semester.**

---

# 🎓 What Did I Miss?

Students miss classes.

That's normal.

The difficult part is figuring out what happened while they were away.

"What Did I Miss?" helps students identify missed academic activity and understand what they need to catch up on.

### Goal

Reduce the gap between:

> "I missed something."

and

> "I know what I need to do now."

---

# 🤝 Connect Hub

PULSE treats campus life as more than academics.

Students also need people to collaborate with.

Connect Hub provides a structured environment for projects, hackathons, teammates, and peer-to-peer skill exchange.

---

## 👥 TeamUp — Projects & Hackathons

Students can post projects and find teammates based on the roles and skills they need.

Projects can contain:

- Project title
- Description
- Category
- Required roles
- Team capacity
- Current members
- Missing roles

Students can discover projects posted by other students and request to join.

### Why?

Finding teammates often happens through random messages, friend groups, or last-minute WhatsApp posts.

TeamUp turns that process into a structured discovery system.

Instead of:

> "Anyone good at UI?"

students can discover projects where their skills are actually needed.

---

# 🧠 Deterministic Team Matching

PULSE includes a deterministic matching system for finding compatible teammates.

Matching considers:

- **Skills — 50%**
- **Availability — 30%**
- **Interests — 20%**

The scoring logic is intentionally transparent.

Instead of giving students an unexplained recommendation, PULSE makes the matching criteria understandable.

### Why deterministic matching?

Important product decisions should be predictable and explainable.

The same inputs should produce consistent results.

---

# 🔁 SkillSwap

SkillSwap enables students to exchange skills with each other.

Instead of only asking:

> "Who can join my project?"

students can also ask:

> "What can I teach someone, and what can I learn from them?"

This creates a peer-to-peer learning and collaboration layer inside the campus ecosystem.

---

# 🏆 Campus Events & Hackathons

PULSE allows students to create and discover campus activities such as:

- Hackathons
- Workshops
- Competitions
- Meetups
- Campus events

Events can contain information such as dates, categories, descriptions, updates, and confirmations.

### Goal

Make campus opportunities easier to discover instead of relying entirely on scattered announcements.

---

# 👤 Profile & Settings

Students have a profile and settings area for managing their campus identity and preferences.

This provides a consistent experience across the academic and collaboration parts of PULSE.

---

# 🧩 Product Philosophy

PULSE is built around several principles.

## 1. One campus, one workspace

Academic planning and campus collaboration shouldn't feel like completely separate products.

---

## 2. Action over information

Showing a student twenty pieces of information isn't useful if they still don't know what to do next.

PULSE focuses on turning information into actionable next steps.

---

## 3. Deterministic where possible

Important business logic is handled through predictable application logic.

Matching, project state, roles, and other product rules are not dependent on an opaque AI decision.

This makes the system easier to understand, test, and debug.

---

## 4. Recovery matters

Students will fall behind.

A useful productivity system should help students recover rather than simply reminding them about everything they haven't completed.

---

# 🏗️ Architecture

At a high level:

```text
                         ┌─────────────────┐
                         │     Student     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    PULSE Web    │
                         │     Next.js     │
                         └────────┬────────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                     ▼                         ▼
             ┌────────────────┐       ┌────────────────┐
             │ Product Logic  │       │ Authentication │
             │ & Matching     │       │    & Session   │
             └───────┬────────┘       └───────┬────────┘
                     │                        │
                     └────────────┬───────────┘
                                  ▼
                         ┌─────────────────┐
                         │    Supabase     │
                         │   PostgreSQL    │
                         │      + RLS      │
                         └─────────────────┘

---

## Architecture & Design Philosophy

The frontend handles the user experience while application logic handles deterministic product rules. Supabase provides the persistent backend, authentication, database, and row-level security.

A core design principle of PULSE is to **keep important product decisions deterministic rather than letting an AI model decide them**. This makes features such as matching, deadlines, planning, and recovery predictable and explainable.

---

## 🧩 Core Features

### 🤝 Connect Hub — TeamUp & SkillSwap

PULSE helps students find people they can actually work with instead of relying on random group chats.

#### TeamUp

- Create project listings for hackathons and campus projects.
- Define the team size and required roles.
- Specify the skills needed for a project.
- Discover students who match the required role.
- Request to join projects.
- Invite compatible candidates directly.
- Track team capacity and filled positions.

#### Deterministic Matching

Candidates are ranked using a transparent scoring model:

- **50% — Skills overlap**
- **30% — Availability**
- **20% — Shared interests**

This avoids the "AI says you're a perfect match 🤖" black-box approach and gives the matching system predictable behavior.

#### SkillSwap

- Students can offer skills they know.
- Students can discover peers who have useful skills.
- Supports peer-to-peer learning and collaboration.
- Encourages students to exchange knowledge rather than simply consume it.

---

### 📅 Campus Events

The Events system gives students a single place to discover and participate in campus activities.

Students can:

- Browse upcoming events.
- View event details.
- See event capacity.
- Join events.
- Track participation.
- View event activity and confirmations.

The system uses Supabase persistence and database-level access control so event data remains consistent across sessions.

---

### ⏰ Deadline Radar

Deadline Radar is designed around one simple idea:

> **Students shouldn't have to remember everything themselves.**

It provides a centralized view of important academic deadlines and helps students understand what needs attention next.

The goal is to turn a collection of scattered dates into an actionable timeline.

---

### 📚 Study Planner

The Study Planner helps convert academic work into structured study sessions.

Students can:

- Create study plans.
- Organize subjects and tasks.
- Track upcoming work.
- Manage study sessions.
- Work from their own real data instead of relying on fake demo plans.

PULSE intentionally avoids automatically filling a new account with artificial exam data. A new user starts with a clear empty state and can build their own plan.

---

### 🔄 Recovery Mode

Recovery Mode is built for the inevitable situation where a student falls behind.

Instead of treating a missed task as failure, PULSE helps reorganize what remains and focus on the next actionable step.

The intention is to make academic planning **recoverable rather than perfection-dependent**.

---

### 🎓 What Did I Miss?

Campus information is often fragmented across announcements, events, deadlines, and other activities.

"What Did I Miss?" provides students with a quick catch-up experience so they can understand what happened and what requires their attention.

---

### 👤 Profile & Trust

PULSE includes student profiles containing relevant information for collaboration, such as:

- Academic information
- Skills
- Interests
- Availability
- Collaboration information
- Trust/reputation signals

Trust indicators help students make better decisions when choosing collaborators.

---

## 🔐 Authentication & Security

PULSE uses **Supabase Authentication** for user identity and **Row Level Security (RLS)** for database access control.

The application follows the principle that users should only be able to perform actions they are authorized to perform.

Public frontend configuration uses environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

---

## 🗄️ Database

The backend is powered by **Supabase PostgreSQL**.

The database contains the persistent data required for:

- Users and profiles
- Projects
- Project roles
- Team requests
- Skills
- Skill offers
- Skill sessions
- Events
- Event updates
- Event confirmations
- Class recaps
- Exams
- Syllabus topics
- Study sessions
- Reputation events
- Badges
- User badges

Database changes are maintained through ordered Supabase migrations located in:

```text
supabase/migrations/
```

The migrations should be applied in numerical order when setting up the project from scratch.

---

## 🏗️ Architecture & Design Philosophy

The frontend handles the user experience while application logic handles deterministic product rules.

Supabase provides:

- Persistent backend storage
- PostgreSQL database
- Authentication
- Row Level Security (RLS)

A core design principle of PULSE is to **keep important product decisions deterministic rather than letting an AI model decide them**.

This makes features such as:

- Matching
- Deadlines
- Study planning
- Recovery
- Reputation

more predictable and explainable.

AI can be useful for future experiences such as summarization or assistance, but the core product rules should remain understandable and controllable.

---

## 🛠️ Tech Stack

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend

- **Supabase**
- **PostgreSQL**
- **Supabase Authentication**
- **Row Level Security**
- **Supabase migrations**

### Development

- **Node.js**
- **npm**
- **TypeScript**
- **ESLint**
- **Git**
- **GitHub**

### Deployment

- **Vercel**
- **Supabase**

---

## 📁 Project Structure

```text
PULSE/
└── app/
    ├── docs/
    ├── public/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   └── lib/
    ├── supabase/
    │   └── migrations/
    ├── .env.example
    ├── .gitignore
    ├── next.config.ts
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.mjs
    ├── README.md
    └── tsconfig.json
```

The project keeps application code, database migrations, documentation, and configuration separated so the repository remains understandable and maintainable.

---

## 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/Harsh2865/PULSE.git
```

Enter the application directory:

```bash
cd PULSE/app
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```text
.env.local
```

Add the required Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🧪 Verification

The project was verified using:

```bash
npm test
npx tsc --noEmit
npm run build
```

The project passed:

- Automated tests
- TypeScript validation
- Production build verification

The application was also manually tested across its major workflows, including:

- Events
- Hackathons
- Connect Hub
- Study Planner
- Recovery Mode
- Reputation
- Profile
- Form validation

---

## 🌐 Deployment

PULSE is deployed using Vercel.

### Live Application

https://pulse-puce-six.vercel.app/

### Vercel Deployment

https://vercel.com/harsh-b659/pulse/135Y2jku7RxF9x756UxjCjJfKUuq

### GitHub Repository

https://github.com/Harsh2865/PULSE

---

## 🎥 Demo Video

A short demonstration of the PULSE platform:

https://youtu.be/VnnMx-12ATw

The video demonstrates the major product workflows and the overall purpose of the platform.

---

## 💡 Why PULSE?

University life already has too many disconnected systems.

One group chat has a hackathon.

Another has an event announcement.

A professor posts a deadline somewhere else.

Someone needs a teammate.

Someone else knows the exact skill they're looking for.

A student misses a class and needs the notes.

Someone falls behind on their study schedule.

PULSE brings these workflows together.

The goal isn't to build another productivity dashboard.

The goal is to create a **student operating layer** that helps answer:

> **What should I do next, who should I do it with, and how do I recover when things don't go according to plan?**

---

## 🚧 Future Improvements

Potential future directions include:

- Smarter project discovery
- More advanced peer-to-peer skill matching
- Calendar integrations
- Notifications and reminders
- Richer academic analytics
- Campus-wide integrations
- Improved reputation mechanisms
- More detailed badge progression
- Mobile/PWA experience
- More personalized recovery recommendations
- AI-assisted class recap generation
- AI-assisted academic summarization

These are future possibilities and are not required for the current MVP.

---

## 🎓 Built For Students

PULSE was created as a campus-focused product designed to help students:

- **Connect** with the right people
- **Organize** academic responsibilities
- **Collaborate** on projects
- **Discover** campus opportunities
- **Share** academic knowledge
- **Recover** when they fall behind
- **Build** trust within their campus community

The overall goal is simple:

> **Turn campus chaos into your next move.**

---

## 📌 Project Links

| Resource | Link |
|---|---|
| 🌐 Live Application | https://pulse-puce-six.vercel.app/ |
| 💻 GitHub Repository | https://github.com/Harsh2865/PULSE |
| 🎥 Demo Video | https://youtu.be/VnnMx-12ATw |
| ▲ Vercel Deployment | https://vercel.com/harsh-b659/pulse/135Y2jku7RxF9x756UxjCjJfKUuq |

---

## 📄 License

This project is currently provided for educational and hackathon purposes.
