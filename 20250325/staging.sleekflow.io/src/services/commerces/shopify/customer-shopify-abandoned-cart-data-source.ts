import { UserprofileShopifyAbandonedUserProfileIdGetRequest } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { interfaces } from 'inversify';
import { takeUntil, tap } from 'rxjs';

import { SimpleObjectDataSource } from '@/services/data-sources/simple-object-data-source';

import { ShopifyAbandonedCart, ShopifyService } from './shopify.service';

export interface CustomerShopifyAbandonedCartParams {
  userProfileId: string;
}

export class CustomerShopifyAbandonedCartDataSource extends SimpleObjectDataSource<ShopifyAbandonedCart> {
  private shopifyService: ShopifyService;
  private hasSetup = false;

  constructor(container: interfaces.Container) {
    super();
    this.shopifyService = container.get(ShopifyService);
  }

  public setupAndGet$(
    params: UserprofileShopifyAbandonedUserProfileIdGetRequest,
  ) {
    if (this.hasSetup) {
      return this.getCachedItem$();
    }

    this.setIsLoading(true);
    this.hasSetup = true;

    this.shopifyService
      .getUserShopifyAbandonedCart$(params)
      .pipe(
        takeUntil(this.getDisconnect$()),
        takeUntil(this.getComplete$()),
        tap((cart) => {
          this.onNextCachedItem(cart);
          this.setIsLoading(false);
        }),
      )
      .subscribe();

    return this.getCachedItem$();
  }
}
