import { interfaces } from 'inversify';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  filter,
  from,
  map,
  Observable,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';

import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

import { ConversationMessageWrapper } from '../conversation-messages/managers/conversation-message-wrapper';
import { ArrayPagedDataSource } from '../data-sources/array-paged-data-source';
import { DisposableDataSource } from '../data-sources/disposable-data-source';
import { DataSourceListRange } from '../data-sources/models/data-source-list-range';
import { Wrapper } from '../models/wrapper';
import { ClassicRealTimeService } from '../signal-r/classic-real-time.service';
import { UserProfileWrapper } from '../user-profiles/managers/user-profile-wrapper';
import { UserService } from '../user.service';
import { ConversationMatcherService } from './conversation-matcher.service';
import { ConversationService } from './conversation.service';
import { ConversationWrapper } from './managers/conversation-wrapper';
import { SearchConversationsParams } from './models/search-conversations-params';
import { ignoreSearchMessageEndpointBackendCacheForOneMinute } from './utils';
import { PermissionService } from '../permissions/permission.service';

type TotalNumberOfItems = number | undefined;
export class SearchConversationWithMessageAndUserProfileResult
  implements Wrapper
{
  constructor(
    public message: ConversationMessageWrapper,
    public conversation: ConversationWrapper,
    public userProfile?: UserProfileWrapper,
  ) {}

  getId(): string | number {
    return this.message.getId();
  }

  destroy(): void {
    // This is intentionally left blank as conversation is managed by its own manager
  }

  subscribe(disposableDataSource: DisposableDataSource): void {
    this.message.subscribe(disposableDataSource);
    this.conversation.subscribe(disposableDataSource);
    this.userProfile?.subscribe(disposableDataSource);
  }

  unsubscribe(disposableDataSource: DisposableDataSource): void {
    this.message.unsubscribe(disposableDataSource);
    this.conversation.unsubscribe(disposableDataSource);
    this.userProfile?.unsubscribe(disposableDataSource);
  }

  observed() {
    return (
      this.message.observed() ||
      this.conversation.observed() ||
      this.userProfile?.observed() === true
    );
  }
}

export class SearchConversationWithMessageAndUserProfileDataSource extends ArrayPagedDataSource<SearchConversationWithMessageAndUserProfileResult> {
  private readonly conversationService: ConversationService;
  private readonly userService: UserService;
  private readonly conversationMatcherService: ConversationMatcherService;
  private readonly classicRealtimeService: ClassicRealTimeService;
  private readonly permissionService: PermissionService;

  private readonly pageSize = 20;
  private readonly fetchedPageIdxs = new Set<number>();

  private readonly totalNumberOfItems$$ =
    new BehaviorSubject<TotalNumberOfItems>(undefined);

  private searchConversationsParams?: SearchConversationsParams;

  private hasSetup = false;

  private readonly isRefetching$$ = new BehaviorSubject(false);

  public constructor(container: interfaces.Container) {
    super();

    this.conversationService =
      container.get<ConversationService>(ConversationService);

    this.userService = container.get<UserService>(UserService);

    this.conversationMatcherService = container.get<ConversationMatcherService>(
      ConversationMatcherService,
    );

    this.classicRealtimeService = container.get<ClassicRealTimeService>(
      ClassicRealTimeService,
    );

    this.permissionService =
      container.get<PermissionService>(PermissionService);
  }

  public getTotalNumberOfItems$(): Observable<TotalNumberOfItems> {
    return this.totalNumberOfItems$$.pipe(takeUntil(this.getDisconnect$()));
  }

  public setupAndGet$(
    searchConversationsParams: SearchConversationsParams,
    listRange$: Observable<DataSourceListRange>,
  ): Observable<SearchConversationWithMessageAndUserProfileResult[]> {
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
        this.fetchPage(endPage + 1);
      });

    if (this.hasSetup) {
      return this.getCachedItems$();
    }

    this.hasSetup = true;

    // Yields the initial empty array
    this.yieldSortedItems(true);

    this.setup(searchConversationsParams);

    return this.getCachedItems$();
  }

  private setup(searchConversationsParams: SearchConversationsParams): void {
    this.setupSortFunc(this.sortDescFunc);
    this.searchConversationsParams = searchConversationsParams;

    this.fetchPage(0);

    this.handleRemoveConversation();
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private setIsRefetching(isRefetching: boolean) {
    if (this.isRefetching$$.getValue() !== isRefetching) {
      this.isRefetching$$.next(isRefetching);
    }
  }

  private fetchPage(page: number, refetch = false): void {
    if (!this.searchConversationsParams) {
      return;
    }

    if (!refetch && this.fetchedPageIdxs.has(page)) {
      return;
    }

    this.fetchedPageIdxs.add(page);

    const observable$ =
      this.conversationService.searchMessageWithConversations$(
        page * this.pageSize,
        this.pageSize,
        this.searchConversationsParams,
        this.searchConversationsParams.searchKeyword,
      );

    if (refetch) {
      this.setIsRefetching(true);
    } else {
      // Update isLoading to true before starting to fetch data
      this.setIsFetchingNextPage(true);
    }

    observable$
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        RxjsUtils.getRetryAPIRequest(),
      )
      .subscribe(
        (tuple) => {
          const totalNumberOfConversations =
            tuple.totalNumberOfConversationMessages;
          const searchResults = tuple.searchResults;

          this.setTotalNumberOfItems(totalNumberOfConversations);

          if (searchResults && searchResults.length > 0) {
            if (searchResults.length < this.pageSize) {
              this.complete();
              this.setHasNextPage(false);
            }

            this.addItems(
              searchResults.map((sr) => {
                return new SearchConversationWithMessageAndUserProfileResult(
                  sr.message,
                  sr.conversation,
                  sr.userProfile,
                );
              }),
            );
          } else {
            this.setHasNextPage(false);
            this.yieldSortedItems();
          }
        },
        (error) => {
          console.error(error);
        },
        () => {
          this.setIsFetchingNextPage(false);
          this.setIsRefetching(false);
        },
      );
  }

  private sortDescFunc = (
    a: SearchConversationWithMessageAndUserProfileResult,
    b: SearchConversationWithMessageAndUserProfileResult,
  ) => {
    return b.message.getCreatedAt().localeCompare(a.message.getCreatedAt());
  };

  private refetchPages() {
    const pages = Array.from(this.fetchedPageIdxs.values()).sort(
      (a, b) => a - b,
    );

    // Refetch all pages sequentially
    from(pages)
      .pipe(
        takeUntil(this.getDisconnect$()),
        concatMap((page) =>
          this.isRefetching$$.pipe(
            filter((isRefetching) => isRefetching === false),
            take(1),
            tap(() => this.fetchPage(page, true)),
          ),
        ),
      )
      .subscribe();
  }

  private setTotalNumberOfItems(
    total: number | ((prev: TotalNumberOfItems) => TotalNumberOfItems),
  ) {
    const currentValue = this.totalNumberOfItems$$.value;
    const newValue = typeof total === 'number' ? total : total(currentValue);
    if (currentValue !== newValue) {
      this.totalNumberOfItems$$.next(newValue);
    }
  }

  private handleRemoveConversation() {
    if (!this.searchConversationsParams) {
      return;
    }

    const {
      searchKeyword: _,
      isStaffAssigned: __,
      channelIds: ___,
      status,
      ...getConversationsFilter
    } = this.searchConversationsParams;

    this.classicRealtimeService
      .getOnConversationStatusChanged$()
      .pipe(
        takeUntil(this.getDisconnect$()),
        switchMap((conversation) =>
          combineLatest([
            this.userService.getMyStaff$(),
            this.permissionService.getIsRbacEnabled$(),
          ]).pipe(
            map(([staff, isRbacEnabled]) => ({
              staff,
              conversation,
              matcher: isRbacEnabled
                ? this.conversationMatcherService
                    .matchConversationPayloadWithFilters
                : this.conversationMatcherService.matchConversation,
            })),
          ),
        ),
        distinctUntilChanged(),
        filter(({ conversation, staff, matcher }) =>
          matcher(getConversationsFilter, conversation, staff, undefined),
        ),
        tap(({ conversation, staff, matcher }) => {
          const isMatchStatus = matcher(
            { status, ...getConversationsFilter },
            conversation,
            staff,
            undefined,
          );

          const prevLength = this.cachedItems.length;
          let delta = 0;
          if (!isMatchStatus) {
            this.removeItems(
              (item) =>
                item.conversation.getId() === conversation.conversationId,
            );
            delta = prevLength - this.cachedItems.length;
            this.setTotalNumberOfItems((prev) =>
              prev !== undefined ? prev - delta : prev,
            );
          }

          if (delta > 0) {
            ignoreSearchMessageEndpointBackendCacheForOneMinute();
            this.refetchPages();
          }
        }),
      )
      .subscribe();
  }
}
