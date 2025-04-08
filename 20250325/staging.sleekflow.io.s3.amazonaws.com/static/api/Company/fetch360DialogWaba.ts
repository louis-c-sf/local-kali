import { WhatsAppwabaResponseType } from "../../types/CompanyType";
import { GET_360DIALOG_WABA } from "../apiPath";
import { getWithExceptions } from "../apiRequest";

export default function fetch360DialogWaba(): Promise<
  WhatsAppwabaResponseType
> {
  return getWithExceptions(GET_360DIALOG_WABA, {
    param: {},
  });
}
