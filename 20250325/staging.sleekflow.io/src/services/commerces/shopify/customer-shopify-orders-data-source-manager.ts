import { injectable } from 'inversify';

import { DataSourceManager } from '../../data-sources/data-source-manager';
import {
  CustomerShopifyOrdersDataSource,
  CustomerShopifyOrdersParams,
} from './customer-shopify-orders-data-source';

@injectable()
export class CustomerShopifyOrdersDataSourceManager extends DataSourceManager<
  CustomerShopifyOrdersDataSource,
  CustomerShopifyOrdersParams
> {}
