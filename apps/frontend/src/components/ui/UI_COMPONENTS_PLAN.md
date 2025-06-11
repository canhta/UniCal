<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/frontend/src/components/ui/UI_COMPONENTS_PLAN.md -->
# UI Components Plan (Frontend)

**Overall Goal:** Develop a comprehensive, reusable, accessible, and consistently styled set of UI components using Tailwind CSS and Headless UI to build the UniCal frontend.

## 1. Core Principles & AI Agent Actionables

*   **[ ] Goal:** Maximize reusability and composability.
    *   **Action:** AI will design components to be generic and easily combined.
*   **[ ] Goal:** Ensure high accessibility (A11y) standards.
    *   **Action:** AI will adhere to WCAG guidelines, using semantic HTML and ARIA attributes. Headless UI will be leveraged for interactive components (Modals, Dropdowns, Toggles, etc.).
*   **[ ] Goal:** Maintain consistent styling with Tailwind CSS.
    *   **Action:** AI will use Tailwind CSS for all component styling, following project conventions.
*   **[ ] Goal:** Define clear, typed props APIs.
    *   **Action:** AI will use TypeScript to define props for each component.
*   **[ ] Goal (Post-Initial Setup):** Integrate Storybook for development and documentation.
    *   **Action:** AI will set up Storybook and write stories for components once a foundational set is built.

## 2. Component Development Plan

**Directory:** `apps/frontend/src/components/ui/`

**General AI Actions for Each Component:**
*   Create the component file (e.g., `Button.tsx`).
*   Implement functionality and variants as specified.
*   Apply Tailwind CSS for styling.
*   Ensure accessibility (ARIA roles, keyboard navigation, focus management).
*   Define TypeScript props.
*   Consider `cva` (Class Variance Authority) for managing variant styles if complexity grows.
*   Consider `tailwind-merge` and `clsx` for robust class name composition.

### Phase 1: Foundational UI Elements

*   **[ ] Component: `Button.tsx`**
    *   **Needs:** Variants (`primary`, `secondary`, `danger`, `outline`, `ghost`, `link`), sizes (`sm`, `md`, `lg`), icons, loading/disabled states, `asChild` prop for composition (e.g., with Next.js `<Link>`).
*   **[ ] Component: `Input.tsx`**
    *   **Needs:** Standard input types, label association (via `Label.tsx`), helper/error text display, disabled/readonly states, icons, sizes.
*   **[ ] Component: `Label.tsx`**
    *   **Needs:** Association with inputs via `htmlFor`.
*   **[ ] Component: `Card.tsx`** (and sub-components like `CardHeader.tsx`, `CardContent.tsx`, `CardFooter.tsx` if preferred over props)
    *   **Needs:** Container with configurable padding, border, shadow. Structured content sections.
*   **[ ] Component: `Spinner.tsx`**
    *   **Needs:** Visual loading indicator, various sizes, centering.
*   **[ ] Component: `Alert.tsx`** (Moved to Phase 1 as it's crucial for user feedback, e.g., form errors, notifications)
    *   **Needs:** Variants (`info`, `success`, `warning`, `error`), optional title, icon, dismiss button, ARIA roles.

### Phase 2: Interactive & Overlay Components

*   **[ ] Component: `Modal.tsx`** (using Headless UI `Dialog`)
    *   **Needs:** Accessible dialog, overlay, ESC/click-outside dismiss, configurable size, header/body/footer sections.
*   **[ ] Component: `DropdownMenu.tsx`** (using Headless UI `Menu`)
    *   **Needs:** Trigger, accessible menu, items, separators, optional icons.
*   **[ ] Component: `ToggleSwitch.tsx`** (using Headless UI `Switch`)
    *   **Needs:** Accessible switch, label association.
*   **[ ] Component: `Checkbox.tsx`**
    *   **Needs:** Accessible checkbox, optional label, indeterminate state.
*   **[ ] Component: `Avatar.tsx`**
    *   **Needs:** Image display with fallback to initials, sizes, optional status indicator.
*   **[ ] Component: `Select.tsx`** (Custom styled select using Headless UI `Listbox` or `Combobox`)
    *   **Needs:** Accessible custom select, searchable option for `Combobox`.

### Phase 3: More Specialized & Utility Components

*   **[ ] Component: `Tooltip.tsx`** (Potentially using Headless UI `Popover` or Floating UI if more control needed)
    *   **Needs:** Contextual info on hover/focus, accessible.
*   **[ ] Component: `DatePicker.tsx`**
    *   **Needs:** Date selection (single/range), keyboard navigation, localization.
    *   **AI Action:** AI will evaluate and integrate a library like `react-day-picker` (recommended for its customizability with Tailwind and Headless UI compatibility for popovers) or `react-datepicker`.
*   **[ ] Component: `Textarea.tsx`** (Similar to `Input.tsx` but for multi-line text)
    *   **Needs:** Label association, helper/error text, disabled/readonly states, auto-resize option.
*   **[ ] Component: `Tabs.tsx`** (using Headless UI `Tab`)
    *   **Needs:** Accessible tab interface.
*   **[ ] Component: `Breadcrumbs.tsx`**
    *   **Needs:** Navigational aid, list of links.
*   **[ ] Component: `Pagination.tsx`**
    *   **Needs:** For paginated lists.
*   **[ ] Component: `RadioGroup.tsx`** (using Headless UI `RadioGroup`)
    *   **Needs:** Accessible radio button group, label association.

## 3. Storybook Integration (Post-Initial Component Set)

*   **[ ] Goal:** Visually test and document components in isolation.
    *   **AI Action:** AI will run `npx storybook@latest init`.
    *   **AI Action:** AI will create `*.stories.tsx` files for each UI component, demonstrating variants and states.

## Notes:
*   The AI agent will create these components iteratively, starting with Phase 1.
*   Accessibility will be a primary concern throughout development for each component.
*   Consider creating a shared `types.ts` within `components/ui` for common UI prop types if needed.
