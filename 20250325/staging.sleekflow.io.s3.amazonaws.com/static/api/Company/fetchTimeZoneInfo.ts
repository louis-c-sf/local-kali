import { get } from "api/apiRequest";
import TimeZoneInfoType from "types/TimeZoneInfoType";

export const fetchTimeZoneInfo = async (countryCode: string) => {
  const result = await get("/company/countrylist", {
    param: { countryCode },
    header: { Authorization: "" },
  });

  return (await get("/company/timezone", {
    param: { countryName: result[0]?.displayName },
    header: { Authorization: "" },
  })) as TimeZoneInfoType;
};
