import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import { ConversationSummaryDataSource } from './conversation-summary-data-source';
import { GetConversationsFilter } from './models/get-conversations-filter';

@injectable()
export class ConversationSummaryDataSourceManager extends DataSourceManager<
  ConversationSummaryDataSource,
  GetConversationsFilter
> {}
