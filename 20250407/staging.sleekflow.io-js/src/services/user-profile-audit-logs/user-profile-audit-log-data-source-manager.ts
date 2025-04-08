import { injectable } from 'inversify';

import { DataSourceManager } from '../data-sources/data-source-manager';
import { GetUserProfileAuditLogsParams } from './models/get-user-profile-audit-logs-params';
import { UserProfileAuditLogDataSource } from './user-profile-audit-log-data-source';

@injectable()
export class UserProfileAuditLogDataSourceManager extends DataSourceManager<
  UserProfileAuditLogDataSource,
  GetUserProfileAuditLogsParams
> {}
