import { useState } from "react";

import { IpResponseType } from "../../../api/countryCode";
import { getWithExceptions } from "../../../api/apiRequest";

export const useGetCurrentIp = () => {
  const [isLoading, setLoading] = useState(false);
  const [isBooted, setBooted] = useState(false);
  const getPublicIP = async () => {
    try {
      setLoading(true);
      const data: IpResponseType = await getWithExceptions("/ipaddress", {
        param: {},
        config: {
          skipAuth: true,
        },
      });
      if (data) {
        return data.ipAddress;
      }
    } catch (error) {
      console.error("getPublicIP error", error);
    } finally {
      setBooted(true);
      setLoading(false);
    }
  };

  const boot = async () => {
    return await getPublicIP();
  };

  return {
    isLoading,
    boot,
    isBooted,
  };
};
