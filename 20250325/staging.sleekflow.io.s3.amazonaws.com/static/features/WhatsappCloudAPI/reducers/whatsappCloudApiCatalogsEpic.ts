import { Observable } from "rxjs";
import { Action, LoginType } from "types/LoginType";
import { ofType, StateObservable } from "redux-observable";
import { switchMap, map, retryWhen, delay, take, filter } from "rxjs/operators";
import { fetchConnectedCatalogChannels$ } from "api/CloudAPI/fetchConnectedCatalogChannels";

export const whatsappCloudApiCatalogsEpic = (
  $action: Observable<Action>,
  $state: StateObservable<LoginType>
) => {
  return $action.pipe(
    ofType("ADD_COMPANY"),
    filter(() => !$state.value.vendor.whatsappCloudApi.channels.booted),

    switchMap(() => {
      return fetchConnectedCatalogChannels$(false).pipe(
        map(
          (result) =>
            ({
              type: "WHATSAPP_CLOUD_API.CATALOGS.BOOTED",
              data: result,
            } as Action)
        ),
        retryWhen((errors) => errors.pipe(delay(1000), take(3)))
      );
    })
  );
};
