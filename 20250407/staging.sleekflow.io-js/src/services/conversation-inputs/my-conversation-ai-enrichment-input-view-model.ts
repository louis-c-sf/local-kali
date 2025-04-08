import {
  IntelligentHubApi,
  SleekflowApisIntelligentHubModelSfChatEntry,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  finalize,
  map,
  Observable,
  switchMap,
  take,
} from 'rxjs';

import { AIEnrichmentMenuListType } from '@/pages/InboxRXJS/ConversationWindow/ConversationInput/AiEnrichment/getAIEnrichmentMenuList';
import { MessagingChannel } from '@/services/companies/company.service';
import { ConversationMessageService } from '@/services/conversation-messages/conversation-message.service';
import { UserService } from '@/services/user.service';

import { FeatureService } from '../features/feature.service';
import { inject } from 'inversify';
import { ReliableSignalRService } from '../signal-r/reliable-signal-r.service';

export const DEFAULT_AI_ENRICHMENT_MESSAGE: {
  messages: _AIEnrichmentMessage[];
} = {
  messages: [],
};

export interface _AIEnrichmentMessage {
  originalText: string;
  enrichedText: string;
  type:
    | 'ai-enrichment'
    | 'recommended-reply'
    | 'recommended-reply-streaming'
    | 'summarize';
  aiEnrichmentType?: AIEnrichmentMenuListType;
}

export interface AIEnrichmentMessage {
  messages: _AIEnrichmentMessage[];
}

export interface MyConversationAiEnrichmentInputViewModelProps {
  conversationId: string;
  userProfileId: string;
  messagingChannel: MessagingChannel | '';
}

export type LoadingState = 'loading' | 'streaming' | 'finished';

export class MyConversationAiEnrichmentInputViewModel {
  private aiEnrichmentMessage$$: BehaviorSubject<AIEnrichmentMessage> =
    new BehaviorSubject<AIEnrichmentMessage>(DEFAULT_AI_ENRICHMENT_MESSAGE);
  private loadingState$$: BehaviorSubject<LoadingState> =
    new BehaviorSubject<LoadingState>('loading');
  private isEnabled$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );

  private aiCustomPrompt$$: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  private isAiCustomPromptInputEnabled$$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private sessionId = 0;

  private conversationId: string | undefined;
  private userProfileId: string | undefined;
  private messagingChannel: MessagingChannel | '' | undefined;

  constructor(
    private intelligentHubApi: IntelligentHubApi,
    private conversationMessageService: ConversationMessageService,
    private userService: UserService,
    private featureService: FeatureService,
    @inject(ReliableSignalRService)
    private reliableSignalRService: ReliableSignalRService,
  ) {}

  public setup(props: MyConversationAiEnrichmentInputViewModelProps) {
    this.reset();

    this.conversationId = props.conversationId;
    this.userProfileId = props.userProfileId;
    this.messagingChannel = props.messagingChannel;
  }

  // Should be called when
  // 1. The initial enrich / summarize
  // 2. On error
  public reset() {
    this.sessionId += 1;

    this.aiEnrichmentMessage$$.next(DEFAULT_AI_ENRICHMENT_MESSAGE);
    this.isEnabled$$.next(false);
    this.loadingState$$.next('loading');

    this.resetInput();
  }

  public resetInput() {
    this.aiCustomPrompt$$.next('');
  }

  public generateSummary$(conversationId: string) {
    this.loadingState$$.next('loading');

    const sessionId = this.sessionId;

    return combineLatest({
      messages: this.conversationMessageService.getRecentLastMessages$(
        conversationId,
        '',
        10,
      ),
    }).pipe(
      switchMap(({ messages }) => {
        return this.intelligentHubApi
          .intelligentHubTextEnrichmentsCustomPromptRewritePost({
            travisBackendControllersSleekflowControllersIntelligentHubControllerCustomPromptRewriteRequest:
              {
                message:
                  messages
                    .filter((message) => message.getChannelType() !== 'note')
                    .map((m) => {
                      const prefix =
                        m.getDirection() === 'incoming'
                          ? 'customer:'
                          : 'agent:';

                      return `${prefix}${m.getMessageContent() || ''}`;
                    })
                    .reverse()
                    .join('\n') || 'No recent messages.',
                prompt: `Please generate a concise point-form summary of the conversation, capturing the key points, decisions, and outcomes discussed. Ensure that the summary:
- Clearly highlights the most important aspects of the conversation.
- Includes relevant details and insights to accurately reflect the conversation's content.
- Maintains clarity and ease of understanding.
- Is structured to allow for various relevant and creative interpretations of the conversation.

Focus on distilling the essence of the conversation into bullet points that are informative and directly relevant to the main topics discussed.`,
              },
          })
          .pipe(
            finalize(() => this.loadingState$$.next('finished')),
            map((response) => {
              if (response.success && this.sessionId === sessionId) {
                console.log('response', response);

                this.aiEnrichmentMessage$$.next({
                  messages: [
                    {
                      originalText: '',
                      enrichedText: response.output_message || '',
                      type: 'summarize',
                    },
                  ],
                });
              }

              return response;
            }),
          );
      }),
    );
  }

  public recommendReply$(
    conversationId: string,
    messagingChannel: MessagingChannel,
  ) {
    this.loadingState$$.next('loading');

    const sessionId = this.sessionId;

    // {"conversation_context":[{"user":"can"},{"user":"how"},{"user":"hi"},{"user":"yo"},{"bot":"您好\n以下為一則新訊息通知"},{"bot":"hi"},{"bot":"jess 03im nt sure.. u got notification?"},{"bot":"jesshey lee_v1 how do u think now?"},{"bot":"Reminder"},{"user":"Halo"}],"sleekflow_company_id":"39ee5f12-7997-45fa-a960-e4feecba425c"}
    return combineLatest({
      messages: this.conversationMessageService.getRecentLastMessages$(
        conversationId,
        messagingChannel,
        20,
      ),
      myCompany: this.userService.getMyCompany$(),
    }).pipe(
      switchMap(({ messages, myCompany }) => {
        return this.intelligentHubApi
          .intelligentHubRecommendedRepliesRecommendReplyPost({
            travisBackendControllersSleekflowControllersIntelligentHubControllerRecommendedReplyRequest:
              {
                conversation_context: messages
                  .filter((message) => message.getChannelType() !== 'note')
                  .map((message) => {
                    if (message.getDirection() === 'incoming') {
                      return {
                        user: message.getMessageContent(),
                      };
                    } else if (message.getDirection() === 'outgoing') {
                      return {
                        bot: message.getMessageContent(),
                      };
                    } else {
                      return undefined;
                    }
                  })
                  .reverse()
                  .filter(
                    (message) => message !== undefined,
                  ) as SleekflowApisIntelligentHubModelSfChatEntry[],
                sleekflow_company_id: myCompany.id,
              },
          })
          .pipe(
            finalize(() => {
              this.featureService.getIntelligentHubConfigs$(true).subscribe();
              this.loadingState$$.next('finished');
            }),
            map((response) => {
              if (response.recommended_reply && this.sessionId === sessionId) {
                this.aiEnrichmentMessage$$.next({
                  messages: [
                    {
                      originalText: '',
                      enrichedText: response.recommended_reply || '',
                      type: 'recommended-reply',
                    },
                  ],
                });
              }

              return response;
            }),
          );
      }),
    );
  }

  public recommendReplyStreaming$(
    conversationId: string,
    messagingChannel: MessagingChannel,
  ) {
    this.loadingState$$.next('loading');

    const sessionId = this.sessionId;

    return combineLatest({
      messages: this.conversationMessageService.getRecentLastMessages$(
        conversationId,
        messagingChannel,
        20,
      ),
      myCompany: this.userService.getMyCompany$(),
    }).pipe(
      switchMap(({ messages, myCompany }) => {
        return this.intelligentHubApi
          .intelligentHubRecommendedRepliesRecommendReplyStreamingPost({
            travisBackendControllersSleekflowControllersIntelligentHubControllerRecommendedReplyStreamingRequest:
              {
                conversation_context: messages
                  .filter((message) => message.getChannelType() !== 'note')
                  .map((message) => {
                    if (message.getDirection() === 'incoming') {
                      return {
                        user: message.getMessageContent(),
                      };
                    } else if (message.getDirection() === 'outgoing') {
                      return {
                        bot: message.getMessageContent(),
                      };
                    } else {
                      return undefined;
                    }
                  })
                  .reverse()
                  .filter(
                    (message) => message !== undefined,
                  ) as SleekflowApisIntelligentHubModelSfChatEntry[],
                sleekflow_company_id: myCompany.id,
                session_id: this.reliableSignalRService.getSessionId(),
                client_request_id: sessionId.toString(),
              },
          })
          .pipe(
            switchMap(() => {
              this.aiEnrichmentMessage$$.next({
                messages: [
                  {
                    originalText: '',
                    enrichedText: '',
                    type: 'recommended-reply-streaming',
                  },
                ],
              });

              // wrap in custom observable so we can complete it when we receive a stream finish event
              return new Observable((subscriber) => {
                const streamSubscription = this.reliableSignalRService
                  .getRecommededReplyStreamEndpoint$()
                  .pipe(
                    filter(
                      (streamEvent) =>
                        streamEvent.clientRequestId === sessionId.toString(),
                    ),
                  )
                  .subscribe((streamEvent) => {
                    switch (streamEvent.type) {
                      case 'emit': {
                        // as soon as we get the first partial smart reply, we change the loading state
                        if (this.loadingState$$.getValue() === 'loading') {
                          this.loadingState$$.next('streaming');
                        }
                        console.log(
                          'Streaming recommended reply:',
                          streamEvent.partialRecommendedReply,
                        );
                        this.aiEnrichmentMessage$$.next({
                          messages: [
                            {
                              originalText: '',
                              enrichedText:
                                this.aiEnrichmentMessage$$.getValue()
                                  .messages[0].enrichedText +
                                streamEvent.partialRecommendedReply,
                              type: 'recommended-reply-streaming',
                            },
                          ],
                        });
                        break;
                      }
                      case 'finish': {
                        this.loadingState$$.next('finished');
                        this.featureService
                          .getIntelligentHubConfigs$(true)
                          .subscribe();
                        streamSubscription.unsubscribe();
                        subscriber.complete();
                        break;
                      }
                    }
                  });
              });
            }),
          );
      }),
    );
  }

  public enrichMessage$(
    text: string,
    aiEnrichmentMenuListType: AIEnrichmentMenuListType,
    customPrompt?: string,
  ) {
    this.loadingState$$.next('loading');

    const sessionId = this.sessionId;
    const aiEnrichedMessage$ = this.getAiEnrichedMessage$(
      text,
      aiEnrichmentMenuListType,
      customPrompt,
    );

    return aiEnrichedMessage$.pipe(
      finalize(() => {
        this.featureService.getIntelligentHubConfigs$(true).subscribe();
        this.loadingState$$.next('finished');
      }),
      map((response) => {
        if (response.success && this.sessionId === sessionId) {
          this.aiEnrichmentMessage$$.next({
            messages: [
              {
                originalText: text,
                enrichedText: response.output_message || '',
                type: 'ai-enrichment',
                aiEnrichmentType: aiEnrichmentMenuListType,
              },
            ],
          });
        }
        return response;
      }),
    );
  }

  private getAiEnrichedMessage$(
    text: string,
    aiEnrichmentMenuListType: AIEnrichmentMenuListType,
    customPrompt?: string,
  ) {
    switch (aiEnrichmentMenuListType.actionType) {
      case 'rephrase':
        return this.intelligentHubApi.intelligentHubTextEnrichmentsRephrasePost(
          {
            travisBackendControllersSleekflowControllersIntelligentHubControllerRephraseRequest:
              {
                message: text,
                rephrase_target_type: aiEnrichmentMenuListType.value,
              },
          },
        );
      case 'change-tone':
        return this.intelligentHubApi.intelligentHubTextEnrichmentsChangeTonePost(
          {
            travisBackendControllersSleekflowControllersIntelligentHubControllerChangeToneRequest:
              {
                message: text,
                tone_type: aiEnrichmentMenuListType.value,
              },
          },
        );
      case 'translate':
        return this.intelligentHubApi.intelligentHubTextEnrichmentsTranslatePost(
          {
            travisBackendControllersSleekflowControllersIntelligentHubControllerTranslateRequest:
              {
                message: text,
                target_language_code: aiEnrichmentMenuListType.value,
              },
          },
        );
      case 'custom-prompt':
        return this.intelligentHubApi.intelligentHubTextEnrichmentsCustomPromptRewritePost(
          {
            travisBackendControllersSleekflowControllersIntelligentHubControllerCustomPromptRewriteRequest:
              {
                message: text,
                prompt: customPrompt,
              },
          },
        );
      default:
        throw new Error('Invalid action type');
    }
  }

  public furtherEnrichLastMessage$(
    aiEnrichmentMenuListType: AIEnrichmentMenuListType,
    conversationId: string,
    messagingChannel: MessagingChannel,
    customPrompt?: string,
  ) {
    if (aiEnrichmentMenuListType.actionType === 'recommend-reply') {
      return this.recommendReply$(conversationId, messagingChannel).pipe(
        switchMap(() => {
          return this.getAiEnrichmentMessage$();
        }),
      );
    }

    return this.aiEnrichmentMessage$$.pipe(take(1)).pipe(
      switchMap((aiEnrichmentMessage) => {
        const lastMessage =
          aiEnrichmentMessage.messages[aiEnrichmentMessage.messages.length - 1];

        return this.enrichMessage$(
          lastMessage.enrichedText,
          aiEnrichmentMenuListType,
          customPrompt,
        ).pipe(
          switchMap(() => {
            return this.getAiEnrichmentMessage$();
          }),
        );
      }),
    );
  }

  public getAiEnrichmentMessage$() {
    return this.aiEnrichmentMessage$$.asObservable();
  }

  public getLoadingState$() {
    return this.loadingState$$.asObservable();
  }

  public getHasExistingGeneratedReply$() {
    return this.aiEnrichmentMessage$$.pipe(
      map((aiEnrichmentMessage) => {
        return aiEnrichmentMessage.messages.some(
          (message) => message.type === 'recommended-reply',
        );
      }),
    );
  }

  public getIsEnabled$() {
    return this.isEnabled$$.asObservable();
  }

  public getIsAiCustomPromptInputEnabled$() {
    return this.isAiCustomPromptInputEnabled$$.asObservable();
  }

  public setIsAiCustomPromptInputEnabled(isEnabled: boolean) {
    this.isAiCustomPromptInputEnabled$$.next(isEnabled);
  }

  public setIsEnabled(isEnabled: boolean) {
    this.isEnabled$$.next(isEnabled);
  }

  public setAiCustomPrompt(customPrompt: string) {
    this.aiCustomPrompt$$.next(customPrompt);
  }

  public getAiCustomPrompt$() {
    return this.aiCustomPrompt$$.asObservable();
  }
}
