/**
 * Common database and entity related types
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditableEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Common update operation patterns
 */
export interface UpdateOperation<T> {
  id: string;
  data: Partial<T>;
}

/**
 * Soft delete interface
 */
export interface SoftDeletable {
  deletedAt?: Date | null;
  isDeleted: boolean;
}

/**
 * Common metadata structure
 */
export interface EntityMetadata {
  [key: string]: any;
}

/**
 * Sync status for external integrations
 */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncableEntity {
  externalId?: string | null;
  lastSyncedAt?: Date | null;
  syncStatus: SyncStatus;
}

/**
 * User preference settings structure
 */
export interface UserSettings {
  [key: string]: any;
}

/**
 * Provider types for external integrations
 */
export type Provider = 'google' | 'microsoft' | 'outlook';

/**
 * Calendar access roles
 */
export type CalendarAccessRole =
  | 'owner'
  | 'reader'
  | 'writer'
  | 'freeBusyReader';

/**
 * Event status types
 */
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

/**
 * Event visibility types
 */
export type EventVisibility = 'default' | 'public' | 'private' | 'confidential';
