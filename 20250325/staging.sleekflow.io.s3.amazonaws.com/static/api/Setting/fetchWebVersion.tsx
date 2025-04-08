import { get } from "../apiRequest";

type WebVersionResponseType = {
  version: string;
};
export const fetchWebVersion = async (
  userId: string
): Promise<WebVersionResponseType> => {
  return await get(`/webapp/version/${userId}`, {
    param: {},
  });
};
