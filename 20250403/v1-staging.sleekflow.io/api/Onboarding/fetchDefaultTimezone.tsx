import { getWithExceptions } from "../apiRequest";
type DefaultTimezoneResponse = {
  id: string;
  displayName: string;
  standardName: string;
  baseUtcOffset: string;
  baseUtcOffsetInHour: number;
};

export const fetchDefaultTimezone =
  async (): Promise<DefaultTimezoneResponse> => {
    return await getWithExceptions("/timezone-v2", {
      param: {},
      config: {
        skipAuth: true,
      },
    });
  };
