import { ofType } from "redux-observable";
import { Action, LoginType } from "../../../types/LoginType";
import { Epic } from "redux-observable/src/epic";
import {
  catchError,
  delay,
  map,
  retryWhen,
  switchMap,
  take,
} from "rxjs/operators";
import { getWithExceptions$ } from "../../../api/apiRequest";
import { GET_MESSAGE_COUNT } from "../../../api/apiPath";
import CompanyUsageResponseType from "../../../types/CompanyUsageResponseType";
import { Union } from "ts-toolbelt";

type CompanyUsageType = Union.Select<
  Action,
  { type: "COMPANY_USAGE.API.LOAD" }
>;

function fetchCompanyUsage$() {
  return getWithExceptions$(GET_MESSAGE_COUNT, { param: {} });
}

export const companyUsageEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) =>
  action$.pipe(
    ofType("COMPANY_USAGE.API.LOAD"),
    switchMap(() => {
      return fetchCompanyUsage$().pipe(
        map((result) => {
          const responseCast = result.data as CompanyUsageResponseType;
          return {
            type: "USAGE_UPDATED",
            usage: {
              maximumAutomatedMessages: responseCast.maximumAutomatedMessages,
              totalMessagesSentFromSleekflow:
                responseCast.billingPeriodUsages[0]
                  .totalMessagesSentFromSleekflow,
              maximumContacts: responseCast.maximumContacts,
              maximumAgents: responseCast.maximumAgents,
              currentAgents: responseCast.totalAgents,
              totalContacts: responseCast.totalContacts,
              currentNumberOfChannels: responseCast.currentNumberOfChannels,
              maximumNumberOfChannel: responseCast.maximumNumberOfChannel,
              booted: true,
            },
          } as Action;
        }),
        retryWhen((errors) => errors.pipe(delay(1000), take(5)))
      );
    }),
    catchError((error, retry) => {
      console.error(error);
      return retry;
    })
  );
