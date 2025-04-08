import { useQueryData } from "api/apiHook";

// {
//   "data": {
//       "associatedCompanyIds": [
//           "qNSAAYoLy6qW41m"
//       ],
//       "email": "p.lo+signup03-hk@sleekflow.io",
//       "firstName": "testing",
//       "isShopifyAccount": false,
//       "lastName": "paul",
//       "signalRGroupName": "qNSAAYoLy6qW41m",
//       "staffId": "35016",
//       "userId": "1KinnGg2vP3bank",
//       "userName": "plosignup03hk"
//   },
//   "date_time": "2024-05-15T12:31:06.385Z",
//   "http_status_code": 200,
//   "request_id": "e3TQQpabDxrMKvd",
//   "success": true
// }
type Response = {
  associated_company_ids: string[];
  email: string;
  first_name: string;
  is_shopify_account: boolean;
  last_name: string;
  signalr_group_name: string;
  staff_id: string;
  user_id: string;
  user_name: string;
};
type Request = {
  lmref: string;
  phoneNumber: string;
  industry?: string;
  onlineShopSystem?: string;
  companyName: string;
  timeZoneInfoId: string;
  companySize?: string;
  heardFrom?: string;
  promotionCode: string;
  webClientUUID: string;
  firstName: string | null;
  lastName: string | null;
  communicationTools: string[];
  companyWebsite: string;
  isAgreeMarketingConsent: boolean;
  connectionStrategy?: string;
  location?: string;
  isGlobalPricingEnabled: boolean;
  partnerstackKey?: string;
};

export default function useRegisterAccountCompnay({
  data,
  enabled,
}: {
  data: Request;
  enabled: boolean;
}) {
  let referralId = "";
  const tolt = window["tolt_referral"];
  if (tolt) {
    referralId = tolt;
  }
  return useQueryData<{
    success: boolean;
    data: Response;
  }>(
    "/v1/tenant-hub/Register/Companies/RegisterCompany",
    {
      lmref: "",
      phone_number: data.phoneNumber,
      industry: data.industry,
      online_shop_system: data.onlineShopSystem,
      company_name: data.companyName,
      time_zone_info_id: data.timeZoneInfoId || "GMT Time Zone",
      company_size: data.companySize,
      subscription_plan_id: data.isGlobalPricingEnabled
        ? "sleekflow_v10_startup"
        : "sleekflow_freemium",
      heard_from: data.heardFrom,
      promotion_code: data.promotionCode,
      web_client_uuid: data.webClientUUID,
      referral: referralId,
      first_name: data.firstName,
      last_name: data.lastName,
      communication_tools: data.communicationTools,
      company_website: data.companyWebsite,
      is_agree_marketing_consent: data.isAgreeMarketingConsent,
      connection_strategy: data.connectionStrategy,
      location: data.location,
      partnerstack_key: data.partnerstackKey,
      // location: "eastasia",
    },
    {
      protocol: "post",
      enabled,
    }
  );
}
