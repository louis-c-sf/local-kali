import { interfaces } from 'inversify';
import {
  catchError,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  Observable,
  take,
  takeUntil,
  tap,
} from 'rxjs';

import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

import { ConversationMessageWrapper } from '../conversation-messages/managers/conversation-message-wrapper';
import { ConversationMessageWrapperManagerService } from '../conversation-messages/managers/conversation-message-wrapper-manager.service';
import { ArrayPagedDataSource } from '../data-sources/array-paged-data-source';
import { DisposableDataSource } from '../data-sources/disposable-data-source';
import { DataSourceListRange } from '../data-sources/models/data-source-list-range';
import { Wrapper } from '../models/wrapper';
import { UserProfileWrapper } from '../user-profiles/managers/user-profile-wrapper';
import { UserProfileService } from '../user-profiles/user-profile.service';
import { ConversationMatcherService } from './conversation-matcher.service';
import { ConversationService } from './conversation.service';
import { ConversationWrapper } from './managers/conversation-wrapper';
import { GetConversationsFilter } from './models/get-conversations-filter';
import { LogService } from '../logs/log.service';

export class ConversationWithUserProfileResult implements Wrapper {
  constructor(
    public userProfile: UserProfileWrapper,
    public conversation: ConversationWrapper,
    public lastMessage?: ConversationMessageWrapper,
  ) {}

  getId(): string | number {
    return this.conversation.getId();
  }

  destroy(): void {
    // This is intentionally left blank as userProfile and conversation are managed by their own managers
  }

  subscribe(disposableDataSource: DisposableDataSource): void {
    this.userProfile.subscribe(disposableDataSource);
    this.conversation.subscribe(disposableDataSource);
    this.lastMessage?.subscribe(disposableDataSource);
  }

  unsubscribe(disposableDataSource: DisposableDataSource): void {
    this.userProfile.unsubscribe(disposableDataSource);
    this.conversation.unsubscribe(disposableDataSource);
    this.lastMessage?.unsubscribe(disposableDataSource);
  }

  observed() {
    return (
      this.userProfile.observed() ||
      this.conversation.observed() ||
      this.lastMessage?.observed() ||
      false
    );
  }
}

export class ConversationWithUserProfileDataSource extends ArrayPagedDataSource<ConversationWithUserProfileResult> {
  private readonly conversationService: ConversationService;
  private readonly conversationMatcherService: ConversationMatcherService;
  private readonly userProfileService: UserProfileService;
  private readonly conversationMessageWrapperManagerService: ConversationMessageWrapperManagerService;
  private readonly logService: LogService;

  private readonly pageSize = 20;
  private readonly fetchedPageIdxs = new Set<number>();

  private hasSetup = false;

  public constructor(container: interfaces.Container) {
    super();

    this.conversationService =
      container.get<ConversationService>(ConversationService);
    this.conversationMatcherService = container.get<ConversationMatcherService>(
      ConversationMatcherService,
    );
    this.userProfileService =
      container.get<UserProfileService>(UserProfileService);
    this.conversationMessageWrapperManagerService =
      container.get<ConversationMessageWrapperManagerService>(
        ConversationMessageWrapperManagerService,
      );
    this.logService = container.get(LogService);
  }

  public setupAndGet$ = (
    getConversationsFilter: GetConversationsFilter,
    listRange$: Observable<DataSourceListRange>,
  ): Observable<ConversationWithUserProfileResult[]> => {
    listRange$
      .pipe(
        distinctUntilChanged((a, b) => {
          return a.start == b.start && a.end == b.end;
        }),
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
      )
      .subscribe((range) => {
        const endPage = this.getPageForIndex(range.end);
        this.fetchPage(endPage + 1, getConversationsFilter);
      });

    if (this.hasSetup) {
      return this.getCachedItems$();
    }

    this.hasSetup = true;

    // Yields the initial empty array
    this.yieldSortedItems(true);

    this.setup(getConversationsFilter);

    return this.getCachedItems$();
  };

  private setup = (getConversationsFilter: GetConversationsFilter) => {
    this.setupSortFunc(
      getConversationsFilter.orderBy === 'asc'
        ? this.sortAscFunc
        : this.sortDescFunc,
    );

    this.fetchPage(0, getConversationsFilter);
    this.setupRealtimeUpdates(getConversationsFilter);
  };

  private withUserProfileAndLastMessage$ = (
    conversation: ConversationWrapper,
  ) => {
    return combineLatest([
      this.userProfileService.getUserProfileWrapper$(
        conversation.getUserProfileId(),
      ),
      conversation.getLastMessageId$().pipe(
        map((lastMessageId) => {
          return this.conversationMessageWrapperManagerService.getConversationMessageWrapper(
            lastMessageId,
          );
        }),
      ),
    ]).pipe(
      take(1),
      map(([userProfile, conversationMessageWrapper]) => {
        return {
          conversation,
          userProfile,
          lastMessage: conversationMessageWrapper,
        };
      }),
    );
  };

  private setupRealtimeUpdates = (
    getConversationsFilter: GetConversationsFilter,
  ) => {
    this.conversationService
      .getOngoingUpdatedConversation$(getConversationsFilter)
      .pipe(
        filter((conversation) => !this.hasId(conversation.getId())),
        concatMap(this.withUserProfileAndLastMessage$),
        // check whether the incoming conversation matches our getConversationFilter again because the above operations are async and the conversation could have been updated
        concatMap(({ conversation, ...rest }) =>
          this.conversationMatcherService
            .matchConversationWrapper(getConversationsFilter, conversation)
            .pipe(map((matched) => ({ conversation, matched, ...rest }))),
        ),
        filter(({ matched }) => matched),
        takeUntil(this.getDisconnect$()),
        catchError((error) => {
          this.logService.critical(error);
          return EMPTY;
        }),
      )
      .subscribe((x) => {
        this.addItem(
          new ConversationWithUserProfileResult(
            x.userProfile,
            x.conversation,
            x.lastMessage,
          ),
        );
      });

    this.conversationService
      .getCachedConversationUpdate$()
      .pipe(
        filter(([, cwu]) => this.hasId(cwu.id)),
        takeUntil(this.getDisconnect$()),
      )
      .subscribe(([conversationWrapper, conversationWrapperUpdate]) => {
        if (
          ['lastMessage', 'updatedTime'].includes(
            conversationWrapperUpdate.type,
          )
        ) {
          this.yieldSortedItems();
          return;
        }

        // `channelIds` is only checked against the last message, but isn't checked against earlier messages within the conversation,
        // which will lead to conversations being removed wrongly despite having a message that matches the `channelIds`.
        // Since conversation messages don't disappear, once a message that matches channelId exists, the conversation will always match the filter. So we can safely ignore this case.
        const { channelIds: _, ...rest } = getConversationsFilter;
        this.conversationMatcherService
          .matchConversationWrapper(rest, conversationWrapper)
          .pipe(
            tap((matches) => {
              if (matches) {
                // The item is already updated continuously in the wrapper
              } else {
                this.removeItemById(conversationWrapper.getId());
              }
            }),
            catchError((error) => {
              this.logService.critical(error);
              return EMPTY;
            }),
          )
          .subscribe();
      });
  };

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private fetchPage(
    page: number,
    getConversationsFilter: GetConversationsFilter,
  ): void {
    if (this.fetchedPageIdxs.has(page)) {
      return;
    }
    this.fetchedPageIdxs.add(page);

    let observable$:
      | Observable<
          {
            userProfile: UserProfileWrapper;
            conversation: ConversationWrapper;
            lastMessage?: ConversationMessageWrapper;
          }[]
        >
      | undefined;
    if (getConversationsFilter.assignedTeamId) {
      observable$ = this.conversationService.getTeamConversations$(
        page * this.pageSize,
        this.pageSize,
        getConversationsFilter.orderBy ?? 'desc',
        getConversationsFilter,
      );
    }
    // assignedTeamId should be checked first because assignedStaffId can also be a subset of assignedTeamId
    else if (getConversationsFilter.assignedStaffId) {
      observable$ = this.conversationService.getStaffConversations$(
        page * this.pageSize,
        this.pageSize,
        getConversationsFilter.orderBy ?? 'desc',
        getConversationsFilter,
      );
    } else if (getConversationsFilter.isCollaborated) {
      observable$ = this.conversationService.getCollaboratedConversations$(
        page * this.pageSize,
        this.pageSize,
        getConversationsFilter.orderBy ?? 'desc',
        getConversationsFilter,
      );
    } else if (getConversationsFilter.isMentioned) {
      observable$ = this.conversationService.getMentionedConversations$(
        page * this.pageSize,
        this.pageSize,
        getConversationsFilter.orderBy ?? 'desc',
        getConversationsFilter,
      );
    } else {
      observable$ = this.conversationService.getAllConversations$(
        page * this.pageSize,
        this.pageSize,
        getConversationsFilter.orderBy ?? 'desc',
        getConversationsFilter,
      );
    }

    // Update isLoading to true before starting to fetch data
    this.setIsFetchingNextPage(true);

    observable$
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        RxjsUtils.getRetryAPIRequest(),
        finalize(() => {
          this.setIsFetchingNextPage(false);
        }),
      )
      .subscribe({
        next: (tuples) => {
          if (tuples && tuples.length > 0) {
            if (tuples.length < this.pageSize) {
              this.setHasNextPage(false);
              this.complete();
            }

            this.addItems(
              tuples.map((tuple) => {
                return new ConversationWithUserProfileResult(
                  tuple.userProfile,
                  tuple.conversation,
                  tuple.lastMessage,
                );
              }),
            );
          } else {
            this.setHasNextPage(false);
            this.yieldSortedItems();
          }
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          // This is intentionally left blank
        },
      });
  }

  private sortAscFunc = (
    a: ConversationWithUserProfileResult,
    b: ConversationWithUserProfileResult,
  ) => {
    // Check if either conversation is pinned
    const aPinned = a.conversation.getIsPinned();
    const bPinned = b.conversation.getIsPinned();

    // If both or neither are pinned, sort by date
    if (aPinned === bPinned) {
      return a.conversation
        .getUpdatedTime()
        .localeCompare(b.conversation.getUpdatedTime());
    }

    // If only one is pinned, it should come first regardless of the sort order
    return aPinned ? -1 : 1;
  };

  private sortDescFunc = (
    a: ConversationWithUserProfileResult,
    b: ConversationWithUserProfileResult,
  ) => {
    // Check if either conversation is pinned
    const aPinned = a.conversation.getIsPinned();
    const bPinned = b.conversation.getIsPinned();

    // If both or neither are pinned, sort by date
    if (aPinned === bPinned) {
      return -a.conversation
        .getUpdatedTime()
        .localeCompare(b.conversation.getUpdatedTime());
    }

    // If only one is pinned, it should come first regardless of the sort order
    return aPinned ? -1 : 1;
  };
}
