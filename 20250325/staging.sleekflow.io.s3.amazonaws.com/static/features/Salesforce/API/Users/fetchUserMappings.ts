import { post } from "../../../../api/apiRequest";

export async function fetchUserMappings(): Promise<CrmHubUserMappingType> {
  return post("/CrmHub/GetUserMappings", { param: {} });
}

export type CrmHubUserMappingType = {
  crm_hub_user_id_to_staff_dict: Record<string, CrmHubUserNormalized>;
  crm_hub_user_id_to_provider_ids_dict: Record<string, string[]>;
  provider_id_to_crm_hub_user_mappings_dict: Record<
    string,
    {
      main_crm_hub_user_id: string;
      all_crm_hub_user_ids: string[];
    }
  >;
};

export type CrmHubUserNormalized = {
  staff_id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  display_id: string;
  user_name: string;
  email: string;
  phone_number: string;
  position: string;
  created_at: string;
  last_login_at: string;
  email_confirmed: boolean;
  status: "Active" | string;
  role_type: string;
  time_zone_info_id: string;
};
