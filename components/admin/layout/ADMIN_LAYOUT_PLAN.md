# Admin Layout Plan (Frontend - MVP)

This plan outlines tasks for creating the main layout and navigation for the Admin Panel MVP.

## Core Layout Component (`/components/admin/layout/AdminLayout.tsx`)
- [ ] Create `AdminLayout` component.
    - [ ] It should include a sidebar for navigation and a main content area.
    - [ ] It should also include a header, possibly for global search and user menu.
- [ ] Implement responsive design for the layout.

## Sidebar Navigation (`/components/admin/layout/AdminSidebar.tsx`)
- [ ] Create `AdminSidebar` component.
- [ ] Navigation links based on `Admin_FRD_MVP.md` sections:
    - [ ] Dashboard (FR-GEN-002-MVP)
    - [ ] Client User Management (FR-CUSER-*)
    - [ ] Admin User Management (FR-AUSER-*) (Super Admin only)
    - [ ] Subscription Plans (FR-SUB-001-MVP)
    - [ ] Audit Logs (FR-GEN-004-MVP)
- [ ] Implement RBAC for navigation links (e.g., Admin User Management visible to Super Admins only).
    - [ ] Use session/user role data to conditionally render links.
- [ ] Style active navigation links.

## Header (`/components/admin/layout/AdminHeader.tsx`)
- [ ] Create `AdminHeader` component.
- [ ] Include Global Search bar (FR-GEN-003-MVP).
    - [ ] Input field for search query.
    - [ ] Logic to trigger search API call (to `GET /admin/search/clients`) and display/navigate to results (e.g., a dropdown list of users, each linking to `/admin/users/clients/[id]`).
- [ ] Include Admin User Menu.
    - [ ] Display logged-in admin user's name/email.
    - [ ] Logout button.
    - [ ] Link to profile/settings (if any for MVP).

## Admin Panel App Layout (`/app/(admin)/layout.tsx`)
- [ ] Create the main layout file for the `/admin` route group.
- [ ] Use `AdminLayout` component to wrap admin pages.
- [ ] Implement route protection: ensure only authenticated admin users can access routes under `/admin`.
    - [ ] Redirect to admin login page if not authenticated.
    - [ ] Potentially check for admin role and redirect if a non-admin user attempts access.

## Global Search Implementation (FR-GEN-003-MVP)
- [ ] Connect search bar input to an API call to the backend search endpoint (`GET /admin/search/clients`) using the API client.
- [ ] Display search results (e.g., in a dropdown below the search bar). Each result should show client user's Name and Email.
- [ ] Each search result item should be a link navigating to the respective client user's detail view (e.g., `/admin/users/clients/[id]`).
- [ ] Handle "no results found" state.

## Styling
- [ ] Apply consistent styling using Tailwind CSS, adhering to a clean and professional look suitable for an admin interface.

## General Notes:
- Ensure consistent error handling and display of user feedback (loading states, success/error messages) for all interactions.
- Identify opportunities for reusable UI components (e.g., tables, modals, form elements) and consider adding them to a shared admin UI library (`/components/admin/ui/`).
