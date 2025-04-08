import { TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import {
  concatMap,
  forkJoin,
  interval,
  map,
  Observable,
  of,
  Subject,
  take,
  withLatestFrom,
} from 'rxjs';

import { I18nService } from '@/services/i18n/i18n.service';

import { ClassicRealTimeService } from '../../signal-r/classic-real-time.service';
import {
  ConversationMessageWrapper,
  ConversationMessageWrapperMessage,
} from './conversation-message-wrapper';

export interface ConversationMessageWrapperUpdate {
  id: ConversationMessageWrapperMessage['id'];
  type: 'status' | 'updatedAt' | 'timestamp';
  newValue: {
    status?: string;
    updatedAt?: string;
    timestamp?: number;
  };
}

@injectable()
export class ConversationMessageWrapperManagerService {
  private conversationMessageIdToConversationMessageWrapperMap = new Map<
    number | string,
    {
      conversationMessageWrapper: ConversationMessageWrapper;
      lastObservedAt: number;
    }
  >();
  private conversationMessageWrapperUpdate$$ =
    new Subject<ConversationMessageWrapperUpdate>();

  constructor(
    @inject(ClassicRealTimeService)
    private classicRealTimeService: ClassicRealTimeService,
    @inject(I18nService) private i18nService: I18nService,
  ) {
    this.classicRealTimeService
      .getOnConversationMessageChanged$()
      .subscribe((x) => {
        if (x.id === undefined || x.id === null) {
          return;
        }

        const conversationMessageWrapper = this.getConversationMessageWrapper(
          x.id,
        );

        if (conversationMessageWrapper !== undefined) {
          conversationMessageWrapper.onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel(
            x,
          );
          this.conversationMessageIdToConversationMessageWrapperMap.delete(
            conversationMessageWrapper.getMessageChecksum(),
          );
        }
      });

    interval(60_000).subscribe(() => {
      const recyclingConversationMessageIds: (number | string)[] = [];
      this.conversationMessageIdToConversationMessageWrapperMap.forEach(
        (obj, key) => {
          if (
            new Date().getTime() - obj.lastObservedAt > 60_000 &&
            !obj.conversationMessageWrapper.observed()
          ) {
            recyclingConversationMessageIds.push(key);
          }
        },
      );
      recyclingConversationMessageIds.forEach((id) => {
        const conversationMessageWrapperEntry =
          this.conversationMessageIdToConversationMessageWrapperMap.get(id);

        console.log(
          'Recycling ConversationMessageWrapper',
          id,
          conversationMessageWrapperEntry,
        );

        conversationMessageWrapperEntry?.conversationMessageWrapper.destroy();
        this.conversationMessageIdToConversationMessageWrapperMap.delete(id);
      });
    });
  }

  public getSendingMessages$() {
    return interval(10_000).pipe(
      concatMap(() => {
        return forkJoin(
          Array.from(
            this.conversationMessageIdToConversationMessageWrapperMap.values(),
          ).map((entry) => {
            return of(entry.conversationMessageWrapper).pipe(
              withLatestFrom(
                entry.conversationMessageWrapper.getStatus$().pipe(take(1)),
              ),
            );
          }),
        ).pipe(
          map((entries) => {
            return entries
              .filter(([, status]) => status === 'Sending')
              .map(([conversationMessageWrapper, _]) => {
                return conversationMessageWrapper;
              });
          }),
        );
      }),
    );
  }

  public getConversationMessageWrapperUpdate$(): Observable<ConversationMessageWrapperUpdate> {
    return this.conversationMessageWrapperUpdate$$.asObservable();
  }

  public getOrInitConversationMessageWrapper(
    idOrChecksum: number | string,
    travisBackendMessageDomainViewModelsConversationMessageResponseViewModel: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  ): ConversationMessageWrapper {
    // Asserts
    if (
      !idOrChecksum ||
      !travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.id
    ) {
      throw new Error('id is required');
    }
    if (
      idOrChecksum !==
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.id &&
      idOrChecksum !==
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.messageChecksum
    ) {
      throw new Error('idOrChecksum does not match');
    }

    // Check if conversationMessageWrapper exists and update it
    const conversationMessageWrapper = this.getConversationMessageWrapper(
      travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.id,
    );
    if (conversationMessageWrapper !== undefined) {
      conversationMessageWrapper.onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel(
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
      );

      return conversationMessageWrapper;
    }

    // Create new conversationMessageWrapper
    const newConversationMessageWrapper = new ConversationMessageWrapper({
      conversationMessageWrapperConstructorParams: {
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel:
          travisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
      },
      conversationMessageWrapperUpdate$$:
        this.conversationMessageWrapperUpdate$$,
      i18nService: this.i18nService,
    });

    this.conversationMessageIdToConversationMessageWrapperMap.set(
      idOrChecksum,
      {
        conversationMessageWrapper: newConversationMessageWrapper,
        lastObservedAt: new Date().getTime(),
      },
    );

    return newConversationMessageWrapper;
  }

  public getConversationMessageWrapper(
    idOrChecksum: number | string,
  ): ConversationMessageWrapper | undefined {
    const obj =
      this.conversationMessageIdToConversationMessageWrapperMap.get(
        idOrChecksum,
      );
    if (obj === undefined) {
      return obj;
    }

    obj.lastObservedAt = new Date().getTime();

    return obj.conversationMessageWrapper;
  }

  public getConversationMessageWrapperWithQuoteMessageId(
    quotedMessageId: string,
  ): ConversationMessageWrapper | undefined {
    const obj = [
      ...this.conversationMessageIdToConversationMessageWrapperMap.values(),
    ].find(
      (entry) =>
        entry.conversationMessageWrapper.getMessageUniqueID() ===
        quotedMessageId,
    );
    return obj?.conversationMessageWrapper;
  }
}
