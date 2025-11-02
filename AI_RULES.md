# AI Rules for Karaoke Lovable Project

This document outlines the core technologies used in this project and provides guidelines for using specific libraries and tools.

## Tech Stack Overview

*   **Frontend Framework**: React with TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS for utility-first styling
*   **UI Components**: shadcn/ui (built on Radix UI) for accessible and customizable components
*   **Routing**: React Router DOM for client-side navigation
*   **Data Fetching & State Management**: TanStack Query for server state management
*   **Backend as a Service (BaaS)**: Supabase for database, authentication, and storage
*   **Icons**: Lucide React for vector icons
*   **Form Management**: React Hook Form with Zod for schema validation
*   **Notifications**: Sonner for toast notifications
*   **Audio Processing**: `pitchy`, `music-metadata-browser`, and `wavesurfer.js` for audio analysis and visualization.

## Library Usage Rules

To maintain consistency and leverage the strengths of the existing codebase, please adhere to the following rules when making changes or adding new features:

*   **UI Components**: Always prioritize `shadcn/ui` components. If a specific component is not available or requires significant customization, create a new, small component using Tailwind CSS. Do not modify existing `shadcn/ui` component files directly.
*   **Styling**: Use Tailwind CSS exclusively for all styling. Avoid inline styles or separate CSS files unless absolutely necessary for a third-party library that doesn't support Tailwind.
*   **Routing**: Use `react-router-dom` for all navigation within the application. Keep route definitions centralized in `src/App.tsx`.
*   **State Management**:
    *   For server-side data fetching, caching, and synchronization, use **TanStack Query**.
    *   For simple component-level state, use React's `useState` or `useReducer`.
*   **Backend Interactions**: All interactions with the database, storage, or edge functions should be done using the **Supabase client** (`@supabase/supabase-js`).
*   **Icons**: Use icons from the **Lucide React** library.
*   **Forms**: Implement forms using **React Hook Form** for state management and validation. Use **Zod** for defining form schemas and `@hookform/resolvers` for integration.
*   **Notifications**: For displaying temporary messages (toasts), use **Sonner**.
*   **Audio Analysis**:
    *   For real-time pitch detection from microphone input, use `pitchy`.
    *   For extracting metadata from audio files (e.g., title, artist, duration), use `music-metadata-browser`.
    *   For displaying interactive audio waveforms, use `wavesurfer.js`.
*   **Date Manipulation**: Use `date-fns` for any date formatting or manipulation tasks.
*   **Utility Functions**: For combining CSS classes, use `clsx` and `tailwind-merge` via the `cn` utility function in `src/lib/utils.ts`.
*   **File Structure**:
    *   New pages should go into `src/pages/`.
    *   New reusable components should go into `src/components/`.
    *   Hooks should go into `src/hooks/`.
    *   Utility functions should go into `src/utils/`.