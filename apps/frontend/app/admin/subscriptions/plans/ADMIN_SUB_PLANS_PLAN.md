# Admin Subscription Plans Plan (Frontend - MVP)

This plan outlines tasks for creating the UI to view subscription plans within the Admin Panel MVP.

## Subscription Plan List Page (`/app/admin/subscriptions/plans/page.tsx`)
- **FR-SUB-001-MVP: View Subscription Plan List**
    - [ ] Create the main component for displaying the list of available subscription plans.
    - [ ] Fetch subscription plan data from the backend API endpoint (`GET /admin/subscriptions/plans`).
    - [ ] Display plans in a table with columns:
        - [ ] Plan ID/Name
        - [ ] Description (brief)
        - [ ] Price
        - [ ] Billing Frequency (e.g., Monthly, Annually)
    - [ ] This view is **read-only** for MVP. No create, update, or delete functionality for plans.
    - [ ] Implement pagination if the number of plans is large (API should support it).

## Data Fetching and Display
- [ ] Implement logic to fetch subscription plan data when the page loads.
    - [ ] Use `useEffect` and an API client utility.
- [ ] Handle loading states while data is being fetched (e.g., display skeletons or loading spinners).
- [ ] Handle error states if data fetching fails (e.g., display an error message).
- [ ] Handle empty state if no subscription plans are available.

## Styling and Layout
- [ ] Design a clear and informative layout for displaying the list of plans.
- [ ] Use Tailwind CSS for styling.
- [ ] Ensure the page is responsive.

## RBAC Considerations
- [ ] This page should be accessible to both `Super Admin` and `Admin` roles as per FR-SUB-001-MVP.
