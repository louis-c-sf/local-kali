import {
  TravisBackendCompanyDomainModelsCondition,
  TravisBackendConversationDomainViewModelsCompanyResponse,
  TravisBackendEnumsSupportedNextOperator,
  TravisBackendEnumsSupportedOperator,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { Dayjs } from 'dayjs';
import { inject, injectable } from 'inversify';
import {
  BehaviorSubject,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';

import { FilterType } from '@/pages/Contacts/shared/ContactsTable/ContactsFilterDialog';
import { transformContactsFiltersToApi } from '@/pages/Contacts/shared/ContactsTable/utils';

import { CompanyService } from '../companies/company.service';
import { AnalyticsService } from './analytics.service';
import {
  ConversationAnalyticsDto,
  Segments,
  Segment,
  ShopifyOrderStaffStatisticsDto,
  ShopifyOrderStatisticsDto,
} from './types';

@injectable()
export class AnalyticsViewModel {
  constructor(
    @inject(AnalyticsService) private analyticsService: AnalyticsService,
    @inject(CompanyService) private companyService: CompanyService,
  ) {}

  // company
  private isLoadingCompanyData$$ = new BehaviorSubject<boolean>(false);
  private companyData$$ = new BehaviorSubject<
    TravisBackendConversationDomainViewModelsCompanyResponse | null | undefined
  >(undefined);

  public getCompanyData$(): Observable<
    TravisBackendConversationDomainViewModelsCompanyResponse | null | undefined
  > {
    this.isLoadingCompanyData$$.next(true);
    this.companyService
      .getCompany$()
      .pipe(
        take(1),
        finalize(() => this.isLoadingCompanyData$$.next(false)),
      )
      .subscribe((data) => {
        this.companyData$$.next(data);
      });
    return this.companyData$$.asObservable();
  }

  // Conversation

  private isLoadingCurrentData$$ = new BehaviorSubject<boolean>(false);
  private currentData$$ = new BehaviorSubject<
    ConversationAnalyticsDto | undefined
  >(undefined);

  private isLoadingPreviousData$$ = new BehaviorSubject<boolean>(false);
  private previousData$$ = new BehaviorSubject<
    ConversationAnalyticsDto | undefined
  >(undefined);

  public getCurrentData$(
    timeFrame: Dayjs[],
    segment: Segment | undefined,
  ): Observable<ConversationAnalyticsDto | undefined> {
    this.isLoadingCurrentData$$.next(true);
    const conditions: TravisBackendCompanyDomainModelsCondition[] = [];
    if (segment != undefined) {
      segment.conditions.forEach((c) => {
        const condition: TravisBackendCompanyDomainModelsCondition = {
          containHashTag: c.containHashTag,
          fieldName: c.fieldName,
          conditionOperator: AnalyticsViewModel.operatorMapper(
            c.conditionOperator,
          ),
          values: c.values as string[],
          nextOperator: TravisBackendEnumsSupportedNextOperator.NUMBER_0,
        };
        conditions.push(condition);
      });
    }
    this.analyticsService
      .getConversationsAnalytics$(timeFrame, conditions)
      .pipe(
        take(1),
        finalize(() => this.isLoadingCurrentData$$.next(false)),
      )
      .subscribe((data) => {
        this.currentData$$.next(data);
      });
    return this.currentData$$.asObservable();
  }

  public getPreviousData$(
    timeFrame: Dayjs[],
    segment: Segment | undefined,
  ): Observable<ConversationAnalyticsDto | undefined> {
    this.isLoadingPreviousData$$.next(true);
    const conditions: TravisBackendCompanyDomainModelsCondition[] = [];
    if (segment != undefined) {
      segment.conditions.forEach((c) => {
        const condition: TravisBackendCompanyDomainModelsCondition = {
          containHashTag: c.containHashTag,
          fieldName: c.fieldName,
          conditionOperator: AnalyticsViewModel.operatorMapper(
            c.conditionOperator,
          ),
          values: c.values as string[],
          nextOperator: TravisBackendEnumsSupportedNextOperator.NUMBER_0,
        };
        conditions.push(condition);
      });
    }
    this.analyticsService
      .getPreviousConversationsAnalytics$(timeFrame, conditions)
      .pipe(
        take(1),
        finalize(() => this.isLoadingPreviousData$$.next(false)),
      )
      .subscribe((data) => {
        this.previousData$$.next(data);
      });
    return this.previousData$$.asObservable();
  }

  public getIsLoadingCurrent = (): Observable<boolean> =>
    this.isLoadingCurrentData$$.asObservable();

  public getIsLoadingPrevious = (): Observable<boolean> =>
    this.isLoadingPreviousData$$.asObservable();

  // Sales

  private isLoadingAllSalesData$$ = new BehaviorSubject<boolean>(false);
  private allSalesData$$ = new BehaviorSubject<
    ShopifyOrderStatisticsDto | undefined
  >(undefined);

  private isLoadingStaffSalesData$$ = new BehaviorSubject<boolean>(false);
  private staffSalesData$$ = new BehaviorSubject<
    ShopifyOrderStaffStatisticsDto | undefined
  >(undefined);

  public getAllSalesData$(
    timeFrame: Dayjs[],
  ): Observable<ShopifyOrderStatisticsDto | undefined> {
    this.isLoadingAllSalesData$$.next(true);
    this.analyticsService
      .getShopifyOrderStatistics$(timeFrame)
      .pipe(
        take(1),
        finalize(() => this.isLoadingAllSalesData$$.next(false)),
      )
      .subscribe((data) => {
        this.allSalesData$$.next(data);
      });
    return this.allSalesData$$.asObservable();
  }

  public getStaffSalesData$(
    timeFrame: Dayjs[],
    page: number,
    sortBy?: string,
    sortOrder?: string,
    teamId?: number,
  ): Observable<ShopifyOrderStaffStatisticsDto | undefined> {
    this.isLoadingStaffSalesData$$.next(true);
    this.analyticsService
      .getShopifyOrderStaffStatistics$(
        timeFrame,
        15,
        page * 15,
        sortBy,
        sortOrder,
        teamId,
      )
      .pipe(
        take(1),
        finalize(() => this.isLoadingStaffSalesData$$.next(false)),
      )
      .subscribe((data) => {
        this.staffSalesData$$.next(data);
      });
    return this.staffSalesData$$.asObservable();
  }

  public getIsLoadingAllSales = (): Observable<boolean> =>
    this.isLoadingAllSalesData$$.asObservable();

  public getIsLoadingStaffSales = (): Observable<boolean> =>
    this.isLoadingStaffSalesData$$.asObservable();

  // segment

  private isLoadingSegmentData$$ = new BehaviorSubject<boolean>(false);
  private segmentData$$ = new BehaviorSubject<Segments | undefined>(undefined);

  public getSegmentData$(): Observable<Segments | undefined> {
    this.isLoadingSegmentData$$.next(true);
    this.analyticsService
      .getSegmentData$()
      .pipe(
        take(1),
        finalize(() => this.isLoadingSegmentData$$.next(false)),
      )
      .subscribe((data) => {
        this.segmentData$$.next(data);
      });
    return this.segmentData$$.asObservable();
  }

  public getIsLoadingSegment = (): Observable<boolean> =>
    this.isLoadingSegmentData$$.asObservable();

  // create segment

  private createSegmentResult$$ = new BehaviorSubject<boolean>(false);

  public createSegment$({
    name,
    filterConditions,
    matchOperator,
  }: {
    matchOperator: 'And' | 'Or';
    name: string;
    filterConditions: FilterType[];
  }): Observable<boolean> {
    this.companyService
      .getCompany$()
      .pipe(
        map((data) => {
          if (data) {
            return (data.customUserProfileFields || []).map(
              (field) => field.id,
            );
          }
          return [];
        }),
        switchMap((allCustomUserProfileFieldIds) => {
          return of(
            transformContactsFiltersToApi(
              filterConditions,
              matchOperator,
              allCustomUserProfileFieldIds as string[],
            ),
          );
        }),
        switchMap((value) => {
          if (value) {
            return this.analyticsService
              .createSegment$({
                name,
                conditions:
                  value as unknown as TravisBackendCompanyDomainModelsCondition[],
              })
              .pipe(
                take(1),
                map(() => true),
              );
          }
          return of(false);
        }),
      )
      .subscribe((data) => {
        this.createSegmentResult$$.next(data);
      });
    return this.createSegmentResult$$.asObservable();
  }

  // delete segment

  private deleteSegmentResult$$ = new BehaviorSubject<boolean>(false);

  public deleteSegment$(segmentId: number): Observable<boolean> {
    this.analyticsService
      .deleteSegment$(segmentId)
      .pipe(take(1))
      .subscribe(() => {
        this.deleteSegmentResult$$.next(true);
      });
    return this.deleteSegmentResult$$.asObservable();
  }

  // update segment

  private updateSegmentResult$$ = new BehaviorSubject<boolean>(false);

  public updateSegment$({
    segmentId,
    name,
    filterConditions,
    matchOperator,
  }: {
    matchOperator: 'And' | 'Or';
    segmentId: number;
    name: string;
    filterConditions: FilterType[];
  }): Observable<boolean> {
    this.companyService
      .getCompany$()
      .pipe(
        map((data) => {
          if (data) {
            return (data.customUserProfileFields || []).map(
              (field) => field.id,
            );
          }
          return [];
        }),
        switchMap((allCustomUserProfileFieldIds) => {
          return of(
            transformContactsFiltersToApi(
              filterConditions,
              matchOperator,
              allCustomUserProfileFieldIds as string[],
            ),
          );
        }),
        switchMap((value) => {
          if (value) {
            return this.analyticsService
              .updateSegment$(segmentId, {
                name,
                conditions:
                  value as unknown as TravisBackendCompanyDomainModelsCondition[],
              })
              .pipe(
                take(1),
                map(() => true),
              );
          }
          return of(false);
        }),
      )
      .subscribe((data) => {
        this.updateSegmentResult$$.next(data);
      });
    return this.updateSegmentResult$$.asObservable();
  }

  public static operatorMapper(
    operator: string,
  ): TravisBackendEnumsSupportedOperator | undefined {
    switch (operator) {
      case 'Equals':
        return TravisBackendEnumsSupportedOperator.NUMBER_0;
      case 'HigherThan':
        return TravisBackendEnumsSupportedOperator.NUMBER_1;
      case 'LessThan':
        return TravisBackendEnumsSupportedOperator.NUMBER_2;
      case 'Contains':
        return TravisBackendEnumsSupportedOperator.NUMBER_3;
      case 'IsNotNull':
        return TravisBackendEnumsSupportedOperator.NUMBER_4;
      case 'IsNull':
        return TravisBackendEnumsSupportedOperator.NUMBER_5;
      case 'IsNotContains':
        return TravisBackendEnumsSupportedOperator.NUMBER_6;
      case 'DateBeforeDayAgo':
        return TravisBackendEnumsSupportedOperator.NUMBER_7;
      case 'DateAfterDayAgo':
        return TravisBackendEnumsSupportedOperator.NUMBER_8;
      case 'TimeBefore':
        return TravisBackendEnumsSupportedOperator.NUMBER_9;
      case 'TimeAfter':
        return TravisBackendEnumsSupportedOperator.NUMBER_10;
      case 'IsBetween':
        return TravisBackendEnumsSupportedOperator.NUMBER_11;
      case 'IsNotBetween':
        return TravisBackendEnumsSupportedOperator.NUMBER_12;
      case 'DayOfWeek':
        return TravisBackendEnumsSupportedOperator.NUMBER_13;
      case 'IsExactlyDaysBefore':
        return TravisBackendEnumsSupportedOperator.NUMBER_14;
      case 'IsExactlyDaysAfter':
        return TravisBackendEnumsSupportedOperator.NUMBER_15;
      case 'IsAway':
        return TravisBackendEnumsSupportedOperator.NUMBER_16;
      case 'IsActive':
        return TravisBackendEnumsSupportedOperator.NUMBER_17;
      case 'IsToday':
        return TravisBackendEnumsSupportedOperator.NUMBER_18;
      case 'RegexMatched':
        return TravisBackendEnumsSupportedOperator.NUMBER_19;
      case 'ContainsExactly':
        return TravisBackendEnumsSupportedOperator.NUMBER_20;
      case 'IsNotContainsExactly':
        return TravisBackendEnumsSupportedOperator.NUMBER_21;
      case 'ContainsAll':
        return TravisBackendEnumsSupportedOperator.NUMBER_22;
      case 'IsNotContainsAll':
        return TravisBackendEnumsSupportedOperator.NUMBER_23;
      case 'ContainsAny':
        return TravisBackendEnumsSupportedOperator.NUMBER_24;
      case 'IsNotContainsAny':
        return TravisBackendEnumsSupportedOperator.NUMBER_25;
      case 'IsChanged':
        return TravisBackendEnumsSupportedOperator.NUMBER_26;
      case 'Included':
        return TravisBackendEnumsSupportedOperator.NUMBER_500;
      case 'NotIncluded':
        return TravisBackendEnumsSupportedOperator.NUMBER_501;
      case 'Equal':
        return TravisBackendEnumsSupportedOperator.NUMBER_502;
      case 'NotEqual':
        return TravisBackendEnumsSupportedOperator.NUMBER_503;
      case 'IsNotNullOrEmpty':
        return TravisBackendEnumsSupportedOperator.NUMBER_504;
      case 'GroupBy':
        return TravisBackendEnumsSupportedOperator.NUMBER_505;
      case 'StringIsNullOrEmpty':
        return TravisBackendEnumsSupportedOperator.NUMBER_506;
      case 'StringIsNotNullOrEmpty':
        return TravisBackendEnumsSupportedOperator.NUMBER_507;
      case 'DateTimeBefore':
        return TravisBackendEnumsSupportedOperator.NUMBER_509;
      case 'DateTimeAfter':
        return TravisBackendEnumsSupportedOperator.NUMBER_510;
      case 'TimeBetween':
        return TravisBackendEnumsSupportedOperator.NUMBER_511;
      case 'TimeNotBetween':
        return TravisBackendEnumsSupportedOperator.NUMBER_512;
      case 'DateTimeBetween':
        return TravisBackendEnumsSupportedOperator.NUMBER_513;
      case 'IncludeSubQuery':
        return TravisBackendEnumsSupportedOperator.NUMBER_514;
      case 'NumberHigherThan':
        return TravisBackendEnumsSupportedOperator.NUMBER_515;
      case 'NumberLessThan':
        return TravisBackendEnumsSupportedOperator.NUMBER_516;
      case 'LikeOrMultipleValues':
        return TravisBackendEnumsSupportedOperator.NUMBER_517;
      case 'IsNotLikeOrMultipleValues':
        return TravisBackendEnumsSupportedOperator.NUMBER_518;
      default:
        return undefined;
    }
  }
}
