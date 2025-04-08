import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import { ConversationTypingDataSource } from './conversation-typing-data-source';

@injectable()
export class ConversationTypingDataSourceManager extends DataSourceManager<
  ConversationTypingDataSource,
  object
> {}
