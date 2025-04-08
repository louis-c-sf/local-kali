import { injectable } from 'inversify';

import { DataSourceManager } from '../../data-sources/data-source-manager';
import {
  CustomerShopifyAbandonedCartDataSource,
  CustomerShopifyAbandonedCartParams,
} from './customer-shopify-abandoned-cart-data-source';

@injectable()
export class CustomerShopifyAbandonedCartDataSourceManager extends DataSourceManager<
  CustomerShopifyAbandonedCartDataSource,
  CustomerShopifyAbandonedCartParams
> {}
