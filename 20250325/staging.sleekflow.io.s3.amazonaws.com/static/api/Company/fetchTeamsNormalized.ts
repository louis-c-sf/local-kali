import { TeamNormalizedType } from "types/TeamType";
import { getWithExceptions, getWithExceptions$ } from "api/apiRequest";
import { GET_TEAMS } from "api/apiPath";
import { AxiosObservable } from "axios-observable";

export async function fetchTeamsNormalized(): Promise<TeamNormalizedType[]> {
  return await getWithExceptions(GET_TEAMS, { param: {} });
}

export function fetchTeamsNormalized$(): AxiosObservable<TeamNormalizedType[]> {
  return getWithExceptions$(GET_TEAMS, { param: {} });
}
