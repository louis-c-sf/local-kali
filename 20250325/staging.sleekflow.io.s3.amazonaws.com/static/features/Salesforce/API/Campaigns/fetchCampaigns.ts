import {
  ObjectNormalizedType,
  ObjectNormalizedExpandedType,
} from "../Objects/contracts";
import { fetchObjects } from "../Objects/fetchObjects";
import { FetchObjectsInterface } from "../../components/ObjectsGrid/ObjectsGridContextType";
import { fetchObjectsV2 } from "../Objects/fetchObjectsV2";

export const fetchCampaigns: FetchObjectsInterface<
  ObjectNormalizedExpandedType<string>
> = async function (filters, sorts, limit, offsetToken) {
  return await fetchObjectsV2<string>(
    "Campaign",
    filters,
    sorts,
    limit,
    [],
    offsetToken
  );
};
