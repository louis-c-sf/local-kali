import { postWithExceptions } from "../apiRequest";

type ResponseType = {
  success: boolean;
  data: {
    is_feature_enabled_for_company: boolean;
    is_feature_enabled_for_roles_dict: {
      Admin: boolean;
      Staff: boolean;
      TeamAdmin: boolean;
    };
  };
};

export async function fetch2FASetting(): Promise<ResponseType> {
  return await postWithExceptions(
    "/TenantHub/EnabledFeatures/GetFeatureEnablements",
    {
      param: {
        feature_name: "2FA",
      },
    }
  );
}
