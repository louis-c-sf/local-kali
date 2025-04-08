import { getWithExceptions } from "../apiRequest";

type BroadcastStatisticsRealtimeResponseType = {
  delivered: number;
  failed: number;
  read: number;
  replied: number;
  sent: number;
};

export function fetchBroadcastStatisticsRealtime(
  broadcastId: string
): Promise<BroadcastStatisticsRealtimeResponseType> {
  return getWithExceptions(`/Broadcast/${broadcastId}/Statistics/Realtime`, {
    param: {},
  });
}
