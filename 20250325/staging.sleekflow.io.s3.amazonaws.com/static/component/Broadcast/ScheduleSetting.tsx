import React, { useContext, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import BroadcastContext from "./BroadcastContext";
import moment, { Moment } from "moment";
import { useAppSelector } from "../../AppRootContext";
import DatePickerUtcAware from "../shared/DatePickerUTCAware";

interface ScheduleSettingPropsType {
  scheduledAt?: string;
  disabled: boolean;
}

export default function ScheduleSetting(props: ScheduleSettingPropsType) {
  const { scheduledAt, disabled } = props;
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);
  const { broadcastDispatch } = useContext(BroadcastContext);
  const [startDate, setStartDate] = useState<Moment>(moment());

  useEffect(() => {
    if (scheduledAt) {
      setStartDate(moment(scheduledAt));
    }
  }, [scheduledAt]);

  const handleTimeChange = (date: Moment | null) => {
    if (!date) {
      return;
    }
    setStartDate(date);
    broadcastDispatch({
      type: "UPDATE_SCHEDULE",
      scheduledAt: date.toDate().toISOString(),
    });
  };

  return (
    <DatePickerUtcAware
      disabled={disabled}
      selected={startDate}
      onChange={handleTimeChange}
      utcOffset={selectedTimeZone}
      showTimeSelect
      minDate={new Date()}
      dateFormat="dd/MM/yyyy h:mm aa"
    />
  );
}
