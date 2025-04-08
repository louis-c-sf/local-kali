import { analyticsKeys } from '@/api/analytics';
import { queryClient } from '@/utils/queryClient';
import {
  AnalyticsApi,
  ShopifyApi,
  TravisBackendAnalyticsDomainModelsSegment,
  TravisBackendCompanyDomainModelsCondition,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { Dayjs } from 'dayjs';
import { inject, injectable } from 'inversify';
import { map, Observable, shareReplay, take } from 'rxjs';
import {
  ConversationAnalyticsDto,
  Segments,
  Segment,
  ShopifyOrderStaffStatisticsDto,
  ShopifyOrderStatisticsDto,
} from './types';

@injectable()
export class AnalyticsService {
  constructor(
    @inject(AnalyticsApi)
    private analyticsApi: AnalyticsApi,
    @inject(ShopifyApi)
    private shopifyApi: ShopifyApi,
  ) {}

  private conversationAnalyticsData$?: Observable<ConversationAnalyticsDto> =
    undefined;

  public getConversationsAnalytics$(
    timeframe: Dayjs[],
    conditions: TravisBackendCompanyDomainModelsCondition[],
  ): Observable<ConversationAnalyticsDto> {
    this.conversationAnalyticsData$ = this.analyticsApi
      .companyAnalyticsDataPost({
        from: timeframe[0].format('YYYY-MM-DD'),
        to: timeframe[1].format('YYYY-MM-DD'),
        travisBackendCompanyDomainModelsCondition: conditions,
      })
      .pipe(
        take(1),
        map((data) => {
          return data as unknown as ConversationAnalyticsDto;
        }),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );
    return this.conversationAnalyticsData$;
  }

  private previousConversationAnalyticsData$?: Observable<ConversationAnalyticsDto> =
    undefined;

  public getPreviousConversationsAnalytics$(
    timeframe: Dayjs[],
    conditions: TravisBackendCompanyDomainModelsCondition[],
  ): Observable<ConversationAnalyticsDto> {
    this.previousConversationAnalyticsData$ = this.analyticsApi
      .companyAnalyticsDataPost({
        from: timeframe[0].format('YYYY-MM-DD'),
        to: timeframe[1].format('YYYY-MM-DD'),
        travisBackendCompanyDomainModelsCondition: conditions,
      })
      .pipe(
        take(1),
        map((data) => {
          return data as unknown as ConversationAnalyticsDto;
        }),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );
    return this.previousConversationAnalyticsData$;
  }

  private shopifyOrderStatisticsData$?: Observable<ShopifyOrderStatisticsDto> =
    undefined;

  public getShopifyOrderStatistics$(
    timeframe: Dayjs[],
  ): Observable<ShopifyOrderStatisticsDto> {
    this.shopifyOrderStatisticsData$ = this.shopifyApi
      .companyShopifyOrderStatisticsGet({
        from: timeframe[0].format('YYYY-MM-DD'),
        to: timeframe[1].format('YYYY-MM-DD'),
      })
      .pipe(
        take(1),
        map((data) => {
          return data as unknown as ShopifyOrderStatisticsDto;
        }),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );
    return this.shopifyOrderStatisticsData$;
  }

  public shopifyOrderStaffStatisticsData$?: Observable<ShopifyOrderStaffStatisticsDto> =
    undefined;

  public getShopifyOrderStaffStatistics$(
    timeframe: Dayjs[],
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortOrder?: string,
    teamId?: number,
  ): Observable<ShopifyOrderStaffStatisticsDto> {
    this.shopifyOrderStaffStatisticsData$ = this.shopifyApi
      .companyShopifyOrderStaffStatisticsGet({
        from: timeframe[0].format('YYYY-MM-DD'),
        to: timeframe[1].format('YYYY-MM-DD'),
        limit: limit ?? 15,
        offset: offset ?? 0,
        sortBy:
          sortBy === undefined
            ? undefined
            : sortBy === 'linkSharedCount'
              ? 0
              : sortBy === 'paymentLinkSharedCount'
                ? 1
                : 2,
        sortOrder: sortOrder === 'false' ? undefined : sortOrder,
        teamId: teamId,
        isIncludeSystemStatistics: true,
      })
      .pipe(
        take(1),
        map((data) => {
          return data as unknown as ShopifyOrderStaffStatisticsDto;
        }),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );
    return this.shopifyOrderStaffStatisticsData$;
  }

  private segmentData$?: Observable<Segments> = undefined;

  public getSegmentData$(): Observable<Segments> {
    this.segmentData$ = this.analyticsApi.companyAnalyticsSegmentGet().pipe(
      map((data) => {
        return data as unknown as Segment[];
      }),
      take(1),
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );
    return this.segmentData$;
  }

  public createSegment$(
    data: TravisBackendAnalyticsDomainModelsSegment,
  ): Observable<void> {
    return this.analyticsApi
      .companyAnalyticsSegmentCreatePost({
        travisBackendAnalyticsDomainModelsSegment: data,
      })
      .pipe(
        map((resp) => {
          queryClient.invalidateQueries({
            queryKey: analyticsKeys.getSegments(),
          });
          return resp;
        }),
      );
  }

  public deleteSegment$(id: number): Observable<void> {
    return this.analyticsApi
      .companyAnalyticsSegmentSegmentIdDelete({
        segmentId: id,
      })
      .pipe(
        map((resp) => {
          queryClient.invalidateQueries({
            queryKey: analyticsKeys.getSegments(),
          });
          return resp;
        }),
      );
  }

  public updateSegment$(
    id: number,
    data: TravisBackendAnalyticsDomainModelsSegment,
  ): Observable<void> {
    return this.analyticsApi
      .companyAnalyticsSegmentUpdateSegmentIdPut({
        segmentId: id,
        travisBackendAnalyticsDomainModelsSegment: data,
      })
      .pipe(
        map((resp) => {
          queryClient.invalidateQueries({
            queryKey: analyticsKeys.getSegments(),
          });
          return resp;
        }),
      );
  }
}
