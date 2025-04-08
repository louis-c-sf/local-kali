import { StripePaymentApi } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import type { TravisBackendStripeIntegrationDomainModelsStripePaymentLineItem } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';
import {
  first,
  interval,
  map,
  Observable,
  race,
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
  tap,
  timer,
} from 'rxjs';

import {
  CACHE_REFRESHING_BEHAVIOUR,
  RxjsUtils,
} from '@/services/rxjs-utils/rxjs-utils';

import { CommerceService } from '../commerces/commerce.service';
import type { CustomerStripePayments } from '../commerces/stripe-payments/customer-stripe-payments-data-source';
import { StripePaymentStatus } from '../commerces/stripe-payments/constants';

export interface SleekpayCurrency {
  currency: string;
  platformCountry: string;
}

// [{
//   "messageType": "PaymentMessage",
//   "messageBody": "Checkout: \n{0}",
//   "params": ["paymentUrl"],
//   "createdAt": "2022-06-21T09:07:40.384998Z",
//   "updatedAt": "2022-06-21T09:07:40.384998Z",
//   "id": 1
// }]
export interface SleekpayTemplate {
  messageType: string;
  messageBody: string;
  params: string[];
  createdAt: string;
  updatedAt: string;
  id: number;
}

export interface SleekpayPaymentLinkResponse {
  paymentIntentId: string;
  paymentLink: string;
  stripePaymentRecordId: number;
  rawPaymentLink: string;
}

@injectable()
export class SleekpayService {
  constructor(
    @inject(StripePaymentApi) private stripePaymentApi: StripePaymentApi,
    @inject(CommerceService) private commerceService: CommerceService,
  ) {}

  private supportedCurrenciesReplaySubject$$?: ReplaySubject<
    SleekpayCurrency[]
  > = undefined;
  public onSleekpayPaymentLinkGenerated = new Subject<
    SleekpayPaymentLinkResponse & { userProfileId: string }
  >();

  public getSupportedCurrencies$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.NEVER_REFRESH,
  ) {
    const {
      replaySubject$$: supportedCurrenciesReplaySubject$$,
      observable$: supportedCurrencies$,
    } = RxjsUtils.cacheAndRetryObservable<SleekpayCurrency[]>(
      () => this.supportedCurrenciesReplaySubject$$,
      this.stripePaymentApi.sleekPaySupportedCurrenciesGet().pipe(
        map((resp: any) => {
          return resp['stripeSupportedCurrenciesMappings'].map(
            (mapping: any) => {
              const currency: SleekpayCurrency = {
                currency: mapping.currency,
                platformCountry: mapping.platformCountry,
              };

              return currency;
            },
          );
        }),
      ),
      cacheRefreshingBehaviour ===
        CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
    );

    this.supportedCurrenciesReplaySubject$$ =
      supportedCurrenciesReplaySubject$$;

    if (
      cacheRefreshingBehaviour ===
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT
    ) {
      return this.supportedCurrenciesReplaySubject$$.asObservable();
    }

    return supportedCurrencies$;
  }

  public generateSleekpayPaymentLink$(
    lineItems: TravisBackendStripeIntegrationDomainModelsStripePaymentLineItem[],
    expiredAt: dayjs.Dayjs,
    platformCountry: string,
    userProfileId: string,
    shopifyId?: number,
  ): Observable<SleekpayPaymentLinkResponse> {
    return this.stripePaymentApi
      .sleekPayGeneratePaymentPost({
        travisBackendStripeIntegrationDomainModelsGenerateStripPaymentRequest: {
          lineItems: lineItems,
          expiredAt: expiredAt.toISOString(),
          platformCountry: platformCountry,
          userprofileId: userProfileId,
          ...(shopifyId ? { shopifyId: shopifyId } : {}),
        },
      })
      .pipe(
        map((resp: any) => {
          // {
          //     "stripePaymentRecordId": 12798,
          //     "paymentIntentId": "pi_3PBfMrI2ilBBY57Z0sVMGGBM",
          //     "url": "https://checkout.stripe.com/c/pay/cs_test_b1NJBbaDiYyyw7OUIHV8KRg9uz4zQZ2sqJSsEPnCBlN10iRWMAAV3GjPS1#fidkdWxOYHwnPyd1blpxYHZxWjA0Tml1bj1MN2xpR0dcMDJfSlx9anJ2UlBWUEEyUmcyNHVWf2JHf2ZXckMyRlRVdWQ0XWFVMnN1cnBnX25nYnAwcjxNRHZiYkxndj1SM2s0Z1NwYHZWR2ttNTVtVndxQHJLUicpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPydocGlxbFpscWBoJyknYGtkZ2lgVWlkZmBtamlhYHd2Jz9xd3BgeCUl",
          //     "trackingUrl": "https://pay-eas-dev.sleekflow.io/track/99WHMMLQ"
          // }
          return {
            paymentIntentId: (resp.paymentIntentId as string) || '',
            paymentLink: (resp.trackingUrl as string) || '',
            stripePaymentRecordId: (resp.stripePaymentRecordId as number) || 0,
            rawPaymentLink: (resp.url as string) || '',
          };
        }),
        tap((resp) => {
          const pollUntilNewPaymentLinkAppears$ = interval(1000).pipe(
            switchMap(() =>
              this.commerceService.getCustomerStripePayments$({
                userProfileId,
                status: StripePaymentStatus.PENDING,
                limit: 10,
              }),
            ),
            first(
              (payments: CustomerStripePayments) =>
                !!payments.stripePaymentCustomerPaymentHistoryRecords.find(
                  (p) => p.paymentId === resp.paymentIntentId,
                ),
            ),
          );
          const pollTimeout$ = timer(5000);
          race(pollUntilNewPaymentLinkAppears$, pollTimeout$).subscribe(() =>
            this.onSleekpayPaymentLinkGenerated.next({
              userProfileId,
              ...resp,
            }),
          );
        }),
      );
  }

  private paymentMessageTemplateReplaySubject$$?: ReplaySubject<SleekpayTemplate> =
    undefined;

  public getPaymentMessageTemplate(shouldRefresh = false) {
    const {
      replaySubject$$: paymentMessageTemplateReplaySubject$$,
      observable$: paymentMessageTemplate$,
    } = RxjsUtils.cacheAndRetryObservable(
      () => this.paymentMessageTemplateReplaySubject$$,
      this.stripePaymentApi
        .sleekPayMessageTemplateGet({
          messageType: 'PaymentMessage' as any,
        })
        .pipe(
          map((resp: any) => {
            return resp as SleekpayTemplate[];
          }),
          map((templates: SleekpayTemplate[]) => {
            return templates[0];
          }),
          shareReplay({
            bufferSize: 1,
            refCount: false,
          }),
        ),
      shouldRefresh,
    );

    this.paymentMessageTemplateReplaySubject$$ =
      paymentMessageTemplateReplaySubject$$;

    return paymentMessageTemplate$;
  }

  public getOnSleekpayPaymentLinkGenerated$() {
    return this.onSleekpayPaymentLinkGenerated.asObservable();
  }
}
