# NLP-Based Clinical Code Dictionary Web App

## Overview

This is a full-stack web application for searching and managing medical codes across multiple code systems (ICD-9, ICD-10, CPT, HCPCS, SNOMED, LOINC, and HCC). The application provides NLP-powered search capabilities, CSV upload functionality for bulk operations, and an admin interface for data management. Built with React frontend and Express backend, using TypeScript throughout.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom medical theme variables
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite with development optimizations

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Module System**: ES Modules (ESM)
- **Request Handling**: JSON and URL-encoded body parsing
- **File Uploads**: Multer with memory storage (10MB limit)
- **Error Handling**: Global error middleware with structured responses

### Data Storage
- **Primary Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with type-safe queries
- **Development Storage**: In-memory storage class for development/testing
- **Migration System**: Drizzle Kit for schema management

## Key Components

### Search System
- **Text Processing**: Basic NLP with tokenization and similarity scoring
- **Search Types**: Code-based, description-based, and bulk CSV search
- **Matching Algorithm**: Fuzzy matching with synonym support
- **Results Ranking**: Match scoring based on similarity and relevance

### File Processing
- **CSV Parser**: csv-parser library for data ingestion
- **Upload Types**: Data upload (adding codes) and search upload (bulk queries)
- **Validation**: Schema validation using Zod for data integrity
- **File Limits**: 10MB maximum file size with memory storage

### UI Components
- **Search Interface**: Advanced search with code type filtering
- **Results Display**: Sortable tables with export functionality
- **Admin Dashboard**: Statistics, data management, and system overview
- **Upload Interface**: Dual-purpose upload for data and search operations

## Data Flow

### Search Flow
1. User enters query in search interface
2. Query processed and validated on frontend
3. Backend receives search request with optional code type filter
4. Storage layer performs fuzzy matching against clinical codes
5. Results scored and ranked by relevance
6. Search history recorded for analytics
7. Results returned to frontend with metadata

### Upload Flow
1. User selects CSV file and upload type
2. File validated on frontend (size, type)
3. Multer processes file upload to memory
4. CSV parser streams and validates data
5. For data uploads: codes inserted into database
6. For search uploads: bulk search performed
7. Results returned with success/error status

### Admin Flow
1. Admin accesses dashboard
2. System statistics aggregated from database
3. Recent activity pulled from search history
4. Code management interface loads all records
5. Export functionality generates CSV from current data

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **csv-parser**: CSV file processing
- **multer**: File upload handling

### UI Libraries
- **@radix-ui/***: Headless UI components (20+ components)
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management
- **clsx** & **tailwind-merge**: Conditional styling utilities

### Development Tools
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundler for server code
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR for frontend
- **Backend**: tsx for TypeScript execution with file watching
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: Replit-optimized with custom plugins

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: esbuild bundles server to `dist/index.js`
- **Static Serving**: Express serves built React app
- **Database**: Production Neon PostgreSQL instance

### Database Management
- **Schema**: Defined in `shared/schema.ts` with Drizzle
- **Migrations**: Generated and applied via `drizzle-kit push`
- **Seeding**: In-memory storage includes sample data for development
- **Connection**: Environment variable `DATABASE_URL` required

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Port**: Configurable via environment or defaults to standard
- **File Storage**: Memory-based for uploads (suitable for serverless)