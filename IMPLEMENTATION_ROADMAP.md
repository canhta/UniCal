# Implementation Roadmap: Auth → Calendar → Sync Integration

## ✅ **Current Working Components**

### Backend
- **AuthService**: JWT token management ✅
- **AccountsService**: ConnectedAccount CRUD with token encryption ✅  
- **CalendarsService**: Platform abstraction layer ✅
- **GoogleCalendarSyncService**: Calendar synchronization ✅
- **Platform Services**: Google/Microsoft API integration ✅

### Frontend  
- **NextAuth Configuration**: User authentication ✅
- **API Client**: Token management and refresh ✅
- **OAuth API Methods**: `getOAuthUrl()` and `manualSync()` ✅

## ✅ **Recently Completed Components**

### 1. IntegrationsModule (Backend) - **COMPLETE**
```typescript
// ✅ IMPLEMENTED:
src/integrations/
├── integrations.module.ts ✅
├── integrations.controller.ts ✅ 
├── services/oauth-url.service.ts ✅
├── services/oauth-callback.service.ts ✅
├── dto/integration.dto.ts ✅
└── INTEGRATIONS_MODULE_PLAN.md ✅
```

**✅ Key Implementations Completed:**
- OAuth URL generation with state tokens ✅
- OAuth callback handling ✅
- Integration with AccountsService ✅
- Sync trigger after account creation ✅
- Manual sync endpoints ✅

### 2. SyncService Orchestration (Backend) - **COMPLETE**
```typescript
// ✅ IMPLEMENTED:
src/sync/
├── sync.service.ts ✅ 
├── sync.module.ts ✅
└── SYNC_MODULE_PLAN.md ✅
```

**✅ Key Integrations Completed:**
- Connect to existing GoogleCalendarSyncService ✅
- Handle initial sync after OAuth ✅
- Provide manual sync endpoints ✅
- Error handling and status management ✅

## 🔄 **Remaining Components**

### 3. Frontend Integration Components - **LOW PRIORITY**
```typescript
// Missing UI components:
components/integrations/
├── ConnectButtons.tsx  
├── ConnectedAccountCard.tsx
└── IntegrationsPage.tsx (main page)
```

## 🎯 **Implementation Steps**

### Phase 1: Backend OAuth Integration (Week 1)
1. **Create IntegrationsModule structure**
   ```bash
   mkdir apps/backend/src/integrations
   cd apps/backend/src/integrations
   ```

2. **Implement OAuth URL Service**
   - Generate Google/Microsoft OAuth URLs
   - State token generation and storage (Redis/cache)
   - CSRF protection

3. **Implement OAuth Callback Service**  
   - Token exchange with providers
   - Account creation via AccountsService
   - Error handling and validation

4. **Implement IntegrationsController**
   - `GET /integrations/oauth-url/:provider`
   - `GET /integrations/auth/:provider/callback`
   - `POST /integrations/sync/:accountId`

### Phase 2: Sync Integration (Week 2)
1. **Create SyncService orchestration**
   - `triggerInitialSync(accountId)` 
   - `triggerManualSync(accountId)`
   - Connect to GoogleCalendarSyncService

2. **Connect OAuth flow to sync**
   - OAuth callback triggers initial sync
   - Manual sync endpoint implementation
   - Status reporting and error handling

3. **Testing and validation**
   - End-to-end OAuth flow
   - Sync triggering after account connection
   - Error scenarios and edge cases

### Phase 3: Frontend UI (Week 3)
1. **Implement ConnectButtons component**
   - OAuth URL fetching
   - Redirect handling
   - Loading states

2. **Implement ConnectedAccountCard**
   - Account display
   - Disconnect functionality  
   - Manual sync triggers

3. **Implement main IntegrationsPage**
   - Success/error message handling
   - Account listing
   - Status indicators

## 🔗 **Service Integration Map**

```
Frontend Components:
├── ConnectButtons.tsx
│   └── apiClient.getOAuthUrl() 
│       └── GET /integrations/oauth-url/:provider
│           └── OAuthUrlService.generateOAuthUrl()
│
├── ConnectedAccountCard.tsx  
│   ├── apiClient.disconnectAccount()
│   │   └── DELETE /accounts/:id
│   │       └── AccountsService.deleteConnectedAccount()
│   └── apiClient.manualSync()
│       └── POST /integrations/sync/:id
│           └── SyncService.triggerManualSync()
│               └── GoogleCalendarSyncService.syncAccountCalendars()
│
└── OAuth Callback Flow:
    └── GET /integrations/auth/:provider/callback
        ├── OAuthCallbackService.handleCallback()
        ├── AccountsService.createConnectedAccount()
        └── SyncService.triggerInitialSync()
            └── GoogleCalendarSyncService.syncAccountCalendars()
```

## 🔧 **Configuration & Dependencies**

### Environment Variables Needed:
```env
# OAuth Configuration  
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# OAuth Callback URLs
OAUTH_REDIRECT_BASE_URL=http://localhost:3000
FRONTEND_BASE_URL=http://localhost:3030

# State Management (Redis)
REDIS_URL=redis://localhost:6379
```

### Module Dependencies:
```typescript
// IntegrationsModule imports:
@Module({
  imports: [
    CalendarsModule,      // For platform services
    AccountsModule,       // For account management  
    SyncModule,          // For sync orchestration
    CacheModule,         // For state token storage
    ConfigModule,        // For OAuth credentials
  ],
  providers: [
    OAuthUrlService,
    OAuthCallbackService,
  ],
  controllers: [
    IntegrationsController,
  ],
})
```

## 🎯 **Success Criteria**

### Phase 1 Complete:
- [ ] User can click "Connect Google Calendar" 
- [ ] OAuth URL is generated and user redirects to Google
- [ ] Google callback creates ConnectedAccount successfully
- [ ] User sees success message in frontend

### Phase 2 Complete:  
- [ ] OAuth callback automatically triggers initial sync
- [ ] Manual sync button works for connected accounts
- [ ] Sync status is properly reported and displayed
- [ ] Error handling works for failed connections

### Phase 3 Complete:
- [ ] Full integration UI is functional
- [ ] Account management (list, disconnect) works
- [ ] Success/error states are clearly communicated
- [ ] Loading states provide good UX

## 📝 **Next Steps**

1. **Start with IntegrationsModule implementation** - This unblocks the entire OAuth flow
2. **Create SyncService orchestration** - This connects OAuth to existing sync functionality  
3. **Build frontend components** - This provides the user interface

The current codebase has all the foundational pieces (auth, accounts, calendar sync) - we just need to connect them with the missing OAuth integration layer.
