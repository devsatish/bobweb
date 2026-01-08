# BobWeb - Your Friendly Home Desktop

A room-based "home desktop" web app inspired by Microsoft Bob. Navigate rooms, click objects, and let an AI assistant help you manage your digital life.

## Features

- **Room Navigation**: Move between Living Room, Office, and Kitchen
- **Interactive Objects**: Click objects to open apps (Calendar, Notes, To-Dos, Photos, Contacts)
- **AI Assistant**: BobBot helps you create notes, add tasks, and schedule events
- **Accessibility**: High contrast mode, large text, reduced motion, simplified mode
- **OAuth Authentication**: Sign in with Google or Facebook

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI / shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **AI**: OpenAI API
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials
- Facebook OAuth credentials (optional)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bobweb.git
   cd bobweb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with:
   - Database connection string
   - OAuth credentials
   - OpenAI API key
   - Auth secret

5. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret key |
| `AUTH_URL` | Application URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth client ID |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth client secret |
| `OPENAI_API_KEY` | OpenAI API key for AI assistant |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/        # Authenticated routes
│   │   ├── home/           # Home/room selector
│   │   ├── rooms/[roomId]/ # Individual room view
│   │   └── settings/       # User settings
│   ├── api/                # API routes
│   │   ├── ai/             # AI chat and tools
│   │   ├── auth/           # NextAuth handlers
│   │   ├── notes/          # Notes CRUD
│   │   ├── todos/          # Todos CRUD
│   │   ├── events/         # Calendar events CRUD
│   │   ├── photos/         # Photos CRUD
│   │   └── contacts/       # Contacts CRUD
│   └── auth/signin/        # Sign-in page
├── components/
│   ├── ai/                 # AI assistant components
│   ├── objects/            # Object/app components
│   ├── rooms/              # Room view components
│   ├── providers/          # Context providers
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions
├── store/                  # Zustand store
└── types/                  # TypeScript types
```

## AI Assistant Tools

BobBot can:
- Create notes (`create_note`)
- Create to-do items (`create_todo`)
- Create calendar events (`create_calendar_event`)
- Get upcoming events (`get_upcoming_events`)
- Get to-do items (`get_todos`)

## Accessibility Features

- **High Contrast Mode**: Increased color contrast
- **Large Text Mode**: Larger text throughout the app
- **Reduced Motion**: Minimized animations
- **Simplified Mode**: Fewer objects per room
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and landmarks

## License

MIT
