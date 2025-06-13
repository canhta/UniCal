# Admin Audit Logs Plan (Frontend - MVP)

This plan outlines tasks for creating the Audit Logs viewing interface for the Admin Panel MVP.

## Audit Logs Page (`/app/(admin)/audit-logs/page.tsx`)
- **FR-GEN-004-MVP: Audit Logs (Core User Actions)**
    - [ ] Create the main component for the Audit Logs page.
    - [ ] Fetch audit log data from the backend API endpoint (`GET /admin/audit-logs`).

## Displaying Audit Logs
- [ ] Display audit logs in a table or a list format.
- [ ] Each log entry should show:
    - [ ] Timestamp (UTC, formatted for readability).
    - [ ] Performing Admin User (Email or ID).
    - [ ] Action Performed (e.g., "Client User Created", "Admin Role Updated").
    - [ ] Affected User (ID or Email).
    - [ ] Relevant details (e.g., old/new status or role).
- [ ] Display logs in reverse chronological order (most recent first) by default.

## Filtering Audit Logs
- [ ] Implement basic filtering options:
    - [ ] Filter by Date Range (start date, end date).
        - [ ] Use date picker components for selecting dates.
    - [ ] Filter by Performing Admin User (e.g., a dropdown populated with admin users, or a text input for email/ID).
- [ ] Apply filters to the API request when fetching audit logs.
- [ ] Provide a "Clear Filters" or "Reset" option.

## Pagination
- [ ] Implement pagination for the audit log list if the number of logs is large.
- [ ] The backend API should support pagination; the frontend should pass page number and page size parameters.
- [ ] Display pagination controls (e.g., Next, Previous, page numbers).

## Data Fetching and Display
- [ ] Implement logic to fetch audit log data when the page loads and when filters or page change.
    - [ ] Use `useEffect` and an API client utility.
- [ ] Handle loading states while data is being fetched.
- [ ] Handle error states if data fetching fails.
- [ ] Handle empty state if no audit logs match the criteria.

## Styling and Layout
- [ ] Design a clear and readable layout for displaying audit logs and filter options.
- [ ] Use Tailwind CSS for styling.
- [ ] Ensure the page is responsive.

## RBAC Considerations
- [ ] This page should be accessible to both `Super Admin` and `Admin` roles as per FR-GEN-004-MVP (Actor: Super Admin, Admin (view only)).
