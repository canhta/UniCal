# UI Components Plan

This plan outlines the development of common UI components for the UniCal frontend.

## Core Principles
*   **Reusability & Composability:** Components should be generic, composable, and reusable across the application.
*   **Accessibility (A11y):** Build with accessibility in mind from the start, adhering to WCAG guidelines. Leverage Headless UI for complex interactive components.
*   **Styling:** Use Tailwind CSS for styling, ensuring a consistent visual language.
*   **Props API:** Define clear, well-typed, and predictable props for each component.
*   **Developer Experience:** Components should be easy to use and integrate. Consider Storybook for development and documentation.

## Component List & Phasing

**Directory:** `apps/frontend/src/components/ui/`

### Phase 1: Foundational UI Elements (Essential for Core Features)

*   **[ ] Button (`Button.tsx`)**
    *   **FRD Ref:** Used throughout all interactive elements.
    *   **Requirements:**
        *   Variants (visual styles): `primary`, `secondary`, `danger`, `outline`, `ghost`, `link`.
        *   Sizes: `sm`, `md` (default), `lg`.
        *   Optional icons (leading/trailing, using an `icon` prop or children).
        *   Loading state (visual indicator, disable interaction).
        *   Disabled state (visual style, `aria-disabled`).
        *   Full width option.
        *   Support for `type="button" | "submit" | "reset"`.
    *   **Tech:** Tailwind CSS. Consider `asChild` prop pattern for composition with `<Link>` etc.
*   **[ ] Input (`Input.tsx`)** (and related form elements)
    *   **FRD Ref:** Login (FR3.1.0), event creation (FR3.4.1), settings.
    *   **Requirements:**
        *   Types: `text`, `email`, `password`, `number`, `search`, `tel`, `url`.
        *   (Separate components for `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx`, `RadioGroup.tsx` planned below).
        *   Optional embedded label or standalone `<Label />` component.
        *   Display of helper text and error messages (associated via `aria-describedby`).
        *   Disabled and readonly states.
        *   Optional leading/trailing icons or elements.
        *   Sizes: `sm`, `md`, `lg`.
    *   **Tech:** Tailwind CSS.
*   **[ ] Label (`Label.tsx`)**
    *   **Requirements:** Associated with form inputs using `htmlFor`.
    *   **Tech:** Tailwind CSS.
*   **[ ] Card (`Card.tsx`)**
    *   **Requirements:**
        *   Basic container with configurable padding, border, shadow.
        *   Optional `CardHeader`, `CardContent`, `CardFooter` sub-components or props for structured content.
    *   **Tech:** Tailwind CSS.
*   **[ ] Spinner (`Spinner.tsx`)**
    *   **Requirements:** Visual indicator for loading states. Various sizes. Centering options.
    *   **Tech:** Tailwind CSS (SVG or CSS animation).

### Phase 2: Interactive & Overlay Components

*   **[ ] Modal (`Modal.tsx`)**
    *   **FRD Ref:** Event details (FR3.3.4), event creation/editing (FR3.4.1, FR3.4.3), delete confirmation (FR3.4.4).
    *   **Requirements:**
        *   Accessible dialog (focus trapping, `aria-modal`, `aria-labelledby`, `aria-describedby`).
        *   Overlay (backdrop) with click-to-dismiss option.
        *   ESC key to dismiss.
        *   Configurable size/width.
        *   Sections for `ModalHeader`, `ModalBody`, `ModalFooter` (e.g., for action buttons).
        *   Control over open/close state via props.
    *   **Tech:** Tailwind CSS, Headless UI (`Dialog`).
*   **[ ] DropdownMenu (`DropdownMenu.tsx`)**
    *   **FRD Ref:** User profile menu (Navbar), view selectors (FR3.3.1), action menus on items.
    *   **Requirements:**
        *   Trigger element (e.g., button).
        *   Accessible menu (`role="menu"`, keyboard navigation).
        *   Menu items, separators, optional icons in items.
        *   Sub-menus (if complexity demands later).
    *   **Tech:** Tailwind CSS, Headless UI (`Menu`).
*   **[ ] ToggleSwitch (`ToggleSwitch.tsx`)**
    *   **FRD Ref:** Calendar visibility (FR3.3.3), All-day event (FR3.4.1), settings toggles.
    *   **Requirements:** Accessible switch (`role="switch"`, `aria-checked`). Label association.
    *   **Tech:** Tailwind CSS, Headless UI (`Switch`).
*   **[ ] Checkbox (`Checkbox.tsx`)**
    *   **FRD Ref:** Calendar selection for sync (FR3.5.4), task lists.
    *   **Requirements:** Accessible checkbox. Optional label. Indeterminate state.
    *   **Tech:** Tailwind CSS.
*   **[ ] Avatar (`Avatar.tsx`)**
    *   **Requirements:** Display user initials or an image. Fallback to initials if image fails. Different sizes. Optional status indicator.
    *   **Tech:** Tailwind CSS.
*   **[ ] Alert (`Alert.tsx`)**
    *   **FRD Ref:** Sync status/error notifications (FR3.9.3), form validation summaries, general info messages.
    *   **Requirements:**
        *   Variants: `info`, `success`, `warning`, `error`.
        *   Optional title, icon, and dismiss button.
        *   ARIA roles (e.g., `role="alert"`).
    *   **Tech:** Tailwind CSS.

### Phase 3: More Specialized & Utility Components

*   **[ ] Tooltip (`Tooltip.tsx`)**
    *   **Requirements:** Show contextual information on hover/focus. Accessible (`aria-describedby`).
    *   **Tech:** Tailwind CSS, Headless UI (potentially, or a lightweight tooltip library if Headless UI doesn't cover it directly, e.g. Floating UI).
*   **[ ] DatePicker (`DatePicker.tsx`)**
    *   **FRD Ref:** Event start/end dates (FR3.4.1).
    *   **Requirements:** Select single dates, date ranges. Keyboard navigable. Localization.
    *   **Tech:** This can be complex. Evaluate options:
        *   Styling a native date picker (limited).
        *   A dedicated library like `react-datepicker` or `react-day-picker`, styled with Tailwind.
        *   Headless UI (if a date picker primitive becomes available or can be composed).
*   **[ ] Select (`Select.tsx`)** (Custom styled select)
    *   **FRD Ref:** Timezone selection, recurrence options (FR3.4.1).
    *   **Requirements:** Accessible custom select dropdown. Searchable if many options.
    *   **Tech:** Tailwind CSS, Headless UI (`Listbox` or `Combobox`).
*   **[ ] Tabs (`Tabs.tsx`)**
    *   **FRD Ref:** Potentially for settings pages or complex views.
    *   **Requirements:** Accessible tab interface (`role="tablist"`, `role="tab"`, `role="tabpanel"`).
    *   **Tech:** Tailwind CSS, Headless UI (`Tab`).
*   **[ ] Breadcrumbs (`Breadcrumbs.tsx`)**
    *   **Requirements:** Navigational aid. List of links showing path to current page.
    *   **Tech:** Tailwind CSS, Next.js `<Link>`.
*   **[ ] Pagination (`Pagination.tsx`)**
    *   **Requirements:** For paginated lists if needed.
    *   **Tech:** Tailwind CSS.

## Storybook Integration (Recommended)
*   **[ ] Setup Storybook:** `npx storybook@latest init` (after initial components are built).
*   **[ ] Write Stories:** Create `*.stories.tsx` files for each UI component.
    *   Demonstrate different variants, states, and props.
    *   Helps with isolated development, testing, and documentation.

## Implementation Notes
*   Start with Phase 1 components as they are foundational.
*   Prioritize functionality, accessibility, and clear props over complex styling initially.
*   For each component, consider its states (hover, focus, active, disabled, loading).
*   Ensure Tailwind CSS classes are applied consistently and follow project conventions.
*   Write unit tests for components, especially for logic within them (e.g., state changes, event handlers if not purely presentational).
