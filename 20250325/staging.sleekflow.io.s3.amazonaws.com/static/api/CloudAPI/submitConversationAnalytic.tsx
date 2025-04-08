import { postWithExceptions } from "api/apiRequest";

interface AnalyticsType {
  business_initiated_paid_quantity: number;
  business_initiated_free_tier_quantity: number;
  user_initiated_paid_quantity: number;
  user_initiated_free_tier_quantity: number;
  user_initiated_free_entry_point_quantity: number;
  used: {
    currency_iso_code: string;
    amount: number;
  };
  start: string;
  end: string;
}
type ResponseType = {
  conversation_usage_analytic: {
    conversation_category_quantities: {
      AUTHENTICATION?: number;
      MARKETING?: number;
      SERVICE?: number;
      UTILITY?: number;
    };
    granular_conversation_usage_analytics: AnalyticsType[];
    total_business_initiated_paid_quantity: number;
    total_business_initiated_free_tier_quantity: number;
    total_user_initiated_paid_quantity: number;
    total_user_initiated_free_tier_quantity: number;
    total_user_initiated_free_entry_point_quantity: number;
    total_used: {
      currency_iso_code: string;
      amount: number;
    };
  };
};

export async function submitConversationAnalytic(props: {
  facebookBusinessId: string;
  facebookWabaId: string;
  start: string;
  end: string;
}): Promise<ResponseType> {
  const { facebookBusinessId, facebookWabaId, start, end } = props;
  return await postWithExceptions(
    "/company/whatsapp/cloudapi/conversation-usage/analytic",
    {
      param: {
        facebookBusinessId,
        facebookWabaId,
        start,
        end,
      },
    }
  );
}
