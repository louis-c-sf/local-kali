import { useAppSelector } from "../../../AppRootContext";
import { LoginType } from "../../../types/LoginType";

export function useCurrentUtcOffset(): number {
  return useAppSelector(selectCurrentUtcOffset);
}

function selectCurrentUtcOffset(s: LoginType) {
  return (
    s.selectedTimeZone ?? s.company?.timeZoneInfo?.baseUtcOffsetInHour ?? 0
  );
}
