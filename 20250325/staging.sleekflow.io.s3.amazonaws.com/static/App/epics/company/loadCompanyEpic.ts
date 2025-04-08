import { Epic } from "redux-observable/src/epic";
import { Action, LoginType } from "../../../types/LoginType";
import { ofType } from "redux-observable";
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs/operators";
import { fetchCompany$ } from "../../../api/Company/fetchCompany";
import { of } from "rxjs";
import { eqBy } from "ramda";

export const loadCompanyEpic: Epic<Action, Action, LoginType> = (action) => {
  return action.pipe(
    ofType("COMPANY.API.LOAD"),
    distinctUntilChanged(
      eqBy((a: Action) => (a.type === "COMPANY.API.LOAD" ? a.hash : undefined))
    ),
    switchMap(() => {
      return fetchCompany$().pipe(
        map((response) => {
          return {
            type: "ADD_COMPANY",
            company: response.data,
          } as Action;
        }),
        catchError((err) => {
          return of({
            type: "INBOX.API.ERROR",
            error: String(err),
          } as Action);
        })
      );
    })
  );
};
