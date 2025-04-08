import { postFiles } from "api/apiRequest";

type Response = {
  validationSucceeded: boolean;
  currentNumberOfContacts: number;
  maximumNumberOfContacts: number;
  numberOfNewContacts: number;
};

export default async function submitValidateImport(props: {
  file: File;
}): Promise<Response> {
  const { file } = props;
  return await postFiles(
    "/userprofile/import/validate",
    [{ name: "files", file }],
    {
      param: {
        isTriggerAutomation: false,
      },
    }
  );
}
