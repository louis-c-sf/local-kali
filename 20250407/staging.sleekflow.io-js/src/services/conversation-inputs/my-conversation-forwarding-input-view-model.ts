import { ConversationMessageApi } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import {
  BehaviorSubject,
  combineLatest,
  finalize,
  of,
  switchMap,
  take,
} from 'rxjs';

import { MessagingChannel } from '@/services/companies/company.service';
import { MyConversationInputViewModelManager } from '@/services/conversation-inputs/my-conversation-input-view-model-manager';
import {
  ChannelType,
  ConversationMessageWrapperMessage,
} from '../conversation-messages/managers/conversation-message-wrapper';

export interface MyConversationForwardingInputViewModelProps {
  conversationId: string;
  userProfileId: string;
  messagingChannel: MessagingChannel | '';
}

export const DEFAULT_FORWARDING_MODEL: ForwardingModel = {
  messages: [],
  conversations: [],
};

// {"MessageIds":[375725,375726,375727],"ConversationIds":["ce9ea20a-0f61-4e3e-ab8c-90322ffb3264","9df7eaa5-d805-4b36-b91e-ae8b1dd49b94"]}
export interface ForwardingModel {
  messages: {
    // TravisBackendMessageDomainViewModelsForwardConversationMessage
    messageId: number;
    channelType: ChannelType;
    timestamp: ConversationMessageWrapperMessage['timestamp'];
  }[];
  conversations: {
    conversationId: string;
    messagingChannel: MessagingChannel;
  }[];
}

@injectable()
export class MyConversationForwardingInputViewModel {
  private forwardingModel$$: BehaviorSubject<ForwardingModel> =
    new BehaviorSubject<ForwardingModel>(DEFAULT_FORWARDING_MODEL);
  private isLoading$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );

  constructor(
    @inject(ConversationMessageApi)
    private conversationMessageApi: ConversationMessageApi,
    @inject(MyConversationInputViewModelManager)
    private myConversationInputViewModelManager: MyConversationInputViewModelManager,
  ) {}

  public onNextMessages(
    messages: {
      messageId: number;
      channelType: ChannelType;
      timestamp: ConversationMessageWrapperMessage['timestamp'];
    }[],
  ) {
    this.forwardingModel$$.next({
      ...this.forwardingModel$$.value,
      messages,
    });
  }

  public selectConversation(
    conversationId: string,
    messagingChannel: MessagingChannel,
  ) {
    this.forwardingModel$$.next({
      ...this.forwardingModel$$.value,
      conversations: [
        ...this.forwardingModel$$.value.conversations.filter(
          (conversation) => conversation.conversationId !== conversationId,
        ),
        {
          conversationId,
          messagingChannel,
        },
      ],
    });
  }

  public deselectConversation(conversationId: string) {
    this.forwardingModel$$.next({
      ...this.forwardingModel$$.value,
      conversations: this.forwardingModel$$.value.conversations.filter(
        (conversation) => conversation.conversationId !== conversationId,
      ),
    });
  }

  public getForwardingModel$() {
    return this.forwardingModel$$.asObservable();
  }

  public reset() {
    this.forwardingModel$$.next(DEFAULT_FORWARDING_MODEL);
  }

  public getIsValid$() {
    return of(true);
  }

  public getIsLoading$() {
    return this.isLoading$$.asObservable();
  }

  public sendMessage$() {
    this.isLoading$$.next(true);

    return combineLatest({
      forwardingModel: this.forwardingModel$$.pipe(take(1)),
    }).pipe(
      switchMap(({ forwardingModel }) => {
        const arr: {
          conversation: ForwardingModel['conversations'][number];
          message: ForwardingModel['messages'][number];
        }[] = [];
        for (let i = 0; i < forwardingModel.messages.length; i++) {
          for (let j = 0; j < forwardingModel.conversations.length; j++) {
            arr.push({
              conversation: forwardingModel.conversations[j],
              message: forwardingModel.messages[i],
            });
          }
        }
        // Forward Messages should follows the order of original messages
        arr.sort((a, b) => a.message.timestamp - b.message.timestamp);

        return this.conversationMessageApi.conversationMessagesForwardMessagePost(
          {
            travisBackendMessageDomainViewModelsForwardMessageInput: {
              forwardConversationMessages: arr.map(
                ({ message, conversation }) => {
                  return {
                    conversationId: conversation.conversationId,
                    messageId: message.messageId,
                    channelIdentityId:
                      conversation.messagingChannel.channelIdentityId,
                    channelType: conversation.messagingChannel.channelType,
                  };
                },
              ),
            },
          },
        );
      }),
      finalize(() => {
        this.isLoading$$.next(false);
      }),
    );
  }
}
