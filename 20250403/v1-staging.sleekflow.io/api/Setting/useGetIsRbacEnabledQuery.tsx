import { postWithExceptions } from "api/apiRequest";
import { useAppDispatch } from "AppRootContext";
import { ApiSuccessResponseTemplate } from "types/ApiTypes";

type IsRbacEnabledResponse = {
  is_enabled: boolean;
};
export function useGetIsRbacEnabledQuery({
  isEnabled,
}: {
  isEnabled: boolean;
}) {
  const loginDispatch = useAppDispatch();
  async function fetchIsRbacEnabled() {
    try {
      if (!isEnabled) {
        loginDispatch({
          type: "IS_RBAC_TOGGLE",
          isRbacEnabled: false,
        });
        return false;
      }
      const response = await postWithExceptions<
        ApiSuccessResponseTemplate<IsRbacEnabledResponse>
      >("/v1/tenant-hub/authorized/Rbac/IsRbacEnabled", {
        param: {},
      });
      loginDispatch({
        type: "IS_RBAC_TOGGLE",
        isRbacEnabled: response.data.is_enabled,
      });
      return response.data.is_enabled;
    } catch (error) {}
  }
  return { fetchIsRbacEnabled };
}
