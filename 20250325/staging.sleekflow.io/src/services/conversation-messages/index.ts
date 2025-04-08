import { Container } from 'inversify';

import { ConversationWindowUIService } from '@/services/conversation-messages/conversation-window-ui.service';
import { SendingConversationMessageManager } from '@/services/conversation-messages/managers/sending-conversation-message-manager';

import { ConversationMessageDataSource } from './conversation-message-data-source';
import { ConversationMessageDataSourceManager } from './conversation-message-data-source-manager';
import { ConversationMessageService } from './conversation-message.service';
import { ConversationMessageWrapperManagerService } from './managers/conversation-message-wrapper-manager.service';

function loadDeps(container: Container) {
  container
    .bind(ConversationWindowUIService)
    .to(ConversationWindowUIService)
    .inSingletonScope();
  container
    .bind<ConversationMessageWrapperManagerService>(
      ConversationMessageWrapperManagerService,
    )
    .to(ConversationMessageWrapperManagerService)
    .inSingletonScope();
  container
    .bind<ConversationMessageService>(ConversationMessageService)
    .to(ConversationMessageService)
    .inSingletonScope();
  container
    .bind<ConversationMessageDataSourceManager>(
      ConversationMessageDataSourceManager,
    )
    .toConstantValue(
      new ConversationMessageDataSourceManager(
        () => new ConversationMessageDataSource(container),
      ),
    );
  container
    .bind(SendingConversationMessageManager)
    .to(SendingConversationMessageManager)
    .inSingletonScope();
}

export const ConversationMessages = {
  loadDeps,
};
