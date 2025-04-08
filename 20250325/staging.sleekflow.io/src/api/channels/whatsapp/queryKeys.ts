import { createQueryKeys } from '@lukemorales/query-key-factory';
import { Dayjs } from 'dayjs';
import { GetConversationAnalyticsInput } from './types';

export const billingKeys = createQueryKeys('whatsapp-billing', {
  getWabaConversationUsageAnalytics: (
    fbbaId: string,
    wabaId: string,
    start: Dayjs | undefined,
    end: Dayjs | undefined,
  ) => [{ fbbaId, wabaId, start, end }],
  useGetWabaTopUpProfile: ({
    fbbaId,
    wabaId,
  }: {
    fbbaId: string;
    wabaId?: string | undefined;
  }) => [{ fbbaId, wabaId }],
  useGetWabaAllTimeUsage: ({
    fbbaId,
    wabaId,
  }: {
    fbbaId: string;
    wabaId?: string | undefined;
  }) => [{ fbbaId, wabaId }],
  useGetConversationAnalytics: (input: GetConversationAnalyticsInput) => [
    {
      waba_id: input.waba_id,
      start_timestamp: input.start_timestamp,
      end_timestamp: input.end_timestamp,
      phone_number: input.phone_number,
    },
  ],
});

export const conversationalAutomationKeys = createQueryKeys(
  'whatsapp-conversational-automation',
  {
    getConversationalAutomationList: (wabaId: string) => [{ wabaId }],
  },
);
