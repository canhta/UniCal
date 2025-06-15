# Admin Layout Plan (Frontend - MVP)

This plan outlines tasks for creating the main layout and navigation for the Admin Panel MVP.

## Core Layout Component (`/components/admin/layout/AdminLayout.tsx`)
- [x] Create `AdminLayout` component.
    - [x] It should include a sidebar for navigation and a main content area.
    - [x] It should also include a header, possibly for global search and user menu.
- [x] Implement responsive design for the layout.

## Sidebar Navigation (`/components/admin/layout/AdminSidebar.tsx`)
- [x] Create `AdminSidebar` component.
- [x] Navigation links based on `Admin_FRD_MVP.md` sections:
    - [x] Dashboard (FR-GEN-002-MVP)
    - [x] Client User Management (FR-CUSER-*)
    - [x] Admin User Management (FR-AUSER-*) (Super Admin only)
    - [x] Subscription Plans (FR-SUB-001-MVP)
    - [x] Audit Logs (FR-GEN-004-MVP)
- [x] Implement RBAC for navigation links (e.g., Admin User Management visible to Super Admins only).
    - [x] Use session/user role data to conditionally render links.
- [x] Style active navigation links.

## Header (`/components/admin/layout/AdminHeader.tsx`)
- [x] Create `AdminHeader` component.
- [x] Include Global Search bar (FR-GEN-003-MVP).
    - [x] Input field for search query.
    - [ ] Logic to trigger search API call (to `GET /admin/search/clients`) and display/navigate to results (e.g., a dropdown list of users, each linking to `/admin/users/clients/[id]`).
- [x] Include Admin User Menu.
    - [x] Display logged-in admin user's name/email.
    - [x] Logout button.
    - [x] Link to profile/settings (if any for MVP).

## Admin Panel App Layout (`/app/admin/layout.tsx`)
- [x] Create the main layout file for the `/admin` route.
- [x] Use `AdminLayout` component to wrap admin pages.
- [x] Implement route protection: ensure only authenticated admin users can access routes under `/admin`.
    - [x] Redirect to admin login page if not authenticated.
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
