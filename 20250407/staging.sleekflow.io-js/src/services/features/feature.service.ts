import {
  IntelligentHubApi,
  TravisBackendIntelligentHubDomainModelsFeatureUsageStatistic,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import {
  combineLatest,
  map,
  Observable,
  ReplaySubject,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';

import { CompanyService } from '@/services/companies/company.service';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';
import { transformPlanDetails } from '@/utils/billing';

import { CommerceService } from '../commerces/commerce.service';
import { UserService } from '../user.service';
import { PermissionService } from '../permissions/permission.service';

// https://docs.google.com/spreadsheets/d/1jPIuTs0Wxjnm3FgM0NRWd6YtbpeQI5SrMtG4STSNMKE/edit#gid=0
@injectable()
export class FeatureService {
  constructor(
    @inject(CompanyService) private readonly companyService: CompanyService,
    @inject(CommerceService) private readonly commerceService: CommerceService,
    @inject(UserService) private readonly userService: UserService,
    @inject(PermissionService)
    private readonly permissionService: PermissionService,
    @inject(IntelligentHubApi)
    private readonly intelligentHubApi: IntelligentHubApi,
  ) {}

  public getIsTabSystemEnabled$() {
    return this.companyService.getCompany$().pipe(
      map((company) => {
        return [
          // Prod Amberstudent
          'd66566c6-2bc5-46af-905e-b0a6688494bd',

          // Prod Clean Living
          'ed43bd11-90e2-45aa-8cd3-49405acf2226',

          // Dev SleekFlow
          'b6d7e442-38ae-4b9a-b100-2951729768bc',
        ].includes(company?.id || '');
      }),
    );
  }

  public getIsSleekpayIntegrationEnabled$() {
    return this.getFeatureEnablement$().pipe(
      map(
        (featureEnablement) =>
          featureEnablement.isSleekpayIntegrationEnabled || false,
      ),
    );
  }

  public getIsShopifyIntegrationEnabled$() {
    return this.commerceService.getStores$().pipe(
      map(({ shopifyStores }) => {
        return shopifyStores.filter((ss) => ss.isShowInInbox).length > 0;
      }),
    );
  }

  public getIsCommerceHubStoresEnabled$() {
    return this.commerceService.getStores$().pipe(
      map(({ commerceHubStores }) => {
        return (
          commerceHubStores.filter((chs) => chs.is_view_enabled).length > 0
        );
      }),
    );
  }

  public getAvailableConversationTeams$() {
    return combineLatest([
      this.companyService.getAllTeams$(),
      this.userService.getMyStaff$(),
      this.permissionService.getIsRbacEnabled$(),
    ]).pipe(
      map(([teams, staff, isRbacEnabled]) => {
        if (
          isRbacEnabled ||
          (staff.roleType && staff.roleType.toLocaleLowerCase() === 'admin')
        ) {
          return teams;
        }
        return teams.filter((team) => {
          return staff.associatedTeams.some(
            (associatedTeam) => associatedTeam.id === team.id,
          );
        });
      }),
    );
  }

  public getIsHubspotIntegrationEnabled$() {
    return this.getFeatureEnablement$().pipe(
      map(
        (featureEnablement) =>
          featureEnablement.isHubspotIntegrationEnabled || false,
      ),
    );
  }

  public getIsSalesforceIntegrationEnabled$() {
    return this.getFeatureEnablement$().pipe(
      map(
        (featureEnablement) =>
          featureEnablement.isSalesforceCrmEnabled || false,
      ),
    );
  }

  public getIsAiIntegrationEnabled$() {
    return this.getActivePlans$().pipe(
      map((activePlans) => {
        return activePlans != undefined;
      }),
    );
  }

  public getActivePlans$() {
    return this.companyService.getCompanyUsage$().pipe(
      map((companyUsage) => {
        return companyUsage?.billingPeriodUsages.map((usage) =>
          transformPlanDetails(usage.billRecord.subscriptionPlanId),
        );
      }),
    );
  }

  private isSmartReplyEnabled$?: Observable<boolean> = undefined;

  public getIsSmartReplyEnabled$() {
    if (!this.isSmartReplyEnabled$) {
      this.isSmartReplyEnabled$ = this.companyService.getCompany$().pipe(
        switchMap((company) => {
          return this.intelligentHubApi.intelligentHubIntelligentHubConfigsGetAiFeatureSettingPost(
            {
              travisBackendControllersSleekflowControllersIntelligentHubControllerGetAiFeatureSettingRequest:
                {
                  sleekflow_company_id: company?.id,
                },
            },
          );
        }),
        map((resp) => resp.enable_smart_reply || false),
        startWith(false),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );
    }

    return this.isSmartReplyEnabled$;
  }

  private isWritingAssistantEnabled$?: Observable<boolean> = undefined;

  public getIsWritingAssistantEnabled$() {
    if (!this.isWritingAssistantEnabled$) {
      this.isWritingAssistantEnabled$ = this.companyService.getCompany$().pipe(
        switchMap((company) => {
          return this.intelligentHubApi.intelligentHubIntelligentHubConfigsGetAiFeatureSettingPost(
            {
              travisBackendControllersSleekflowControllersIntelligentHubControllerGetAiFeatureSettingRequest:
                {
                  sleekflow_company_id: company?.id,
                },
            },
          );
        }),
        map((resp) => resp.enable_writing_assistant || false),
        startWith(false),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );
    }

    return this.isWritingAssistantEnabled$;
  }

  private intelligentHubConfigsReplaySubject$?: ReplaySubject<{
    [key: string]: TravisBackendIntelligentHubDomainModelsFeatureUsageStatistic;
  }> = undefined;

  public getIntelligentHubConfigs$(shouldRefresh = false) {
    const {
      replaySubject$$: intelligentHubConfigsReplaySubject$$,
      observable$: intelligentHubConfigs$,
    } = RxjsUtils.cacheAndRetryObservable<{
      [
        key: string
      ]: TravisBackendIntelligentHubDomainModelsFeatureUsageStatistic;
    }>(
      () => this.intelligentHubConfigsReplaySubject$,
      this.intelligentHubApi
        .intelligentHubIntelligentHubConfigsGetFeatureUsageStatisticsPost()
        .pipe(map((resp) => resp.feature_usage_statistics || {})),
      shouldRefresh,
    );

    this.intelligentHubConfigsReplaySubject$ =
      intelligentHubConfigsReplaySubject$$;

    return intelligentHubConfigs$;
  }

  public getIsMemberFilterEnabled$() {
    return this.userService
      .getMyStaff$()
      .pipe(map((staff) => staff.roleType !== 'Staff'));
  }

  public getFeatureEnablement$() {
    return this.companyService.getCompany$().pipe(
      map((company) => {
        if (company) {
          return {
            ...company.addonStatus,
            isSleekpayIntegrationEnabled: company.isStripePaymentEnabled,
          };
        }
        return {
          isSleekpayIntegrationEnabled: false,
          isAdditionalStaffEnabled: false,
          isAdditionalContactsEnabled: false,
          isUnlimitedContactEnabled: false,
          isUnlimitedChannelEnabled: false,
          isEnterpriseContactMaskingEnabled: false,
          isWhatsappQrCodeEnabled: false,
          isShopifyIntegrationEnabled: false,
          isHubspotIntegrationEnabled: false,
          isPaymentIntegrationEnabled: false,
          isSalesforceCrmEnabled: false,
          isSalesforceMarketingCloudEnabled: false,
          isSalesforceCommerceCloudEnabled: false,
          isOnboardingSupportActivated: false,
          isPrioritySupportActivated: false,
          isChatbotSetupSupportActivated: false,
          isHubspotIntegrationFreeTrialEligible: false,
          isSalesforceCrmFreeTrialEligible: false,
        };
      }),
    );
  }
}
