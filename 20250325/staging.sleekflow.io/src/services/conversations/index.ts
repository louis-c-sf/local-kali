import { Container } from 'inversify';

import { ConversationMatcherService } from './conversation-matcher.service';
import { ConversationSummaryDataSource } from './conversation-summary-data-source';
import { ConversationSummaryDataSourceManager } from './conversation-summary-data-source-manager';
import { ConversationSummaryService } from './conversation-summary.service';
import { ConversationTypingDataSource } from './conversation-typing-data-source';
import { ConversationTypingDataSourceManager } from './conversation-typing-data-source-manager';
import { ConversationUnreadSummaryDataSource } from './conversation-unread-summary-data-source';
import { ConversationUnreadSummaryDataSourceManager } from './conversation-unread-summary-data-source-manager';
import { ConversationWithUserProfileDataSource } from './conversation-with-user-profile-data-source';
import { ConversationWithUserProfileDataSourceManager } from './conversation-with-user-profile-data-source-manager';
import { ConversationService } from './conversation.service';
import { ConversationWrapperManagerService } from './managers/conversation-wrapper-manager.service';
import { SearchConversationWithMessageAndUserProfileDataSource } from './search-conversation-with-message-and-user-profile-data-source';
import { SearchConversationWithMessageAndUserProfileDataSourceManager } from './search-conversation-with-message-and-user-profile-data-source-manager';
import { SearchConversationWithUserProfileDataSource } from './search-conversation-with-user-profile-data-source';
import { SearchConversationWithUserProfileDataSourceManager } from './search-conversation-with-user-profile-data-source-manager';

function loadDeps(container: Container) {
  container
    .bind<ConversationWrapperManagerService>(ConversationWrapperManagerService)
    .to(ConversationWrapperManagerService)
    .inSingletonScope();
  container
    .bind<ConversationService>(ConversationService)
    .to(ConversationService)
    .inSingletonScope();
  container
    .bind<ConversationWithUserProfileDataSourceManager>(
      ConversationWithUserProfileDataSourceManager,
    )
    .toConstantValue(
      new ConversationWithUserProfileDataSourceManager(
        () => new ConversationWithUserProfileDataSource(container),
      ),
    );
  container
    .bind<ConversationMatcherService>(ConversationMatcherService)
    .to(ConversationMatcherService)
    .inSingletonScope();
  container
    .bind<ConversationSummaryService>(ConversationSummaryService)
    .to(ConversationSummaryService)
    .inSingletonScope();
  container
    .bind<ConversationSummaryDataSourceManager>(
      ConversationSummaryDataSourceManager,
    )
    .toConstantValue(
      new ConversationSummaryDataSourceManager(
        () => new ConversationSummaryDataSource(container),
      ),
    );
  container
    .bind<ConversationUnreadSummaryDataSourceManager>(
      ConversationUnreadSummaryDataSourceManager,
    )
    .toConstantValue(
      new ConversationUnreadSummaryDataSourceManager(
        () => new ConversationUnreadSummaryDataSource(container),
      ),
    );
  container
    .bind<SearchConversationWithMessageAndUserProfileDataSourceManager>(
      SearchConversationWithMessageAndUserProfileDataSourceManager,
    )
    .toConstantValue(
      new SearchConversationWithMessageAndUserProfileDataSourceManager(
        () =>
          new SearchConversationWithMessageAndUserProfileDataSource(container),
      ),
    );
  container
    .bind<SearchConversationWithUserProfileDataSourceManager>(
      SearchConversationWithUserProfileDataSourceManager,
    )
    .toConstantValue(
      new SearchConversationWithUserProfileDataSourceManager(
        () => new SearchConversationWithUserProfileDataSource(container),
      ),
    );

  container
    .bind<ConversationTypingDataSourceManager>(
      ConversationTypingDataSourceManager,
    )
    .toConstantValue(
      new ConversationTypingDataSourceManager(
        () => new ConversationTypingDataSource(container),
      ),
    );
}

export const Conversations = {
  loadDeps,
};
