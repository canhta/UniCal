# Admin Client Users Plan (Frontend - MVP)

This plan outlines tasks for implementing the Client Application User Management UI for the Admin Panel MVP.

## Client User List Page (`/app/admin/users/clients/page.tsx`)
- **FR-CUSER-001-MVP: View Client User List**
    - [ ] Create the main component for displaying the list of client users.
    - [ ] Fetch client user data from `GET /admin/users/clients`.
    - [ ] Display users in a table with columns: User ID, Full Name, Email, Status (Active, Inactive, Pending Verification), Registration Date.
    - [ ] Implement pagination (API should support it).
    - [ ] Implement sorting for Name, Email, Status, Registration Date columns.
    - [ ] Implement basic filtering by Status (Active/Inactive).
    - [ ] Add a "Create User" button navigating to the create user form/page.

## Client User Detail View (e.g., `/app/admin/users/clients/[id]/page.tsx`)
- **FR-CUSER-002-MVP: View Client User Details**
    - [ ] Create a page/component to display detailed information for a specific client user.
    - [ ] Fetch data from `GET /admin/users/clients/:id`.
    - [ ] Display: User ID, Full Name, Email, Status, Registration Date, Last Login Date.
    - [ ] **FR-CRM-001-MVP: View Client User Contact Information**
        - [ ] Display Phone Number (if available) from user details.
    - [ ] **FR-SUB-002-MVP: View Client User Subscription Details**
        - [ ] Display associated Subscription Status (e.g., Active Plan Name, Trial, Canceled).
        - [ ] Display current and past subscriptions: Plan Name, Status, Start Date, End Date, Renewal Date.
        - [ ] Handle "No subscriptions found" message.
    - [ ] **FR-CRM-002-MVP: View Client User Basic Interaction Log**
        - [ ] Display a basic log: Account Created, Password Reset Requested, Subscription Started, Subscription Canceled (Timestamp, Event Type).
    - [ ] Provide buttons/links for actions:
        - [ ] "Edit User" (navigates to edit form).
        - [ ] "Activate/Deactivate User" (triggers status change).
        - [ ] "Delete User" (Super Admin only, triggers FR-CUSER-005-MVP).
        - [ ] "Cancel Subscription" (if active subscription exists, triggers FR-SUB-003-MVP).

## Create Client User Form/Page (e.g., `/app/admin/users/clients/new/page.tsx`)
- **FR-CUSER-003-MVP: Create Client User (Manual)**
    - [ ] Create a form for manually adding a new client user.
    - [ ] Fields: Full Name, Email Address, Initial Password (consider system-generated vs. admin-set with change on first login requirement).
    - [ ] Implement form validation (e.g., required fields, valid email format, unique email check via backend).
    - [ ] On submit, call `POST /admin/users/clients`.
    - [ ] Display success/error messages. Redirect to user list or detail view on success.

## Update Client User Form/Page (e.g., `/app/admin/users/clients/[id]/edit/page.tsx`)
- **FR-CUSER-004-MVP: Update Client User (Basic Info & Status)**
    - [ ] Create a form for editing client user details.
    - [ ] Pre-fill form with existing user data fetched from `GET /admin/users/clients/:id`.
    - [ ] Editable fields: Full Name, Phone Number.
    - [ ] Option to change user status (Active/Inactive) - perhaps a separate action button on detail view or a dropdown here.
    - [ ] On submit, call `PUT /admin/users/clients/:id`.
    - [ ] Display success/error messages. Redirect to detail view on success.

## Delete Client User Functionality (Super Admin Only)
- **FR-CUSER-005-MVP: Delete Client User**
    - [ ] Implement a confirmation dialog before deletion.
    - [ ] On confirmation, call `DELETE /admin/users/clients/:id`.
    - [ ] Display success/error message. Refresh user list or redirect.
    - [ ] Ensure this option is only visible/actionable for Super Admins.

## Cancel Subscription Functionality
- **FR-SUB-003-MVP: Cancel Client User Subscription (Admin Initiated)**
    - [ ] On the client user detail view, if an active subscription exists, provide a "Cancel Subscription" button.
    - [ ] Show a confirmation dialog with options: Immediate cancellation vs. Cancellation at end of billing period.
    - [ ] On confirmation, call `POST /admin/users/clients/:userId/subscriptions/:subscriptionId/cancel` (or similar backend endpoint).
    - [ ] Display success/error message. Refresh subscription details.

## General
- [ ] Data Fetching: Use an API client utility, handle loading and error states for all API interactions.
- [ ] Styling: Use Tailwind CSS for a consistent admin UI.
- [ ] RBAC: Ensure features like "Delete User" are restricted to Super Admins.
