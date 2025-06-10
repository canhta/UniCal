# UI Components Plan (Phase 1 & Beyond)

This plan outlines the development of common UI components for the UniCal frontend.

## Core Principles
*   **Reusability:** Components should be generic and reusable across the application.
*   **Accessibility (A11y):** Build with accessibility in mind from the start, leveraging Headless UI where appropriate.
*   **Styling:** Use Tailwind CSS for styling.
*   **Props:** Define clear and well-typed props for each component.

## Phase 1: Basic Essential Components

*   **[ ] Button (`apps/frontend/src/components/ui/Button.tsx`)**
    *   **FRD Ref:** Used throughout all interactive elements.
    *   **Requirements:**
        *   Variants: primary, secondary, danger, outline, ghost, link.
        *   Sizes: small, medium, large.
        *   Optional icons (leading/trailing).
        *   Loading state.
        *   Disabled state.
    *   **Tech:** Tailwind CSS, Headless UI (potentially for focus management if complex).
*   **[ ] Input (`apps/frontend/src/components/ui/Input.tsx`)**
    *   **FRD Ref:** Used in login forms (FR3.1.0), event creation (FR3.4.1), etc.
    *   **Requirements:**
        *   Standard text input.
        *   Types: text, email, password, number, date (consider native date picker or a library later).
        *   Optional label, helper text, error message display.
        *   Disabled state.
        *   Optional leading/trailing icons.
    *   **Tech:** Tailwind CSS, Headless UI (potentially for form control accessibility).
*   **[ ] Card (`apps/frontend/src/components/ui/Card.tsx`)**
    *   **Requirements:**
        *   Basic container with padding and shadow.
        *   Optional header and footer sections.
    *   **Tech:** Tailwind CSS.

## Phase 2 & 3: Advanced & Contextual Components

*   **[ ] Modal (`apps/frontend/src/components/ui/Modal.tsx`)**
    *   **FRD Ref:** Event details (FR3.3.4), event creation/editing (FR3.4.1, FR3.4.3), delete confirmation (FR3.4.4).
    *   **Requirements:**
        *   Overlay.
        *   Title, content, footer sections.
        *   Close button (icon and/or explicit button).
        *   Dismiss on ESC, dismiss on overlay click.
        *   Accessible (focus trapping, ARIA attributes).
    *   **Tech:** Tailwind CSS, Headless UI (`Dialog`).
*   **[ ] Dropdown (`apps/frontend/src/components/ui/Dropdown.tsx`)**
    *   **FRD Ref:** Target calendar selection (FR3.4.1), view selectors (Day/Week/Month - FR3.3.1).
    *   **Requirements:**
        *   Trigger button.
        *   Menu with selectable items.
        *   Accessible (keyboard navigation).
    *   **Tech:** Tailwind CSS, Headless UI (`Menu`).
*   **[ ] Toggle/Switch (`apps/frontend/src/components/ui/Toggle.tsx`)**
    *   **FRD Ref:** Calendar visibility toggle (FR3.3.3), All-day event (FR3.4.1).
    *   **Requirements:**
        *   On/off states.
        *   Accessible.
    *   **Tech:** Tailwind CSS, Headless UI (`Switch`).
*   **[ ] Checkbox (`apps/frontend/src/components/ui/Checkbox.tsx`)**
    *   **FRD Ref:** Calendar selection for sync (FR3.5.4).
    *   **Requirements:**
        *   Standard checkbox functionality.
        *   Optional label.
        *   Accessible.
    *   **Tech:** Tailwind CSS.
*   **[ ] Avatar/UserIcon (`apps/frontend/src/components/ui/Avatar.tsx`)**
    *   **Requirements:**
        *   Display user initials or an image.
        *   Different sizes.
    *   **Tech:** Tailwind CSS.
*   **[ ] Spinner/LoadingIndicator (`apps/frontend/src/components/ui/Spinner.tsx`)**
    *   **Requirements:**
        *   Visual indicator for loading states.
        *   Different sizes.
    *   **Tech:** Tailwind CSS (can be simple CSS animation).
*   **[ ] Alert/Notification (`apps/frontend/src/components/ui/Alert.tsx`)**
    *   **FRD Ref:** Sync status/error notifications (FR3.9.3 - basic on page), general app notifications.
    *   **Requirements:**
        *   Different types (info, success, warning, error).
        *   Optional title and dismiss button.
        *   (Consider a toast system for global notifications later - `STATE_MANAGEMENT_PLAN.md`).
    *   **Tech:** Tailwind CSS.

## Directory Structure
All common UI components will reside in `apps/frontend/src/components/ui/`. Each component will typically have its own file (e.g., `Button.tsx`).

## Implementation Notes
*   Start with the most essential components needed for Phase 1 and 2 features (Login, Basic Layout).
*   Prioritize functionality and accessibility.
*   Write Storybook stories for each component for isolated development and testing (Post-MVP or if time permits during initial phases).
