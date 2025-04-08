import { useEffect, useState } from "react";
import moment from "moment";
import { useAppSelector } from "AppRootContext";
import { Moment } from "moment/moment";

export function useMinimumAnalyticsDate() {
  const companyCreatedAt = useAppSelector((s) => s.company?.createdAt);
  const [minDate, setMinDate] = useState<Moment>();

  useEffect(() => {
    if (companyCreatedAt) {
      const companyRegDay = moment(companyCreatedAt);
      if (!companyRegDay.isValid()) {
        console.error(`Bad date: ${companyRegDay}`);
        return;
      }
      if (companyRegDay.isBefore(moment("2021-02-22"))) {
        setMinDate(moment("2021-02-22"));
      } else {
        setMinDate(companyRegDay);
      }
    }
  }, [companyCreatedAt]);

  return minDate;
}
