import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import { GetUserProfilesFilter } from './models/get-user-profiles-filter';
import { UserProfileDataSource } from './user-profile-data-source';

@injectable()
export class UserProfileDataSourceManager extends DataSourceManager<
  UserProfileDataSource,
  GetUserProfilesFilter
> {}
