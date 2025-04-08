import { postWithExceptions } from "api/apiRequest";

type CreateStaffManualAddedLogArgs = {
  sleekflow_user_profile_id: string;
  audit_log_text: string;
};

export const postActivityLogs = (props: CreateStaffManualAddedLogArgs) => {
  return postWithExceptions("/AuditHub/AuditLogs/CreateStaffManualAddedLog", {
    param: {
      sleekflow_user_profile_id: props.sleekflow_user_profile_id,
      audit_log_text: props.audit_log_text,
    },
  });
};
