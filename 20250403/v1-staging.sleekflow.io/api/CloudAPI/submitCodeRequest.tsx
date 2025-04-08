import { postWithExceptions } from "api/apiRequest";

type RequestCodeResponseType = {
  code_method: string;
  code_sent: boolean;
  destination_phone_number_id: string;
  facebook_phone_number: string;
  language: string;
};

export async function submitCodeRequest(props: {
  facebookWabaId: string;
  facebookPhoneNumber: string;
  destinationPhoneNumberId: string;
  codeMethod: string;
  language: string;
}): Promise<RequestCodeResponseType> {
  const {
    facebookWabaId,
    facebookPhoneNumber,
    destinationPhoneNumberId,
    codeMethod,
    language,
  } = props;
  return await postWithExceptions(
    "/company/whatsapp/cloudapi/migration/code/request",
    {
      param: {
        facebookWabaId,
        facebookPhoneNumber,
        destinationPhoneNumberId,
        codeMethod,
        language,
      },
    }
  );
}
