import { injectable } from 'inversify';

import { DataSourceManager } from '../../data-sources/data-source-manager';
import {
  ShopifySearchProductDataSource,
  ShopifySearchProductsParams,
} from './shopify-search-product-data-source';

@injectable()
export class ShopifySearchProductDataSourceManager extends DataSourceManager<
  ShopifySearchProductDataSource,
  ShopifySearchProductsParams
> {}
