import { useQueryData } from "api/apiHook";
import useRouteConfig from "config/useRouteConfig";
type Response = {
  data: {
    data_center_location: string;
  };
  date_time: string;
  http_status_code: number;
  request_id: string;
  success: true;
  loading: boolean;
  error: boolean;
  errorRes: null;
  status: string;
};
function useFetchGeoLocation() {
  const { matchesCurrentRoute } = useRouteConfig();
  const geoLocation = useQueryData<Response>(
    "/v1/tenant-hub/Geolocations/GetClosestDataCenter",
    {},
    {
      config: { baseURL: process.env.REACT_APP_SLEEKFLOW_API_URL },
      protocol: "post",
      enabled: matchesCurrentRoute("/setup-company"),
    }
  );
  return geoLocation;
}
export default useFetchGeoLocation;
