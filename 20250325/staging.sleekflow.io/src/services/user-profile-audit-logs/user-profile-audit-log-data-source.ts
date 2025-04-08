import { parseISO } from 'date-fns';
import { interfaces } from 'inversify';
import { Observable, takeUntil } from 'rxjs';

import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

import { ArrayPagedDataSource } from '../data-sources/array-paged-data-source';
import { GetUserProfileAuditLogsParams } from './models/get-user-profile-audit-logs-params';
import { UserProfileAuditLogService } from './user-profile-audit-log.service';
import { UserProfileAuditLogWrapper } from './wrappers/user-profile-audit-log-wrapper';

const TOKEN_OUT_OF_RESULTS = null;

export class UserProfileAuditLogDataSource extends ArrayPagedDataSource<UserProfileAuditLogWrapper> {
  private readonly userProfileAuditLogService: UserProfileAuditLogService;
  private pageSize = 20;

  private nextContinuationToken?: string | null;
  private fetchedContinuationTokens = new Set<string>();

  private hasSetup = false;

  public constructor(container: interfaces.Container) {
    super();

    this.userProfileAuditLogService = container.get<UserProfileAuditLogService>(
      UserProfileAuditLogService,
    );
  }

  public setupAndGet$(
    getUserProfileAuditLogsParams: GetUserProfileAuditLogsParams,
    pageSize: number,
  ): Observable<UserProfileAuditLogWrapper[]> {
    this.pageSize = pageSize;

    if (this.hasSetup) {
      return this.getCachedItems$();
    }

    this.hasSetup = true;

    // Yields the initial empty array
    this.yieldSortedItems(true);

    this.setup(getUserProfileAuditLogsParams);

    return this.getCachedItems$();
  }

  private setup(
    getUserProfileAuditLogsParams: GetUserProfileAuditLogsParams,
  ): void {
    this.setupSortFunc(UserProfileAuditLogDataSource.sortDescFunc);
    this.fetchNextPage(getUserProfileAuditLogsParams);

    this.userProfileAuditLogService
      .getRealtimeAuditLogsAdded$(getUserProfileAuditLogsParams)
      .pipe(takeUntil(this.getDisconnect$()))
      .subscribe((x) => {
        this.addItem(x);
      });

    this.userProfileAuditLogService
      .getRealtimeAuditLogsUpdated$(getUserProfileAuditLogsParams)
      .pipe(takeUntil(this.getDisconnect$()))
      .subscribe((x) => {
        this.updateInCache(x);
      });

    this.userProfileAuditLogService
      .getRealtimeAuditLogsDeleted$(getUserProfileAuditLogsParams)
      .pipe(takeUntil(this.getDisconnect$()))
      .subscribe((x) => {
        this.deleteFromCache(x);
      });
  }

  public fetchNextPage(
    getUserProfileAuditLogsParams: GetUserProfileAuditLogsParams,
  ): void {
    // All data has been fetched
    if (this.nextContinuationToken === TOKEN_OUT_OF_RESULTS) {
      return;
    }

    if (this.nextContinuationToken) {
      if (this.fetchedContinuationTokens.has(this.nextContinuationToken)) {
        return;
      }

      this.fetchedContinuationTokens.add(this.nextContinuationToken);
    }

    // Update isLoading to true before starting to fetch data
    this.setIsFetchingNextPage(true);

    this.userProfileAuditLogService
      .getUserProfileAuditLogs$(
        getUserProfileAuditLogsParams,
        this.pageSize,
        this.nextContinuationToken ?? null,
      )
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        RxjsUtils.getRetryAPIRequest(),
      )
      .subscribe(
        ({ list, continuationToken }) => {
          if (list.length > 0) {
            if (!continuationToken) {
              this.complete();
              this.setHasNextPage(false);
            }
            this.nextContinuationToken =
              continuationToken ?? TOKEN_OUT_OF_RESULTS;
            this.addItems(list);
          }
          this.yieldSortedItems();
        },
        (error) => {
          console.error(error);
        },
        () => {
          this.setIsFetchingNextPage(false);
        },
      );
  }

  public deleteFromCache(item: UserProfileAuditLogWrapper): void {
    this.removeItem(item);
  }

  public insertIntoCache(item: UserProfileAuditLogWrapper): void {
    this.addItem(item);
  }

  public updateInCache(item: UserProfileAuditLogWrapper): void {
    this.removeItemById(item.getId());
    this.addItem(item);
  }

  private static sortDescFunc = (
    a: UserProfileAuditLogWrapper,
    b: UserProfileAuditLogWrapper,
  ) => {
    return (
      parseISO(b.getCreatedTimeSnapshot()).getTime() -
      parseISO(a.getCreatedTimeSnapshot()).getTime()
    );
  };
}
