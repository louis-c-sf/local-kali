import {
  FilterGroupType,
  SortType,
  RequestType,
  EntityType,
  ResponseType,
  ExpandType,
  ObjectNormalizedExpandedType,
} from "./contracts";
import { post } from "../../../../api/apiRequest";

export async function fetchObjects<TExpands extends string>(
  type: EntityType,
  filters: FilterGroupType[],
  sorts: SortType[],
  limit: number,
  offsetToken?: string,
  expands?: ExpandType[]
): Promise<ResponseType<ObjectNormalizedExpandedType<TExpands>>> {
  const request: RequestType = {
    entity_type_name: type,
    continuation_token: offsetToken ?? null,
    limit: limit,
    filter_groups: filters,
    sorts: sorts,
    expands,
  };

  return await post("/CrmHub/GetObjects", { param: request });
}
