# Admin Dashboard Plan (Frontend - MVP)

This plan outlines tasks for creating the Admin Dashboard UI for the Admin Panel MVP.

## Dashboard Page (`/app/(admin)/dashboard/page.tsx`)
- **FR-GEN-002-MVP: Admin Dashboard (Simplified)**
    - [ ] Create the main component for the Admin Dashboard page.
    - [ ] Fetch dashboard data from the backend API endpoint (`GET /admin/dashboard/stats`).

## Key Performance Indicators (KPIs)
- [ ] Display the following KPIs fetched from the backend:
    - [ ] Total number of client application users.
    - [ ] Number of new client user registrations in the last 7 days.
    - [ ] Total number of active client user subscriptions.
- [ ] Present KPIs clearly, possibly using cards or a summary section.

## Quick Links / Navigation
- [ ] Provide quick links/buttons for easy navigation to key admin sections:
    - [ ] Client User Management list view (`/admin/users/clients`).
    - [ ] Admin User Management list view (`/admin/users/admins`) (Super Admin only - conditionally render).
- [ ] Ensure links are functional and direct to the correct pages.

## Data Fetching and Display
- [ ] Implement logic to fetch KPI data when the dashboard page loads.
    - [ ] Use `useEffect` and an API client utility.
- [ ] Handle loading states while data is being fetched (e.g., display skeletons or loading spinners).
- [ ] Handle error states if data fetching fails (e.g., display an error message).
- [ ] Ensure data displayed is accurate and reflects the current state from the backend.

## Styling and Layout
- [ ] Design a clean and informative layout for the dashboard.
- [ ] Use Tailwind CSS for styling.
- [ ] Ensure the dashboard is responsive and usable on different screen sizes.

## RBAC Considerations
- [ ] Conditionally render elements like the link to "Admin User Management" based on the logged-in admin's role (Super Admin vs. Admin).
