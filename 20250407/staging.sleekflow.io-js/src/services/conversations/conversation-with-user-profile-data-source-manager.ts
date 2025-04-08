import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import { ConversationWithUserProfileDataSource } from './conversation-with-user-profile-data-source';
import { GetConversationsFilter } from './models/get-conversations-filter';

@injectable()
export class ConversationWithUserProfileDataSourceManager extends DataSourceManager<
  ConversationWithUserProfileDataSource,
  GetConversationsFilter
> {}
