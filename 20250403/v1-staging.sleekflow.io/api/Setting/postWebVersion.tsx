import { postWithExceptions } from "../apiRequest";
import { VersionType } from "../../container/Settings/Profile/types";

export const postWebVersion = async (props: {
  userId: string;
  version: VersionType;
}) => {
  const { version, userId } = props;
  return await postWithExceptions(`/webapp/version/${userId}`, {
    param: {
      version,
    },
  });
};
