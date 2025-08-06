# SEO Content Rewriter Application

## Overview

This is a full-stack web application designed to rewrite content for SEO optimization using AI models (Google Gemini 2.5-flash or OpenAI GPT-4o). The application takes original content and a target keyword, then generates SEO-optimized content using simple, accessible language with metadata, featured image suggestions, FAQ sections, and **real case studies with authentic links** optimized for RankMath plugin compatibility.

## User Preferences

- Preferred communication style: Simple, everyday language
- Content rewriting style: Accessible language that anyone can understand (avoid technical jargon, use conversational tone)
- Link policy: Link keyword only once in the first mention, never repeat links for the same keyword
- **Case Studies**: Must use real, authentic case studies with verified links to official sources (no fake or placeholder data)

## Recent Changes (January 2025)

✓ **Database Integration**: Implemented PostgreSQL database with Drizzle ORM for data persistence
✓ **Configuration Management**: Added AI provider configuration system (OpenAI/Gemini) with secure API key storage
✓ **Rewrite History**: Implemented complete history tracking with statistics and analytics
✓ **Enhanced Schema**: Updated data models for configs, users, and rewrite history with proper relations
✓ **API Endpoints**: Created comprehensive REST API for config management, history, and statistics
✓ **Real Case Studies Integration**: Added authentic Brazilian business case studies with verified links
✓ **Database Migration**: Successfully migrated from in-memory to persistent PostgreSQL storage
✓ **Backup Recovery**: Restored project from GitHub backup with full functionality (January 24, 2025)
✓ **Google's 12 Quality Criteria Implementation**: Complete integration of all Google content quality standards (January 24, 2025)
  - Helpfulness scoring and optimization
  - Quality metrics with real-time assessment
  - E-A-T (Experience, Expertise, Authority, Trustworthiness) evaluation
  - Advanced structure and formatting analysis
  - AI-search optimization for modern search engines
  - Rich content suggestions (graphics, infographics, visual elements)
  - Citations and evidence with credibility scoring
  - Internal linking optimization with relevance scoring
  - Entity optimization (brands, people, locations, concepts)
  - Schema markup suggestions for structured data
  - Enhanced interface with visual progress bars and detailed analytics
  - Comprehensive scoring system with average quality metrics
✓ **Universal E-E-A-T Implementation**: Fixed nicho-specific limitations to ensure ALL content receives credibility elements (January 24, 2025)
  - Case studies now universal for ALL niches (not limited to specific sectors)
  - Credible sources mandatory for ALL content types
  - Expert mentions required universally across all topics
  - Entity optimization applied to ALL niches without exception
  - Enhanced prompts with explicit universal application instructions
✓ **Dynamic Case Study System**: Implemented intelligent case study selection based on content niche (January 30, 2025)
  - Automatic niche detection from content and keywords (e-commerce, marketing, fintech, saúde, educação, etc.)
  - Real-time web search integration for authentic Brazilian business cases
  - Dynamic case study generation relevant to specific business sectors
  - Verified links and authentic company data instead of static examples
✓ **Valid Internal Links System**: Created comprehensive internal link validation and generation (January 30, 2025)
  - Automatic generation of valid internal links based on content context
  - Smart link structure using company domain or fallback patterns
  - Contextual anchor text optimization for relevance scoring
  - Elimination of placeholder and invalid link suggestions

## System Architecture

The application follows a modern full-stack architecture with a clear separation between frontend and backend:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Integration**: OpenAI GPT-4o for content rewriting
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reload with tsx and Vite middleware

## Key Components

### Core Services
1. **OpenAI Service** (`server/services/openai.ts`): Handles AI-powered content rewriting with specific SEO prompts and integrated web search
2. **Gemini Service** (`server/services/gemini.ts`): Alternative AI service for content rewriting using Google's Gemini with dynamic case studies
3. **Dynamic Case Study Service** (`server/services/dynamicCaseStudyService.ts`): Intelligent case study generation using real-time web search, niche detection, and authentic Brazilian business data
4. **Case Study Service** (`server/services/caseStudyService.ts`): Legacy service providing fallback case studies with verified links
5. **API Routes** (`server/routes.ts`): RESTful endpoints with integrated web search functionality for dynamic content generation
6. **Schema Validation** (`shared/schema.ts`): Shared validation schemas between client and server

### UI Components
- **Home Page** (`client/src/pages/home.tsx`): Main interface for content input and results display
- **Shadcn/ui Components**: Complete UI component library for consistent design
- **Form Controls**: Input validation with real-time feedback and character counting

### Data Flow
1. User inputs original content and target keyword
2. Frontend validates input using Zod schemas
3. Request sent to `/api/rewrite` endpoint
4. Backend detects business niche from content and keyword analysis
5. System performs real-time web search for authentic Brazilian case studies in the detected niche
6. Valid internal links are generated based on content context and company domain
7. Backend processes content through AI API (OpenAI or Gemini) with dynamic data integration
8. AI generates optimized content with niche-specific case studies, verified links, meta description, image suggestions, FAQ, and custom CTA
9. Results displayed in organized sections with authentic case studies and functional internal links

## External Dependencies

### AI Integration
- **OpenAI API**: GPT-4o model for content generation
- **Environment Variables**: `OPENAI_API_KEY` or `OPENAI_API_KEY_ENV_VAR` required

### Database Configuration
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: Neon Database serverless PostgreSQL
- **Migrations**: Drizzle Kit for schema management
- **Note**: Database setup is configured but not actively used in current implementation

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Backend**: Express server with tsx for TypeScript execution
- **Port Configuration**: Frontend proxies API requests to backend

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both frontend and API

### Environment Variables
- `NODE_ENV`: Environment setting (development/production)
- `DATABASE_URL`: PostgreSQL connection string (for future database features)
- `OPENAI_API_KEY`: OpenAI API authentication

### Build Process
1. `npm run build`: Builds both frontend (Vite) and backend (esbuild)
2. `npm start`: Runs production server
3. `npm run dev`: Development mode with hot reload

The application is optimized for deployment on platforms like Replit, with specific configurations for the Replit environment including cartographer plugin integration and runtime error overlay for development.