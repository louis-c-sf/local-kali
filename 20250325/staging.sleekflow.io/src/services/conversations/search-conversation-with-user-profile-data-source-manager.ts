import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import { SearchConversationsParams } from './models/search-conversations-params';
import { SearchConversationWithUserProfileDataSource } from './search-conversation-with-user-profile-data-source';

@injectable()
export class SearchConversationWithUserProfileDataSourceManager extends DataSourceManager<
  SearchConversationWithUserProfileDataSource,
  SearchConversationsParams
> {}
