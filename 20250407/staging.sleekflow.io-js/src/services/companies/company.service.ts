import { User } from '@auth0/auth0-react';
import {
  CompanyApi,
  MessagingChannelApi,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import type {
  SleekflowApisMessagingHubModelBusinessBalanceDto,
  TravisBackendChannelDomainModelsEmailConfig,
  TravisBackendChannelDomainModelsLineConfig,
  TravisBackendChannelDomainModelsTelegramConfig,
  TravisBackendChannelDomainModelsViberConfig,
  TravisBackendChannelDomainModelsWeChatConfig,
  TravisBackendChannelDomainModelsWhatsAppConfigViewModel,
  TravisBackendChannelDomainViewModelsWhatsApp360DialogConfigViewModel,
  TravisBackendControllersMessageControllersMessagingChannelControllerGetAvailableChannelsResults,
  TravisBackendConversationDomainViewModelsCompanyResponse,
  TravisBackendConversationServicesModelsFacebookConfig,
  TravisBackendModelsChatChannelConfigWhatsappCloudApiConfig,
  TravisBackendConversationServicesModelsInstagramConfig,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  from,
  map,
  Observable,
  of,
  ReplaySubject,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs';

import type { CompanyUsageResponse } from '@/api/types';
import { StaffCore } from '@/services/companies/types';
import {
  CACHE_REFRESHING_BEHAVIOUR,
  RxjsUtils,
} from '@/services/rxjs-utils/rxjs-utils';

import { SignalRService } from '../signal-r/signal-r.service';
import { queryClient } from '@/utils/queryClient';
import {
  getCloudApiBalancesQueryOptions,
  getCompanyOptions,
  getCompanyUsageQueryOptions,
  getUseTeamListArgs,
} from '@/api/company';
import { I18nService } from '../i18n/i18n.service';

export type MessagingChannel =
  | ({
      channelType: 'instagram';
    } & TravisBackendConversationServicesModelsInstagramConfig)
  | ({
      channelType: 'facebook';
    } & TravisBackendConversationServicesModelsFacebookConfig)
  | ({
      channelType: 'whatsapp';
    } & TravisBackendChannelDomainModelsWhatsAppConfigViewModel)
  | ({
      channelType: 'whatsapp360dialog';
    } & TravisBackendChannelDomainViewModelsWhatsApp360DialogConfigViewModel)
  | ({
      channelType: 'whatsappcloudapi';
      facebookWabaBusinessId: string;
    } & TravisBackendModelsChatChannelConfigWhatsappCloudApiConfig)
  | ({
      channelType: 'telegram';
    } & TravisBackendChannelDomainModelsTelegramConfig)
  | ({ channelType: 'line' } & TravisBackendChannelDomainModelsLineConfig)
  | ({ channelType: 'wechat' } & TravisBackendChannelDomainModelsWeChatConfig)
  | ({ channelType: 'viber' } & TravisBackendChannelDomainModelsViberConfig)
  | ({ channelType: 'email' } & TravisBackendChannelDomainModelsEmailConfig)
  | {
      channelType: 'sms';
      channelDisplayName?: string | null;
      channelIdentityId: null;
      legacyChannelId: string | null;
    }
  | {
      channelType: 'note';
      channelDisplayName?: string | null;
      channelIdentityId: null;
    }
  | {
      channelType: 'web';
      channelDisplayName?: string | null;
      channelIdentityId: null;
    };

export interface Team {
  id: number;
  name: string;
  admins: Staff[];
  members: Staff[];
}

export interface Staff {
  displayName: string;
  connectionStrategy?: User['https://app.sleekflow.io/connection_strategy'];
  id: string;
  staffId: number;
  firstName: string;
  lastName: string;
  email: string;
  associatedTeams: CompanyTeam[];
  roleType?: string;

  // Should show the name when sending the message
  shouldShowSenderName: boolean;
  status: string;
  pictureUrl?: string;
}

export interface CompanyTeam {
  id: number;
  teamName: string;
}

@injectable()
export class CompanyService {
  constructor(
    @inject(MessagingChannelApi)
    private messagingChannelApi: MessagingChannelApi,
    @inject(CompanyApi) private companyApi: CompanyApi,
    @inject(SignalRService) private signalRService: SignalRService,
    @inject(I18nService) private i18nService: I18nService,
  ) {
    this.signalRService
      .getWhatsappBusinessBalance$()
      .pipe(
        withLatestFrom(
          this.whatsappCloudApiBusinessBalancesReplaySubject$$.pipe(
            map((balances) => balances),
          ),
        ),
        map(([balanceChanged, balances]) => {
          const index = balances.findIndex(
            (balance) =>
              balance.facebook_business_id ===
              balanceChanged.facebook_business_id,
          );

          if (index !== -1) {
            const updatedBalances = [...balances];
            updatedBalances[index] = balanceChanged;
            return updatedBalances;
          }

          return balances;
        }),
      )
      .subscribe((updatedBalances) => {
        this.whatsappCloudApiBusinessBalancesReplaySubject$$?.next(
          updatedBalances,
        );
      });
  }

  private displayableMessageChannels$$ = new BehaviorSubject<
    MessagingChannel[] | null
  >(null);
  private displayableMessageChannels$ = this.displayableMessageChannels$$.pipe(
    map((channels) => channels || []),
  );

  public getAllTeams$(): Observable<Team[]> {
    const queryOptions = getUseTeamListArgs({
      staleTime: Infinity,
    });

    const cache = queryClient.getQueryData<any>(queryOptions.queryKey);

    const observable$ = cache
      ? of(cache)
      : from(queryClient.fetchQuery(queryOptions));

    return observable$.pipe(
      map((data) =>
        data.map((obj: any) => {
          const team: Team = {
            id: obj.id,
            name: obj.teamName,
            admins: obj.teamAdmins.map((m: any) => {
              return {
                id: m.userInfo.id,
                staffId: m.staffId,
                firstName: (m.userInfo.firstName || '').trim(),
                lastName: (m.userInfo.lastName || '').trim(),
                email: m.userInfo.email,
              };
            }),
            members: obj.members.map((m: any) => {
              return {
                id: m.userInfo.id,
                staffId: m.staffId,
                firstName: (m.userInfo.firstName || '').trim(),
                lastName: (m.userInfo.lastName || '').trim(),
                email: m.userInfo.email,
              };
            }),
          };

          return team;
        }),
      ),
    );
  }

  private allStaffsCoreReplaySubject$$?: ReplaySubject<StaffCore[]> = undefined;

  public getAllStaffsCore$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.NEVER_REFRESH,
  ) {
    const {
      replaySubject$$: allStaffsOverviewReplaySubject$$,
      observable$: allStaffs$,
    } = RxjsUtils.cacheAndRetryObservable<StaffCore[]>(
      () => this.allStaffsCoreReplaySubject$$,
      combineLatest({
        allStaffs: this.companyApi.companyStaffOverviewsGet({
          offset: 0,
          limit: 1000,
        }),
      }).pipe(
        map(({ allStaffs }) => {
          // it doesn't always have associatedTeams, we need to use allTeams to fill in the missing data in allStaffs
          return allStaffs.map((staff) => {
            let pictureUrl = staff.profilePicture?.url ?? null;
            pictureUrl = pictureUrl
              ? import.meta.env.VITE_API_BASE_URL + pictureUrl
              : pictureUrl;

            return {
              ...staff,
              profilePictureUrl: pictureUrl,
              status: staff.status ?? 'Active',
            } as StaffCore;
          });
        }),
        catchError((error) => {
          console.error('Unable to fetch getAllStaffs$.', error);
          return [];
        }),
      ),
      cacheRefreshingBehaviour ===
        CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
    );

    this.allStaffsCoreReplaySubject$$ = allStaffsOverviewReplaySubject$$;

    if (
      cacheRefreshingBehaviour ===
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT
    ) {
      return this.allStaffsCoreReplaySubject$$
        .asObservable()
        .pipe(startWith([] as StaffCore[]));
    }

    // Some places require the initial value to be an empty array
    return allStaffs$.pipe(startWith([] as StaffCore[]));
  }

  public getCompany$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.NEVER_REFRESH,
  ) {
    const queryOptions = getCompanyOptions({
      ...(cacheRefreshingBehaviour ===
        CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER && {
        staleTime: 0,
      }),
    });

    const cache =
      queryClient.getQueryData<TravisBackendConversationDomainViewModelsCompanyResponse>(
        queryOptions.queryKey,
      );

    return cache
      ? of(cache)
      : from(
          queryClient.fetchQuery(
            queryOptions,
          ) as Promise<TravisBackendConversationDomainViewModelsCompanyResponse>,
        );
  }

  public getCompanyUsage$(): Observable<
    CompanyUsageResponse | null | undefined
  > {
    const queryOptions = getCompanyUsageQueryOptions({ staleTime: Infinity });

    const cache = queryClient.getQueryData<CompanyUsageResponse | null>(
      queryOptions.queryKey,
    );

    return cache
      ? of(cache)
      : from(
          queryClient.fetchQuery(queryOptions) as Promise<
            CompanyUsageResponse | null | undefined
          >,
        );
  }

  private whatsappCloudApiBusinessBalancesReplaySubject$$: ReplaySubject<
    Array<SleekflowApisMessagingHubModelBusinessBalanceDto>
  > = new ReplaySubject(1);

  public getWhatsappCloudApiBalances$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.NEVER_REFRESH,
  ) {
    const refresh =
      cacheRefreshingBehaviour ===
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER;
    const queryOptions = getCloudApiBalancesQueryOptions({
      staleTime: refresh ? 0 : Infinity,
    });

    const cache =
      !refresh &&
      queryClient.getQueryData<
        Array<SleekflowApisMessagingHubModelBusinessBalanceDto>
      >(queryOptions.queryKey);

    const observable$ = cache
      ? of(cache)
      : from(queryClient.fetchQuery(queryOptions));

    return observable$.pipe(map((data) => data ?? []));
  }

  private availableChannelsReplaySubject$$?: ReplaySubject<TravisBackendControllersMessageControllersMessagingChannelControllerGetAvailableChannelsResults> =
    undefined;

  public getAvailableChannels$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.NEVER_REFRESH,
  ) {
    const {
      replaySubject$$: availableChannelsReplaySubject$$,
      observable$: availableChannels$,
    } =
      RxjsUtils.cacheAndRetryObservable<TravisBackendControllersMessageControllersMessagingChannelControllerGetAvailableChannelsResults>(
        () => this.availableChannelsReplaySubject$$,
        this.messagingChannelApi.messagingChannelsGetAvailableChannelsPost(),
        cacheRefreshingBehaviour ===
          CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
      );

    this.availableChannelsReplaySubject$$ = availableChannelsReplaySubject$$;

    if (
      cacheRefreshingBehaviour ===
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT
    ) {
      return this.availableChannelsReplaySubject$$.asObservable();
    }

    return availableChannels$;
  }

  public getDisplayableMessageChannels$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.NEVER_REFRESH,
  ) {
    if (this.displayableMessageChannels$$.getValue() !== null) {
      return this.displayableMessageChannels$;
    }

    this.getAvailableChannels$(cacheRefreshingBehaviour)
      .pipe(
        map((messagingChannels) => {
          return [
            ...(messagingChannels.whatsAppConfigs ?? []),
            ...(messagingChannels.whatsApp360DialogConfigs ?? []),
            ...(messagingChannels.whatsappCloudApiConfigs ?? []),
            ...(messagingChannels.facebookConfigs ?? []),
            ...(messagingChannels.instagramConfigs ?? []),

            ...(messagingChannels.emailConfig
              ? [messagingChannels.emailConfig]
              : []),
            ...(messagingChannels.weChatConfig
              ? [messagingChannels.weChatConfig]
              : []),
            ...(messagingChannels.lineConfigs ?? []),
            ...(messagingChannels.viberConfigs ?? []),
            ...(messagingChannels.telegramConfigs ?? []),
            ...(messagingChannels.smsConfigs ?? []),
            {
              channelType: 'web',
              channelDisplayName: 'Live Chat', // i18n to be handled in component level
              channelIdentityId: 'live-chat',
            },
            {
              channelType: 'note' as const,
              channelDisplayName: this.i18nService.t(
                'inbox.internal-note-channel',
              ),
              channelIdentityId: null,
            },
          ].map((mc) => {
            const myMc = mc as any;

            if (myMc.channelType === 'facebook') {
              myMc.channelDisplayName =
                myMc.channelDisplayName ?? myMc.pageName ?? '';
            }

            if (myMc.channelType === 'email') {
              myMc.channelDisplayName =
                myMc.channelDisplayName ??
                myMc.email ??
                myMc.channelIdentityId ??
                '';
            }

            if (myMc.channelType === 'sms') {
              myMc.channelDisplayName =
                myMc.channelDisplayName ??
                myMc.smsSender ??
                myMc.channelIdentityId ??
                '';
            }

            return mc as MessagingChannel;
          });
        }),
        RxjsUtils.getRetryAPIRequest(),
        tap((messagingChannels) =>
          this.displayableMessageChannels$$.next(messagingChannels),
        ),
      )
      .subscribe();

    return this.displayableMessageChannels$;
  }

  public getIsLoadingDisplayableMessageChannels$() {
    return this.displayableMessageChannels$$.pipe(
      map((displayableMessageChannels) => displayableMessageChannels === null),
    );
  }
}
