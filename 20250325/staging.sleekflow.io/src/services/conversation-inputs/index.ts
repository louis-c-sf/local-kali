import { Container } from 'inversify';

import { MyConversationAiEnrichmentInputViewModelManager } from '@/services/conversation-inputs/my-conversation-ai-enrichment-input-view-model-manager';
import { MyConversationForwardingInputViewModel } from '@/services/conversation-inputs/my-conversation-forwarding-input-view-model';
import { MyConversationInputViewModelManager } from '@/services/conversation-inputs/my-conversation-input-view-model-manager';

function loadDeps(container: Container) {
  container
    .bind<MyConversationInputViewModelManager>(
      MyConversationInputViewModelManager,
    )
    .to(MyConversationInputViewModelManager)
    .inSingletonScope();
  container
    .bind<MyConversationForwardingInputViewModel>(
      MyConversationForwardingInputViewModel,
    )
    .to(MyConversationForwardingInputViewModel)
    .inSingletonScope();
  container
    .bind<MyConversationAiEnrichmentInputViewModelManager>(
      MyConversationAiEnrichmentInputViewModelManager,
    )
    .to(MyConversationAiEnrichmentInputViewModelManager)
    .inSingletonScope();
}

export const ConversationInputs = {
  loadDeps,
};
