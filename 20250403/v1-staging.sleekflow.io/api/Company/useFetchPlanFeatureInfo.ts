// import { getWithExceptions } from "api/apiRequest";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { useEffect } from "react";

// type Response = {
//   isGlobalPricingFeatureEnabled: boolean;
// };
export default function useFetchPlanFeatureInfo() {
  const company = useAppSelector((s) => s.company);
  const dispatch = useAppDispatch();

  // async function fetchCompanyPlanFeatureInfo() {
  //   const result: Response = await getWithExceptions("/app/feature-info", {
  //     param: {},
  //     config: {
  //       skipAuth: true,
  //     },
  //   });
  // }

  useEffect(() => {
    if (company && company.isGlobalPricingFeatureEnabled === undefined) {
      dispatch({
        type: "UPDATE_COMPANY_GLOBAL_PRICING_FEATURE_INFO",
        isGlobalPricingFeatureEnabled: true,
      });
    }
  }, [dispatch, company]);

  return {
    isGlobalPricingFeatureEnabled: true,
  };
}
