# Overview

This is a phishing simulation and awareness training platform built as a full-stack web application. The system allows security professionals to create and manage phishing campaigns, send targeted emails, track user interactions, and analyze security awareness metrics. It supports multiple campaign types including Office 365, Gmail, and custom phishing scenarios with comprehensive bot detection and session tracking capabilities.

**Project Status**: Successfully migrated to Replit environment (September 9, 2025)
- ✅ Node.js dependencies installed and configured
- ✅ PostgreSQL database set up and schema applied
- ✅ Database connection updated from Neon serverless to standard PostgreSQL
- ✅ Application running on port 5000 with proper security practices
- ✅ Client/server separation verified and maintained

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interface components
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both dark and light modes
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

**Key Design Decisions**:
- Component-based architecture with reusable UI components
- File-based routing structure with dedicated pages for each major feature
- Centralized query client configuration for consistent API interaction patterns
- Theme provider for dynamic light/dark mode switching

## Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js
- **Database Layer**: Drizzle ORM with PostgreSQL using Neon serverless database
- **Session Management**: Express sessions with PostgreSQL session store
- **File Handling**: Multer middleware for handling file uploads (email attachments, recipient lists)
- **Authentication**: BCrypt for password hashing with simplified authentication middleware

**API Design**:
- RESTful API endpoints organized by feature domain
- Centralized error handling middleware
- Request logging middleware for API monitoring
- Type-safe database schemas shared between frontend and backend

## Database Architecture

**ORM**: Drizzle with PostgreSQL dialect for type-safe database operations
- **Schema Design**: Relational model with proper foreign key relationships
- **Key Entities**: Users, Campaigns, Email Templates, SMTP Servers, Recipients, Sessions, Campaign Assets, Telegram Settings
- **Migration Strategy**: Schema-first approach with automatic migration generation

**Database Relationships**:
- Users own multiple campaigns, email templates, and SMTP servers
- Campaigns have multiple recipients and sessions
- Sessions track user interactions with phishing attempts
- SMTP servers can be marked as active for email sending

## Development Architecture

**Build System**: 
- Vite for frontend development with React plugin and runtime error overlay
- ESBuild for backend compilation and bundling
- TypeScript compilation checking across the entire codebase

**Module Resolution**:
- Path aliases for clean imports (@/, @shared/, @assets/)
- Shared schema definitions between frontend and backend
- Monorepo structure with client/, server/, and shared/ directories

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with WebSocket support for real-time connections
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **Radix UI**: Comprehensive set of accessible React components (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Utility for creating variant-based component styles
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **TypeScript**: Type checking and compilation across the entire stack

## Authentication and Security
- **BCrypt**: Password hashing for secure user authentication
- **Multer**: File upload handling with size limits and validation

## Email and Communication
- **SMTP Integration**: Custom SMTP server configuration for email sending
- **Telegram Integration**: Bot notification system for campaign alerts

## Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation library for type-safe data validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Date and Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional className utility
- **cmdk**: Command palette component for enhanced UX