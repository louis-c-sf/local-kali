import { Container } from 'inversify';

import { UserProfileAuditLogDataSource } from './user-profile-audit-log-data-source';
import { UserProfileAuditLogDataSourceManager } from './user-profile-audit-log-data-source-manager';
import { UserProfileAuditLogService } from './user-profile-audit-log.service';

function loadDeps(container: Container) {
  container
    .bind<UserProfileAuditLogService>(UserProfileAuditLogService)
    .to(UserProfileAuditLogService)
    .inSingletonScope();
  container
    .bind<UserProfileAuditLogDataSourceManager>(
      UserProfileAuditLogDataSourceManager,
    )
    .toConstantValue(
      new UserProfileAuditLogDataSourceManager(
        () => new UserProfileAuditLogDataSource(container),
      ),
    );
}

export const UserProfileAuditLogs = {
  loadDeps,
};
