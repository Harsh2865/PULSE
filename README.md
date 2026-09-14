# ⚡ PULSE

> **Turn campus chaos into your next move.**

PULSE is a student-focused campus operating platform that brings **academic planning, deadlines, recovery, campus events, hackathons, projects, teammates, and peer-to-peer collaboration** into one connected workspace.

College life is not just assignments and exams.

Students constantly deal with:

- 📚 Exams and study plans
- ⏰ Deadlines and academic workload
- 🎓 Missed classes and catch-up work
- 🏆 Hackathons and campus events
- 🤝 Finding teammates for projects
- 🔄 Falling behind and recovering
- 🧠 Learning and exchanging skills with peers

PULSE connects these workflows so students can spend less time figuring out **what to do next** and more time actually doing it.

---

## 🚀 Links

| Resource | Link |
|---|---|
| 🌐 **Live Application** | https://pulse-puce-six.vercel.app/ |
| 💻 **GitHub Repository** | https://github.com/Harsh2865/PULSE |
| 🎥 **Demo Video** | https://youtu.be/VnnMx-12ATw |
| ▲ **Vercel Deployment** | https://vercel.com/harsh-b659/pulse/135Y2jku7RxF9x756UxjCjJfKUuq |

---

# 🎯 The Problem

Student life is fragmented across too many disconnected systems.

A student might have:

- An exam approaching
- Multiple assignments due
- A hackathon this weekend
- A project that needs another teammate
- Classes they missed
- A study plan that no longer works
- An event they want to attend
- A schedule that suddenly becomes impossible to manage

Usually, these problems are handled using completely different tools.

Calendars handle dates.

Task managers handle tasks.

WhatsApp groups handle teammates.

College portals handle academics.

Event groups handle hackathons.

And the student has to connect everything themselves.

### PULSE brings these workflows together.

Instead of forcing students to ask:

> "Where do I find this information?"

PULSE focuses on a more useful question:

> **"Given everything happening around me, what should I do next?"**

---

# ✨ Features

## 📊 Dashboard

The Dashboard acts as the student's central campus command center.

It provides an overview of academic and campus activity so students can quickly understand what needs attention.

### Goal

Turn scattered information into a clear starting point.

---

## ⏰ Deadline Radar

Deadline Radar provides a centralized view of important academic deadlines.

Students can see upcoming work and identify what requires attention.

### Why it matters

Deadlines become difficult to manage when they are spread across subjects, classes, and different platforms.

Deadline Radar turns scattered dates into an actionable timeline.

---

## 📚 Study Planner

The Study Planner helps students organize academic preparation around their real workload.

Students can:

- Create study plans
- Organize subjects and tasks
- Create study sessions
- Track upcoming academic work
- Manage their own study data

PULSE intentionally avoids automatically filling new accounts with artificial exam data.

New users start with a clear empty state and can create their own real study plans.

### Design principle

> **A study plan should adapt to a student's life, not become another source of stress.**

---

## 🔄 Recovery Mode

Falling behind is part of student life.

Recovery Mode is designed for situations where the original study plan is no longer realistic.

Instead of simply reminding students about everything they missed, Recovery Mode focuses on helping them regain control and work through what remains.

### The idea

> **A bad week shouldn't become a bad semester.**

The goal is to make academic planning **recoverable rather than perfection-dependent**.

---

## 🎓 What Did I Miss?

Students miss classes, announcements, events, and academic activity.

"What Did I Miss?" provides a catch-up experience that helps students understand what happened while they were away and what requires their attention.

### Goal

Reduce the gap between:

> "I missed something."

and:

> **"I know what I need to do now."**

---

# 🤝 Connect Hub

Connect Hub extends PULSE beyond academics into student collaboration.

It provides structured workflows for:

- Projects
- Hackathons
- Team formation
- Skill exchange
- Peer collaboration

The goal is to replace random group-chat searching with structured campus discovery.

---

## 👥 TeamUp — Projects & Hackathons

Students can create project listings and find teammates based on the skills and roles they need.

Projects can include:

- Project title
- Description
- Category
- Required roles
- Required skills
- Team capacity
- Current members
- Missing roles

Students can discover projects posted by other students and request to join.

Project creators can also invite compatible candidates directly.

### Why TeamUp?

Finding teammates often looks like:

> "Anyone good at UI?"

or:

> "Need one Python developer ASAP."

TeamUp turns that into structured discovery.

Instead of searching randomly, students can discover projects where their skills are actually needed.

---

# 🧠 Deterministic Team Matching

PULSE includes a transparent matching system for identifying compatible teammates.

Candidate scores are calculated using:

| Factor | Weight |
|---|---:|
| 🛠️ Skills overlap | **50%** |
| ⏱️ Availability | **30%** |
| 💡 Shared interests | **20%** |

### Why deterministic matching?

Important product decisions should be:

- Predictable
- Explainable
- Testable
- Consistent

The same inputs should produce consistent results.

Instead of:

> "AI says you're a 94% match 🤖"

PULSE uses explicit scoring rules that can be understood and verified.

---

# 🔁 SkillSwap

SkillSwap enables peer-to-peer knowledge exchange.

Students can:

- Offer skills they know
- Discover useful skills from peers
- Find potential learning partners
- Exchange knowledge
- Build connections beyond project teams

The idea is simple:

> **Don't just find people to build with. Find people to learn from.**

---

# 🏆 Campus Events & Hackathons

PULSE provides a centralized space for discovering campus activities.

Events can include:

- Hackathons
- Workshops
- Competitions
- Meetups
- Campus activities

Students can:

- Browse upcoming events
- View event details
- Check event capacity
- Join events
- Track participation
- View updates and confirmations

### Goal

Make campus opportunities easier to discover instead of relying entirely on scattered announcements and group chats.

---

# 👤 Profile & Trust

Student profiles provide relevant information for academic and collaborative experiences.

Profiles can include:

- Academic information
- Skills
- Interests
- Availability
- Collaboration information
- Reputation signals

Trust and reputation signals help students make more informed decisions when collaborating with peers.

---

# 🏆 Reputation & Badges

PULSE includes reputation events and badges to encourage reliable participation within the campus community.

The system can represent signals such as:

- Collaboration
- Participation
- Skill exchange
- Community contribution

The goal is not simply to create another points system.

It is to gradually build **trust between students who may not already know each other**.

---

# 🧩 Product Philosophy

PULSE is built around four core principles.

## 1. One campus, one workspace

Academic planning and campus collaboration should not feel like completely separate products.

PULSE connects both sides of student life.

---

## 2. Action over information

Showing students twenty pieces of information is not useful if they still don't know what to do next.

PULSE focuses on turning information into actionable next steps.

---

## 3. Deterministic where possible

Important business logic is handled through predictable application logic.

Matching, project state, roles, deadlines, planning, recovery, and other product rules should not depend on an opaque AI decision.

This makes the system easier to:

- Understand
- Test
- Debug
- Explain

---

## 4. Recovery matters

Students will fall behind.

A useful productivity system should help them recover instead of simply reminding them about everything they haven't completed.

---

# 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │     Student      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    PULSE Web     │
                         │     Next.js      │
                         │      React       │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          ┌──────────────────┐        ┌──────────────────┐
          │  Product Logic   │        │ Authentication   │
          │ & Deterministic  │        │    & Session     │
          │    Matching      │        │                  │
          └─────────┬────────┘        └─────────┬────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     Supabase     │
                         │    PostgreSQL    │
                         │       + RLS      │
                         └──────────────────┘
                         ---
                         ## 🧠 Architecture & Design Philosophy

The frontend handles the user experience while application logic handles deterministic product rules.

Supabase provides:

- Persistent backend storage
- PostgreSQL database
- Authentication
- Row Level Security
- Database migrations

A core design principle of PULSE is:

> **Keep important product decisions deterministic rather than letting an AI model decide them.**

This applies to areas such as:

- Team matching
- Deadline prioritization
- Study planning
- Recovery planning
- Project roles and capacity
- Reputation
- Access control

The goal is to make important product behavior **predictable, explainable, and testable**.

For example, TeamUp matching uses a transparent scoring model instead of an opaque AI-generated recommendation:

- **50% — Skills overlap**
- **30% — Availability**
- **20% — Shared interests**

This means the same inputs produce consistent results, while students can understand why a particular candidate was ranked highly.

### Design Philosophy

PULSE follows four main principles:

1. **One campus, one workspace**  
   Academic planning, collaboration, events, and peer learning should work together rather than exist as isolated tools.

2. **Action over information**  
   The goal is not to show students more dashboards. The goal is to help them understand what deserves attention next.

3. **Deterministic where it matters**  
   Core product rules should be controlled by application logic rather than unpredictable AI decisions.

4. **Recovery over perfection**  
   Students will inevitably fall behind. PULSE is designed to help them recover and move forward instead of making missed tasks feel like failure.

---

## 🛠️ Tech Stack

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend & Database

- **Supabase**
- **PostgreSQL**
- **Supabase Authentication**
- **Row Level Security (RLS)**
- **Supabase Database Migrations**

### Development & Quality

- **Node.js**
- **npm**
- **TypeScript**
- **ESLint**
- **Git**
- **GitHub**

### Deployment

- **Vercel** — frontend/application hosting
- **Supabase** — authentication and database infrastructure

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
    ---
    ## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Harsh2865/PULSE.git
```

### 2. Enter the application directory

```bash
cd PULSE/app
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a local environment file:

```text
.env.local
```

Add the required Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

> `.env.local` is intentionally excluded from GitHub. Do not commit your environment file or private credentials.

### 5. Set up the database

The repository contains the Supabase database migrations in:

```text
supabase/migrations/
```

Apply the migrations in numerical order when setting up the project from scratch.

### 6. Start the development server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

### 7. Production build

To verify the application can be built for production:

```bash
npm run build
```

To start the production server after building:

```bash
npm start
```

---

## 🧪 Verification

PULSE was verified using:

```bash
npm test
npx tsc --noEmit
npm run build
```

The project passed:

- Automated tests
- TypeScript validation
- Production build verification

Major workflows were also manually tested, including:

- Dashboard
- Events
- Hackathons
- Connect Hub
- TeamUp
- SkillSwap
- Study Planner
- Recovery Mode
- Deadline Radar
- What Did I Miss?
- Reputation
- Profile
- Form validation

---

## 🌐 Deployment

PULSE is deployed using **Vercel**, with **Supabase** providing authentication and database infrastructure.

### Live Application

https://pulse-six-phi.vercel.app/

### GitHub Repository

https://github.com/Harsh2865/PULSE

### Vercel Deployment

https://vercel.com/harsh-b659/pulse/135Y2jku7RxF9x756UxjCjJfKUuq

---

## 🎥 Demo

Watch the 3-minute product demonstration:

https://youtu.be/VnnMx-12ATw

The demo showcases the core PULSE experience, including academic planning, campus collaboration, events, and the student workflow the platform is designed around.

---

## 💡 Why PULSE?

University life already has too many disconnected systems.

One group chat has a hackathon.

Another has an event announcement.

A professor posts a deadline somewhere else.

Someone needs a teammate.

Someone else has the exact skill they are looking for.

A student misses a class and needs to catch up.

Another student falls behind on their study schedule.

The information exists — but it is scattered.

PULSE brings these workflows together into one student-focused workspace.

The goal isn't to build another productivity dashboard.

The goal is to create a **student operating layer** that helps answer three questions:

> **What should I do next?**  
> **Who should I do it with?**  
> **How do I recover when things don't go according to plan?**

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

PULSE was created as a campus-focused platform designed to help students:

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
| 🌐 Live Application | https://pulse-six-phi.vercel.app/ |
| 💻 GitHub Repository | https://github.com/Harsh2865/PULSE |
| 🎥 Demo Video | https://youtu.be/VnnMx-12ATw |
| ▲ Vercel Deployment | https://vercel.com/harsh-b659/pulse/135Y2jku7RxF9x756UxjCjJfKUuq |

---

## 📄 License

This project is currently provided for educational and hackathon purposes.