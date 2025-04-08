import { postWithExceptions } from "../apiRequest";

export async function update2FAEnableRole(isEnable: boolean, role: string) {
  return await postWithExceptions(
    isEnable
      ? "/TenantHub/EnabledFeatures/EnableFeatureForRole"
      : "/TenantHub/EnabledFeatures/DisableFeatureForRole",
    {
      param: {
        feature_name: "2FA",
        role_name: role,
      },
    }
  );
}

export async function update2FAEnableCompany(isEnable: boolean) {
  return await postWithExceptions(
    isEnable
      ? "/TenantHub/EnabledFeatures/EnableFeatureForCompany"
      : "/TenantHub/EnabledFeatures/DisableFeatureForCompany",
    {
      param: {
        feature_name: "2FA",
      },
    }
  );
}
