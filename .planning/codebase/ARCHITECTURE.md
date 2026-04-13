# 🏗️ Architecture

## System Overview
Sigmania is a real-time asset management dashboard for streamer signatures (Sigs). It follows a standard Next.js Client Component architecture for the main dashboard to handle high-frequency UI updates and complex upload logic.

## Key Architectural Patterns

### 1. Real-time Synchronization
- **Pattern**: Optimistic UI with Real-time Postgres Changes.
- **Implementation**: Dashboard subscribes to Supabase `postgres_changes` on the `files` table. Any DB change (upload, delete, edit) triggers an automatic re-fetch (`fetchFiles`).

### 2. Matching Logic (Intelligent Ingestion)
- **Pattern**: Dialogue-based matching for non-standard filenames.
- **Implementation**: 
  - Regex-based signature number extraction.
  - Interactive matching via `AssetMatchDialog` for files without leading numbers.
  - Multi-file set detection (matching name prefix across different extensions).

### 3. High-Density UI
- **Pattern**: Conditional rendering (Grid/List) with space-optimized components.
- **Components**:
  - `SigGridItem`: Optimized for visual scanning.
  - `SigTableRow`: Optimized for bulk data management.

## State Management
- **Local State**: `useState` for UI state (view mode, sort, search).
- **External State**: Supabase (Postgres) as the single source of truth.
