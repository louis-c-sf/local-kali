import { GET_USER_ROLE_PERMISSION } from "../apiPath";
import { getWithExceptions } from "../apiRequest";

export default async function fetchUserRolePermission() {
  return getWithExceptions(GET_USER_ROLE_PERMISSION, {
    param: {},
  });
}
