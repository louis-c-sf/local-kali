import { postWithExceptions } from "api/apiRequest";
import {
  AuditLogsFilterType,
  AuditLogsGetUserProfileAuditLogsResponse,
} from "component/Contact/Individual/types";

export type AuditLogsGetUserProfileAuditLogsArgs = {
  sleekflow_user_profile_id: string;
  continuation_token?: string;
  filters: {
    types?: AuditLogsFilterType[] | null;
    has_sleekflow_staff_id?: boolean;
  };
  limit?: number;
};

export const fetchActivityLogs = (
  props: AuditLogsGetUserProfileAuditLogsArgs
): Promise<AuditLogsGetUserProfileAuditLogsResponse> => {
  const { continuation_token, filters, limit, sleekflow_user_profile_id } =
    props;
  return postWithExceptions("/AuditHub/AuditLogs/GetUserProfileAuditLogsV2", {
    param: {
      sleekflow_user_profile_id,
      continuation_token,
      filters: {
        types: filters.types,
        has_sleekflow_staff_id: filters.has_sleekflow_staff_id,
      },
      limit,
    },
  });
};
