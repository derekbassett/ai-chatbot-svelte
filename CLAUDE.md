# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit AI chatbot template built with the AI SDK by Vercel. The application enables interactive chat with AI models (primarily OpenAI models) with features like chat history, file attachments, and user authentication.

## Key Technologies

- SvelteKit + Svelte 5
- AI SDK by Vercel for language model integration
- Tailwind CSS with shadcn-svelte components
- Drizzle ORM with PostgreSQL (Vercel Postgres/Neon)
- Vercel Blob for file storage

## Development Commands

```bash
# Install dependencies
pnpm install

# Generate database client
pnpm db:generate

# Run development server
pnpm dev

# Build the project
pnpm build

# Format code
pnpm format

# Lint code
pnpm lint

# Type checking
pnpm check

# Database operations
pnpm db:migrate    # Apply migrations
pnpm db:studio     # Open Drizzle studio
pnpm db:push       # Push schema changes
pnpm db:pull       # Pull schema changes
```

## Architecture

### Directory Structure

- `/src/lib/` - Core components and utilities
  - `/src/lib/components/` - UI components including chat interface
  - `/src/lib/server/` - Server-side code
  - `/src/lib/server/db/` - Database models and queries
  - `/src/lib/server/ai/` - AI model configurations and prompts
  - `/src/lib/utils/` - Shared utilities

- `/src/routes/` - SvelteKit routes
  - `/(auth)/` - Authentication routes
  - `/(chat)/` - Chat interface and API routes
  - `/api/` - Backend API endpoints

### Key Components

1. **Authentication System**
   - User registration and login with password authentication
   - Session management

2. **Chat Interface**
   - Real-time message streaming
   - Support for attachments
   - Message history persistence
   - Message up/down voting

3. **AI Integration**
   - Integrated with OpenAI models through AI SDK
   - Support for different model selections
   - System prompts management

4. **Database**
   - User data and authentication
   - Chat history storage
   - Document/attachment storage

## Environment Variables

The following environment variables are required and should be set in a `.env` file (not committed to the repository) or through Vercel environment variables:

```
# OpenAI API Key (required)
OPENAI_API_KEY=****

# Database connection
POSTGRES_URL=****

# Blob storage
BLOB_READ_WRITE_TOKEN=****
```

## Important Implementation Notes

1. AI model configurations are defined in `/src/lib/server/ai/models.ts` and can be extended with additional providers.

2. New chat flows should integrate with the existing database schema in `/src/lib/server/db/schema.ts` which includes users, sessions, chats, messages, and documents.

3. The primary chat implementation is in `/src/routes/(chat)/api/chat/+server.ts` which handles message streaming and database persistence.