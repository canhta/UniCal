# UniCal Admin Panel - Functional Requirements Document (MVP)

## 1. Introduction

This document outlines the functional requirements for the Minimum Viable Product (MVP) of the UniCal Admin Panel. The MVP will focus on core functionalities essential for basic administration of the UniCal application. The requirements herein are intended to be specific and actionable for development by an AI agent or human developers.

## 2. Scope of MVP

The MVP will include the following core modules and features:

*   **User Management:** Basic lifecycle management for all system users (including client application users, Admin Panel administrators, and potential leads), incorporating a unified user table and role-based access control (RBAC) where users can have multiple roles.
*   **Lead Management:** Basic capture, viewing, and management of leads.
*   **General Admin Panel Features:** Essential features like an admin dashboard (simplified), global search (basic), and audit logging.
*   **Security:** Foundational security measures for admin authentication and authorization.
*   **Limited CRM Viewing:** Basic viewing of contact information related to users.
*   **Limited Subscription Viewing & Cancellation:** Basic viewing of subscription plans and user subscriptions, with admin-initiated cancellation.

**Out of Scope for MVP (Examples):**

*   Advanced CRM functionalities (e.g., creating/editing company records, complex segmentation, opportunity management beyond basic lead conversion).
*   Advanced Lead Management features beyond basic capture, status updates, and conversion.
*   Full Subscription Management (e.g., creating/editing plans, complex billing operations, dunning, coupon management).
*   Comprehensive Reporting & Analytics (beyond dashboard KPIs).
*   Content Management System (CMS).
*   Complex data migrations beyond core user and basic subscription data.
*   User self-service password reset for Admin Panel accounts (handled by Auth0).

## 3. Functional Requirements (MVP)

Each functional requirement includes:
*   **ID:** A unique identifier.
*   **Description:** A detailed explanation of the function.
*   **Actor(s):** The type of admin user(s) who will perform this function.
*   **Preconditions:** Conditions that must be true before the function can be executed.
*   **Postconditions:** The state of the system after the function is successfully executed.
*   **Acceptance Criteria (AC):** Specific, testable conditions that must be met for the requirement to be considered complete.

---

### 3.1. General Admin Panel Features (MVP)

*   **FR-GEN-001-MVP (Critical): Admin Login**
    *   **Description:** Admin Panel administrators must be able to securely log in to the Admin Panel.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User has an active Admin Panel account. Auth0 integration is configured.
    *   **Postconditions:** User is authenticated and redirected to the Admin Dashboard.
    *   **AC:**
        *   AC-1: Login page is accessible at `/admin/login`.
        *   AC-2: Users can authenticate using their email and password via Auth0.
        *   AC-3: Successful authentication redirects the user to the Admin Dashboard.
        *   AC-4: Failed authentication attempts display an appropriate error message.
        *   AC-5: MFA (if enabled for the user in Auth0) is enforced during login.

*   **FR-GEN-002-MVP (Critical): Admin Dashboard (Simplified)**
    *   **Description:** Provide a basic dashboard displaying essential KPIs and quick links.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged into the Admin Panel.
    *   **Postconditions:** Dashboard displays relevant information.
    *   **AC:**
        *   AC-1: Dashboard displays the following KPIs:
            *   Total number of client application users.
            *   Number of new client user registrations in the last 7 days.
            *   Total number of active client user subscriptions.
        *   AC-2: Dashboard provides quick links/navigation to:
            *   Client User Management list view.
            *   Admin User Management list view (Super Admin only).
        *   AC-3: Data for KPIs is accurate and reflects the current state of the system.

*   **FR-GEN-003-MVP (Critical): Global Search (Basic User/Lead Search)**
    *   **Description:** Allow administrators to locate user records (client users, admins) or lead records by name or email.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged into the Admin Panel.
    *   **Postconditions:** Search results are displayed, or a "no results found" message is shown.
    *   **AC:**
        *   AC-1: A search bar is prominently displayed in the Admin Panel header/navigation.
        *   AC-2: Administrators can enter a user's or lead's full or partial name or email address.
        *   AC-3: Search results display a list of matching users/leads, showing at least Name, Email, Type (User/Lead), and Status/Role(s).
        *   AC-4: Clicking on a search result navigates to the respective user's or lead's detail view.
        *   AC-5: If no users or leads match the search criteria, a clear "No results found" message is displayed.
        *   AC-6: Search is case-insensitive.

*   **FR-GEN-004-MVP (Critical): Audit Logs (Core User/Lead Actions)**
    *   **Description:** Maintain and display audit logs for critical actions related to user account and lead management.
    *   **Actor(s):** Super Admin, Admin (view only)
    *   **Preconditions:** User is logged in. Actions have been performed by administrators.
    *   **Postconditions:** Audit log entries are recorded and can be viewed.
    *   **AC:**
        *   AC-1: Audit logs are recorded for the following actions on user accounts: Create, Update (Status change, Role change), Delete.
        *   AC-2: Audit logs are recorded for lead actions: Create, Update (Status change), Convert to User, Delete.
        *   AC-3: Each log entry includes: Timestamp (UTC), Performing Admin User (Email or ID), Action Performed (e.g., "User Created", "Admin Role Assigned", "Lead Converted"), Affected User/Lead (ID or Email), and relevant details (e.g., old/new status or role(s)).
        *   AC-4: A dedicated page allows Super Admins and Admins to view audit logs.
        *   AC-5: Audit logs are displayed in reverse chronological order (most recent first).
        *   AC-6: Basic filtering of audit logs by date range and/or Performing Admin User is available.

---

### 3.2. User Management Module (MVP)

This module covers the management of all users within the UniCal system, utilizing a single user table. Users can be client application users, Admin Panel administrators, or other defined user types, and can possess multiple roles.

*   **FR-USER-001-MVP (Critical): View User List**
    *   **Description:** Allow administrators to view a paginated list of all system users.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in.
    *   **Postconditions:** List of users is displayed.
    *   **AC:**
        *   AC-1: A dedicated page displays a table of system users.
        *   AC-2: The table shows at least: User ID, Full Name, Email, Role(s) (e.g., Client, Admin, Super Admin), Status (e.g., Active, Inactive, Pending Verification), Registration Date.
        *   AC-3: The list is paginated if the number of users exceeds a predefined limit (e.g., 20 per page).
        *   AC-4: Administrators can sort the list by Name, Email, Status, and Registration Date.
        *   AC-5: Basic filtering by Status (Active/Inactive) and Role(s) is available.

*   **FR-USER-002-MVP (Critical): View User Details**
    *   **Description:** Allow administrators to view detailed information for a specific system user.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. User exists.
    *   **Postconditions:** User details are displayed.
    *   **AC:**
        *   AC-1: From the user list, an administrator can navigate to a detail view for a specific user.
        *   AC-2: The detail view displays: User ID, Full Name, Email, Assigned Role(s), Status, Registration Date, Last Login Date (if available). If the user has a 'Client' role, associated Subscription Status (e.g., Active Plan Name, Trial, Canceled) is also shown.
        *   AC-3: The detail view provides options to Edit User (basic info), Manage Roles, Activate/Deactivate User.

*   **FR-USER-003-MVP (Critical): Create User (Manual)**
    *   **Description:** Allow authorized administrators to manually create a new system user account and assign initial role(s).
    *   **Actor(s):** Super Admin, Admin (Admin role can create users with 'Client' role, Super Admin can create users with any role including 'Admin' or 'Super Admin').
    *   **Preconditions:** User is logged in.
    *   **Postconditions:** A new user account is created and set to 'Pending Verification' or 'Active' status. An audit log entry is created.
    *   **AC:**
        *   AC-1: A form is available to create a new user.
        *   AC-2: Required fields: Full Name, Email Address, Initial Password (system generated or admin set, with a requirement for user to change on first login if admin set).
        *   AC-3: Administrator must assign at least one role to the new user (e.g., 'Client', 'Admin'). Super Admins can assign 'Super Admin' role.
        *   AC-4: Email address must be unique among users.
        *   AC-5: Upon successful creation, the system can optionally send a welcome/verification email to the user. If an 'Admin' or 'Super Admin' role is assigned, the invitation might be handled via Auth0 flow.
        *   AC-6: The new user is added to the user list.
        *   AC-7: An appropriate success message is displayed. Error messages are shown for invalid input (e.g., duplicate email).

*   **FR-USER-004-MVP (Critical): Update User (Basic Info, Status, Roles)**
    *   **Description:** Allow authorized administrators to update basic information, status, and roles for a system user.
    *   **Actor(s):** Super Admin, Admin (Admin role can manage 'Client' roles; Super Admin can manage all roles).
    *   **Preconditions:** User is logged in. User exists.
    *   **Postconditions:** User information is updated. An audit log entry is created for status or role changes.
    *   **AC:**
        *   AC-1: From the user detail view, an administrator can access an edit form.
        *   AC-2: Editable fields: Full Name, Phone Number.
        *   AC-3: Administrators can change the user's status between 'Active' and 'Inactive'.
        *   AC-4: Super Admins can manage (add/remove) any role for any user. Admins can manage 'Client' roles for users.
        *   AC-5: A Super Admin cannot remove their own 'Super Admin' role or deactivate their own account if they are the sole Super Admin with that role.
        *   AC-6: Deactivating a user prevents them from logging into any part of the UniCal system relevant to their roles.
        *   AC-7: An appropriate success message is displayed. Error messages are shown for invalid input.

*   **FR-USER-005-MVP (High): Delete User**
    *   **Description:** Allow authorized administrators to (soft) delete a system user account.
    *   **Actor(s):** Super Admin
    *   **Preconditions:** User is logged in. User exists.
    *   **Postconditions:** User account is marked as deleted (soft delete) and is no longer active or accessible. An audit log entry is created.
    *   **AC:**
        *   AC-1: An option to delete a user is available (e.g., from the user detail view or list view).
        *   AC-2: A confirmation dialog is displayed before performing the deletion.
        *   AC-3: Upon confirmation, the user account is soft-deleted (e.g., status changed to 'Deleted', data retained for audit/recovery if per policy).
        *   AC-4: The deleted user no longer appears in the default user list (unless a filter for 'Deleted' users is applied, which is out of MVP scope).
        *   AC-5: An appropriate success message is displayed.

*   **FR-USER-006-MVP (Critical): Role-Based Access Control (RBAC) Enforcement (Basic)**
    *   **Description:** The system must enforce access controls based on the roles assigned to the logged-in user. A user can have multiple roles.
    *   **Actor(s):** System
    *   **Preconditions:** Users are assigned one or more roles.
    *   **Postconditions:** Users can only access features and perform actions permitted by the combination of their assigned roles.
    *   **AC:**
        *   AC-1: Define baseline permissions for roles: `Client` (no admin panel access), `Lead` (potentially limited view/interaction if they can log in, TBD), `Admin`, `Super Admin`.
        *   AC-2: `Admin` role capabilities (examples): Admin Dashboard, Global User/Lead Search, View Audit Logs, Manage Users with 'Client' role, Manage Leads, View Contact Info, View Subscriptions, Cancel Subscriptions.
        *   AC-3: `Super Admin` role capabilities: All `Admin` capabilities PLUS: Manage all users and all roles (including creating/assigning `Admin` and `Super Admin` roles), Delete Users.
        *   AC-4: Attempting to access unauthorized features/actions results in an "Access Denied" message or redirection.
        *   AC-5: If a user has multiple roles, their permissions are the union of all permissions granted by their roles.

*   **FR-USER-007-MVP (Critical): Strong Authentication & MFA (via Auth0 for Admin Roles)**
    *   **Description:** Enforce strong password policies and MFA for users with Admin Panel access roles (e.g., `Admin`, `Super Admin`) via Auth0 integration.
    *   **Actor(s):** System, Super Admin (for Auth0 config)
    *   **Preconditions:** Auth0 is integrated and configured with appropriate policies.
    *   **Postconditions:** Users with admin roles are subject to strong authentication and MFA during login.
    *   **AC:**
        *   AC-1: Password policies (minimum length, complexity) are configured and enforced by Auth0 for users authenticating for admin panel access.
        *   AC-2: MFA can be enabled and enforced for users with admin roles via Auth0.
        *   AC-3: Admin Panel relies on Auth0 for these enforcement mechanisms for admin-level access.

---

### 3.3. Lead Management Module (MVP)

This module focuses on the basic capture and management of leads.

*   **FR-LEAD-001-MVP (Critical): Capture Lead**
    *   **Description:** Allow administrators to manually create a new lead record. (Automated capture from website forms, etc., is out of MVP scope but system should be designed to accommodate it later).
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in.
    *   **Postconditions:** A new lead record is created. An audit log entry is created.
    *   **AC:**
        *   AC-1: A form is available to create a new lead.
        *   AC-2: Required fields: Full Name, Email Address. Optional fields: Phone Number, Source, Notes.
        *   AC-3: Email address for a lead should ideally be checked for uniqueness against existing users and leads.
        *   AC-4: The new lead is added to the lead list with a default status (e.g., 'New').
        *   AC-5: An appropriate success message is displayed.

*   **FR-LEAD-002-MVP (Critical): View Lead List**
    *   **Description:** Allow administrators to view a paginated list of all leads.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in.
    *   **Postconditions:** List of leads is displayed.
    *   **AC:**
        *   AC-1: A dedicated page displays a table of leads.
        *   AC-2: The table shows at least: Lead ID, Full Name, Email, Phone Number, Status (e.g., New, Contacted, Qualified, Disqualified), Creation Date, Source.
        *   AC-3: The list is paginated if the number of leads exceeds a predefined limit.
        *   AC-4: Administrators can sort the list by Name, Email, Status, and Creation Date.
        *   AC-5: Basic filtering by Status is available.

*   **FR-LEAD-003-MVP (Critical): View Lead Details**
    *   **Description:** Allow administrators to view detailed information for a specific lead.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Lead exists.
    *   **Postconditions:** Lead details are displayed.
    *   **AC:**
        *   AC-1: From the lead list, an administrator can navigate to a detail view for a specific lead.
        *   AC-2: The detail view displays all captured lead information, including any notes or interaction history (MVP: basic notes).
        *   AC-3: The detail view provides options to Edit Lead, Update Status, Convert Lead to User.

*   **FR-LEAD-004-MVP (Critical): Update Lead (Info & Status)**
    *   **Description:** Allow administrators to update information and status for a lead.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Lead exists.
    *   **Postconditions:** Lead information is updated. An audit log entry is created for status changes.
    *   **AC:**
        *   AC-1: From the lead detail view, an administrator can access an edit form.
        *   AC-2: Editable fields: Full Name, Email, Phone Number, Source, Notes.
        *   AC-3: Administrators can change the lead's status (e.g., New, Contacted, Qualified, Disqualified, Converted).
        *   AC-4: An appropriate success message is displayed.

*   **FR-LEAD-005-MVP (High): Convert Lead to User**
    *   **Description:** Allow administrators to convert a qualified lead into a system user (typically with a 'Client' role).
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Lead exists and is deemed qualified.
    *   **Postconditions:** A new user account is created using lead information. The lead record is marked as 'Converted'. An audit log entry is created.
    *   **AC:**
        *   AC-1: An option to "Convert to User" is available from the lead detail view.
        *   AC-2: Upon conversion, the system attempts to pre-fill the new user creation form (FR-USER-003-MVP) with information from the lead (Name, Email, Phone).
        *   AC-3: The administrator confirms user details and assigns the 'Client' role (or other appropriate initial role).
        *   AC-4: The original lead record's status is updated to 'Converted', and it may be linked to the new user record.
        *   AC-5: An appropriate success message is displayed.

*   **FR-LEAD-006-MVP (Medium): Delete Lead**
    *   **Description:** Allow authorized administrators to (soft) delete a lead record.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Lead exists.
    *   **Postconditions:** Lead record is marked as deleted. An audit log entry is created.
    *   **AC:**
        *   AC-1: An option to delete a lead is available.
        *   AC-2: A confirmation dialog is displayed.
        *   AC-3: Upon confirmation, the lead is soft-deleted.
        *   AC-4: An appropriate success message is displayed.

---

### 3.4. CRM Module (MVP - Limited Scope, focused on Users)

*   **FR-CRM-001-MVP (Critical): View User Contact Information**
    *   **Description:** Allow authorized administrators to view contact information associated with system users (those with 'Client' role or similar). This data is part of the user's profile.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Viewing a user's details (FR-USER-002-MVP).
    *   **Postconditions:** Contact information is displayed.
    *   **AC:**
        *   AC-1: Within the user detail view, the following contact fields are displayed (if available): Full Name, Email Address, Phone Number.
        *   AC-2: These fields are read-only in this specific CRM view context for MVP, but Full Name and Phone Number can be edited via FR-USER-004-MVP.

*   **FR-CRM-002-MVP (High): View User Basic Interaction Log**
    *   **Description:** Allow administrators to view a basic log of system-generated interactions or significant events for a system user (primarily those with 'Client' role).
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Viewing a user's details.
    *   **Postconditions:** A list of basic interactions is displayed.
    *   **AC:**
        *   AC-1: Within the user detail view, a section displays a list of interactions.
        *   AC-2: Logged interactions for MVP include: Account Created, Password Reset Requested (if applicable), Subscription Started, Subscription Canceled.
        *   AC-3: Each interaction entry shows: Timestamp, Event Type/Description.
        *   AC-4: Interactions are displayed in reverse chronological order.

---

### 3.5. Subscription Management Module (MVP - Limited Scope, for Users with 'Client' role)

*   **FR-SUB-001-MVP (Critical): View Subscription Plan List**
    *   **Description:** Authorized administrators shall be able to view a list of existing subscription plans.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Subscription plans are defined in the system.
    *   **Postconditions:** A list of subscription plans is displayed.
    *   **AC:**
        *   AC-1: A dedicated page or section displays a table of all available subscription plans.
        *   AC-2: The table shows: Plan ID/Name, Description (brief), Price, Billing Frequency (e.g., Monthly, Annually).
        *   AC-3: This view is read-only for MVP. Creating, updating, or deprecating plans is out of scope.

*   **FR-SUB-002-MVP (Critical): View User Subscription Details**
    *   **Description:** Administrators must be able to view detailed subscription information for a specific system user (with 'Client' role).
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Viewing a user's details (FR-USER-002-MVP), and the user has a 'Client' role.
    *   **Postconditions:** Subscription details for the user are displayed.
    *   **AC:**
        *   AC-1: Within the user detail view, a section displays the user's current and past (if applicable) subscriptions.
        *   AC-2: For each subscription, the following details are shown: Plan Name, Status (e.g., Active, Trial, Canceled, Expired), Start Date, End Date (if applicable), Renewal Date (if applicable).
        *   AC-3: If the user has no active or past subscriptions, a "No subscriptions found" message is displayed in this section.

*   **FR-SUB-003-MVP (High): Cancel User Subscription (Admin Initiated)**
    *   **Description:** The system must allow authorized administrators to cancel an active subscription for a user (with 'Client' role).
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. User has a 'Client' role and an active subscription.
    *   **Postconditions:** The user's subscription status is updated to 'Canceled'. An audit log or interaction log entry is created.
    *   **AC:**
        *   AC-1: From the user
