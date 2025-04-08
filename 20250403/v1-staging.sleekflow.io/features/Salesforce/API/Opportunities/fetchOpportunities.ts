import { ObjectNormalizedType } from "../Objects/contracts";
import { fetchObjects } from "../Objects/fetchObjects";
import { FetchObjectsInterface } from "../../components/ObjectsGrid/ObjectsGridContextType";

export const fetchOpportunities: FetchObjectsInterface<OpportunityNormalizedType> =
  async function (filters, sorts, limit, offsetToken) {
    return await fetchObjects(
      "Opportunity",
      filters,
      sorts,
      limit,
      offsetToken
    );
  };

export type OpportunityNormalizedType = ObjectNormalizedType & {
  [k: string]: any;
};
