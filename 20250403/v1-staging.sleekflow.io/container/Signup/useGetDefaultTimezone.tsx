import { useEffect, useCallback } from "react";
import { fetchDefaultTimezone } from "../../api/Onboarding/fetchDefaultTimezone";

export const useGetDefaultTimezone = (props: {
  setTimezoneId: (id: string | undefined) => void;
  setTimezoneLoading: (loading: boolean) => void;
}) => {
  const { setTimezoneId, setTimezoneLoading } = props;
  const getDefaultTimeZone = useCallback(async () => {
    try {
      setTimezoneLoading(true);
      const timezoneInfo = await fetchDefaultTimezone();
      if (timezoneInfo) {
        setTimezoneId(timezoneInfo.id);
      }
    } catch (error) {
      console.error("getDefaultTimeZone error", error);
    } finally {
      setTimezoneLoading(false);
    }
  }, [setTimezoneId, setTimezoneLoading]);

  useEffect(() => {
    getDefaultTimeZone();
  }, [getDefaultTimeZone]);

  return null;
};
