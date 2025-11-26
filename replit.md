# SupplyShield - AI-Powered Supply Chain Risk Intelligence Platform

## Overview
SupplyShield is a context-aware vendor risk assessment platform that goes beyond generic security scores. It uses AI to analyze the specific products and services organizations use from each vendor to provide accurate, actionable risk intelligence.

## Current State
**MVP Status**: Complete - All core features implemented and tested

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (GPT-4o for risk analysis)
- **Auth**: Replit Auth (OpenID Connect)
- **Routing**: Wouter (frontend), Express (backend)

## Project Structure
```
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # Shadcn UI components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── metric-card.tsx
│   │   │   ├── risk-badge.tsx
│   │   │   ├── risk-heatmap.tsx
│   │   │   ├── theme-*.tsx
│   │   │   └── vendor-card.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app with routing
│   └── index.html
├── server/                 # Backend Express app
│   ├── db.ts              # Database connection
│   ├── index.ts           # Server entry
│   ├── openai.ts          # AI risk analysis
│   ├── replitAuth.ts      # Authentication
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database operations
├── shared/
│   └── schema.ts          # Drizzle schemas & types
└── design_guidelines.md   # UI/UX design system
```

## Database Schema
- **users**: User accounts (Replit Auth)
- **sessions**: Auth sessions
- **vendors**: Companies/suppliers to assess
- **vendor_products**: Products/services from vendors
- **risk_assessments**: AI-generated risk analysis
- **vulnerabilities**: Known security issues

## Key Features
1. **User Authentication**: Replit Auth with Google/GitHub/email support
2. **Vendor Management**: CRUD operations for vendors
3. **AI Risk Assessment**: GPT-4o powered analysis
4. **Risk Visualization**: Heatmaps and score breakdowns
5. **Dashboard**: Overview metrics and top risk vendors
6. **Dark/Light Mode**: Full theme support

## API Endpoints
- `GET /api/auth/user` - Get authenticated user
- `GET /api/dashboard/stats` - Dashboard metrics
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/top-risk` - Top risk vendors
- `GET /api/vendors/:id` - Vendor details with products/assessments
- `POST /api/vendors` - Create vendor
- `PATCH /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor
- `POST /api/vendors/:id/assess` - Run AI assessment
- `POST /api/vendors/:vendorId/products` - Add product

## Running the App
```bash
npm run dev          # Start development server
npm run db:push      # Push schema changes to database
```

## Recent Changes
- [Nov 26, 2025] MVP Complete - All 21 test steps passing
- Created complete MVP frontend with dashboard, vendor list, and detail views
- Implemented Replit Auth integration with secure session management (sameSite: lax)
- Added AI-powered risk assessment via OpenAI (billed to Replit credits)
- Set up PostgreSQL database with Drizzle ORM
- Created professional enterprise UI following design guidelines
- Full dark/light mode support with theme persistence

## User Preferences
- Dark mode support enabled
- Inter font for UI, JetBrains Mono for data/metrics
- Enterprise-focused visual design
