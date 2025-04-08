import { interfaces } from 'inversify';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  startWith,
  take,
  takeUntil,
} from 'rxjs';

import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

import { ArrayPagedDataSource } from '../data-sources/array-paged-data-source';
import { DisposableDataSource } from '../data-sources/disposable-data-source';
import { DataSourceListRange } from '../data-sources/models/data-source-list-range';
import { Wrapper } from '../models/wrapper';
import { UserProfileWrapper } from '../user-profiles/managers/user-profile-wrapper';
import { UserProfileService } from '../user-profiles/user-profile.service';
import { UserService } from '../user.service';
import { ConversationMatcherService } from './conversation-matcher.service';
import { ConversationService } from './conversation.service';
import { ConversationWrapper } from './managers/conversation-wrapper';
import { SearchConversationsParams } from './models/search-conversations-params';

type TotalNumberOfItems = number | undefined;
export class SearchConversationWithUserProfileResult implements Wrapper {
  constructor(
    public userProfile: UserProfileWrapper,
    public conversation: ConversationWrapper,
  ) {}

  getId(): string | number {
    return this.userProfile.getId();
  }

  destroy(): void {
    // This is intentionally left blank as userProfile and conversation are managed by their own managers
  }

  subscribe(disposableDataSource: DisposableDataSource): void {
    this.userProfile.subscribe(disposableDataSource);
    this.conversation.subscribe(disposableDataSource);
  }

  unsubscribe(disposableDataSource: DisposableDataSource): void {
    this.userProfile.unsubscribe(disposableDataSource);
    this.conversation.unsubscribe(disposableDataSource);
  }

  observed() {
    return this.userProfile.observed() || this.conversation.observed();
  }
}

export class SearchConversationWithUserProfileDataSource extends ArrayPagedDataSource<SearchConversationWithUserProfileResult> {
  private readonly conversationService: ConversationService;
  private readonly conversationMatcherService: ConversationMatcherService;
  private readonly userProfileService: UserProfileService;
  private readonly userService: UserService;

  private readonly pageSize = 20;
  private readonly fetchedPageIdxs = new Set<number>();

  private readonly totalNumberOfItems$$ = new BehaviorSubject<
    undefined | number
  >(undefined);

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
    this.userService = container.get<UserService>(UserService);
  }

  public getTotalNumberOfItems$(): Observable<TotalNumberOfItems> {
    return this.totalNumberOfItems$$.pipe(takeUntil(this.getDisconnect$()));
  }

  public setupAndGet$(
    searchConversationsParams: SearchConversationsParams,
    listRange$: Observable<DataSourceListRange>,
  ): Observable<SearchConversationWithUserProfileResult[]> {
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
        this.fetchPage(endPage + 1, searchConversationsParams);
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

    this.fetchPage(0, searchConversationsParams);
    this.setupRealtimeUpdates(searchConversationsParams);
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private fetchPage(
    page: number,
    searchConversationsParams: SearchConversationsParams,
  ): void {
    if (this.fetchedPageIdxs.has(page)) {
      return;
    }
    this.fetchedPageIdxs.add(page);

    const observable$ =
      this.conversationService.searchUserProfilesWithConversations$(
        page * this.pageSize,
        this.pageSize,
        searchConversationsParams,
        searchConversationsParams.searchKeyword,
      );

    // Update isLoading to true before starting to fetch data
    this.setIsFetchingNextPage(true);

    observable$
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        RxjsUtils.getRetryAPIRequest(),
      )
      .subscribe({
        next: (tuple) => {
          const totalNumberOfUserProfiles = tuple.totalNumberOfUserProfiles;
          const searchResults = tuple.searchResults;

          this.setTotalNumberOfItems(totalNumberOfUserProfiles);

          if (searchResults && searchResults.length > 0) {
            if (searchResults.length < this.pageSize) {
              this.complete();
              this.setHasNextPage(false);
            }

            this.addItems(
              searchResults.map((sr) => {
                return new SearchConversationWithUserProfileResult(
                  sr.userProfile,
                  sr.conversation,
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
          this.setIsFetchingNextPage(false);
        },
      });
  }

  private sortDescFunc = (
    a: SearchConversationWithUserProfileResult,
    b: SearchConversationWithUserProfileResult,
  ) => {
    return -a.conversation
      .getUpdatedTime()
      .localeCompare(b.conversation.getUpdatedTime());
  };

  private setTotalNumberOfItems(
    total: number | ((prev: TotalNumberOfItems) => TotalNumberOfItems),
  ) {
    const currentValue = this.totalNumberOfItems$$.value;
    const newValue = typeof total === 'number' ? total : total(currentValue);
    if (currentValue !== newValue) {
      this.totalNumberOfItems$$.next(newValue);
    }
  }

  private setupRealtimeUpdates({
    isStaffAssigned: _, // search results are not grouped by assigned / unassigned, exclude this so that conversations are not wrongly removed
    channelIds: __,
    ...params
  }: SearchConversationsParams) {
    const lowerCaseKeyword = params.searchKeyword.toLowerCase();

    this.conversationService
      .getCachedConversationUpdate$()
      .pipe(
        concatMap(([conversation, cwu]) =>
          this.userProfileService
            .getUserProfileWrapper$(conversation.getUserProfileId())
            .pipe(
              take(1),
              concatMap((userProfile) =>
                combineLatest([
                  userProfile.getFirstName$().pipe(startWith('')),
                  userProfile.getLastName$().pipe(startWith('')),
                  userProfile.getFullName$().pipe(startWith('')),
                  userProfile.getPhoneNumber$().pipe(startWith('')),
                ]).pipe(
                  take(1),
                  map(([firstName, lastName, fullName, phoneNumber]) => ({
                    userProfile,
                    firstName,
                    lastName,
                    fullName,
                    phoneNumber,
                  })),
                ),
              ),
            )
            .pipe(
              map((userParams) => ({
                conversation,
                conversationWrapperUpdate: cwu,
                ...userParams,
              })),
            ),
        ),
        filter(
          ({ firstName, lastName, fullName, phoneNumber }) =>
            firstName.toLowerCase().includes(lowerCaseKeyword) ||
            lastName.toLowerCase().includes(lowerCaseKeyword) ||
            fullName.toLowerCase().includes(lowerCaseKeyword) ||
            phoneNumber.toLowerCase().includes(lowerCaseKeyword),
        ),
        takeUntil(this.getDisconnect$()),
      )
      .subscribe(({ conversation, conversationWrapperUpdate, userProfile }) => {
        if (
          ['lastMessage', 'updatedTime'].includes(
            conversationWrapperUpdate.type,
          )
        ) {
          this.yieldSortedItems();
          return;
        }

        this.conversationMatcherService
          .matchConversationWrapper(params, conversation)
          .pipe(
            map((matched) => {
              if (!matched) {
                const prevLength = this.cachedItems.length;
                this.removeItemById(conversation.getUserProfileId());
                const delta = prevLength - this.cachedItems.length;

                this.setTotalNumberOfItems((prev) =>
                  prev !== undefined ? prev - delta : prev,
                );
                return;
              }

              if (
                ['status', 'permissions'].includes(
                  conversationWrapperUpdate.type,
                )
              ) {
                const prevLength = this.cachedItems.length;
                this.addItem(
                  new SearchConversationWithUserProfileResult(
                    userProfile,
                    conversation,
                  ),
                );
                const delta = this.cachedItems.length - prevLength;

                this.setTotalNumberOfItems((prev) =>
                  prev !== undefined ? prev + delta : prev,
                );
              }
            }),
          )
          .subscribe();
      });
  }
}
