import { ProviderFieldsType } from "core/features/Crm/API/Onboarding/contracts";

export const formHubspotDisplayName = (option: ProviderFieldsType) => {
  return `${option.label}(${option.name})`;
};
