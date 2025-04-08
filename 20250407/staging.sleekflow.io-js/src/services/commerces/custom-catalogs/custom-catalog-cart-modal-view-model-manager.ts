import { injectable } from 'inversify';

import { DataSourceManager } from '../../data-sources/data-source-manager';
import {
  CustomCatalogCartModalViewModel,
  CustomCatalogCartModalViewModelProps,
} from './custom-catalog-cart-modal-view-model';

@injectable()
export class CustomCatalogCartModalViewModelManager extends DataSourceManager<
  CustomCatalogCartModalViewModel,
  CustomCatalogCartModalViewModelProps
> {}
