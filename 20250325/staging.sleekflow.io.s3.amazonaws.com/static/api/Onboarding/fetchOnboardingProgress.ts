import { getBatch } from "../apiRequest";
import { GET_COMPANY_FIELD, GET_ONBOARDING_PROGRESS } from "../apiPath";
import {
  OnboardingProgressType,
  initialFlags,
} from "../../component/GettingStarted/OnboardingProgressType";
import { CompanyCustomFieldsType } from "../../types/CompanyType";

export async function fetchOnboardingProgress(): Promise<OnboardingProgressType> {
  const [onboardingResult, companyResult] = await getBatch(
    {
      path: GET_ONBOARDING_PROGRESS,
      param: { param: {} },
    },
    {
      path: GET_COMPANY_FIELD,
      param: { param: {} },
    }
  );

  let flags = { ...initialFlags, ...onboardingResult };
  return (companyResult as CompanyCustomFieldsType[])
    .filter((item) => item.category === "OnboardingProgress")
    .reduce((acc, next) => {
      try {
        const parsedValue = JSON.parse(next.value);
        return { ...acc, ...parsedValue };
      } catch (e) {
        console.warn(`Bad field ${next.fieldName} value: ${next.value}`);
        return acc;
      }
    }, flags);
}
