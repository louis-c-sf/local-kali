import { parseISO } from 'date-fns';
import { interfaces } from 'inversify';
import {
  distinctUntilChanged,
  Observable,
  ReplaySubject,
  takeUntil,
} from 'rxjs';

import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

import { ArrayPagedDataSource } from '../data-sources/array-paged-data-source';
import { DataSourceListRange } from '../data-sources/models/data-source-list-range';
import { UserProfileWrapper } from './managers/user-profile-wrapper';
import { GetUserProfilesParams } from './models/get-user-profiles-params';
import { UserProfileService } from './user-profile.service';

export class UserProfileDataSource extends ArrayPagedDataSource<UserProfileWrapper> {
  private readonly userProfileService: UserProfileService;

  private readonly pageSize = 20;
  private readonly fetchedPageIdxs = new Set<number>();

  private readonly totalNumberOfItems$$ = new ReplaySubject<number>(1);

  private hasSetup = false;

  public constructor(container: interfaces.Container) {
    super();

    this.userProfileService =
      container.get<UserProfileService>(UserProfileService);
  }

  public getTotalNumberOfItems$(): Observable<number> {
    return this.totalNumberOfItems$$.pipe(takeUntil(this.getDisconnect$()));
  }

  public setupAndGet$(
    getUserProfilesParams: GetUserProfilesParams,
    listRange$: Observable<DataSourceListRange>,
  ): Observable<UserProfileWrapper[]> {
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

        this.fetchPage(endPage + 1, getUserProfilesParams);
      });

    if (this.hasSetup) {
      return this.getCachedItems$();
    }

    this.hasSetup = true;

    // Yields the initial empty array
    this.yieldSortedItems(true);

    this.setup(getUserProfilesParams);

    return this.getCachedItems$();
  }

  private setup(getUserProfilesParams: GetUserProfilesParams): void {
    this.setupSortFunc(
      getUserProfilesParams.orderBy === 'asc'
        ? this.sortAscFunc
        : this.sortDescFunc,
    );

    this.fetchPage(0, getUserProfilesParams);
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private fetchPage(
    page: number,
    getUserProfilesParams: GetUserProfilesParams,
  ): void {
    if (this.fetchedPageIdxs.has(page)) {
      return;
    }
    this.fetchedPageIdxs.add(page);

    const observable$: Observable<{
      userProfiles: UserProfileWrapper[];
      totalNumOfUserProfiles: number;
    }> = this.userProfileService.searchUserProfiles$(
      page * this.pageSize,
      this.pageSize,
      getUserProfilesParams,
      getUserProfilesParams.orderBy ?? 'desc',
      getUserProfilesParams.orderByFieldName ?? 'updatedAt',
    );

    // Update isLoading to true before starting to fetch data
    this.setIsFetchingNextPage(true);

    observable$
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        RxjsUtils.getRetryAPIRequest(),
      )
      .subscribe(
        (tuple) => {
          const userProfileWrappers = tuple.userProfiles;
          const totalNumOfUserProfiles = tuple.totalNumOfUserProfiles;

          this.totalNumberOfItems$$.next(totalNumOfUserProfiles);

          if (userProfileWrappers && userProfileWrappers.length > 0) {
            if (userProfileWrappers.length < this.pageSize) {
              this.complete();
            }

            this.addItems(userProfileWrappers);
          } else {
            this.yieldSortedItems();
          }
        },
        (error) => {
          console.error(error);
        },
        () => {
          this.setIsFetchingNextPage(false);
        },
      );
  }

  private sortAscFunc = (a: UserProfileWrapper, b: UserProfileWrapper) => {
    // TODO based on the field name

    return (
      parseISO(a.getUpdatedAtSnapshot()).getTime() -
      parseISO(b.getUpdatedAtSnapshot()).getTime()
    );
  };

  private sortDescFunc = (a: UserProfileWrapper, b: UserProfileWrapper) => {
    // TODO based on the field name

    return (
      parseISO(b.getUpdatedAtSnapshot()).getTime() -
      parseISO(a.getUpdatedAtSnapshot()).getTime()
    );
  };
}
