import { ProviderFieldsType } from "core/features/Crm/API/Onboarding/contracts";

export const formSalesforceDisplayName = (option: ProviderFieldsType) => {
  return `${option.label}(${option.name})`;
};
