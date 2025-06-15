# Integrations Feature Plan (Phase 3)

This plan details the simplified UI and interaction for managing calendar integrations (Google, Microsoft) in the UniCal frontend.

## Implementation TODOs

### Phase 1: Core Integration Page  
- [x] Create main integrations page (`/integrations`) ✅
- [x] Add OAuth URL API endpoints to `lib/api/client.ts` ✅
- [x] Build `ConnectButtons.tsx` component with OAuth flow ✅
- [x] Build `ConnectedAccountCard.tsx` component for account display ✅
- [x] Handle OAuth success/error feedback from URL parameters ✅
- [x] Update IntegrationsHeader to handle new callback format ✅

### Phase 2: Account Management  
- [x] Implement disconnect functionality with confirmation ✅
- [x] Add manual sync trigger buttons ✅ 
- [x] Display sync status and error states ✅
- [x] Add loading states for async operations ✅
- [x] Connect to new backend integrations endpoints ✅

### Phase 3: Calendar Selection (Future)
- [ ] Calendar selection modal or page
- [ ] Checkbox interface for calendar sync preferences
- [ ] Save and update sync settings

## FRD Alignment
*   **FR3.2.1 Connect Google Calendar**
*   **FR3.2.2 Connect Microsoft Outlook/Teams Calendar**
*   **FR3.2.5 Manage Connected Accounts**
*   **FR3.5.4 Sync Control (Calendar Selection)**
*   **FR3.9.3 Sync Status/Error Notifications (Basic on page)**

## Core Page: `/integrations` (Protected Route)

This page will be a Server Component by default (`apps/frontend/app/(protected)/integrations/page.tsx`) to allow server-side data fetching for existing connections.

## UI Elements & Functionality

1.  **[x] Display Connected Accounts Section:**
    *   **Data Fetching (SSR):** In `page.tsx`, fetch connected accounts from `/api/integrations/accounts`
    *   **UI:**
        *   If no accounts: Show "No calendar accounts connected" message with prominent connect buttons
        *   If accounts connected: List each account with:
            *   Platform logo (Google, Microsoft)
            *   Account email/identifier  
            *   Sync status indicator (Connected, Syncing, Error, etc.)
            *   "Disconnect" and "Manage Calendars" buttons
    *   **Component:** `ConnectedAccountCard.tsx` for individual account display

2.  **[ ] Connect New Account Section:**
    *   **UI:**
        *   "Connect Google Calendar" button
        *   "Connect Microsoft Outlook Calendar" button
    *   **Simplified Action Flow:**
        1. User clicks connect button
        2. Frontend calls `apiClient.getOAuthUrl(provider)` to get OAuth URL
        3. Frontend redirects to OAuth URL using `window.location.href = oauthUrl`
        4. User completes OAuth on provider's site
        5. Provider redirects to backend callback
        6. Backend handles OAuth and redirects to `/integrations?status=success/error`
        7. Frontend shows success/error message based on URL parameters

3.  **[x] Disconnect Account Functionality:**
    *   **UI:** Disconnect button with confirmation modal
    *   **Action:** Call `apiClient.disconnectAccount(accountId)` and refresh page

4.  **[ ] Calendar Selection (Future Phase):**
    *   Navigate to dedicated page or modal for selecting which calendars to sync
    *   List available calendars with checkboxes
    *   Save sync preferences

## Frontend Implementation Notes

### 1. OAuth Connection Flow
*   Click handler in `ConnectButtons.tsx`:
    ```typescript
    const handleConnect = async (provider: 'google' | 'microsoft') => {
      try {
        const { url } = await apiClient.getOAuthUrl(provider);
        window.location.href = url;
      } catch (error) {
        // Show error message
      }
    };
    ```

### 2. Success/Error Handling
*   Server Component reads `searchParams` in `page.tsx`:
    ```typescript
    export default function IntegrationsPage({ 
      searchParams 
    }: { 
      searchParams: { status?: string; provider?: string; error?: string } 
    }) {
      const { status, provider, error } = searchParams;
      // Display appropriate message based on status
    }
    ```

### 3. Sync Status Display
*   Visual indicators for different account states:
    *   ✅ Connected & Syncing
    *   ⚠️ Needs Re-authentication  
    *   ❌ Sync Error
    *   🔄 Syncing in Progress

### 4. Manual Sync Action
*   "Sync Now" button calls `apiClient.manualSync(accountId)`
*   Show loading state during sync operation
*   Refresh account list after sync completion

## Components to Create/Use:

*   [x] `apps/frontend/app/(protected)/integrations/page.tsx` (Main Server Component)
*   [ ] `apps/frontend/components/integrations/ConnectedAccountCard.tsx` (Client Component for account display and actions)
*   [ ] `apps/frontend/components/integrations/ConnectButtons.tsx` (Client Component for OAuth connection)
*   [x] `components/ui/Button.tsx`
*   [x] `components/ui/Card.tsx`
*   [x] `components/ui/Alert.tsx` (for success/error messages)
*   [x] `components/ui/Badge.tsx` (for sync status indicators)
*   [ ] `components/ui/Modal.tsx` (for disconnect confirmation)

## API Endpoints (Frontend Perspective - to be consumed):

*   `GET /api/integrations/accounts` (Lists connected accounts with their status)
*   `GET /api/integrations/oauth-url/:provider` (Gets OAuth authorization URL for provider)
*   `GET /api/integrations/accounts/:accountId/calendars` (Lists calendars for connected account)
*   `PUT /api/integrations/accounts/:accountId/calendars` (Updates calendar sync preferences) 
*   `DELETE /api/integrations/accounts/:accountId` (Disconnects account)
*   `POST /api/integrations/sync/:accountId` (Manual sync trigger)

## Key Changes from Original Plan

### Simplified OAuth Flow
- **Before:** Direct navigation to backend OAuth URLs
- **After:** API call to get OAuth URL, then client-side redirect
- **Benefit:** Better error handling and loading states

### Removed Redundancy
- Consolidated multiple similar components
- Removed unnecessary authentication flows
- Simplified state management

### Cleaner Architecture
- Clear separation between OAuth and account management
- Consistent API patterns
- Better error handling and user feedback
