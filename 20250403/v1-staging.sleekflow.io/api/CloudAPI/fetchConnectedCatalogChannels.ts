import { getWithExceptions$ } from "api/apiRequest";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export function fetchConnectedCatalogChannels$(
  allowCache: boolean
): Observable<ConnectedChannelsResponseType[]> {
  return getWithExceptions$(
    "/company/whatsapp/cloudapi/productcatalog/connected-channels",
    { param: { allowCache: allowCache ? "true" : "false" } }
  ).pipe(map((r) => r.data as ConnectedChannelsResponseType[]));
}

export interface ConnectedChannelsResponseType {
  id: number;
  channelName: string;
  messagingHubWabaPhoneNumberId: string;
  messagingHubWabaId: string;
  whatsappPhoneNumber: string;
  whatsappDisplayName: string;
  facebookWabaName: string;
  facebookWabaBusinessName: string;
  facebookWabaBusinessId: string;
  facebookWabaId: string;
  facebookPhoneNumberId: string;
  templateNamespace: string;
  isOptInEnable: true;
  optInConfig: {
    templateName: string;
    language: string;
    templateMessageContent: string;
    readMoreTemplateButtonMessage: string;
  };
  productCatalogSetting: {
    hasEnabledProductCatalog: boolean;
    hasEnabledAutoSendStripePaymentUrl: boolean;
  };
}
