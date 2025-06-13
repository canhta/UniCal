# UniCal Admin Panel - Functional Requirements Document (MVP)

## 1. Introduction

This document outlines the functional requirements for the Minimum Viable Product (MVP) of the UniCal Admin Panel. The MVP will focus on core functionalities essential for basic administration of the UniCal application. The requirements herein are intended to be specific and actionable for development by an AI agent or human developers.

## 2. Scope of MVP

The MVP will include the following core modules and features:

*   **User Management:** Basic lifecycle management for client application users and Admin Panel administrators, including role-based access control (RBAC).
*   **General Admin Panel Features:** Essential features like an admin dashboard (simplified), global search (basic), and audit logging.
*   **Security:** Foundational security measures for admin authentication and authorization.
*   **Limited CRM Viewing:** Basic viewing of contact information related to users.
*   **Limited Subscription Viewing & Cancellation:** Basic viewing of subscription plans and user subscriptions, with admin-initiated cancellation.

**Out of Scope for MVP (Examples):**

*   Advanced CRM functionalities (e.g., creating/editing company records, complex segmentation, opportunity management).
*   Advanced Lead Management features.
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

*   **FR-GEN-003-MVP (Critical): Global Search (Basic User Search)**
    *   **Description:** Allow administrators to locate client user records by name or email.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged into the Admin Panel.
    *   **Postconditions:** Search results are displayed, or a "no results found" message is shown.
    *   **AC:**
        *   AC-1: A search bar is prominently displayed in the Admin Panel header/navigation.
        *   AC-2: Administrators can enter a client user's full or partial name or email address.
        *   AC-3: Search results display a list of matching client users, showing at least Name, Email, and Status.
        *   AC-4: Clicking on a search result navigates to the respective client user's detail view.
        *   AC-5: If no users match the search criteria, a clear "No users found" message is displayed.
        *   AC-6: Search is case-insensitive.

*   **FR-GEN-004-MVP (Critical): Audit Logs (Core User Actions)**
    *   **Description:** Maintain and display audit logs for critical actions related to user account management.
    *   **Actor(s):** Super Admin, Admin (view only)
    *   **Preconditions:** User is logged in. Actions have been performed by administrators.
    *   **Postconditions:** Audit log entries are recorded and can be viewed.
    *   **AC:**
        *   AC-1: Audit logs are recorded for the following actions on client user accounts: Create, Update (Status change: Active/Inactive), Delete.
        *   AC-2: Audit logs are recorded for the following actions on Admin Panel administrator accounts: Create, Update (Role change, Status change: Active/Inactive), Delete.
        *   AC-3: Each log entry includes: Timestamp (UTC), Performing Admin User (Email or ID), Action Performed (e.g., "Client User Created", "Admin Role Updated"), Affected User (ID or Email), and relevant details (e.g., old/new status or role).
        *   AC-4: A dedicated page allows Super Admins and Admins to view audit logs.
        *   AC-5: Audit logs are displayed in reverse chronological order (most recent first).
        *   AC-6: Basic filtering of audit logs by date range and/or Performing Admin User is available.

---

### 3.2. User Management Module (MVP)

#### 3.2.1. Client Application User Management

*   **FR-CUSER-001-MVP (Critical): View Client User List**
    *   **Description:** Allow administrators to view a paginated list of all client application users.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in.
    *   **Postconditions:** List of client users is displayed.
    *   **AC:**
        *   AC-1: A dedicated page displays a table of client users.
        *   AC-2: The table shows at least: User ID, Full Name, Email, Status (e.g., Active, Inactive, Pending Verification), Registration Date.
        *   AC-3: The list is paginated if the number of users exceeds a predefined limit (e.g., 20 per page).
        *   AC-4: Administrators can sort the list by Name, Email, Status, and Registration Date.
        *   AC-5: Basic filtering by Status (Active/Inactive) is available.

*   **FR-CUSER-002-MVP (Critical): View Client User Details**
    *   **Description:** Allow administrators to view detailed information for a specific client application user.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Client user exists.
    *   **Postconditions:** Client user details are displayed.
    *   **AC:**
        *   AC-1: From the client user list, an administrator can navigate to a detail view for a specific user.
        *   AC-2: The detail view displays: User ID, Full Name, Email, Status, Registration Date, Last Login Date (if available), associated Subscription Status (e.g., Active Plan Name, Trial, Canceled).
        *   AC-3: The detail view provides options to Edit User (basic info), Activate/Deactivate User.

*   **FR-CUSER-003-MVP (Critical): Create Client User (Manual)**
    *   **Description:** Allow authorized administrators to manually create a new client application user account.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in.
    *   **Postconditions:** A new client user account is created and set to 'Pending Verification' or 'Active' status. An audit log entry is created.
    *   **AC:**
        *   AC-1: A form is available to create a new client user.
        *   AC-2: Required fields: Full Name, Email Address, Initial Password (system generated or admin set, with a requirement for user to change on first login if admin set).
        *   AC-3: Email address must be unique among client users.
        *   AC-4: Upon successful creation, the system can optionally send a welcome/verification email to the user (integration dependent, basic notification if email sending is out of MVP scope).
        *   AC-5: The new user is added to the client user list.
        *   AC-6: An appropriate success message is displayed. Error messages are shown for invalid input (e.g., duplicate email).

*   **FR-CUSER-004-MVP (Critical): Update Client User (Basic Info & Status)**
    *   **Description:** Allow authorized administrators to update basic information and status for a client application user.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Client user exists.
    *   **Postconditions:** Client user information is updated. An audit log entry is created for status changes.
    *   **AC:**
        *   AC-1: From the client user detail view, an administrator can access an edit form.
        *   AC-2: Editable fields: Full Name, Phone Number (if part of CRM-MVP).
        *   AC-3: Administrators can change the user's status between 'Active' and 'Inactive'.
        *   AC-4: Deactivating a user prevents them from logging into the client application.
        *   AC-5: An appropriate success message is displayed. Error messages are shown for invalid input.

*   **FR-CUSER-005-MVP (High): Delete Client User**
    *   **Description:** Allow authorized administrators to (soft) delete a client application user account.
    *   **Actor(s):** Super Admin
    *   **Preconditions:** User is logged in. Client user exists.
    *   **Postconditions:** Client user account is marked as deleted (soft delete) and is no longer active or accessible. An audit log entry is created.
    *   **AC:**
        *   AC-1: An option to delete a client user is available (e.g., from the user detail view or list view).
        *   AC-2: A confirmation dialog is displayed before performing the deletion.
        *   AC-3: Upon confirmation, the user account is soft-deleted (e.g., status changed to 'Deleted', data retained for audit/recovery if per policy).
        *   AC-4: The deleted user no longer appears in the default client user list (unless a filter for 'Deleted' users is applied, which is out of MVP scope).
        *   AC-5: An appropriate success message is displayed.

#### 3.2.2. Admin Panel User Management

*   **FR-AUSER-001-MVP (Critical): View Admin User List**
    *   **Description:** Allow Super Administrators to view a list of all Admin Panel administrator accounts.
    *   **Actor(s):** Super Admin
    *   **Preconditions:** User is logged in as Super Admin.
    *   **Postconditions:** List of admin users is displayed.
    *   **AC:**
        *   AC-1: A dedicated page displays a table of Admin Panel administrators.
        *   AC-2: The table shows: Admin User ID, Full Name, Email, Role (Super Admin, Admin), Status (Active, Inactive).
        *   AC-3: The list is paginated if necessary.

*   **FR-AUSER-002-MVP (Critical): Create Admin User**
    *   **Description:** Allow Super Administrators to create new Admin Panel administrator accounts.
    *   **Actor(s):** Super Admin
    *   **Preconditions:** User is logged in as Super Admin.
    *   **Postconditions:** A new admin user account is created. An audit log entry is created.
    *   **AC:**
        *   AC-1: A form is available to create a new admin user.
        *   AC-2: Required fields: Full Name, Email Address.
        *   AC-3: Admin role (`Super Admin` or `Admin`) must be assigned.
        *   AC-4: Email address must be unique among admin users.
        *   AC-5: New admin users are typically invited via Auth0, which handles initial password setup and MFA enrollment. The system should trigger this Auth0 flow.
        *   AC-6: The new admin user is added to the admin user list with 'Pending Activation' or 'Active' status based on Auth0 flow.
        *   AC-7: An appropriate success message is displayed.

*   **FR-AUSER-003-MVP (Critical): Update Admin User (Role & Status)**
    *   **Description:** Allow Super Administrators to update the role and status of Admin Panel administrator accounts.
    *   **Actor(s):** Super Admin
    *   **Preconditions:** User is logged in as Super Admin. Admin user account exists.
    *   **Postconditions:** Admin user's role or status is updated. An audit log entry is created.
    *   **AC:**
        *   AC-1: From the admin user list or detail view, a Super Admin can access an edit function.
        *   AC-2: Editable fields: Role (`Super Admin`, `Admin`), Status (`Active`, `Inactive`).
        *   AC-3: A Super Admin cannot deactivate their own account or change their own role to `Admin` if they are the sole Super Admin.
        *   AC-4: Deactivating an admin user prevents them from logging into the Admin Panel.
        *   AC-5: An appropriate success message is displayed.

*   **FR-AUSER-004-MVP (Critical): Role-Based Access Control (RBAC) Enforcement (Basic)**
    *   **Description:** The system must enforce access controls based on the defined `Super Admin` and `Admin` roles for MVP features.
    *   **Actor(s):** System
    *   **Preconditions:** Users are assigned roles.
    *   **Postconditions:** Users can only access features and perform actions permitted by their role.
    *   **AC:**
        *   AC-1: `Admin` role can access: Admin Dashboard (FR-GEN-002-MVP), Global User Search (FR-GEN-003-MVP), View Audit Logs (FR-GEN-004-MVP), all Client User Management functions (FR-CUSER-*), View Contact Info (FR-CRM-001-MVP), View Contact Interaction History (FR-CRM-002-MVP), View Plans (FR-SUB-001-MVP), View Customer Subscriptions (FR-SUB-002-MVP), Cancel Subscriptions (FR-SUB-005-MVP).
        *   AC-2: `Super Admin` role can access all features available to `Admin` role, PLUS: All Admin Panel User Management functions (FR-AUSER-*), Delete Client User (FR-CUSER-005-MVP).
        *   AC-3: Attempting to access unauthorized features/actions results in an "Access Denied" message or redirection.

*   **FR-AUSER-005-MVP (Critical): Strong Authentication & MFA (via Auth0)**
    *   **Description:** Enforce strong password policies and MFA for Admin Panel administrators via Auth0 integration.
    *   **Actor(s):** System, Super Admin (for Auth0 config)
    *   **Preconditions:** Auth0 is integrated and configured with appropriate policies.
    *   **Postconditions:** Admin users are subject to strong authentication and MFA during login.
    *   **AC:**
        *   AC-1: Password policies (minimum length, complexity) are configured and enforced by Auth0.
        *   AC-2: MFA can be enabled and enforced for admin users via Auth0.
        *   AC-3: Admin Panel relies on Auth0 for these enforcement mechanisms.

---

### 3.3. CRM Module (MVP - Limited Scope)

*   **FR-CRM-001-MVP (Critical): View Client User Contact Information**
    *   **Description:** Allow authorized administrators to view contact information associated with client application users. This data is typically part of the user's profile.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Viewing a client user's details (FR-CUSER-002-MVP).
    *   **Postconditions:** Contact information is displayed.
    *   **AC:**
        *   AC-1: Within the client user detail view, the following contact fields are displayed (if available): Full Name, Email Address, Phone Number.
        *   AC-2: These fields are read-only in this specific CRM view context for MVP, but Full Name and Phone Number can be edited via FR-CUSER-004-MVP.

*   **FR-CRM-002-MVP (High): View Client User Basic Interaction Log**
    *   **Description:** Allow administrators to view a basic log of system-generated interactions or significant events for a client application user.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Viewing a client user's details.
    *   **Postconditions:** A list of basic interactions is displayed.
    *   **AC:**
        *   AC-1: Within the client user detail view, a section displays a list of interactions.
        *   AC-2: Logged interactions for MVP include: Account Created, Password Reset Requested (if applicable), Subscription Started, Subscription Canceled.
        *   AC-3: Each interaction entry shows: Timestamp, Event Type/Description.
        *   AC-4: Interactions are displayed in reverse chronological order.

---

### 3.4. Subscription Management Module (MVP - Limited Scope)

*   **FR-SUB-001-MVP (Critical): View Subscription Plan List**
    *   **Description:** Authorized administrators shall be able to view a list of existing subscription plans.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Subscription plans are defined in the system.
    *   **Postconditions:** A list of subscription plans is displayed.
    *   **AC:**
        *   AC-1: A dedicated page or section displays a table of all available subscription plans.
        *   AC-2: The table shows: Plan ID/Name, Description (brief), Price, Billing Frequency (e.g., Monthly, Annually).
        *   AC-3: This view is read-only for MVP. Creating, updating, or deprecating plans is out of scope.

*   **FR-SUB-002-MVP (Critical): View Client User Subscription Details**
    *   **Description:** Administrators must be able to view detailed subscription information for a specific client application user.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Viewing a client user's details (FR-CUSER-002-MVP).
    *   **Postconditions:** Subscription details for the user are displayed.
    *   **AC:**
        *   AC-1: Within the client user detail view, a section displays the user's current and past (if applicable) subscriptions.
        *   AC-2: For each subscription, the following details are shown: Plan Name, Status (e.g., Active, Trial, Canceled, Expired), Start Date, End Date (if applicable), Renewal Date (if applicable).
        *   AC-3: If the user has no active or past subscriptions, a "No subscriptions found" message is displayed in this section.

*   **FR-SUB-003-MVP (High): Cancel Client User Subscription (Admin Initiated)**
    *   **Description:** The system must allow authorized administrators to cancel a client application user's active subscription.
    *   **Actor(s):** Super Admin, Admin
    *   **Preconditions:** User is logged in. Client user has an active subscription.
    *   **Postconditions:** The user's subscription status is updated to 'Canceled'. An audit log or interaction log entry is created.
    *   **AC:**
        *   AC-1: From the client user's subscription details view, an option to "Cancel Subscription" is available for active subscriptions.
        *   AC-2: A confirmation dialog is displayed before proceeding with the cancellation.
        *   AC-3: The administrator can choose between:
            *   Immediate cancellation.
            *   Cancellation at the end of the current billing period.
        *   AC-4: Upon confirmation, the subscription status is updated accordingly.
        *   AC-5: If the main UniCal application handles notifications, it should be triggered. Otherwise, a basic system log is made.
        *   AC-6: An appropriate success message is displayed in the Admin Panel.

---

## 4. Non-Functional Requirements (MVP Focus)

While all NFRs in the Admin BRD are important, the MVP will prioritize the implementation and verification of the following, ensuring they apply to the MVP feature set:

*   **NFR-SEC-001 (Critical): Data Encryption in Transit:** All Admin Panel traffic over HTTPS.
*   **NFR-SEC-002 (Critical): Data Encryption at Rest:** Sensitive data in the database (e.g., user PII, hashed admin passwords if not solely in Auth0) is encrypted.
*   **NFR-SEC-003 (Critical): Access Control Enforcement:** RBAC for MVP roles (`Super Admin`, `Admin`) is strictly enforced for all MVP functionalities.
*   **NFR-SEC-004 (Critical): Protection Against Common Vulnerabilities:** Basic OWASP Top 10 protection (e.g., input validation to prevent XSS/SQLi, secure session management).
*   **NFR-SEC-005 (Critical): Comprehensive Auditability:** Audit logs for MVP actions (as defined in FR-GEN-004-MVP) are reliably created and stored.
*   **NFR-PERF-001 (Critical): Application Response Time:** Key MVP interactive operations (user list load, user detail load, search) complete within 3-5 seconds under normal load (e.g., <5 concurrent admins, <10,000 client users).
*   **NFR-REL-001 (Critical): System Uptime:** Core Admin Panel services achieve 99.5% uptime during business hours.
*   **NFR-REL-002 (Critical): Data Backup & Recovery:** Regular automated backups of the Admin Panel database (user data, admin accounts, audit logs, basic subscription info). Recovery procedures tested for RPO/RTO of 24h/48h for MVP.
*   **NFR-USA-001 (High): Learnability & Efficiency:** An admin user can learn and perform core MVP tasks (e.g., find a user, view details, change status) within 1 hour of training/exposure.
*   **NFR-USA-003 (High): UI/UX Consistency:** Consistent layout, navigation, and control elements across all MVP screens.

---

## 5. Data Requirements (MVP Focus)

*   **Key Data Entities & Attributes (MVP):**
    *   **AdminUser:** UserID (PK), FullName, Email (Unique), Role (Super Admin/Admin), Status (Active/Inactive), Auth0UserID (FK).
    *   **ClientUser:** UserID (PK), FullName, Email (Unique), Status (Active/Inactive/Pending Verification/Deleted), RegistrationDate, LastLoginDate, PhoneNumber. (Source: Main application DB)
    *   **SubscriptionPlan:** PlanID (PK), PlanName, Description, Price, BillingFrequency. (Source: Main application DB, read-only for MVP)
    *   **UserSubscription:** SubscriptionID (PK), ClientUserID (FK), PlanID (FK), Status (Active/Trial/Canceled/Expired), StartDate, EndDate, RenewalDate. (Source: Main application DB)
    *   **AuditLog:** LogID (PK), Timestamp, PerformingAdminUserID (FK), ActionType, AffectedEntityID, AffectedEntityType, Details (JSON or Text).
*   **Data Migration:** For MVP, focus is on accessing/displaying existing ClientUser and Subscription data from the main application's database. No complex data migration *into* the Admin Panel's own database is planned for MVP beyond AdminUser accounts and AuditLogs.
*   **Data Retention:**
    *   Audit Logs: Retained for at least 12 months.
    *   AdminUser accounts: Retained as long as active or per security policy.
    *   ClientUser/Subscription data: Governed by main application's data retention policies.

---

## 6. Integration Requirements (MVP Focus)

*   **IR-001: Client-Facing Application Database/API (Essential)**
    *   **Purpose:** To read client user data, subscription plan information, and user subscription details. To update client user status (Activate/Deactivate) and basic profile information. To trigger subscription cancellation.
    *   **Data (Read):** ClientUser (all attributes listed in 5), SubscriptionPlan (all attributes), UserSubscription (all attributes).
    *   **Data (Write/Update):** ClientUser (Status, FullName, PhoneNumber), UserSubscription (Status to 'Canceled', cancellation effective date).
    *   **Frequency:** Real-time or near real-time for reads and updates.
    *   **Method:** Secure API endpoints or direct database connection (with read-only access for most parts, and specific, restricted write permissions). API preferred.
    *   **Authentication:** API Key, OAuth, or secure DB credentials.

*   **IR-002: Authentication System (Auth0)**
    *   **Purpose:** To manage authentication (including login, password policies, MFA) for Admin Panel administrators. To facilitate admin user invitation and lifecycle.
    *   **Data:** Admin user email, authentication status, MFA status.
    *   **Frequency:** Real-time during login and admin user management operations.
    *   **Method:** Auth0 SDKs / APIs.
    *   **Authentication:** Auth0 application credentials.

---

## 7. Assumptions for MVP

*   The client-facing application has stable and accessible APIs (or a readable database schema) for fetching required client user and subscription data, and for performing specified update actions (user status, subscription cancellation).
*   Auth0 is available and can be configured for Admin Panel administrator authentication, including MFA and user invitation flows.
*   The necessary infrastructure (hosting, database) for the Admin Panel MVP can be provisioned.
*   The AI agent has access to necessary credentials and API documentation for the integrations.
