import { postWithExceptions } from "api/apiRequest";
import { useState } from "react";
type SharedInvitationAcceptParams = {
  username: string;
  lastName: string;
  firstName: string;
  displayName: string;
  position: string;
  timeZoneInfoId: string;
  phoneNumber: string;
  password: string;
};
type Request = {
  shareableId: string;
  invite_shared_user_object: SharedInvitationAcceptParams & {
    email: string;
    confirmPassword: string;
  };
  location: string;
};
type Response = {
  data: null;
  date_time: string;
  error_code: 11004;
  error_context: {
    Code: number;
    InnerException: null;
  };
  http_status_code: number;
  message: string;
  request_id: string;
  success: boolean;
};
export default function useSubmitInvitationLink() {
  const [loading, setLoading] = useState(false);

  async function submit(data: Request) {
    setLoading(true);
    const result = await postWithExceptions<Response, { param: Request }>(
      "/v1/tenant-hub/invite/CompleteLinkInvitation",
      {
        param: {
          ...data,
        },
      }
    );
    return result;
  }

  return {
    submit,
    loading,
  };
}

// CompleteInvitation Response
// {
//   "success": true,
//   "data": {
//       "user": {
//           "username": "p.loInviteUsername7",
//           "first_name": "testing",
//           "last_name": "paul",
//           "display_name": "testing paul",
//           "email": "p.lo+inviteuserlink+1@sleekflow.io",
//           "phone_number": "85255939648",
//           "user_workspaces": [
//               {
//                   "sleekflow_company_id": "MzSddDr4Q2DV77m",
//                   "sleekflow_user_id": "d4iBB3bX8oK63Rk",
//                   "sleekflow_staff_id": "35012",
//                   "sleekflow_role_ids": [
//                       "Drioz6DQzqBRya"
//                   ],
//                   "sleekflow_team_ids": [],
//                   "is_default": true,
//                   "additional_permissions": [],
//                   "metadata": {}
//               }
//           ],
//           "profile_picture_url": null,
//           "is_agree_marketing_consent": null,
//           "record_statuses": [
//               "Active"
//           ],
//           "metadata": {},
//           "created_at": "2024-05-13T00:35:55.007Z",
//           "updated_at": "2024-05-13T00:35:55.007Z",
//           "id": "d4iBB3bX8oK63Rk",
//           "sys_type_name": "User"
//       },
//       "response": {
//           "user_id": "d4iBB3bX8oK63Rk",
//           "company_id": "MzSddDr4Q2DV77m",
//           "staff_id": "35012",
//           "role_type": "Admin",
//           "team_ids": []
//       }
//   },
//   "date_time": "2024-05-13T00:36:01.642Z",
//   "http_status_code": 200,
//   "request_id": "vpTEEVg483WEb3v"
// }
