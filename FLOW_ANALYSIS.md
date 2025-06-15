# Complete Auth → Calendar → Sync Flow Analysis

## 🔄 **End-to-End Flow**

### 1. User Authentication (✅ Working)
```
Frontend → NextAuth → Backend AuthService → JWT Tokens → API Client
```
- **Status**: ✅ Fully implemented and working
- **Components**: `auth.ts`, `AuthService`, `apiClient`

### 2. Calendar Integration (🔄 Needs Implementation)
```
Frontend → IntegrationsController → OAuth → AccountsService → SyncService
```

**Detailed Flow:**
1. **OAuth URL Request**:
   - `Frontend: apiClient.getOAuthUrl('google')`
   - `Backend: GET /integrations/oauth-url/google`
   - `OAuthUrlService.generateGoogleOAuthUrl(state)`
   - Returns OAuth URL with state token

2. **OAuth Callback**:
   - `Google redirects: GET /integrations/auth/google/callback?code=xxx&state=yyy`
   - `OAuthCallbackService.handleGoogleCallback(code, state)`
   - `AccountsService.createConnectedAccount(tokens)`
   - **🚀 Trigger Sync**: `SyncService.triggerInitialSync(accountId)`
   - Redirect to frontend with status

3. **Account Management**:
   - `GET /accounts` - List connected accounts ✅
   - `DELETE /accounts/:id` - Disconnect account ✅
   - `POST /integrations/sync/:id` - Manual sync 🔄

### 3. Calendar Sync (🔄 Needs Connection)
```
SyncService → GoogleCalendarSyncService → CalendarsService → AccountsService
```

**Current State:**
- ✅ `GoogleCalendarSyncService` - Implemented
- ✅ `CalendarsService` - Implemented  
- ✅ `AccountsService` - Implemented
- ❌ `SyncService` - Missing orchestration layer
- ❌ Integration with OAuth flow

## 🔧 **Required Implementations**

### 1. IntegrationsModule (Priority 1)
```typescript
// integrations.controller.ts
@Controller('integrations')
export class IntegrationsController {
  @Get('oauth-url/:provider')
  async getOAuthUrl(@Param('provider') provider: string, @Request() req) {
    // Generate OAuth URL with state
  }

  @Get('auth/:provider/callback')
  async handleCallback(@Param('provider') provider, @Query() query) {
    // Handle OAuth callback
    // Create account
    // Trigger initial sync
  }

  @Post('sync/:accountId')
  async manualSync(@Param('accountId') accountId: string, @Request() req) {
    // Trigger manual sync
  }
}
```

### 2. SyncService Orchestration (Priority 2)
```typescript
// sync.service.ts
@Injectable()
export class SyncService {
  async triggerInitialSync(accountId: string): Promise<void> {
    // Trigger initial sync using GoogleCalendarSyncService
  }

  async triggerManualSync(accountId: string): Promise<void> {
    // Trigger manual sync
  }
}
```

### 3. OAuth Services (Priority 1)
```typescript
// oauth-url.service.ts
@Injectable()
export class OAuthUrlService {
  generateGoogleOAuthUrl(state: string): string {
    // Generate Google OAuth URL
  }
}

// oauth-callback.service.ts
@Injectable()
export class OAuthCallbackService {
  async handleGoogleCallback(code: string, state: string): Promise<ConnectedAccount> {
    // Exchange code for tokens
    // Create account
  }
}
```

## 🔗 **Service Dependencies**

```
IntegrationsController
├── OAuthUrlService (state management)
├── OAuthCallbackService (token exchange)
├── AccountsService (account creation)
└── SyncService (sync orchestration)
    └── GoogleCalendarSyncService (actual sync)
        └── CalendarsService (platform abstraction)
            └── AccountsService (token access)
```

## ⚠️ **Current Issues to Fix**

### 1. Missing Components
- [ ] IntegrationsController implementation
- [ ] OAuthUrlService implementation  
- [ ] OAuthCallbackService implementation
- [ ] SyncService orchestration layer
- [ ] State token management (Redis/cache)

### 2. Integration Points
- [ ] OAuth callback → Account creation → Sync trigger
- [ ] Manual sync endpoint → GoogleCalendarSyncService
- [ ] Error handling and user feedback
- [ ] Webhook setup after account connection

### 3. Data Flow Issues
- [ ] Remove hardcoded 'system' user IDs
- [ ] Proper user context in all services
- [ ] Consistent error responses
- [ ] Logging and monitoring

## 🎯 **Implementation Priority**

### Phase 1: Core OAuth Flow
1. Create IntegrationsModule structure
2. Implement OAuthUrlService and endpoints
3. Implement OAuthCallbackService
4. Connect to existing AccountsService

### Phase 2: Sync Integration  
1. Create SyncService orchestration layer
2. Connect OAuth callback to initial sync
3. Implement manual sync endpoints
4. Connect to existing GoogleCalendarSyncService

### Phase 3: Enhancement
1. Add webhook setup after account connection
2. Implement proper error handling
3. Add comprehensive logging
4. Add rate limiting and security measures

## 🔄 **Complete Working Flow (Target)**

```
1. User Login → NextAuth → JWT Tokens ✅
2. Connect Calendar → OAuth Flow → Account Created → Initial Sync Triggered 🔄
3. Manual Sync → SyncService → GoogleCalendarSyncService ✅ (partial)
4. Background Sync → Scheduled Jobs → GoogleCalendarSyncService ✅
5. Webhook Events → SyncService → Event Processing 🔄 (future)
```

**Legend:**
- ✅ Fully implemented and working
- 🔄 Partially implemented / needs integration
- ❌ Not implemented
