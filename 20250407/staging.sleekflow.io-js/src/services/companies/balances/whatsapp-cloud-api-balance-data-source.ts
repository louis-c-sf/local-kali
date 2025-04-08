import { interfaces } from 'inversify';
import {
  combineLatest,
  endWith,
  interval,
  map,
  startWith,
  switchMap,
  takeWhile,
} from 'rxjs';

import { SimpleObjectDataSource } from '@/services/data-sources/simple-object-data-source';
import { CACHE_REFRESHING_BEHAVIOUR } from '@/services/rxjs-utils/rxjs-utils';

import { CompanyService } from '../company.service';
import { SleekflowApisMessagingHubModelBusinessBalanceDto } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';

export type whatsappCloudApiBalances = {
  channelIdentityId: string | null | undefined;
  balance: {
    currency_iso_code: string | null | undefined;
    amount: number | undefined;
  };
};

export class WhatsappCloudApiBalanceDataSource extends SimpleObjectDataSource<
  Array<whatsappCloudApiBalances>
> {
  private hasSetup = false;
  private readonly companyService: CompanyService;

  constructor(container: interfaces.Container) {
    super();
    this.companyService = container.get(CompanyService);
  }

  public setupAndGet$() {
    if (this.hasSetup) {
      return this.getCachedItem$();
    }

    this.hasSetup = true;

    interval(1000 * 60 * 20) // 1000 milliseconds * 60 seconds * 20 minutes = 1,200,000 milliseconds
      .pipe(
        startWith(0),
        switchMap(() =>
          combineLatest([
            this.companyService.getAvailableChannels$(),
            this.companyService.getWhatsappCloudApiBalances$(
              CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
            ),
          ]),
        ),
        map(([availableChannels, balances]) => {
          return (
            availableChannels?.whatsappCloudApiConfigs?.map((config) => {
              const balanceConfig = balances.find((b) =>
                b.facebook_business_wabas?.some(
                  (f) => f.facebook_waba_id === config.facebookWabaId,
                ),
              );

              return {
                channelIdentityId: config.channelIdentityId,
                balance: getConfigBalance(balanceConfig, config.facebookWabaId),
                wabaBalances: balanceConfig?.waba_balances,
              };
            }) ?? []
          );
        }),
        takeWhile((configs) => configs.length > 0, true),
        endWith([]),
      )
      .subscribe((balances) => {
        this.onNextCachedItem(balances);
      });

    return this.getCachedItem$();
  }
}
function getConfigBalance(
  balanceConfig: SleekflowApisMessagingHubModelBusinessBalanceDto | undefined,
  facebookWabaId?: string | null,
) {
  const isWabaEnabled = balanceConfig?.is_by_waba_billing_enabled;
  if (isWabaEnabled) {
    const wabaBalance = balanceConfig?.waba_balances?.find(
      (w) => w.facebook_waba_id === facebookWabaId,
    );

    return {
      currency_iso_code: wabaBalance?.balance?.currency_iso_code,
      amount: wabaBalance?.balance?.amount,
    };
  }
  return {
    currency_iso_code: balanceConfig?.balance?.currency_iso_code,
    amount: balanceConfig?.balance?.amount,
  };
}
