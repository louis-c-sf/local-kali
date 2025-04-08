import { IntelligentHubApi } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';

import {
  MyConversationAiEnrichmentInputViewModel,
  MyConversationAiEnrichmentInputViewModelProps,
} from '@/services/conversation-inputs/my-conversation-ai-enrichment-input-view-model';
import { ConversationMessageService } from '@/services/conversation-messages/conversation-message.service';
import { UserService } from '@/services/user.service';

import { FeatureService } from '../features/feature.service';
import { ReliableSignalRService } from '../signal-r/reliable-signal-r.service';

@injectable()
export class MyConversationAiEnrichmentInputViewModelManager {
  constructor(
    @inject(IntelligentHubApi) private intelligentHubApi: IntelligentHubApi,
    @inject(ConversationMessageService)
    private conversationMessageService: ConversationMessageService,
    @inject(UserService)
    private userService: UserService,
    @inject(FeatureService)
    private featureService: FeatureService,
    @inject(ReliableSignalRService)
    private reliableSignalRService: ReliableSignalRService,
  ) {}

  public vmPropsToViewModelMap: Map<
    string,
    MyConversationAiEnrichmentInputViewModel
  > = new Map<string, MyConversationAiEnrichmentInputViewModel>();

  public getOrCreateViewModel(
    props: MyConversationAiEnrichmentInputViewModelProps,
  ) {
    if (this.vmPropsToViewModelMap.has(JSON.stringify(props))) {
      return this.vmPropsToViewModelMap.get(JSON.stringify(props))!;
    }

    const vm = new MyConversationAiEnrichmentInputViewModel(
      this.intelligentHubApi,
      this.conversationMessageService,
      this.userService,
      this.featureService,
      this.reliableSignalRService,
    );

    vm.setup(props);

    this.vmPropsToViewModelMap.set(JSON.stringify(props), vm);

    return vm;
  }
}
