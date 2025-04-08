import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import { ConversationUnreadSummaryDataSource } from './conversation-unread-summary-data-source';

@injectable()
export class ConversationUnreadSummaryDataSourceManager extends DataSourceManager<
  ConversationUnreadSummaryDataSource,
  object
> {}
