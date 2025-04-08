import { postWithExceptions } from "api/apiRequest";

interface VerificationResponseType {
  destination_phone_number_id: string;
  facebook_phone_number: string;
  success: boolean;
  messaging_hub_waba_id: string;
  messaging_hub_phone_number_id: string;
}
export async function submitVerifiedCode(props: {
  facebookWabaId: string;
  facebookPhoneNumber: string;
  destinationPhoneNumberId: string;
  code: string;
}): Promise<VerificationResponseType> {
  const {
    facebookWabaId,
    facebookPhoneNumber,
    destinationPhoneNumberId,
    code,
  } = props;
  return await postWithExceptions(
    "/company/whatsapp/cloudapi/migration/code/verification",
    {
      param: {
        facebookWabaId,
        facebookPhoneNumber,
        destinationPhoneNumberId,
        code,
      },
    }
  );
}
