import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import {
  ConversationMessageDataSource,
  GetConversationMessagesDataSourceFilter,
} from './conversation-message-data-source';

@injectable()
export class ConversationMessageDataSourceManager extends DataSourceManager<
  ConversationMessageDataSource,
  GetConversationMessagesDataSourceFilter
> {}
