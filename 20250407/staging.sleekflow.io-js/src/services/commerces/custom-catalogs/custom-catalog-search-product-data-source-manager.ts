import { injectable } from 'inversify';

import { DataSourceManager } from '../../data-sources/data-source-manager';
import {
  CustomCatalogSearchProductDataSource,
  CustomCatalogSearchProductsParams,
} from './custom-catalog-search-product-data-source';

@injectable()
export class CustomCatalogSearchProductDataSourceManager extends DataSourceManager<
  CustomCatalogSearchProductDataSource,
  CustomCatalogSearchProductsParams
> {}
