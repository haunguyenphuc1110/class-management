# Class Management

A web app for managing classes, students, teachers, enrollments, and subscriptions — built with Next.js 16 and Prisma.

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn

### Setup

```bash
# Install dependencies
yarn install

# Set up the database (runs existing migrations)
yarn prisma migrate deploy

# Generate the Prisma client
yarn prisma generate
```

### Environment

Create a `.env` file in the project root (one is already included):

```env
DATABASE_URL="file:./prisma/dev.db"
```

### Run

```bash
# Development
yarn dev

# Production build
yarn build
yarn start
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
class-management/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── dev.db                 # SQLite database file
│   └── migrations/            # Migration history
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Dashboard
│   │   ├── layout.tsx         # Root layout (sidebar + main)
│   │   │
│   │   ├── parents/           # Parents pages
│   │   ├── students/          # Students pages
│   │   ├── classes/           # Classes + weekly schedule
│   │   └── subscriptions/     # Subscription management
│   │
│   │   └── api/               # REST API routes
│   │       ├── parents/
│   │       ├── students/
│   │       ├── teachers/
│   │       ├── classes/
│   │       ├── enrollments/
│   │       ├── subscriptions/
│   │       └── sessions/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── sidebar.tsx    # Navigation sidebar
│   │   └── ui/                # Reusable UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       └── textarea.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Shared utilities (cn)
│   │
│   └── generated/
│       └── prisma/            # Auto-generated Prisma client (do not edit)
│
├── prisma.config.ts           # Prisma CLI config (loads DATABASE_URL)
├── next.config.ts
└── tsconfig.json
```

---

## Architecture

### Frontend

Pages follow the **server + client component** pattern:

- **Server component** (`page.tsx`) — fetches data directly via Prisma and passes it as props
- **Client component** (`*-client.tsx`) — handles interactivity, local state, and API calls for mutations

UI is built with [Tailwind CSS v4](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com)-style components using [Base UI](https://base-ui.com) primitives.

### Backend

API routes live under `src/app/api/` following REST conventions:

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/parents` | GET, POST | List and create parents |
| `/api/parents/[id]` | PATCH | Update a parent |
| `/api/students` | GET, POST | List and create students |
| `/api/students/[id]` | PATCH | Update a student |
| `/api/teachers` | GET, POST | List and create teachers |
| `/api/classes` | GET, POST | List and create classes |
| `/api/classes/[id]` | DELETE | Delete a class (cascades enrollments) |
| `/api/enrollments` | GET, POST, DELETE | Manage student-class enrollments |
| `/api/subscriptions` | GET, POST | List and create subscriptions |
| `/api/subscriptions/[id]` | PATCH | Update subscription status |
| `/api/sessions` | GET, POST | List and record sessions |
| `/api/sessions/[id]` | DELETE | Delete a session |

### Database

SQLite via [Prisma ORM](https://www.prisma.io) with the `better-sqlite3` adapter.

**Models:**

| Model | Description |
|-------|-------------|
| `Parent` | Guardian contact information |
| `Student` | Student profile, linked to a parent |
| `Teacher` | Teacher profile |
| `Class` | Weekly recurring class with schedule and capacity |
| `Enrollment` | Links a student to a class |
| `Subscription` | Student plan (dates, amount, session count) |
| `Session` | Individual attended session record |

---

## Database Commands

```bash
# Apply migrations (production / fresh setup)
yarn prisma migrate deploy

# Create a new migration after schema changes (development)
yarn prisma migrate dev --name <migration-name>

# Regenerate the Prisma client after schema changes
yarn prisma generate

# Open Prisma Studio (visual database browser)
yarn prisma studio
```
