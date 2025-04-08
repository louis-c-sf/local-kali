import { useQueryData } from "api/apiHook";
import { post, postWithExceptions } from "api/apiRequest";
import { StaffType } from "types/StaffType";

type Request = {
  invite_users: {
    email: string;
    userRole: string;
  }[];
  location: string;
  team_ids: number[];
};
type Response = {
  data: StaffType[];
  date_time: string;
  message: string;
  http_status_code: number;
};
export default function inviteUserByEmailRequest({ data }: { data: Request }) {
  const result = Promise.all(
    data.invite_users.map((user) => {
      return postWithExceptions<Response>(
        `/v1/tenant-hub/authorized/Companies/InviteUserByEmail`,
        {
          param: {
            ...data,
            invite_users: [user],
          },
        }
      );
    })
  );
  return result;
}
