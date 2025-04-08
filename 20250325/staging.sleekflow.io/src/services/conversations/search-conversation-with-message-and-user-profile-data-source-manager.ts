import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import { GetConversationsFilter } from './models/get-conversations-filter';
import { SearchConversationWithMessageAndUserProfileDataSource } from './search-conversation-with-message-and-user-profile-data-source';

@injectable()
export class SearchConversationWithMessageAndUserProfileDataSourceManager extends DataSourceManager<
  SearchConversationWithMessageAndUserProfileDataSource,
  GetConversationsFilter
> {}
