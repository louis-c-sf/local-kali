import { useAppSelector } from "../../../../AppRootContext";

export function useScheduleMessageFlow() {
  const scheduleMode = useAppSelector((s) => s.inbox.messenger.schedule.state);

  return {
    scheduleMode,
  };
}
