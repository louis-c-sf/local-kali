import { getWithExceptions$ } from "../../apiRequest";
import { GET_ANALYTICS_CLIENT_INFO } from "../../apiPath";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { WebClientInfoResponseType } from "../../../types/Analytics/api/WebClientInfoResponseType";

type ResponseType = {
  onlineStatus?: string;
  results: WebClientInfoResponseType[];
};

export function fetchWebclientInfo$(
  webClientUUID: string
): Observable<ResponseType> {
  return getWithExceptions$(
    GET_ANALYTICS_CLIENT_INFO.replace("{webclientUUID}", webClientUUID),
    { param: {} }
  ).pipe(map((r) => r.data));
}
