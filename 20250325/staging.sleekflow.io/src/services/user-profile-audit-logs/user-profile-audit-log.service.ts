import {
  AuditHubApi,
  TravisBackendConversationDomainViewModelsDeleteRemarkResponse,
  TravisBackendConversationDomainViewModelsRemarkResponse,
  TravisBackendConversationDomainViewModelsUpdateRemarkResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { filter, map } from 'rxjs';

import { ClassicRealTimeService } from '../signal-r/classic-real-time.service';
import { GetUserProfileAuditLogsParams } from './models/get-user-profile-audit-logs-params';
import { UserProfileAuditLogWrapper } from './wrappers/user-profile-audit-log-wrapper';

@injectable()
export class UserProfileAuditLogService {
  constructor(
    @inject(AuditHubApi) private auditHubApi: AuditHubApi,
    @inject(ClassicRealTimeService)
    private classicRealTimeService: ClassicRealTimeService,
  ) {}

  public getUserProfileAuditLogs$(
    getUserProfileAuditLogsParam: GetUserProfileAuditLogsParams,
    limit: number,
    continuationToken: string | null,
  ) {
    return this.auditHubApi
      .auditHubAuditLogsGetUserProfileAuditLogsV2Post({
        travisBackendControllersSleekflowControllersAuditHubControllerGetUserProfileAuditLogsV2Request:
          {
            sleekflow_user_profile_id:
              getUserProfileAuditLogsParam.userProfileId,
            filters: getUserProfileAuditLogsParam.filters,
            continuation_token: continuationToken,
            limit,
          },
      })
      .pipe(
        map((resp) => {
          return {
            list: (resp.data?.user_profile_audit_logs ?? []).map(
              (l) => new UserProfileAuditLogWrapper(l),
            ),
            continuationToken: resp.data?.next_continuation_token ?? null,
          };
        }),
      );
  }

  public getRealtimeAuditLogsAdded$(
    getUserProfileAuditLogsParam: GetUserProfileAuditLogsParams,
  ) {
    return this.classicRealTimeService.getOnRemarksReceived$().pipe(
      filter(
        (r: TravisBackendConversationDomainViewModelsRemarkResponse) =>
          r.userProfileId === getUserProfileAuditLogsParam.userProfileId,
      ),
      map((r: TravisBackendConversationDomainViewModelsRemarkResponse) => {
        return new UserProfileAuditLogWrapper({
          id: r.remarkId,
          sleekflow_company_id: '',
          sleekflow_user_profile_id: r.userProfileId,
          sleekflow_staff_id: r.remarksStaff?.userInfo?.id,
          type: r.type,
          audit_log_text: r.remarks,
          data: r.data,
          created_time: r.createdAt,
        });
      }),
    );
  }

  public getRealtimeAuditLogsUpdated$(
    getUserProfileAuditLogsParam: GetUserProfileAuditLogsParams,
  ) {
    return this.classicRealTimeService.getOnRemarkUpdated$().pipe(
      filter(
        (r: TravisBackendConversationDomainViewModelsUpdateRemarkResponse) =>
          r.userProfileId === getUserProfileAuditLogsParam.userProfileId,
      ),
      map(
        (r: TravisBackendConversationDomainViewModelsUpdateRemarkResponse) => {
          return new UserProfileAuditLogWrapper({
            id: r.remarkId,
            sleekflow_company_id: '',
            sleekflow_user_profile_id: r.userProfileId,
            sleekflow_staff_id: r.remarksStaff?.userInfo?.id,
            type: r.type,
            audit_log_text: r.remarks,
            data: r.data,
            created_time: r.createdAt,
            updated_time: r.updatedAt,
          });
        },
      ),
    );
  }

  public getRealtimeAuditLogsDeleted$(
    getUserProfileAuditLogsParam: GetUserProfileAuditLogsParams,
  ) {
    return this.classicRealTimeService.getOnRemarkDeleted$().pipe(
      filter(
        (r: TravisBackendConversationDomainViewModelsDeleteRemarkResponse) =>
          r.userProfileId === getUserProfileAuditLogsParam.userProfileId,
      ),
      map(
        (r: TravisBackendConversationDomainViewModelsDeleteRemarkResponse) => {
          return new UserProfileAuditLogWrapper({
            id: r.remarkId,
            sleekflow_company_id: '',
            sleekflow_user_profile_id: r.userProfileId,
            sleekflow_staff_id: null,
            type: null,
            audit_log_text: null,
            data: null,
            created_time: undefined,
          });
        },
      ),
    );
  }
}
