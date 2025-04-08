import type { SleekflowApisAuditHubModelUserProfileAuditLog } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';

import { RemarkType } from '@/api/types';

import { DisposableDataSource } from '../../data-sources/disposable-data-source';
import { Wrapper } from '../../models/wrapper';

export class UserProfileAuditLogWrapper implements Wrapper {
  public companyId: string;
  public userProfileId: string;
  public staffCreatedId: string | null;
  public staffUpdatedId: string | null;
  public type: string;
  public auditLogText: string;
  public data: any;
  public createdTime: string;
  public updatedTime: string | null;
  public id: string;

  constructor(
    sleekflowApisAuditHubModelUserProfileAuditLog: SleekflowApisAuditHubModelUserProfileAuditLog,
  ) {
    this.companyId =
      sleekflowApisAuditHubModelUserProfileAuditLog.sleekflow_company_id!;
    this.userProfileId =
      sleekflowApisAuditHubModelUserProfileAuditLog.sleekflow_user_profile_id!;
    this.staffCreatedId =
      sleekflowApisAuditHubModelUserProfileAuditLog.sleekflow_staff_id ?? null;
    this.staffUpdatedId =
      sleekflowApisAuditHubModelUserProfileAuditLog.updated_by
        ?.sleekflow_staff_id ?? null;
    this.type = sleekflowApisAuditHubModelUserProfileAuditLog.type!;
    this.auditLogText =
      sleekflowApisAuditHubModelUserProfileAuditLog.audit_log_text!;
    this.data = sleekflowApisAuditHubModelUserProfileAuditLog.data;
    this.createdTime =
      sleekflowApisAuditHubModelUserProfileAuditLog.created_time!;
    this.updatedTime =
      sleekflowApisAuditHubModelUserProfileAuditLog.updated_time ?? null;
    this.id = sleekflowApisAuditHubModelUserProfileAuditLog.id!;
  }

  getId(): string | number {
    return this.id;
  }

  getSleekflowCompanyIdSnapshot(): string {
    return this.companyId;
  }

  getSleekflowUserProfileIdSnapshot(): string {
    return this.userProfileId;
  }

  getSleekflowStaffCreatedIdSnapshot(): string | null {
    return this.staffCreatedId;
  }

  getSleekflowStaffUpdatedIdSnapshot(): string | null {
    return this.staffUpdatedId;
  }

  getTypeSnapshot(): RemarkType {
    return this.type as RemarkType;
  }

  getAuditLogTextSnapshot(): string {
    return this.auditLogText;
  }

  getDataSnapshot(): any {
    return this.data;
  }

  getCreatedTimeSnapshot(): string {
    return this.createdTime;
  }

  getUpdatedTimeSnapshot(): string | null {
    return this.updatedTime;
  }

  public destroy() {
    // Intentionally left blank
  }

  private subscribingDataSources: DisposableDataSource[] = [];

  subscribe(disposableDataSource: DisposableDataSource): void {
    this.subscribingDataSources = [
      ...new Set([...this.subscribingDataSources, disposableDataSource]),
    ];
  }

  unsubscribe(disposableDataSource: DisposableDataSource): void {
    this.subscribingDataSources = this.subscribingDataSources.filter((d) => {
      return d !== disposableDataSource;
    });
  }

  public observed() {
    this.subscribingDataSources = this.subscribingDataSources.filter((d) => {
      return !d.disconnected();
    });

    return this.subscribingDataSources.length !== 0;
  }
}
