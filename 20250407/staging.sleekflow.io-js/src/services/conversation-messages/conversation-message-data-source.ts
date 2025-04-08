import { v4 as uuid4 } from 'uuid';
import dayjs, { Dayjs } from 'dayjs';
import { interfaces } from 'inversify';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  defer,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  filter,
  finalize,
  firstValueFrom,
  forkJoin,
  from,
  identity,
  last,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  reduce,
  shareReplay,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';

import { CompanyService } from '@/services/companies/company.service';
import { MyConversationInputViewModelManager } from '@/services/conversation-inputs/my-conversation-input-view-model-manager';
import {
  ConversationWindowUIService,
  HIGHLIGHT_ATTRIBUTE,
} from '@/services/conversation-messages/conversation-window-ui.service';
import { SendingConversationMessageManager } from '@/services/conversation-messages/managers/sending-conversation-message-manager';
import { UserService } from '@/services/user.service';

import { DisposableDataSource } from '../data-sources/disposable-data-source';
import { ClassicRealTimeService } from '../signal-r/classic-real-time.service';
import { ConversationMessageService } from './conversation-message.service';
import { ConversationMessageWrapper } from './managers/conversation-message-wrapper';
import { ConversationMessageWrapperManagerService } from './managers/conversation-message-wrapper-manager.service';
import { GetConversationMessagesFilter } from './models/get-conversation-messages-filter';
import {
  CHECKSUM_FALLBACK,
  DELIMITER,
  Delimiter,
  END_OF_CONVERSATION,
  ID_FALLBACK,
  NO_DEFAULT_MESSAGE_ID,
  NO_TIMESTAMP,
  START_OF_CONVERSATION,
} from './constants';
import { userInteracted$ } from './userInteracted';

export type SourceMessage =
  | { defaultMessageId: number }
  | { timestamp: number }
  | typeof START_OF_CONVERSATION
  | typeof END_OF_CONVERSATION;

export type MessageKey = `${
  | number
  | typeof ID_FALLBACK}${Delimiter}${string}${Delimiter}${number}`;
export type CacheKey =
  | `${typeof NO_DEFAULT_MESSAGE_ID | number}${Delimiter}${
      | typeof NO_TIMESTAMP
      | number}`
  | typeof START_OF_CONVERSATION
  | typeof END_OF_CONVERSATION;
type ParsedMessageKey = {
  id: number | string;
  messageChecksum: string;
  timestamp: number;
};
type CalculatedMessage = {
  messages: ParsedMessageKey[];
  messageCount: number;
  groupedMessages: {
    monthGroupDayjs: Dayjs;
    messages: {
      conversationWrapper: ConversationMessageWrapper;
      key: MessageKey;
    }[];
  }[];
};

export type GetConversationMessagesDataSourceFilter =
  GetConversationMessagesFilter;

// TODO: this would be easier to implement with a state management lib
export class ConversationMessageDataSource implements DisposableDataSource {
  // services
  private conversationWindowUIService: ConversationWindowUIService;
  private conversationMessageService: ConversationMessageService;
  private userService: UserService;
  private companyService: CompanyService;
  private classicRealTimeService: ClassicRealTimeService;
  private sendingConversationMessageManager: SendingConversationMessageManager;
  private conversationMessageWrapperManagerService: ConversationMessageWrapperManagerService;
  private myConversationInputViewModelManager: MyConversationInputViewModelManager;
  // filters
  private getConversationMessagesFilter:
    | GetConversationMessagesDataSourceFilter
    | undefined = undefined;
  // state
  private dataSourceActive$$ = new BehaviorSubject(false);
  private uniqueIdentifier: string = uuid4();
  private fetchMessageTrigger$$ = new BehaviorSubject<
    undefined | 'next' | 'previous'
  >(undefined);
  private sourceMessage$$ = new BehaviorSubject<SourceMessage>(
    END_OF_CONVERSATION,
  );
  private cache$$ = new BehaviorSubject(
    {} as Record<CacheKey, Set<MessageKey>>,
  );
  private newSourceMessage$$ = new Subject<SourceMessage>();
  private calculatedCacheItems$$ = new BehaviorSubject<CalculatedMessage>({
    messages: [],
    messageCount: 0,
    groupedMessages: [],
  });
  private calculatedCacheItems$ = this.calculatedCacheItems$$
    .asObservable()
    .pipe(shareReplay(1));
  private conversationMessageWrappersMap = new Map<
    MessageKey,
    ConversationMessageWrapper
  >();

  // API state
  private isFetchingNextPage$$ = new BehaviorSubject(
    {} as Record<CacheKey, boolean>,
  );
  private hasPreviousPage$$ = new BehaviorSubject(
    {} as Record<CacheKey, boolean>,
  );
  private hasNextPage$$ = new BehaviorSubject({} as Record<CacheKey, boolean>);
  private isFetchingPreviousPage$$ = new BehaviorSubject(
    {} as Record<CacheKey, boolean>,
  );

  // datasource state
  private complete$$ = new Subject<void>();
  private disconnect$$ = new Subject<void>();
  private isDisconnected = false;

  constructor(container: interfaces.Container) {
    this.conversationWindowUIService = container.get(
      ConversationWindowUIService,
    );
    this.sendingConversationMessageManager = container.get(
      SendingConversationMessageManager,
    );
    this.myConversationInputViewModelManager = container.get(
      MyConversationInputViewModelManager,
    );
    this.userService = container.get(UserService);
    this.companyService = container.get(CompanyService);
    this.classicRealTimeService = container.get(ClassicRealTimeService);
    this.conversationMessageWrapperManagerService = container.get(
      ConversationMessageWrapperManagerService,
    );
    this.conversationMessageService = container.get(ConversationMessageService);
  }

  public setupAndGet$(
    getConversationMessagesFilter: GetConversationMessagesDataSourceFilter,
  ) {
    const result = this.setup(getConversationMessagesFilter);

    if (result) {
      return result;
    }

    if (!this.getConversationMessagesFilter) {
      throw new Error('getConversationMessagesFilter is not defined');
    }

    this.setupCalculateCacheItemsOnCacheChange();
    this.setupInitialDefaultMessage(this.getConversationMessagesFilter);
    this.setupSendingMessageHandling(this.getConversationMessagesFilter);
    this.setupRealtimeMessageHandling(this.getConversationMessagesFilter);

    return this.calculatedCacheItems$;
  }

  public setDataSourceActive(active: boolean) {
    this.dataSourceActive$$.next(active);
    if (active) {
      this.refetchLastPage();
    }
  }

  public refetchLastPage() {
    combineLatest([this.getHasNextPage$(), this.getIsInitializing$()])
      .pipe(
        take(1),
        filter(
          ([hasNextPage, isInitializing]) => !hasNextPage && !isInitializing,
        ),
        exhaustMap(() => this.getPreviousOrNextMessage$({ direction: 'next' })),
      )
      .subscribe();
  }

  public async setSourceMessage({
    defaultMessageId,
    timestamp,
    direction,
  }: {
    defaultMessageId?: number | undefined;
    timestamp?: number | undefined;
    direction?: 'start' | 'end';
  }) {
    if (!defaultMessageId && !timestamp && !direction) {
      throw new Error('Invalid source message');
    }

    if (direction) {
      return this.sourceMessage$$.next(direction);
    }
    if (defaultMessageId) {
      this.sourceMessage$$.next({
        defaultMessageId,
      });
    }
    if (timestamp) {
      this.sourceMessage$$.next({
        timestamp,
      });
    }
  }

  public observed() {
    return this.calculatedCacheItems$$.observed;
  }

  public disconnect() {
    this.disconnect$$.next();
    this.disconnect$$.complete();
    this.isDisconnected = true;
  }

  public disconnected() {
    return this.isDisconnected;
  }

  public getDisconnect$() {
    return this.disconnect$$.asObservable();
  }

  public complete() {
    this.complete$$.next();
    this.complete$$.complete();
  }

  public getComplete$() {
    return this.complete$$.asObservable();
  }

  public fetchNextMessages() {
    this.fetchMessageTrigger$$.next('next');
  }

  public fetchPreviousMessages() {
    this.fetchMessageTrigger$$.next('previous');
  }

  public getIsInitializing$() {
    return this.cache$$.pipe(
      map((cache) => {
        return Object.keys(cache).length === 0;
      }),
      distinctUntilChanged(),
    );
  }

  public getHasPreviousPage$(
    options: { take?: number; selectedCacheKey?: CacheKey } = {},
  ) {
    return this.getStatusFromSourceObservable$(this.hasPreviousPage$$, options);
  }

  public getHasNextPage$(
    options: { take?: number; selectedCacheKey?: CacheKey } = {},
  ) {
    return this.getStatusFromSourceObservable$(this.hasNextPage$$, options);
  }

  public getIsFetchingPreviousPage$(
    options: { take?: number; selectedCacheKey?: CacheKey } = {},
  ) {
    return this.getStatusFromSourceObservable$(
      this.isFetchingPreviousPage$$,
      options,
    );
  }

  public getIsFetchingNextPage$(
    options: { take?: number; selectedCacheKey?: CacheKey } = {},
  ) {
    return this.getStatusFromSourceObservable$(
      this.isFetchingNextPage$$,
      options,
    );
  }

  private isDefaultMessageId(sourceMessage: SourceMessage) {
    return (
      typeof sourceMessage === 'object' && 'defaultMessageId' in sourceMessage
    );
  }

  private setHasPreviousPage(value: boolean) {
    this.getSelectedCacheKey$({ take: 1 })
      .pipe(
        switchMap((id) => {
          return this.hasPreviousPage$$.pipe(
            take(1),
            map((cache) => {
              return {
                id,
                cache,
              };
            }),
          );
        }),
      )
      .subscribe(({ id, cache }) => {
        this.hasPreviousPage$$.next({
          ...cache,
          [id]: value,
        });
      });
  }

  private getPreviousOrNextMessage$({
    direction,
    sourceMessageId,
  }: {
    sourceMessageId?: number;
    direction: 'previous' | 'next';
  }) {
    return this.getSelectedCache$({ take: 1 }).pipe(
      switchMap((cachedItems) => {
        const allMessageIds = Array.from(cachedItems)
          .map((key) => {
            return this.parseMessageKey(key).id;
          })
          .filter((k) => typeof k === 'number') as number[];

        let key: GetConversationMessagesDataSourceFilter | undefined =
          undefined;
        if (direction === 'previous') {
          this.setIsFetchingPreviousPage(true);

          const beforeMessageId = sourceMessageId
            ? sourceMessageId
            : Math.min(...allMessageIds);

          key = {
            ...this.getConversationMessagesFilter,
            order: 'desc',
            beforeTimestamp: undefined,
            afterTimestamp: undefined,
            ...(beforeMessageId !== Infinity
              ? {
                  beforeMessageId: beforeMessageId,
                }
              : {
                  // use beforeTimestamp to bust cache for latest messages on first load if beforeMessageId is undefined
                  beforeTimestamp: dayjs().add(100, 'year').unix(),
                }),
          };
        }

        const isReferenceMessageIdAvailable =
          sourceMessageId || allMessageIds.length > 0;

        if (direction === 'next' && isReferenceMessageIdAvailable) {
          this.setIsFetchingNextPage(true);
          const afterMessageId = sourceMessageId
            ? sourceMessageId
            : Math.max(...allMessageIds);
          key = {
            ...this.getConversationMessagesFilter,
            order: 'asc',
            beforeTimestamp: undefined,
            afterMessageId,
            afterTimestamp: undefined,
          };
        }

        if (!key) {
          throw new Error('no key provided for fetching messages');
        }

        return this.fetch$(key).pipe(
          map((conversationWrappers) => {
            const cacheKeys = conversationWrappers?.map((c) => {
              const key = this.encodeMessageKey({
                id: c.getId(),
                messageChecksum: c.getMessageChecksum(),
                timestamp: dayjs(c.getCreatedAt()).unix(),
              });

              // set conversation wrapper into map to stop it from being garbage collected
              this.conversationMessageWrappersMap.set(key, c);
              c.subscribe(this);

              return key;
            });
            return {
              direction,
              key,
              conversationWrappers,
              cacheKeys,
            };
          }),
          tap(({ direction }) => {
            if (direction === 'previous') {
              this.setIsFetchingPreviousPage(false);
            }
          }),
          switchMap(({ cacheKeys, direction, ...rest }) => {
            return this.getSelectedCache$({ take: 1 }).pipe(
              map((selectedCache) => {
                return {
                  cacheKeys,
                  direction: direction as 'previous' | 'next',
                  selectedCache,
                  ...rest,
                };
              }),
            );
          }),
          switchMap((props) => {
            return this.getSelectedCacheKey$({ take: 1 }).pipe(
              map((id) => {
                return {
                  ...props,
                  id,
                };
              }),
            );
          }),
          tap(({ cacheKeys, direction, selectedCache, id }) => {
            if (!cacheKeys || cacheKeys.length === 0) {
              if (direction === 'previous') {
                this.setHasPreviousPage(false);
              }
              if (direction === 'next') {
                this.setHasNextPage(false);
              }
              return;
            }

            // Check if all fetched conversation messages are included in the cached items
            const allFetchedConversationMessagesIncluded = this.isSubsetOf(
              new Set(cacheKeys),
              selectedCache,
            );

            if (allFetchedConversationMessagesIncluded) {
              if (direction === 'previous') {
                this.setHasPreviousPage(false);
              }
              if (direction === 'next') {
                this.setHasNextPage(false);
              }
            }

            if (cacheKeys) {
              cacheKeys.forEach((x) => {
                selectedCache.add(x);
              });
              this.cache$$.next({
                ...this.cache$$.value,
                [id]: selectedCache,
              });
            }
          }),
          catchError(() => {
            return EMPTY;
          }),
        );
      }),
    );
  }

  // can add more filters for the cache here
  private encodeCacheKey({
    defaultMessageId,
    timestamp,
  }: {
    defaultMessageId?: number;
    timestamp?: number;
  }) {
    return `${defaultMessageId || NO_DEFAULT_MESSAGE_ID}${DELIMITER}${
      timestamp || NO_TIMESTAMP
    }` as const;
  }

  private parseCacheKey(key: CacheKey) {
    if (key === START_OF_CONVERSATION || key === END_OF_CONVERSATION) {
      return key;
    }

    const splitKey = key.split(DELIMITER);

    if (splitKey.length !== 2) {
      throw new Error('Invalid cache key format');
    }

    return {
      defaultMessageId: splitKey[0],
      timestamp: splitKey[1],
    };
  }

  private encodeMessageKey({
    id,
    messageChecksum,
    timestamp,
  }: {
    id?: number;
    messageChecksum?: string;
    timestamp: number;
  }) {
    return `${id || ID_FALLBACK}${DELIMITER}${
      messageChecksum || CHECKSUM_FALLBACK
    }${DELIMITER}${timestamp}` as const;
  }

  private parseMessageKey(key: MessageKey): ParsedMessageKey {
    const splitKey = key.split(DELIMITER);

    if (splitKey.length !== 3) {
      throw new Error('Invalid message key format');
    }

    const idNumberCast = Number(splitKey[0]);
    return {
      id: isNaN(idNumberCast) ? splitKey[0] : idNumberCast,
      messageChecksum: splitKey[1],
      timestamp: Number(splitKey[2]),
    };
  }

  private setup(
    getConversationMessagesFilter: GetConversationMessagesDataSourceFilter,
  ) {
    if (this.getConversationMessagesFilter !== undefined) {
      return this.calculatedCacheItems$;
    }
    this.getConversationMessagesFilter = getConversationMessagesFilter;
  }

  private setupCalculateCacheItemsOnCacheChange() {
    this.getSelectedCache$()
      .pipe(
        debounceTime(10),
        switchMap((cachedItems) => {
          return of(cachedItems).pipe(
            concatMap((cachedItems) => from(cachedItems)),
            reduce(
              (acc, key) => {
                const parsedMessageKey = this.parseMessageKey(key);
                acc.messages.push(parsedMessageKey);

                const createdAt = dayjs
                  .unix(parsedMessageKey.timestamp)
                  .startOf('day');
                const targetGroupIndex = acc.groupedMessages.findIndex(
                  (group) => {
                    return createdAt.isSame(group.monthGroupDayjs, 'day');
                  },
                );
                const conversationMessageWrapper =
                  this.conversationMessageWrappersMap.get(key);

                if (~targetGroupIndex) {
                  if (conversationMessageWrapper) {
                    acc.groupedMessages[targetGroupIndex].messages.push({
                      key,
                      conversationWrapper: conversationMessageWrapper,
                      ...parsedMessageKey,
                    });
                    acc.groupedMessages[targetGroupIndex].messages.sort(
                      (a, b) => a.timestamp - b.timestamp,
                    );
                  }
                } else {
                  if (conversationMessageWrapper) {
                    acc.groupedMessages.push({
                      monthGroupDayjs: createdAt,
                      messages: [
                        {
                          key,
                          conversationWrapper: conversationMessageWrapper,
                          ...parsedMessageKey,
                        },
                      ].sort((a, b) => a.timestamp - b.timestamp),
                    });
                  }
                }

                return acc;
              },
              {
                messages: [] as ParsedMessageKey[],
                groupedMessages: [] as {
                  monthGroupDayjs: Dayjs;
                  messages: ({
                    conversationWrapper: ConversationMessageWrapper;
                    key: MessageKey;
                  } & ParsedMessageKey)[];
                }[],
              },
            ),
            // sort month group
            // Sort messages and grouped messages once
            map((acc) => {
              return {
                messages: [...acc.messages].sort(
                  (a, b) => a.timestamp - b.timestamp,
                ),
                groupedMessages: [...acc.groupedMessages].sort((a, b) => {
                  return a.monthGroupDayjs.isAfter(b.monthGroupDayjs) ? 1 : -1;
                }),
              };
            }),
            map(({ groupedMessages, messages }) => {
              return {
                messageCount: messages.length,
                groupedMessages,
                messages,
              };
            }),
          );
        }),
        takeUntil(this.disconnect$$),
        takeUntil(this.complete$$),
      )
      .subscribe((x) => {
        this.calculatedCacheItems$$.next(x);
      });
  }

  private getFetchInitialDefaultMessage$({
    sourceMessage,
    getConversationMessagesFilter,
  }: {
    sourceMessage: SourceMessage;
    getConversationMessagesFilter: GetConversationMessagesDataSourceFilter;
  }) {
    return of(sourceMessage).pipe(
      switchMap((id) => {
        const getObservable$ = (selectedCacheId: CacheKey) =>
          combineLatest({
            cache: this.cache$$.pipe(take(1)),
            selectedCacheId: of(selectedCacheId),
          }).pipe(
            map(({ cache, selectedCacheId }) => ({
              cache,
              selectedCacheId,
              id,
            })),
          );

        if (typeof id === 'string') {
          return getObservable$(id);
        }
        if ('defaultMessageId' in id) {
          return getObservable$(
            this.encodeCacheKey({
              defaultMessageId: id.defaultMessageId,
            }),
          );
        }

        if ('timestamp' in id) {
          return getObservable$(
            this.encodeCacheKey({
              timestamp: id.timestamp,
            }),
          );
        }

        throw new Error('Invalid source message');
      }),
      switchMap(({ cache, id, selectedCacheId }) => {
        const selectedCache = cache[selectedCacheId];
        const isSearchingMessage = this.isDefaultMessageId(sourceMessage);
        const searchMessageFailedPipeOperator$ = this.dataSourceActive$$.pipe(
          take(1),
          filter((dataSourceActive) => {
            return dataSourceActive;
          }),
          tap(() => {
            this.conversationMessageService.onNextSearchMessageFailed$();
          }),
        );

        // has id and existing cache
        if (selectedCache) {
          this.cache$$.next(this.cache$$.value);

          if (isSearchingMessage && selectedCache.size === 0) {
            // search message failed
            searchMessageFailedPipeOperator$.subscribe();
          }
          return of(selectedCache);
        }

        const commonPipeOperators = (
          source$: Observable<ConversationMessageWrapper | undefined>,
        ) => {
          return source$.pipe(
            tap((sourceConversationMessageWrapper) => {
              if (!isSearchingMessage) {
                return;
              }

              if (
                !sourceConversationMessageWrapper ||
                sourceConversationMessageWrapper.getConversationId() !==
                  getConversationMessagesFilter.conversationId
              ) {
                // search message failed
                searchMessageFailedPipeOperator$.subscribe();
              }
            }),
            tap((sourceConversationMessageWrapper) => {
              if (!sourceConversationMessageWrapper) {
                // reset to use all cache if message is not found on server
                this.sourceMessage$$.next(END_OF_CONVERSATION);
              }
            }),
            switchMap((sourceConversationMessageWrapper) => {
              if (!sourceConversationMessageWrapper) {
                return EMPTY;
              }

              return forkJoin({
                nextMessages: this.getPreviousOrNextMessage$({
                  direction: 'next',
                  sourceMessageId: sourceConversationMessageWrapper.getId(),
                }),
                previousMessages: this.getPreviousOrNextMessage$({
                  direction: 'previous',
                  sourceMessageId: sourceConversationMessageWrapper.getId(),
                }),
                id: of(id),
              });
            }),
            switchMap((props) => {
              return this.getSelectedCache$({ take: 1 }).pipe(
                map((cache) => ({
                  cache,
                  ...props,
                })),
              );
            }),
            map((props) => {
              const { nextMessages, cache, previousMessages } = props;
              if (nextMessages.conversationWrappers) {
                nextMessages.conversationWrappers.forEach((c) => {
                  cache.add(
                    this.encodeMessageKey({
                      id: c.getId(),
                      messageChecksum: c.getMessageChecksum() || 'no-checksum',
                      timestamp: dayjs(c.getCreatedAt()).unix(),
                    }),
                  );
                });
              }
              if (previousMessages.conversationWrappers) {
                previousMessages.conversationWrappers.forEach((c) => {
                  cache.add(
                    this.encodeMessageKey({
                      id: c.getId(),
                      messageChecksum: c.getMessageChecksum() || 'no-checksum',
                      timestamp: dayjs(c.getCreatedAt()).unix(),
                    }),
                  );
                });
              }
              return {
                ...props,
                cache,
              };
            }),
          );
        };

        return defer(() => {
          if (id === 'start') {
            return this.fetch$({
              ...this.getConversationMessagesFilter,
              order: 'asc',
              afterTimestamp: dayjs().subtract(100, 'year').unix(),
              limit: 1,
              offset: 0,
            }).pipe(
              switchMap((res) => {
                if (res && res.length > 0) {
                  return of(res[0]);
                }
                this.sourceMessage$$.next(END_OF_CONVERSATION);
                return EMPTY;
              }),
              commonPipeOperators,
              tap(({ cache }) => {
                return this.cache$$.next({
                  ...this.cache$$.value,
                  [id]: cache,
                });
              }),
            );
          }

          if (id === 'end') {
            this.setHasNextPage(false);
            return this.getPreviousOrNextMessage$({
              direction: 'previous',
            }).pipe(
              switchMap((props) => {
                return this.getSelectedCache$({ take: 1 }).pipe(
                  map((cache) => {
                    return {
                      cache,
                      ...props,
                    };
                  }),
                );
              }),
              tap(({ cacheKeys, cache }) => {
                if (cacheKeys) {
                  cacheKeys.forEach((key) => {
                    cache.add(key);
                  });
                  this.cache$$.next({
                    ...this.cache$$.value,
                    end: cache,
                  });
                }
              }),
              switchMap(() => {
                return of(true);
              }),
            );
          }

          if ('defaultMessageId' in id) {
            return this.conversationMessageService
              .getMessage$(
                getConversationMessagesFilter.conversationId!,
                id.defaultMessageId,
              )
              .pipe(
                commonPipeOperators,
                tap(({ cache }) => {
                  const encodedCacheKey = this.encodeCacheKey({
                    defaultMessageId: id.defaultMessageId,
                  });
                  return this.cache$$.next({
                    ...this.cache$$.value,
                    [encodedCacheKey]: cache,
                  });
                }),
              );
          }

          if ('timestamp' in id) {
            return this.fetch$({
              ...this.getConversationMessagesFilter,
              order: 'asc',
              afterTimestamp: id.timestamp,
              limit: 1,
              offset: 0,
            })
              .pipe(
                switchMap((res) => {
                  if (res && res.length > 0) {
                    return of(res[0]);
                  }
                  this.sourceMessage$$.next(END_OF_CONVERSATION);
                  return EMPTY;
                }),
              )
              .pipe(
                commonPipeOperators,
                tap(({ cache }) => {
                  const encodedCacheKey = this.encodeCacheKey({
                    defaultMessageId: id.timestamp,
                  });
                  return this.cache$$.next({
                    ...this.cache$$.value,
                    [encodedCacheKey]: cache,
                  });
                }),
              );
          }

          return EMPTY;
        });
      }),
    );
  }

  private setupInitialDefaultMessage(
    getConversationMessagesFilter: GetConversationMessagesDataSourceFilter,
  ) {
    // restarts the stream when a new defaultMessageId is received
    this.sourceMessage$$
      .pipe(
        switchMap((sourceMessage) => {
          // // defer to fetch default message first before the rest of the setup
          const initialDefaultMessage$ = defer(() => {
            return this.getFetchInitialDefaultMessage$({
              sourceMessage,
              getConversationMessagesFilter,
            });
          });
          return initialDefaultMessage$.pipe(
            switchMap(() => {
              return forkJoin([
                // after fetch and input initial data into cache, setup the fetch message trigger and scroll locks
                this.setupFetchMessage$(sourceMessage),
                this.setupScrollToDefaultMessage$(sourceMessage),
              ]);
            }),
          );
        }),
        takeUntil(this.disconnect$$),
        takeUntil(this.complete$$),
      )
      .subscribe();
  }

  private setupFetchMessage$(sourceMessage: SourceMessage) {
    const getObservable$ = (selectedCacheKey: CacheKey) =>
      this.fetchMessageTrigger$$.pipe(
        filter((value) => {
          return value !== undefined;
        }),
        debounceTime(100),
        // ignore incoming values if no next/previous page
        switchMap((direction) => {
          if (direction === 'next') {
            return this.getHasNextPage$({ selectedCacheKey }).pipe(
              switchMap((x) => {
                return x ? of(direction) : EMPTY;
              }),
            );
          }

          return this.getHasPreviousPage$().pipe(
            take(1),
            switchMap((x) => {
              return x ? of(direction) : EMPTY;
            }),
          );
        }),

        // ignore incoming values if already fetching previous page
        exhaustMap((direction) => {
          // safe to cast, undefined is already filtered away
          const castedDirection = direction as 'previous' | 'next';

          return this.getPreviousOrNextMessage$({
            direction: castedDirection,
          });
        }),
      );

    if (typeof sourceMessage === 'string') {
      return getObservable$(sourceMessage);
    }

    if ('defaultMessageId' in sourceMessage) {
      return getObservable$(
        this.encodeCacheKey({
          defaultMessageId: sourceMessage.defaultMessageId,
        }),
      );
    }

    if ('timestamp' in sourceMessage) {
      return getObservable$(
        this.encodeCacheKey({ timestamp: sourceMessage.timestamp }),
      );
    }

    throw new Error('Invalid source message');
  }

  private setupScrollToDefaultMessage$(sourceMessage: SourceMessage) {
    // scroll to default message on id change
    return this.dataSourceActive$$.pipe(
      // only scroll if datasource active
      filter((datasourceActive) => {
        return datasourceActive;
      }),
      switchMap(() =>
        this.cache$$.pipe(
          take(1),
          // TODO: only scroll using selected cache
          filter((cache) => {
            if (sourceMessage === 'start') {
              return !!cache && !!cache.start;
            }

            if (sourceMessage === 'end') {
              return !!cache && !!cache.end;
            }
            if ('defaultMessageId' in sourceMessage) {
              const encodedCacheKey = this.encodeCacheKey({
                defaultMessageId: sourceMessage.defaultMessageId,
              });
              return !!cache && !!cache[encodedCacheKey];
            }
            if ('timestamp' in sourceMessage) {
              const encodedCacheKey = this.encodeCacheKey({
                timestamp: sourceMessage.timestamp,
              });
              return !!cache && !!cache[encodedCacheKey];
            }

            return false;
          }),
          switchMap((cache) => {
            if (sourceMessage === 'start') {
              return this.conversationWindowUIService
                .continuouslyScrollToTopPeriodically$(
                  this.getUniqueIdentifier(),
                )
                .pipe(this.getScrollUntil$());
            }

            if (sourceMessage === 'end') {
              return this.getLatestMessageInSelectedCache$({
                take: 1,
                sourceMessage,
              }).pipe(
                switchMap((latestMessageKey) => {
                  if (latestMessageKey) {
                    return this.conversationWindowUIService
                      .continuouslyScrollToMessagePeriodically$({
                        cacheKey: latestMessageKey,
                      })
                      .pipe(this.getScrollUntil$());
                  }

                  return EMPTY;
                }),
              );
            }

            if ('defaultMessageId' in sourceMessage) {
              let lastElem: Element | null = null;
              return this.conversationWindowUIService
                .continuouslyScrollToMessagePeriodically$({
                  messageId: sourceMessage.defaultMessageId,
                })
                .pipe(
                  tap((elem) => {
                    elem?.setAttribute(HIGHLIGHT_ATTRIBUTE, 'true');
                    lastElem = elem;
                  }),
                  last(),
                  finalize(() => {
                    lastElem?.setAttribute(HIGHLIGHT_ATTRIBUTE, 'false');
                  }),
                  this.getScrollUntil$(),
                );
            }

            if ('timestamp' in sourceMessage) {
              const encodedCacheKey = this.encodeCacheKey({
                timestamp: sourceMessage.timestamp,
              });

              const cacheArray = Array.from(cache[encodedCacheKey]);
              // Find the message with the closest timestamp
              const closestMessage = cacheArray.reduce((closest, current) => {
                const closestTimestamp =
                  this.parseMessageKey(closest).timestamp;
                const currentTimestamp =
                  this.parseMessageKey(current).timestamp;

                const closestDiff = Math.abs(
                  closestTimestamp - sourceMessage.timestamp,
                );
                const currentDiff = Math.abs(
                  currentTimestamp - sourceMessage.timestamp,
                );

                return currentDiff < closestDiff ? current : closest;
              });

              if (closestMessage) {
                return this.conversationWindowUIService
                  .continuouslyScrollToMessagePeriodically$({
                    cacheKey: closestMessage,
                  })
                  .pipe(this.getScrollUntil$());
              }
            }

            return EMPTY;
          }),
        ),
      ),
      takeUntil(this.disconnect$$),
      takeUntil(this.complete$$),
    );
  }

  private setupSendingMessageHandling(
    getConversationMessagesFilter: GetConversationMessagesDataSourceFilter,
  ) {
    const sendingMessageTuple$ = this.sendingConversationMessageManager
      .getSendingMessages$(getConversationMessagesFilter.conversationId!)
      .pipe(
        mergeMap((sendingMessage) => {
          return forkJoin({
            sendingMessage: of(sendingMessage),
            staff: this.userService.getMyStaff$().pipe(take(1)),
            company: this.companyService.getCompany$().pipe(take(1)),
            allStaff: this.companyService.getAllStaffsCore$().pipe(take(1)),
            cachedItems: this.cache$$.pipe(take(1)),
          });
        }),
        mergeMap(async (props) => {
          const { sendingMessage, staff, allStaff, company } = props;
          const transformedMessage =
            await this.myConversationInputViewModelManager.transformMessagePayloadToTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel(
              {
                sendingMessage,
                staff,
                company,
                allStaff,
              },
            );

          return {
            conversationMessageWrapper:
              this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
                sendingMessage.messageChecksum,
                transformedMessage,
              ),
            ...props,
          };
        }),
        mergeMap(({ cachedItems, ...rest }) => {
          return from(
            Object.entries(cachedItems).map((cachedItems) => {
              return {
                cachedItems,
                ...rest,
              };
            }),
          );
        }),
      );

    // handles sending messages not in cache
    const sendingMessagesNotInCacheHandling$ = sendingMessageTuple$.pipe(
      filter((props) => {
        const {
          sendingMessage,
          cachedItems: [_, cachedItems],
        } = props;
        return Array.from(cachedItems).every((key) => {
          const { messageChecksum } = this.parseMessageKey(key);
          return messageChecksum !== sendingMessage.messageChecksum;
        });
      }),
    );

    sendingMessagesNotInCacheHandling$
      .pipe(
        concatMap(async (props) => {
          const { conversationMessageWrapper } = props;

          const isMatchedConversationMessageWrapper =
            await this.getIsMatchedConversationMessageWrapper(
              getConversationMessagesFilter,
              conversationMessageWrapper,
            );
          return {
            isMatchedConversationMessageWrapper,
            ...props,
          };
        }),
        filter(({ isMatchedConversationMessageWrapper }) => {
          return isMatchedConversationMessageWrapper;
        }),
        switchMap((props) => {
          const {
            cachedItems: [key],
          } = props;
          return this.getHasNextPage$({
            take: 1,
            selectedCacheKey: key as CacheKey,
          }).pipe(
            map((hasNextPage) => {
              return {
                hasNextPage,
                ...props,
              };
            }),
          );
        }),
        filter(({ hasNextPage }) => {
          return !hasNextPage;
        }),
        map((props) => {
          const {
            conversationMessageWrapper,
            cachedItems: [key, cachedItems],
          } = props;
          // set conversation wrapper into map to stop it from being garbage collected
          const encodedCacheKey = this.encodeMessageKey({
            messageChecksum: conversationMessageWrapper.getMessageChecksum(),
            timestamp: dayjs(conversationMessageWrapper.getCreatedAt()).unix(),
          });

          const isScrolledToBottom =
            this.conversationWindowUIService.getIsScrolledToBottom(
              this.getUniqueIdentifier(),
            );

          this.conversationMessageWrappersMap.set(
            encodedCacheKey,
            conversationMessageWrapper,
          );
          conversationMessageWrapper.subscribe(this);

          // Create a new Set to avoid mutating the original cachedItems
          const updatedCachedItems = new Set(cachedItems);
          updatedCachedItems.add(encodedCacheKey);
          this.cache$$.next({
            ...this.cache$$.value,
            [key]: updatedCachedItems,
          });

          return {
            ...props,
            isScrolledToBottom,
          };
        }),
        tap(({ cachedItems: [key] }) => {
          if (key === 'end') {
            this.setSourceMessage({
              direction: 'end',
            });
          }
        }),
        takeUntil(this.disconnect$$),
        takeUntil(this.complete$$),
      )
      .subscribe();

    const failedSendingMessagesNotInCacheHandling$ = sendingMessageTuple$.pipe(
      filter(({ sendingMessage, cachedItems: [_, cachedItems] }) => {
        return (
          Array.from(cachedItems).findIndex((x) => {
            const { messageChecksum } = this.parseMessageKey(x);
            return messageChecksum === sendingMessage.messageChecksum;
          }) !== -1 && sendingMessage.status === 'Failed'
        );
      }),
    );

    failedSendingMessagesNotInCacheHandling$
      .pipe(
        concatMap(async (props) => {
          const { conversationMessageWrapper } = props;

          const isMatchedConversationMessageWrapper =
            await this.getIsMatchedConversationMessageWrapper(
              getConversationMessagesFilter,
              conversationMessageWrapper,
            );
          return {
            isMatchedConversationMessageWrapper,
            ...props,
          };
        }),
        filter(({ isMatchedConversationMessageWrapper }) => {
          return isMatchedConversationMessageWrapper;
        }),
        tap(({ conversationMessageWrapper, cachedItems: [_, cachedItems] }) => {
          // set conversation wrapper into map to stop it from being garbage collected
          const encodedCacheKey = this.encodeMessageKey({
            messageChecksum: conversationMessageWrapper.getMessageChecksum(),
            timestamp: dayjs(conversationMessageWrapper.getCreatedAt()).unix(),
          });

          const updatedCachedItems = new Set(cachedItems);

          this.conversationMessageWrappersMap.delete(encodedCacheKey);
          updatedCachedItems.delete(encodedCacheKey);

          this.cache$$.next({
            ...this.cache$$.value,
            [encodedCacheKey]: updatedCachedItems,
          });
        }),
        takeUntil(this.disconnect$$),
        takeUntil(this.complete$$),
      )
      .subscribe();

    // remove duplicate messages from cache based on messageChecksum periodically
    this.cache$$
      .pipe(
        mergeMap((cache) => {
          return from(Object.entries(cache));
        }),
        distinctUntilChanged(),
        debounceTime(500),
        takeUntil(this.disconnect$$),
        takeUntil(this.complete$$),
      )
      .subscribe(([key, cacheItems]) => {
        const arrayCacheItems = Array.from(cacheItems);
        const uniqueCacheItems = arrayCacheItems.filter((x, index, self) => {
          const parsedXCachedKey = this.parseMessageKey(x);
          const duplicateIndex = self.findIndex((y, yIndex) => {
            if (index === yIndex) return false;
            const parsedYCachedKey = this.parseMessageKey(y);
            return (
              parsedXCachedKey.messageChecksum ===
              parsedYCachedKey.messageChecksum
            );
          });

          if (duplicateIndex !== -1) {
            const parsedDuplicateCachedKey = this.parseMessageKey(
              self[duplicateIndex],
            );
            if (
              parsedXCachedKey.id === ID_FALLBACK &&
              parsedDuplicateCachedKey.id !== ID_FALLBACK
            ) {
              return false;
            }
          }

          return true;
        });

        if (cacheItems.size !== uniqueCacheItems.length) {
          this.cache$$.next({
            ...this.cache$$.value,
            [key]: new Set(uniqueCacheItems),
          });
        }
      });
  }

  private setupRealtimeMessageHandling(
    getConversationMessagesFilter: GetConversationMessagesDataSourceFilter,
  ) {
    merge(
      this.classicRealTimeService.getOnConversationMessageChanged$(),
      this.sendingConversationMessageManager.getSentMessage$(),
    )
      .pipe(
        map(
          (
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
          ) => {
            return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
              travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.id!,
              travisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
            );
          },
        ),
        switchMap((conversationMessageWrapper) => {
          return this.cache$$.pipe(
            take(1),
            map((cache) => {
              return {
                cache,
                conversationMessageWrapper,
              };
            }),
          );
        }),
        mergeMap(({ cache, conversationMessageWrapper }) => {
          return from(
            Object.entries(cache).map((cachedItems) => {
              return {
                cachedItems,
                conversationMessageWrapper,
              };
            }),
          );
        }),
        concatMap(async (props) => {
          const {
            conversationMessageWrapper,
            cachedItems: [key, cachedItems],
          } = props;

          const encodedKey = this.encodeMessageKey({
            id: conversationMessageWrapper.getId(),
            messageChecksum: conversationMessageWrapper.getMessageChecksum(),
            timestamp: dayjs(conversationMessageWrapper.getCreatedAt()).unix(),
          });

          const isMatchedConversationMessageWrapper =
            await this.getIsMatchedConversationMessageWrapper(
              getConversationMessagesFilter,
              conversationMessageWrapper,
            );

          // has id but does not match filter then remove from cache
          if (
            cachedItems.has(encodedKey) &&
            !isMatchedConversationMessageWrapper
          ) {
            cachedItems.delete(encodedKey);
            this.cache$$.next({
              ...this.cache$$.value,
              [key]: cachedItems,
            });
          }

          // DEVS-9529: if message is scheduled, always delete the previous cache key on webhook received
          this.deleteScheduledMessageCache(
            key,
            cachedItems,
            conversationMessageWrapper,
          );

          return {
            encodedKey,
            isMatchedConversationMessageWrapper,
            ...props,
          };
        }),

        filter(
          ({
            cachedItems: [_, cachedItems],
            conversationMessageWrapper,
            isMatchedConversationMessageWrapper,
          }) => {
            if (!this.getConversationMessagesFilter) {
              return false;
            }
            const isItemNotInCache = Array.from(cachedItems).every((x) => {
              const { id } = this.parseMessageKey(x);
              return conversationMessageWrapper.getId() !== id;
            });

            return isItemNotInCache && isMatchedConversationMessageWrapper;
          },
        ),
        switchMap((props) => {
          const {
            cachedItems: [key],
          } = props;
          return this.getHasNextPage$({
            take: 1,
            selectedCacheKey: key as CacheKey,
          }).pipe(
            map((hasNextPage) => ({
              hasNextPage,
              ...props,
            })),
          );
        }),
        filter(({ hasNextPage }) => {
          return !hasNextPage;
        }),
        map((props) => {
          const {
            encodedKey,
            conversationMessageWrapper,
            cachedItems: [key, cachedItems],
            hasNextPage,
          } = props;

          const isScrolledToBottom =
            this.conversationWindowUIService.getIsScrolledToBottom(
              this.getUniqueIdentifier(),
            );

          // find item based on messagechecksum and remove it if it exists
          const cachedItemFromMessageChecksum = Array.from(cachedItems).find(
            (item) => {
              const { messageChecksum } = this.parseMessageKey(item);
              return (
                messageChecksum ===
                conversationMessageWrapper.getMessageChecksum()
              );
            },
          );

          if (cachedItemFromMessageChecksum) {
            this.conversationMessageWrappersMap.delete(
              cachedItemFromMessageChecksum,
            );
            cachedItems.delete(cachedItemFromMessageChecksum);
          }

          this.conversationMessageWrappersMap.set(
            encodedKey,
            conversationMessageWrapper,
          );
          conversationMessageWrapper.subscribe(this);

          cachedItems.add(encodedKey);

          this.cache$$.next({
            ...this.cache$$.value,
            [key]: cachedItems,
          });

          return {
            ...props,
            isScrolledToBottom,
            hasNextPage,
          };
        }),
        switchMap(({ isScrolledToBottom, cachedItems: [key] }) => {
          if (!isScrolledToBottom) {
            return EMPTY;
          }

          // datasource active + selectedCacheKey === key
          return this.dataSourceActive$$.pipe(
            take(1),
            filter((x) => {
              return x;
            }),
            switchMap((dataSourceActive) => {
              if (!dataSourceActive) {
                return EMPTY;
              }
              return this.getSelectedCacheKey$({ take: 1 }).pipe(
                tap((selectedCacheKey) => {
                  if (selectedCacheKey === key) {
                    this.setSourceMessage({
                      direction: 'end',
                    });
                  }
                }),
              );
            }),
          );
        }),
        takeUntil(this.disconnect$$),
        takeUntil(this.complete$$),
      )
      .subscribe();
  }

  private async getIsMatchedConversationMessageWrapper(
    conversationMessageFilter: GetConversationMessagesDataSourceFilter,
    conversationMessageWrapper: ConversationMessageWrapper,
  ) {
    if (
      conversationMessageWrapper.getConversationId() !==
      conversationMessageFilter.conversationId
    ) {
      return false;
    }

    if (
      conversationMessageFilter.channelMessageFilters !== undefined &&
      conversationMessageFilter.channelMessageFilters.length > 0 &&
      conversationMessageFilter.channelMessageFilters.every(
        (f) =>
          f.channelIdentityId !==
          conversationMessageWrapper.getChannelIdentityId(),
      )
    ) {
      return false;
    }

    try {
      const status = await firstValueFrom(
        conversationMessageWrapper.getStatus$(),
      );
      if (
        conversationMessageFilter.messageStatus !== undefined &&
        status !== conversationMessageFilter.messageStatus
      ) {
        return false;
      }
    } catch (e) {
      console.error(e);
    }

    return true;
  }

  private fetch$(
    getConversationMessagesFilter: GetConversationMessagesDataSourceFilter,
  ) {
    return this.conversationMessageService.getMessages$(
      getConversationMessagesFilter,
    );
  }

  private setHasNextPage(value: boolean) {
    this.setStatusToSourceSubject(this.hasNextPage$$, value);
  }

  private setIsFetchingPreviousPage(value: boolean) {
    this.setStatusToSourceSubject(this.isFetchingPreviousPage$$, value);
  }

  private setIsFetchingNextPage(value: boolean) {
    this.setStatusToSourceSubject(this.isFetchingNextPage$$, value);
  }

  private getSelectedCache$(
    props: { take?: number; sourceMessage?: SourceMessage } = {},
  ) {
    const { take: takeNumber, sourceMessage } = props;
    return this.cache$$.pipe(
      takeNumber ? take(takeNumber) : identity,
      switchMap((cache) => {
        return this.getSelectedCacheKey$({ take: 1, sourceMessage }).pipe(
          map((id) => {
            return cache[id] || new Set();
          }),
        );
      }),
    );
  }

  public getUniqueIdentifier() {
    return this.uniqueIdentifier;
  }

  private getScrollUntil$<T>() {
    return (source$: Observable<T>) =>
      source$.pipe(
        takeUntil(this.disconnect$$),
        takeUntil(this.complete$$),
        takeUntil(this.dataSourceActive$$.pipe(filter((x) => !x))),
        takeUntil(userInteracted$),
        takeUntil(this.newSourceMessage$$), // complete the interval when a new source message is received
      );
  }

  private getSelectedCacheKey$(
    props: { take?: number; sourceMessage?: SourceMessage } = {},
  ) {
    const { take: takeNumber, sourceMessage } = props;
    const observable$ = sourceMessage
      ? of(sourceMessage)
      : this.sourceMessage$$;
    return observable$.pipe(
      takeNumber ? take(takeNumber) : identity,
      map((id) => {
        if (typeof id === 'string') {
          return id;
        }
        if ('defaultMessageId' in id) {
          const encodedCacheKey = this.encodeCacheKey({
            defaultMessageId: id.defaultMessageId,
          });
          return encodedCacheKey;
        }
        const encodedCacheKey = this.encodeCacheKey({
          timestamp: id.timestamp,
        });
        return encodedCacheKey;
      }),
    );
  }

  private isSubsetOf(subset: Set<MessageKey>, superset: Set<MessageKey>) {
    for (const item of subset) {
      if (!superset.has(item)) {
        return false;
      }
    }
    return true;
  }

  private getLatestMessageInSelectedCache$(
    props: { take?: number; sourceMessage?: SourceMessage } = {},
  ) {
    const { take: takeNumber, sourceMessage } = props;
    return this.getSelectedCache$({ take: takeNumber, sourceMessage }).pipe(
      map((cache) => {
        const allCacheKeys = Array.from(cache).sort((a, b) => {
          const parsedAKey = this.parseMessageKey(a);
          const parsedBKey = this.parseMessageKey(b);
          return parsedBKey.timestamp - parsedAKey.timestamp;
        });
        if (allCacheKeys.length === 0) {
          return;
        }
        const latestMessageKey = allCacheKeys[0];
        return latestMessageKey;
      }),
    );
  }

  private getStatusFromSourceObservable$<T extends Record<CacheKey, any>>(
    sourceObservable: Observable<T>,
    options: { take?: number; selectedCacheKey?: CacheKey } = {},
  ) {
    const { take: takeNumber, selectedCacheKey } = options;
    return merge(
      sourceObservable,
      this.sourceMessage$$.pipe(switchMap(() => sourceObservable)),
    ).pipe(
      takeNumber ? take(takeNumber) : identity,
      switchMap((cache) => {
        const observable$ = selectedCacheKey
          ? of(selectedCacheKey)
          : this.getSelectedCacheKey$({ take: 1 });
        return observable$.pipe(
          map((id) => {
            const value = cache[id];

            return value !== undefined ? value : true;
          }),
        );
      }),
    );
  }

  private setStatusToSourceSubject<T extends Record<CacheKey, any>>(
    subject$$: Subject<T>,
    value: T[keyof T],
    options: { selectedCacheKey?: CacheKey } = {},
  ) {
    const { selectedCacheKey } = options;
    const observable$ = selectedCacheKey
      ? of(selectedCacheKey)
      : this.getSelectedCacheKey$({ take: 1 });
    observable$
      .pipe(
        switchMap((id) => {
          return subject$$.pipe(
            take(1),
            map((cache) => {
              return {
                id,
                cache,
              };
            }),
          );
        }),
      )
      .subscribe(({ id, cache }) => {
        subject$$.next({
          ...cache,
          [id]: value,
        });
      });
  }

  private deleteScheduledMessageCache(
    key: string,
    cachedItems: Set<MessageKey>,
    conversationMessageWrapper: ConversationMessageWrapper,
  ) {
    const isScheduledMessage =
      conversationMessageWrapper.getScheduleSentAt() !== null &&
      conversationMessageWrapper.getScheduleSentAt() !== undefined;

    if (!isScheduledMessage) {
      return;
    }
    const encodedKeyById = this.findCacheKeyByIdAndCheckSum(
      cachedItems,
      conversationMessageWrapper.getId(),
      conversationMessageWrapper.getMessageChecksum(),
    );
    if (!encodedKeyById) {
      return;
    }
    cachedItems.delete(encodedKeyById);
    this.cache$$.next({
      ...this.cache$$.value,
      [key]: cachedItems,
    });
  }

  private findCacheKeyByIdAndCheckSum(
    cachedItems: Set<MessageKey>,
    id: string | number,
    messageChecksum: string,
  ): MessageKey | undefined {
    for (const key of cachedItems) {
      const { id: cachedId, messageChecksum: cachedMessageChecksum } =
        this.parseMessageKey(key);
      if (id === cachedId && messageChecksum === cachedMessageChecksum) {
        return key;
      }
    }
    return undefined;
  }
}
