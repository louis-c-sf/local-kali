import Dexie, { Table } from 'dexie';

import { MessagingChannel } from '@/services/companies/company.service';
import type { UnifiedMessage } from '@/services/conversation-inputs/my-conversation-input-view-model';
import { MessageStatus } from '@/services/conversation-messages/managers/conversation-message-wrapper';

export interface ConversationTabGroup {
  browserTabId: string;
  conversationTabs: ConversationTab[];
}

export interface ConversationTab {
  conversationId: string;
  userProfileId: string;
  lastSelectedDate: Date;
  createdAt: Date;
  active: boolean;
  defaultMessageId?: number;
}

export interface SendingMessage {
  status: MessageStatus;
  unifiedMessage: UnifiedMessage;
  messagingChannel: '' | MessagingChannel;
  messageChecksum: string;
  messageGroupName: string;
  scheduleSentAt: string | undefined;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreference {
  userId: string;
  conversationSidebarState: 'open' | 'closed';
}

export class SfDexie extends Dexie {
  public readonly conversationTabGroup!: Table<ConversationTabGroup>;
  public readonly userPreference!: Table<UserPreference>;
  public readonly sendingMessage!: Table<SendingMessage>;

  constructor() {
    super('SfDatabase');

    this.version(1).stores({
      conversationTab: '&conversationId, userProfileId, lastSelectedDate', // Primary key and indexed props
    });

    this.version(2).stores({
      conversationTab:
        '&conversationId, userProfileId, lastSelectedDate, createdAt, active', // Primary key and indexed props
    });

    this.version(3).stores({
      conversationTab:
        '&conversationId, userProfileId, lastSelectedDate, createdAt, active, defaultMessageId', // Primary key and indexed props
    });

    this.version(4).stores({
      conversationTab:
        '&conversationId, userProfileId, lastSelectedDate, createdAt, active, defaultMessageId, tabId', // Include tabId in the primary key and indexed props
    });

    this.version(5).stores({
      conversationTabGroup: '&browserTabId',
    });

    this.version(6).stores({
      userPreference: '&userId, conversationSidebarState',
      conversationTabGroup: '&browserTabId',
    });
    this.version(7).stores({
      userPreference: '&userId, conversationSidebarState',
      conversationTabGroup: '&browserTabId',
      sendingMessage:
        '&[conversationId+messageChecksum], status, messageGroupName, unifiedMessage, scheduledAt, messagingChannel, createdAt, updatedAt',
    });
  }
}
