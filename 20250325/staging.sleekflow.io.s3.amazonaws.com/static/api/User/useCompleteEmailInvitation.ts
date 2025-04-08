import { useQueryData } from "api/apiHook";
type Request = {
  username: string;
  sleekflow_user_id: string | null;
  tenanthub_user_id: string | null;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  token: string | null;
  position: string;
  timeZoneInfoId: string;
  location: string | null;
};
type Response = {
  success: boolean;
  data: {
    message: string;
  };
  message: string;
  date_time: string;
  http_status_code: number;
  error_code: number;
  error_context: {};
  request_id: string;
};
export default function useCompleteEmailInvitation({
  data,
  enabled,
}: {
  data: Request;
  enabled: boolean;
}) {
  return useQueryData<Response>(
    "/v1/tenant-hub/invite/CompleteEmailInvitation",
    {
      ...data,
      location: data.location || "eastasia",
    },
    {
      protocol: "post",
      enabled,
    }
  );
}
