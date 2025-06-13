# Admin Admin Users Plan (Frontend - MVP)

This plan outlines tasks for implementing the Admin Panel User Management UI for the Admin Panel MVP. These features are accessible to **Super Admins only**.

## Admin User List Page (`/app/(admin)/users/admins/page.tsx`)
- **FR-AUSER-001-MVP: View Admin User List**
    - [ ] Create the main component for displaying the list of Admin Panel administrators.
    - [ ] This page and its functionalities must be protected and accessible only to Super Admins.
    - [ ] Fetch admin user data from `GET /admin/users/admins`.
    - [ ] Display users in a table with columns: Admin User ID, Full Name, Email, Role (Super Admin, Admin), Status (Active, Inactive).
    - [ ] Implement pagination if necessary (API should support it).
    - [ ] Add a "Create Admin User" button navigating to the create admin user form/page.

## Create Admin User Form/Page (e.g., `/app/(admin)/users/admins/new/page.tsx`)
- **FR-AUSER-002-MVP: Create Admin User**
    - [ ] Create a form for adding a new Admin Panel administrator.
    - [ ] Fields: Full Name, Email Address.
    - [ ] Field: Admin Role (Dropdown: `Super Admin`, `Admin`).
    - [ ] Implement form validation (required fields, valid email, unique email check via backend).
    - [ ] On submit, call `POST /admin/users/admins`.
        - [ ] Backend handles Auth0 invitation flow.
    - [ ] Display success/error messages. Redirect to admin user list on success.

## Update Admin User Form/Page (e.g., `/app/(admin)/users/admins/[id]/edit/page.tsx`)
- **FR-AUSER-003-MVP: Update Admin User (Role & Status)**
    - [ ] Create a form/page for editing Admin Panel administrator details.
    - [ ] Pre-fill form with existing admin user data fetched from `GET /admin/users/admins/:id` (or use data from list view if navigating directly).
    - [ ] Editable fields:
        - [ ] Role (Dropdown: `Super Admin`, `Admin`).
        - [ ] Status (Dropdown: `Active`, `Inactive`).
    - [ ] Implement logic to prevent a Super Admin from deactivating their own account or changing their own role if they are the sole Super Admin (backend should enforce, frontend can provide UX).
    - [ ] On submit, call `PUT /admin/users/admins/:id`.
    - [ ] Display success/error messages. Redirect to admin user list or detail view on success.

## General
- [ ] **RBAC Enforcement:** Strictly ensure all routes and components related to admin user management are accessible only by users with the `Super Admin` role. Check session/user role on page load and for actions.
- [ ] Data Fetching: Use an API client utility, handle loading and error states for all API interactions.
- [ ] Styling: Use Tailwind CSS for a consistent admin UI.
