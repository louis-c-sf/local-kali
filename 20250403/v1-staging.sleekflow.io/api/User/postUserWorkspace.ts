import { postWithExceptions, postWithExceptions$ } from "api/apiRequest";
export type UserWorkspaceResponseType = {
  success: boolean;
  data: {
    user_workspaces: {
      is_default: boolean;
      server_location: string;
      sleekflow_company_id: string;
    }[];
  };
  date_time: Date;
  message?: string;
  http_status_code: number;
  request_id: string;
};
export default function postUserWorkspace() {
  return postWithExceptions<UserWorkspaceResponseType>(
    "/v1/tenant-hub/UserWorkspaces/GetUserWorkspaces",
    { param: {} }
  );
}
