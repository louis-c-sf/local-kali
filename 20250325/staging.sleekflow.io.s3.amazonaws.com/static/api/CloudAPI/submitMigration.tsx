import { postWithExceptions } from "api/apiRequest";

type FacebookMigrationResponseType = {
  facebook_phone_number_id: string;
  facebook_phone_number: string;
  destination_phone_number_id: string;
  migration_initiated: boolean;
};
export async function submitMigration(props: {
  facebookWabaId: string;
  facebookPhoneNumber: string;
  isOnPremises: boolean;
}): Promise<FacebookMigrationResponseType> {
  const { facebookWabaId, facebookPhoneNumber, isOnPremises } = props;
  return await postWithExceptions(
    "/company/whatsapp/cloudapi/migration/initiation",
    {
      param: {
        facebookWabaId,
        facebookPhoneNumber,
        isOnPremises,
      },
    }
  );
}
